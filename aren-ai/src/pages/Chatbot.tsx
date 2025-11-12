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
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounter = useRef(1);

  // Logout handler
  const handleLogout = () => {
    console.log('Logout clicked');
    // Add your logout logic here
    // For example: navigation to login page, clear tokens, etc.
    // You can use Ionic's useHistory hook for navigation if needed
  };

  // Check Ollama connection on component mount
  useEffect(() => {
    checkOllamaConnection();
    
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

  // Check if Ollama is running
  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:11434/api/tags');
      if (response.ok) {
        setIsOllamaConnected(true);
        console.log('Ollama is connected');
      } else {
        setIsOllamaConnected(false);
        console.log('Ollama is not running');
      }
    } catch (error) {
      setIsOllamaConnected(false);
      console.log('Ollama connection failed:', error);
    }
  };

  // Typewriter effect for bot messages
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

  // Format time function
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Main function to handle sending messages
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
      // System prompt for the AI - Updated to include subject context
      const systemRules = `Eres Aren, un capibara entusiasta que adora enseñar. Eres un tutor amigable que ayuda a estudiantes durante sus clases.

CONTEXTO DEL AULA:
- Materia actual: ${selectedSubject}
- El estudiante tiene acceso a su CUADERNO para escribir, dibujar y resolver problemas
- Puede hacer notas, diagramas y cálculos en papel
- Está en un ambiente de aprendizaje con materiales básicos (lápiz, papel, borrador)
- Eres un asistente de chat dentro de una aplicación

PERFIL DEL ESTUDIANTE:
- Nombre: Yereth Soto
- Grado: 7mo grado
- Estilo de aprendizaje: kinestésico

FILOSOFÍA DE ENSEÑANZA:
1. DESCUBRIMIENTO GUIADO: Nunca des respuestas directas. Haz preguntas estratégicas que lleven a los estudiantes a descubrir soluciones por sí mismos.
2. USO PRÁCTICO DEL CUADERNO: Fomenta el uso activo del cuaderno para resolver problemas.
3. ENFOQUE EN LA MATERIA: Enfócate en ${selectedSubject} y sus conceptos específicos.

ADAPTACIÓN AL ESTILO DE APRENDIZAJE - ACTIVIDADES PRÁCTICAS:

Aprendices Kinestésicos (Yereth):
- "Escribe cada paso físicamente en tu cuaderno"
- "Usa tu dedo para trazar los cálculos"
- "Organiza tu cuaderno con espacios para cada paso"
- "Usa gestos con las manos para representar operaciones"
- "Encierra en un círculo o subraya las partes importantes"

MÉTODOS DE ENSEÑANZA CONCRETOS:
1. "YO HAGO, NOSOTROS HACEMOS, TÚ HACES":
   - YO HAGO: Demuestro un paso específico (explico cómo lo haría en mi cuaderno)
   - NOSOTROS HACEMOS: Guío para hacer el siguiente paso juntos
   - TÚ HACES: Invito a intentar el siguiente paso en tu cuaderno

2. ESTRATEGIAS DE CUADERNO:
   - "Escribe lo que ya sabes sobre el problema"
   - "Dibuja un espacio de trabajo para cada parte"
   - "Usa la página para organizar tus pensamientos"
   - "Haz una lista de lo que necesitas encontrar"

LENGUAJE REQUERIDO - USA SIEMPRE:
- "Primero, escribe en tu cuaderno lo que el problema está preguntando"
- "¿Qué operación/concepto de ${selectedSubject} necesitamos usar aquí?"
- "Intenta resolver solo esta parte en tu cuaderno: [paso específico]"
- "Excelente, ahora usemos eso para el siguiente paso"
- "Dibuja cómo visualizas este problema"
- "Escribe la siguiente operación en tu cuaderno"

Habla directamente con Yereth, usando su nombre frecuentemente. Proporciona pasos accionables que desarrollen habilidades de pensamiento. Celebra el esfuerzo y enfócate en la mentalidad de crecimiento.`;

      let botResponse: string;

      if (isOllamaConnected) {
        // Call Ollama directly
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'phi4:latest',
            messages: [
              {
                role: 'system',
                content: systemRules
              },
              {
                role: 'user',
                content: inputMessage
              }
            ],
            stream: false
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        botResponse = data.message.content;
      } else {
        // Fallback response if Ollama is not available
        botResponse = "¡Hola! Actualmente no puedo acceder a mi sistema de IA. Por favor asegúrate de que Ollama esté ejecutándose en tu computadora. Mientras tanto, puedo sugerirte que: \n\n1. Escribas el problema en tu cuaderno\n2. Identifiques qué información tienes y qué necesitas encontrar\n3. Intentes diferentes enfoques para resolverlo";
      }

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
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: messageIdCounter.current++,
        text: "Lo siento, estoy teniendo problemas para procesar tu mensaje. Por favor verifica que Ollama esté ejecutándose (puerto 11434) o intenta nuevamente.",
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
      <IonHeader className="app-header">
        <IonToolbar>
          <div className="header-content">
            <IonMenuButton slot="start" className="menu-button enlarged-menu">
              <IonIcon icon={menu} />
            </IonMenuButton>
            
            <div className="header-center">
              <StudentMenu
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
              />
            </div>
            
            <div className="header-brand">
              <div className="brand-text">
                <div className="arenai">ArenAI</div>
                <div className="student">Chat</div>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <StudentSidebar onLogout={handleLogout} />

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