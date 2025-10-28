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
} from "@ionic/react";
import { micOutline, send } from "ionicons/icons";
import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  displayedText?: string;
  isTyping?: boolean;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Array vacío inicial
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounter = useRef(1); // Contador para IDs únicos y consistentes

  // Efecto para el mensaje inicial cuando el componente se monta
  useEffect(() => {
    const initialMessage: Message = {
      id: messageIdCounter.current++,
      text: "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte?",
      isUser: false,
      timestamp: new Date(),
      displayedText: "", // Vacío para el efecto de escritura
      isTyping: true,
    };
    
    setMessages([initialMessage]);
    
    // Iniciar efecto de escritura para el mensaje inicial
    setTimeout(() => {
      startTypewriterEffect(initialMessage.id, initialMessage.text, 40);
    }, 500); // Pequeño delay para que se note el efecto al cargar
    
  }, []);

  // Limpiar intervalos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Efecto de escritura para mensajes del bot
  const startTypewriterEffect = (messageId: number, fullText: string, speed: number = 40) => {
    let currentText = "";
    let charIndex = 0;
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setMessages(prev => prev.map(msg =>
      msg.id === messageId 
        ? { ...msg, displayedText: "", isTyping: true }
        : msg
    ));

    typingIntervalRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText.charAt(charIndex);
        setMessages(prev => prev.map(msg =>
          msg.id === messageId 
            ? { ...msg, displayedText: currentText }
            : msg
        ));
        charIndex++;
        
        // Hacer scroll durante la escritura
        scrollToBottom();
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setMessages(prev => prev.map(msg =>
          msg.id === messageId 
            ? { ...msg, isTyping: false }
            : msg
        ));
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

  // Función para formatear la hora
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleSendMessage = () => {
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




    // Aqui va las respuesta del bot 
    const botResponse = "Hola, esto es una pruebaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // esta funcion es para ver si el mensaje es repetido no volver a mostrar la foto, no se va a usar mucho  pero por si acaso
  const shouldShowAvatar = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];
    return currentMessage.isUser !== previousMessage.isUser;
  };

  return (
    <IonPage>
      <IonHeader className="app-header">
        <IonToolbar>
          <IonTitle className="app-title">ArenAI</IonTitle>
          <IonButtons slot="end">
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} className="chat-content">
        <div className="messages-container">
          <IonList lines="none" className="message-list">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message-wrapper ${
                  message.isUser ? "user-wrapper" : "bot-wrapper"
                } ${message.isTyping ? 'typing' : ''}`}
              >
                {!message.isUser && shouldShowAvatar(index) && (
                  <div className="avatar-container">
                    <img
                      className="bot-avatar-image"
                      src="./resources/Capybara profile picture.png"
                      alt="AI"
                    />
                  </div>
                )}

                <div
                  className={`message-bubble ${
                    message.isUser ? "user-bubble" : "bot-bubble"
                  } ${message.isTyping ? 'typing-bubble' : ''}`}
                >
                  <div className="message-text">
                    {message.displayedText}
                    {message.isTyping && <span className="typing-cursor">|</span>}
                  </div>
                  <div className="message-timestamp">
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.isUser && shouldShowAvatar(index) && (
                  <div className="avatar-container">
                    <img 
                      className="user-avatar-image" 
                      src="./resources/Capybara profile picture.png" 
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