import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonModal,
  IonInput,
} from "@ionic/react";
import {
  personAddOutline,
  closeOutline,
  checkmarkOutline,
  searchOutline,
  notificationsOutline,
  checkmarkCircle,
  closeCircle,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import StudentHeader from "../components/StudentHeader";
import "./ChatMenu.css";
import { getApiUrl } from "../config/api";
import { useTranslation } from "react-i18next";
import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";
import { socketService } from "../services/socket";

const ChatMenu: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [isAddFriendMode, setIsAddFriendMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // New State for Features
  const filterOptions = [
    "chatMenu.allChats",
    "chatMenu.friends",
    "chatMenu.groups",
  ];
  const [activeFilter, setActiveFilter] = useState("chatMenu.allChats");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [chats, setChats] = useState<any[]>([]);

  // Helper to format date
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString();
  };

  // Fetch Chats from Backend & Merge with Local History
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userDataStr = localStorage.getItem("userData");

      if (!userDataStr) return;

      const user = JSON.parse(userDataStr);
      const userId = user.id || user.id_user;

      if (!userId) {
        console.error("User ID not found in local storage");
        return;
      }

      const res = await fetch(getApiUrl(`/api/chats/user/${userId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        let backendChats = await res.json();

        // --- Merge with Local Storage History ---
        const enrichedChats = backendChats.map((chat: any) => {
          // chat.id is usually the friend's user ID in this P2P context?
          // Or if backend returns "chatId", we use that. Assuming chat.id is the friend's ID for P2P.
          // Let's assume chat.id IS the friend's ID.

          const historyKey = `chat_history_${chat.id}`; // Matches StudentChat
          const storedHistory = localStorage.getItem(historyKey);

          let lastMsg = chat.message; // Fallback to backend
          let timestamp = chat.time;

          if (storedHistory) {
            try {
              const messages = JSON.parse(storedHistory);
              if (messages && messages.length > 0) {
                const last = messages[messages.length - 1];
                lastMsg = last.text;
                timestamp = last.timestamp; // Date string or object
              }
            } catch (e) {}
          }

          return {
            ...chat,
            message: lastMsg,
            rawTime: new Date(timestamp), // Store Date object for sorting
            time:
              typeof timestamp === "string"
                ? formatTime(timestamp)
                : formatTime(timestamp.toISOString()),
          };
        });

        // --- SORT by Recent ---
        enrichedChats.sort(
          (a: any, b: any) => b.rawTime.getTime() - a.rawTime.getTime()
        );

        setChats(enrichedChats);
      }
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  // --- Live Sync & Refresh on Focus ---
  // --- Live Sync & Refresh on Focus ---
  useIonViewWillEnter(() => {
    fetchChats();
    fetchRequests();

    // Refresh Nicknames
    const stored = localStorage.getItem("friendNicknames");
    if (stored) {
      try {
        setLocalNicknames(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse nicknames", e);
      }
    }

    // Connect Socket for Live Updates
    socketService.connect();
    const socket = socketService.socket;

    // Remove existing listener to prevent duplicates before adding
    if (socket) {
      socket.off("receive_message");

      socket.on("receive_message", (data: any) => {
        // Update Chat List in Real Time
        setChats((prevChats) => {
          const newChats = [...prevChats];
          const chatIndex = newChats.findIndex(
            (c) => c.id == data.chatId || c.id_user == data.senderId
          ); // Check both ID types

          if (chatIndex > -1) {
            const chat = newChats[chatIndex];

            // Prevent duplicate update if timestamp matches exactly (simple debounce)
            // or just rely on state update. The double count likely comes from double listeners.
            // The explicit .off() above should fix it.

            // Update content
            chat.message = data.text;
            chat.time = formatTime(new Date().toISOString());
            chat.rawTime = new Date();
            chat.unread = (chat.unread || 0) + 1;

            // Move to Top
            newChats.splice(chatIndex, 1);
            newChats.unshift(chat);
            return newChats;
          } else {
            fetchChats();
            return prevChats;
          }
        });
      });
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off("receive_message");
      }
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests(); // Keep requests polling
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch(getApiUrl("/api/friends/requests"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFriendRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 3) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(getApiUrl(`/api/friends/search?query=${query}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const sendRequest = async (targetId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(getApiUrl("/api/friends/request"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: targetId }),
      });
      if (res.ok) {
        alert("Request sent!");
        setSearchResults((prev) => prev.filter((u) => u.id_user !== targetId));
      } else {
        const err = await res.json();
        alert(err.message || "Failed to send request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const respondToRequest = async (
    reqId: number,
    action: "accept" | "reject"
  ) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(getApiUrl("/api/friends/respond"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: reqId, action }),
      });
      if (res.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id_request !== reqId));
        if (action === "accept") {
          // Check if we need to refresh chat list
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMode = () => {
    setIsAddFriendMode(!isAddFriendMode);
    setSearchText("");
    setSearchResults([]);
  };

  const handleSearchChange = (e: CustomEvent) => {
    const val = e.detail.value!;
    setSearchText(val);
    if (isAddFriendMode && val.length >= 3) {
      searchUsers(val);
    }
  };

  // UI Handlers
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Nickname State
  const [localNicknames, setLocalNicknames] = useState<Record<number, string>>(
    {}
  );

  // Initial load
  useEffect(() => {
    const stored = localStorage.getItem("friendNicknames");
    if (stored) {
      try {
        setLocalNicknames(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const saveNickname = (userId: number, nick: string) => {
    const updated = { ...localNicknames, [userId]: nick };
    setLocalNicknames(updated);
    localStorage.setItem("friendNicknames", JSON.stringify(updated));
  };

  const UI_getUserName = (user: any) => {
    // If we have a local nickname for this user ID, use it.
    // User might have id_user or id_sender depending on object type
    const id = user.id_user || user.id_sender || user.id;
    return localNicknames[id] || user.name || user.sender_name;
  };

  const handleAcceptClick = (req: any) => {
    setSelectedRequest(req);
    setNicknameInput(req.sender_name || "Friend");
    setShowNicknameModal(true);
  };

  const confirmAcceptFriend = async () => {
    if (!selectedRequest) return;
    try {
      await respondToRequest(selectedRequest.id_request, "accept");

      // Save nickname locally
      if (nicknameInput && nicknameInput !== selectedRequest.sender_name) {
        saveNickname(selectedRequest.id_sender, nicknameInput);
      }

      setShowNicknameModal(false);
      setNicknameInput("");
      setSelectedRequest(null);

      // Refresh chats to show the new friend
      fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage className="chat-menu-page">
      <StudentHeader
        pageTitle="sidebar.chat"
        showSubject={true}
        selectedSubject={activeFilter}
        onSubjectChange={handleFilterChange}
        menuOptions={filterOptions}
      />

      <IonContent fullscreen className="chat-menu-content">
        <div className="chat-action-bar">
          <div className="search-container">
            <IonSearchbar
              value={searchText}
              onIonInput={handleSearchChange}
              placeholder={
                isAddFriendMode ? t("chatMenu.addFriend") : t("chatMenu.search")
              }
              className={`custom-searchbar ${
                isAddFriendMode ? "add-mode" : ""
              }`}
              showClearButton="focus"
              animated
            />
          </div>

          <IonButton
            className={`action-toggle-btn ${isAddFriendMode ? "active" : ""}`}
            onClick={handleToggleMode}
            shape="round"
          >
            <IonIcon icon={isAddFriendMode ? closeOutline : personAddOutline} />
          </IonButton>

          {!isAddFriendMode && (
            <div className="notification-btn-wrapper">
              <IonButton
                onClick={() => setShowNotifications(!showNotifications)}
                className={`notification-btn ${
                  showNotifications ? "active" : ""
                }`}
                shape="round"
                fill="clear"
              >
                <IonIcon icon={notificationsOutline} />
              </IonButton>
              {friendRequests.length > 0 && (
                <span className="notif-badge">{friendRequests.length}</span>
              )}
            </div>
          )}
        </div>

        {/* Glassmorphism Notification Popup */}
        {showNotifications && (
          <div className="glass-popup notification-popup">
            <div className="popup-header">
              <h3>{t("chatMenu.friendRequests")}</h3>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowNotifications(false)}
              >
                <IonIcon icon={closeCircle} />
              </IonButton>
            </div>
            <div className="popup-content">
              {friendRequests.length === 0 ? (
                <p className="empty-state">{t("chatMenu.noRequests")}</p>
              ) : (
                <IonList className="glass-list">
                  {friendRequests.map((req) => (
                    <IonItem
                      key={req.id_request}
                      className="glass-item"
                      lines="none"
                    >
                      <div className="req-info">
                        <h4>{req.sender_name}</h4>
                        <p>@{req.sender_username}</p>
                      </div>
                      <div className="req-actions">
                        <IonButton
                          fill="clear"
                          color="danger"
                          onClick={() =>
                            respondToRequest(req.id_request, "reject")
                          }
                        >
                          <IonIcon icon={closeCircle} slot="icon-only" />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          color="success"
                          onClick={() => handleAcceptClick(req)}
                        >
                          <IonIcon icon={checkmarkCircle} slot="icon-only" />
                        </IonButton>
                      </div>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </div>
          </div>
        )}

        {isAddFriendMode && (
          <div className="add-friend-hint">
            <IonIcon icon={searchOutline} />
            <span>{t("chatMenu.hint")}</span>
            <IonButton fill="clear" size="small" disabled={!searchText}>
              <IonIcon slot="icon-only" icon={checkmarkOutline} />
            </IonButton>
          </div>
        )}

        <IonList className="chat-list" lines="full">
          {isAddFriendMode && searchText.length >= 3
            ? searchResults.map((user) => (
                <IonItem key={user.id_user} className="chat-item">
                  <IonAvatar slot="start" className="chat-avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.name}`}
                      alt={user.name}
                    />
                  </IonAvatar>
                  <IonLabel>
                    <h2>{UI_getUserName(user)}</h2>
                    <p>@{user.username}</p>
                  </IonLabel>
                  <IonButton
                    slot="end"
                    fill="outline"
                    shape="round"
                    onClick={() => sendRequest(user.id_user)}
                  >
                    Add
                  </IonButton>
                </IonItem>
              ))
            : chats.map((chat) => (
                <IonItem
                  key={chat.id}
                  button
                  detail={false}
                  className="chat-item"
                  onClick={() => history.push(`/student-chat/${chat.id}`)}
                >
                  <IonAvatar slot="start" className="chat-avatar">
                    <img src={chat.avatar} alt={chat.name} />
                  </IonAvatar>
                  <IonLabel className="chat-info">
                    <div className="chat-header">
                      {/* Use nickname if available */}
                      <h2>{UI_getUserName(chat)}</h2>
                      <span className="chat-time">{chat.time}</span>
                    </div>
                    <p className="chat-preview">{chat.message}</p>
                  </IonLabel>
                  {chat.unread > 0 && (
                    <div className="unread-badge">{chat.unread}</div>
                  )}
                </IonItem>
              ))}
        </IonList>

        <IonModal
          isOpen={showNicknameModal}
          onDidDismiss={() => setShowNicknameModal(false)}
          className="glass-modal"
        >
          <div className="glass-modal-content">
            <h2>Welcome Friend!</h2>
            <p>
              Give <strong>{selectedRequest?.sender_name}</strong> a nickname.
            </p>

            <IonInput
              value={nicknameInput}
              onIonInput={(e) => setNicknameInput(e.detail.value!)}
              placeholder="Enter nickname"
              className="glass-input"
              clearInput
            />

            <div className="modal-actions">
              <IonButton
                fill="clear"
                onClick={() => setShowNicknameModal(false)}
              >
                Cancel
              </IonButton>
              <IonButton
                expand="block"
                shape="round"
                onClick={confirmAcceptFriend}
              >
                Accept & Add
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ChatMenu;
