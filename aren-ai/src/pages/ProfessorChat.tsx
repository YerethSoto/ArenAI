import {
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonList,
    IonPage,
    IonTextarea,
    IonToolbar,
    IonButtons,
    IonBackButton
} from "@ionic/react";
import { micOutline, send, chevronForward } from "ionicons/icons";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAvatar } from "../context/AvatarContext"; // Keeping context hook even if unused to match student structure
import "./ProfessorChat.css";

// Fallback translations - Essential for stability
const CHAT_TRANSLATIONS: any = {
    es: {
        title: "Asistente ArenAI",
        welcome: "¡Hola, Profesor! Soy tu asistente de IA. ¿En qué puedo ayudarte en tu clase hoy?",
        placeholder: "Pregunta sobre planes de lección, ideas o calificaciones...",
        error: "⚠️ Ocurrió un error. Por favor intenta de nuevo.",
        serverError: "Lo siento, no pude procesar tu solicitud."
    },
    en: {
        title: "ArenAI Assistant",
        welcome: "Hello, Professor! I am your AI assistant. How can I help with your class today?",
        placeholder: "Ask about lesson plans, ideas, or grading...",
        error: "⚠️ An error occurred. Please try again.",
        serverError: "Sorry, I couldn't process your request."
    }
};

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    displayedText?: string;
    isTyping?: boolean;
}

const ProfessorChat: React.FC = () => {
    // Exact hooks from Student Chat
    const { getAvatarAssets } = useAvatar(); // Hook presence maintained
    const avatarAssets = getAvatarAssets();  // Hook presence maintained
    const { i18n } = useTranslation();

    // Helper to get translation based on current language
    const getT = (key: string) => {
        const lang = i18n.language?.startsWith('es') ? 'es' : 'en';
        return CHAT_TRANSLATIONS[lang][key] || CHAT_TRANSLATIONS['en'][key];
    };

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    // const [selectedSubject, setSelectedSubject] = useState("Math"); // Student specific, removed for prof
    const messagesEndRef = useRef<HTMLDivElement>(null); // Kept but unused for scrolling if we use contentRef, but Student has it
    const contentRef = useRef<HTMLIonContentElement>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const messageIdCounter = useRef(1);

    // Initial Message - Logic matched exactly with Student Chat (empty dep array)
    useEffect(() => {
        const initialMessage: Message = {
            id: messageIdCounter.current++,
            text: getT('welcome'),
            isUser: false,
            timestamp: new Date(),
            displayedText: "",
            isTyping: true,
        };

        setMessages([initialMessage]);

        setTimeout(() => {
            startTypewriterEffect(initialMessage.id, initialMessage.text, 40);
        }, 500);
    }, []); // Empty dependency array -> Same as Student

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

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

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
                    prompt: inputMessage,
                }),
            });

            if (!response.ok) throw new Error("Server response error");

            const data = await response.json();
            const botResponse = data.response || getT('serverError');

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
                text: getT('error'),
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

    // Copied from Student Chat
    const shouldShowAvatar = (currentIndex: number) => {
        if (currentIndex === 0) return true;
        const currentMessage = messages[currentIndex];
        const previousMessage = messages[currentIndex - 1];
        return currentMessage.isUser !== previousMessage.isUser;
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/page/professor" className="back-button" text="" icon={chevronForward} style={{ transform: 'rotate(180deg)' }} />
                    </IonButtons>
                    <div className="header-brand">
                        <span className="brand-text">{getT('title')}</span>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent ref={contentRef} className="prof-chat-content">
                <div className="messages-container">
                    <IonList lines="none" className="message-list">
                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`message-wrapper ${message.isUser ? "user-wrapper" : "bot-wrapper"
                                    } ${message.isTyping ? "typing" : ""}`}
                            >
                                {!message.isUser && shouldShowAvatar(index) && (
                                    <div className="avatar-container">
                                        {/* Using a static professional AI logo/icon for Prof instead of mascot */}
                                        <div className="bot-avatar-prof">
                                            <img src="/assets/icon/icon.png" alt="AI" onError={(e) => { e.currentTarget.src = 'https://placehold.co/60x60?text=AI' }} />
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={`message-bubble ${message.isUser ? "user-bubble" : "bot-bubble"
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
                            </div>
                        ))}
                    </IonList>
                </div>
            </IonContent>

            <IonFooter className="chat-footer-prof">
                <IonToolbar>
                    <IonItem lines="none" className="input-container-prof">
                        <IonTextarea
                            rows={1}
                            autoGrow={true}
                            value={inputMessage}
                            placeholder={getT('placeholder')}
                            onIonInput={(e) => setInputMessage(e.detail.value!)}
                            onKeyPress={handleKeyPress}
                            className="message-input-prof"
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

export default ProfessorChat;
