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

  const OLLAMA_URL = "http://192.168.31.166:11434/api/generate";
  const OLLAMA_MODEL = "gemma2:2b"; // Cambiado a gemma2:2b

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
      const systemRules = `[Tus reglas de sistema aquí...]`;

      const prompt = `<|system|>
${systemRules}
<|user|>
${inputMessage}
<|assistant|>
`;

      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error("Ollama no responde");

      const data = await response.json();
      const botResponse =
        data.response ||
        "¡Hola Yereth! Veo que tienes una pregunta interesante sobre " +
          selectedSubject +
          ". ¿Por qué no empiezas escribiendo en tu cuaderno lo que ya sabes sobre este tema?";

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
        text: "⚠️ El servicio de IA no está disponible. Sugerencias:\n\n1. Verifica tu conexión a internet\n2. Intenta con una pregunta más corta\n3. Mientras, puedes escribir el problema en tu cuaderno",
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
                      openSrc="/assets/profile_picture_capybara_eyes_open.png"
                      closedSrc="/assets/profile_picture_capybara_eyes_closed.png"
                      winkSrc="/assets/profile_picture_capybara_wink.png"
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
