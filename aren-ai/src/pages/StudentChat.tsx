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
import "./Chatbot.css";
import StudentHeader from "../components/StudentHeader";
import { getApiUrl } from "../config/api";
import { useTranslation } from "react-i18next";
import { socketService } from "../services/socket";
import { chatStorage } from "../services/chatStorage";
import { useIonViewWillEnter } from "@ionic/react";
import { useAvatar } from "../context/AvatarContext";
import { getAvatarPath } from "../utils/avatarUtils";

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
  const { currentAvatar } = useAvatar();
  const { id } = useParams<{ id: string }>(); // Chat ID or User ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const contentRef = useRef<HTMLIonContentElement>(null);
  const messageIdCounter = useRef(1);
  const [chatName, setChatName] = useState("Student");
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const displayedTimestampsRef = useRef<Set<string>>(new Set()); // Track displayed messages

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
      // Try to fetch the friend's name from the backend
      fetchChatName();
    }
  });

  // Fetch friend name from backend if no nickname is set
  const fetchChatName = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) return;

      const user = JSON.parse(userDataStr);
      const userId = user.id || user.id_user;

      const res = await fetch(getApiUrl(`/api/chats/user/${userId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const chats = await res.json();
        const currentChat = chats.find((c: any) => String(c.id) === String(id));
        if (currentChat && currentChat.name) {
          setChatName(currentChat.name);
        } else {
          setChatName(`Chat ${id}`);
        }
      }
    } catch (err) {
      console.error("[StudentChat] Failed to fetch chat name:", err);
      setChatName(`Chat ${id}`);
    }
  };

  useEffect(() => {
    // Keep initial load just in case
    const nick = getChatNickname(id);
    if (nick) {
      setChatName(nick);
    } else {
      fetchChatName();
    }
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

  //REMOVED: Socket listener - ChatMenu now handles all incoming messages
  // We just read from chatStorage
  useEffect(() => {
    // Mark messages as read in localStorage
    chatStorage.markAsRead(id);

    // Mark messages as read in the database
    const markReadInDB = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userContext = getUserContext();
        await fetch(getApiUrl(`/api/chats/${id}/read`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userContext.id }),
        });
      } catch (err) {
        console.error("[StudentChat] Failed to mark messages as read:", err);
      }
    };
    markReadInDB();

    // IMPORTANT: Still need to join the chat room so backend knows where to deliver messages
    socketService.connect();
    if (socketService.socket) {
      socketService.socket.emit("join_chat", { chatId: id });
      console.log(`[StudentChat] Joined chat room ${id}`);
    }
  }, [id]);

  // Load Messages from Database + LocalStorage
  useEffect(() => {
    const context = getUserContext();
    setChatName(`Chat ${id}`);

    // Clear timestamp tracking when switching chats
    displayedTimestampsRef.current.clear();

    // Fetch messages from database and merge with local storage
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(getApiUrl(`/api/chats/${id}/messages`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        let dbMessages: Message[] = [];
        if (response.ok) {
          const data = await response.json();
          dbMessages = data.map((m: any) => ({
            id: m.id_message || m.id,
            text: m.text || m.content || "",
            isUser: m.id_user === context.id,
            timestamp: new Date(m.date || m.created_at),
            senderName: m.sender_name,
            displayedText: m.text || m.content || "",
            isTyping: false,
          }));
        }

        // Get local messages
        const localMessages = chatStorage.getMessages(id).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
          displayedText: m.text,
          isTyping: false,
        }));

        // Merge: use DB as source of truth, add any local messages not in DB
        const dbTimestamps = new Set(
          dbMessages.map((m) => String(m.timestamp.getTime())),
        );

        const mergedMessages = [
          ...dbMessages,
          ...localMessages.filter(
            (m: any) => !dbTimestamps.has(String(m.timestamp.getTime())),
          ),
        ]
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .map((m, idx) => ({ ...m, id: idx + 1 })); // Assign unique sequential IDs

        // Track all displayed timestamps
        mergedMessages.forEach((m) => {
          displayedTimestampsRef.current.add(String(m.timestamp.getTime()));
        });

        setMessages(mergedMessages);
        messageIdCounter.current = mergedMessages.length + 1;
      } catch (err) {
        console.error("[StudentChat] Failed to fetch messages from DB:", err);
        // Fallback to local storage only
        const storedMessages = chatStorage.getMessages(id);
        if (storedMessages.length > 0) {
          const parsedMessages = storedMessages.map((m: any) => {
            displayedTimestampsRef.current.add(
              String(new Date(m.timestamp).getTime()),
            );
            return {
              ...m,
              timestamp: new Date(m.timestamp),
              displayedText: m.text,
              isTyping: false,
            };
          });
          setMessages(parsedMessages);
          messageIdCounter.current =
            Math.max(...parsedMessages.map((m: any) => m.id)) + 1;
        }
      }
    };

    loadMessages();

    // Poll for new messages every 500ms
    const pollInterval = setInterval(() => {
      const latestMessages = chatStorage.getMessages(id);

      // Only process messages we haven't displayed yet
      latestMessages.forEach((msg) => {
        const msgTimestamp = String(new Date(msg.timestamp).getTime());

        if (!displayedTimestampsRef.current.has(msgTimestamp)) {
          displayedTimestampsRef.current.add(msgTimestamp);

          const processedMsg = {
            ...msg,
            id: messageIdCounter.current++,
            timestamp: new Date(msg.timestamp),
            displayedText: "",
            isTyping: true,
          };
          setMessages((prev) => [...prev, processedMsg]);
          startTypewriterEffect(processedMsg.id, msg.text, 15);
        }
      });
    }, 500);

    return () => clearInterval(pollInterval);
  }, [id]);

  const saveMessageToLocal = (chatId: string, msg: Message) => {
    // Use chatStorage service instead of direct localStorage
    chatStorage.saveMessage(chatId, {
      id: msg.id,
      text: msg.text,
      isUser: msg.isUser,
      timestamp: msg.timestamp,
      senderName: msg.senderName,
      displayedText: msg.displayedText,
      isTyping: msg.isTyping,
    });
  };

  // Typewriter Effect (Copied from Chatbot)
  const startTypewriterEffect = (
    messageId: number,
    fullText: string,
    speed: number = 15,
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
          : msg,
      ),
    );

    typingIntervalRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText.charAt(charIndex);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, displayedText: currentText } : msg,
          ),
        );
        charIndex++;
        scrollToBottom();
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg,
          ),
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

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userContext = getUserContext();
    const token = localStorage.getItem("authToken");

    const newMessage: Message = {
      id: messageIdCounter.current++,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      displayedText: inputMessage, // User messages show immediately
      isTyping: false,
    };

    // CRITICAL: Track this timestamp so polling doesn't re-add it
    displayedTimestampsRef.current.add(String(newMessage.timestamp.getTime()));

    // Update UI immediately
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Save to localStorage for offline support
    saveMessageToLocal(id, newMessage);

    // Emit via socket for real-time delivery
    if (socketService.socket) {
      socketService.socket.emit("send_message", {
        chatId: id,
        text: inputMessage,
        senderName: userContext.name,
      });
    }

    // Persist to database
    try {
      await fetch(getApiUrl(`/api/chats/${id}/messages`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userContext.id,
          text: inputMessage,
          date: newMessage.timestamp.toISOString(),
        }),
      });
    } catch (err) {
      console.error("[StudentChat] Failed to save message to DB:", err);
      // Message is still saved locally, will sync later
    }
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
              key={`${msg.timestamp.getTime()}-${index}`}
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
                  src={getAvatarPath(currentAvatar)}
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
