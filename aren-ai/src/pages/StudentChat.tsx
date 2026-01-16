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
  IonModal,
  IonInput,
  IonAvatar,
  IonLabel,
} from "@ionic/react";
import {
  micOutline,
  send,
  arrowBack,
  gameControllerOutline,
  pencilOutline,
  trashOutline,
} from "ionicons/icons";
import React, { useState, useRef, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import "./Chatbot.css"; // Reuse existing styles
import StudentHeader from "../components/StudentHeader";
import { getApiUrl } from "../config/api";
import { useTranslation } from "react-i18next";
import { socketService } from "../services/socket";
import { useIonViewWillEnter } from "@ionic/react";

// Helper to get User Context
const getUserContext = () => {
  try {
    const stored = localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : { name: "Student", id: 0 };
  } catch (e) {
    return { name: "Student", id: 0 };
  }
};

// Helper to get Chat Nickname
const getChatNickname = (chatId: string) => {
  try {
    const stored = localStorage.getItem("friendNicknames");
    const nicknames = stored ? JSON.parse(stored) : {};
    // Ensure strict string lookup
    return nicknames[String(chatId)] || null;
  } catch (e) {
    return null;
  }
};

interface Message {
  id: number;
  text: string;
  isUser: boolean; // true = me, false = other
  timestamp: Date;
  senderName?: string; // For group chats
  displayedText?: string;
  isTyping?: boolean;
}

const StudentChat: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id: string }>(); // Chat ID or User ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const contentRef = useRef<HTMLIonContentElement>(null);
  const messageIdCounter = useRef(1);
  const [chatName, setChatName] = useState("Student");
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals State
  const [showOptionsModal, setShowOptionsModal] = useState(false); // Can double as "Actions" if not using StudentMenu directly
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showMinigameModal, setShowMinigameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [selectedMinigameSubject, setSelectedMinigameSubject] = useState("");

  const headerOptions = [
    "ChatOptions.play",
    "ChatOptions.rename",
    "ChatOptions.delete",
  ];

  // Initialize Name - Ensure it runs on entry every time
  useIonViewWillEnter(() => {
    const nick = getChatNickname(id);
    if (nick) {
      setChatName(nick);
    } else {
      setChatName(`Chat ${id}`); // Generic Fallback
    }
  });

  useEffect(() => {
    // Keep initial load just in case
    const nick = getChatNickname(id);
    if (nick) setChatName(nick);
  }, [id]);

  const handleHeaderOption = (option: string) => {
    // Map translated or raw options
    if (option === "ChatOptions.play") {
      setShowMinigameModal(true);
    } else if (option === "ChatOptions.rename") {
      setNicknameInput(chatName);
      setShowNicknameModal(true);
    } else if (option === "ChatOptions.delete") {
      // Confirm delete (simple alert for now)
      if (window.confirm(t("chat.confirmDelete"))) {
        // Delete logic
        history.push("/chat-menu");
      }
    }
  };

  const saveNickname = () => {
    if (!nicknameInput.trim()) return;

    const stored = localStorage.getItem("friendNicknames");
    const nicknames = stored ? JSON.parse(stored) : {};
    nicknames[String(id)] = nicknameInput; // Saving by ID as string
    localStorage.setItem("friendNicknames", JSON.stringify(nicknames));

    setChatName(nicknameInput);
    setShowNicknameModal(false);
  };

  // Initialize Socket
  useEffect(() => {
    socketService.connect();
    if (socketService.socket) {
      socketService.socket.emit("join_chat", { chatId: id });

      socketService.socket.on("receive_message", (data: any) => {
        // data: { chatId, text, senderId, senderName, timestamp }
        const newMessage: Message = {
          id: messageIdCounter.current++,
          text: data.text,
          isUser: false,
          timestamp: new Date(data.timestamp),
          senderName: data.senderName,
          displayedText: "",
          isTyping: true,
        };

        // Persist (append to existing)
        saveMessageToLocal(id, newMessage);

        setMessages((prev) => [...prev, newMessage]);
        startTypewriterEffect(newMessage.id, newMessage.text, 15);
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off("receive_message");
      }
    };
  }, [id]);

  // Load History
  useEffect(() => {
    const context = getUserContext();
    // Try to find chat metadata (e.g. Friend Name) from localStorage chats
    // For now, minimal:
    setChatName(`Chat ${id}`); // Placeholder logic for name

    const stored = localStorage.getItem(`chat_history_${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert strings back to dates if needed, or keep strings
        const parsedMessages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          displayedText: m.text, // History is already typed
          isTyping: false,
        }));
        setMessages(parsedMessages);
        if (parsedMessages.length > 0) {
          messageIdCounter.current =
            Math.max(...parsedMessages.map((m: any) => m.id)) + 1;
        }
      } catch (e) {
        console.error("Failed load chat history", e);
      }
    }
  }, [id]);

  const saveMessageToLocal = (chatId: string, msg: Message) => {
    const key = `chat_history_${chatId}`;
    const existing = localStorage.getItem(key);
    let list = existing ? JSON.parse(existing) : [];
    list.push(msg);
    localStorage.setItem(key, JSON.stringify(list));
  };

  // Typewriter Effect (Copied from Chatbot)
  const startTypewriterEffect = (
    messageId: number,
    fullText: string,
    speed: number = 15
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
      contentRef.current?.scrollToBottom(100);
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const userContext = getUserContext();

    // Emit to Backend
    if (socketService.socket) {
      socketService.socket.emit("send_message", {
        chatId: id,
        text: inputMessage,
        senderName: userContext.name,
      });
    }

    const newMessage: Message = {
      id: messageIdCounter.current++,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      displayedText: inputMessage, // User messages show immediately
      isTyping: false,
    };

    saveMessageToLocal(id, newMessage);

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <IonPage className="chatbot-page">
      <StudentHeader
        pageTitle="sidebar.chat" // Static "Chat" or "Student"
        showSubject={true} // Use Notch for Nickname
        selectedSubject={chatName} // Display Nickname Here
        menuOptions={headerOptions} // Options
        onSubjectChange={handleHeaderOption}
        showBackButton={true}
        onBack={() => history.push("/chat-menu")}
        skipTranslation={true}
      />

      <IonContent fullscreen className="chat-content" ref={contentRef}>
        <div className="chat-container">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`message-row ${msg.isUser ? "user" : "bot"}`}
            >
              {!msg.isUser && (
                <div className="chat-avatar bot">
                  {/* Placeholder Avatar - Initials */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#ccc",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  >
                    {chatName.charAt(0)}
                  </div>
                </div>
              )}

              <div className={`chat-bubble ${msg.isUser ? "user" : "bot"}`}>
                <div className="bubble-text">
                  {/* Use displayedText if available (for animation), else full text */}
                  {msg.displayedText !== undefined
                    ? msg.displayedText
                    : msg.text}
                  {msg.isTyping && <span className="cursor">|</span>}
                </div>
                <div className="bubble-time">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {msg.isUser && (
                <img
                  className="chat-avatar user"
                  src={`https://ui-avatars.com/api/?name=${
                    getUserContext().name
                  }`}
                  alt="Me"
                />
              )}
            </div>
          ))}
        </div>
      </IonContent>

      <div className="chat-footer">
        <div className="input-pill">
          <IonTextarea
            placeholder={
              t("chat.inputThinking") || "What are you thinking about?"
            }
            value={inputMessage}
            onIonInput={(e) => setInputMessage(e.detail.value!)}
            autoGrow={true}
            rows={1}
            className="chat-input"
            onKeyDown={handleKeyPress}
          />
          <IonButton
            fill="clear"
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            <IonIcon icon={send} slot="icon-only" />
          </IonButton>
        </div>
      </div>

      {/* Nickname Modal */}
      <IonModal
        isOpen={showNicknameModal}
        onDidDismiss={() => setShowNicknameModal(false)}
        className="glass-modal"
      >
        <div className="glass-modal-content">
          <h2>{t("chat.changeNickname")}</h2>
          <IonInput
            value={nicknameInput}
            onIonInput={(e) => setNicknameInput(e.detail.value!)}
            placeholder="Enter new nickname"
            className="glass-input"
          />
          <div className="modal-actions">
            <IonButton fill="clear" onClick={() => setShowNicknameModal(false)}>
              {t("common.cancel")}
            </IonButton>
            <IonButton expand="block" shape="round" onClick={saveNickname}>
              {t("common.save")}
            </IonButton>
          </div>
        </div>
      </IonModal>

      {/* Minigame Modal (Placeholder) */}
      <IonModal
        isOpen={showMinigameModal}
        onDidDismiss={() => setShowMinigameModal(false)}
        className="glass-modal"
      >
        <div className="glass-modal-content">
          <h2>{t("chat.selectSubject")}</h2>
          <p>Select a subject to challenge {chatName}!</p>
          <IonList className="glass-list">
            {["Math", "Science", "History", "Art"].map((subj) => (
              <IonItem
                key={subj}
                button
                onClick={() => setShowMinigameModal(false)}
                className="glass-item"
              >
                <IonLabel>{subj}</IonLabel>
                <IonIcon icon={gameControllerOutline} slot="end" />
              </IonItem>
            ))}
          </IonList>
          <IonButton fill="clear" onClick={() => setShowMinigameModal(false)}>
            {t("common.cancel")}
          </IonButton>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default StudentChat;
