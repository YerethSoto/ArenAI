import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonFooter,
  IonMenuButton,
} from "@ionic/react";
import { micOutline, send, menu } from "ionicons/icons";
import React, { useState, useRef, useEffect } from "react";
import { useAvatar } from "../context/AvatarContext";
import "./Chatbot.css";
import StudentMenu from "../components/StudentMenu";
import StudentSidebar from "../components/StudentSidebar";
import StudentHeader from "../components/StudentHeader";
import AnimatedMascot from "../components/AnimatedMascot";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  displayedText?: string;
  isTyping?: boolean;
}

const Chat: React.FC = () => {
  const { getAvatarAssets } = useAvatar();
  const avatarAssets = getAvatarAssets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Math");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounter = useRef(1);

  const handleLogout = () => {};

  useEffect(() => {
    const initialMessage: Message = {
      id: messageIdCounter.current++,
      text: "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte?",
      isUser: false,
      timestamp: new Date(),
      displayedText: "",
      isTyping: true,
    };

    setMessages([initialMessage]);

    setTimeout(() => {
      startTypewriterEffect(initialMessage.id, initialMessage.text, 40);
    }, 500);
  }, []);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Typewriter effect for bot messages
  const startTypewriterEffect = (
    messageId: number,
    fullText: string,
    speed: number = 40
  ) => {
    let currentText = "";
    let charIndex = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, displayedText: "", isTyping: true }
          : msg
      )
    );

    typingIntervalRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText.charAt(charIndex);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, displayedText: currentText } : msg
          )
        );
        charIndex++;
        scrollToBottom();
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
      }
    }, speed);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollToBottom(100);
      }
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format time function
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // mandar mensaje

  // Endpoint del backend propio
  const API_URL = "http://localhost:3002/ai/chat";

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage: Message = {
      id: messageIdCounter.current++,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      displayedText: inputMessage,
      isTyping: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    scrollToBottom();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputMessage, // Backend espera { prompt: string }
        }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      const botResponse =
        data.response ||
        "Lo siento, no pude procesar tu solicitud en este momento.";

      const botMessage: Message = {
        id: messageIdCounter.current++,
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
        displayedText: "",
        isTyping: true,
      };

      setMessages((prev) => [...prev, botMessage]);
      startTypewriterEffect(botMessage.id, botResponse, 30);
    } catch (error) {
      console.error("Detailed error:", error);
      const errorMessage: Message = {
        id: messageIdCounter.current++,
        text: "⚠️ Ocurrió un error al conectar con la IA. Por favor intenta denuevo.",
        isUser: false,
        timestamp: new Date(),
        displayedText: "",
        isTyping: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      startTypewriterEffect(errorMessage.id, errorMessage.text, 30);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const shouldShowAvatar = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];
    return currentMessage.isUser !== previousMessage.isUser;
  };

  return (
    <IonPage>
      <StudentHeader
        pageTitle="Chat"
        showSubject={true}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />

      <StudentSidebar onLogout={handleLogout} />

      <IonContent ref={contentRef} className="chat-content">
        <div className="messages-container">
          <IonList lines="none" className="message-list">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message-wrapper ${
                  message.isUser ? "user-wrapper" : "bot-wrapper"
                } ${message.isTyping ? "typing" : ""}`}
              >
                {!message.isUser && shouldShowAvatar(index) && (
                  <div className="avatar-container">
                    <AnimatedMascot
                      className="bot-avatar-image"
                      openSrc={avatarAssets.open}
                      closedSrc={avatarAssets.closed}
                      winkSrc={avatarAssets.wink}
                    />
                  </div>
                )}

                <div
                  className={`message-bubble ${
                    message.isUser ? "user-bubble" : "bot-bubble"
                  } ${message.isTyping ? "typing-bubble" : ""}`}
                >
                  <div className="message-text">
                    {message.displayedText}
                    {message.isTyping && (
                      <span className="typing-cursor">|</span>
                    )}
                  </div>
                  <div className="message-timestamp">
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.isUser && shouldShowAvatar(index) && (
                  <div className="avatar-container">
                    <img
                      className="user-avatar-image"
                      src="/assets/Capybara profile picture.png"
                      alt="User"
                    />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </IonList>
        </div>
      </IonContent>

      <IonFooter className="chat-footer">
        <IonToolbar>
          <IonItem lines="none" className="input-container">
            <IonTextarea
              rows={1}
              autoGrow={true}
              value={inputMessage}
              placeholder="Pregúntame lo que quieras..."
              onIonInput={(e) => setInputMessage(e.detail.value!)}
              onKeyPress={handleKeyPress}
              className="message-input"
            />

            {inputMessage.trim() ? (
              <IonButton
                fill="clear"
                slot="end"
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                <IonIcon icon={send} />
              </IonButton>
            ) : (
              <IonButton fill="clear" slot="end" className="mic-btn">
                <IonIcon icon={micOutline} />
              </IonButton>
            )}
          </IonItem>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Chat;
