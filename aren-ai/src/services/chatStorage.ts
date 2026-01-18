import { getApiUrl } from '../config/api';

// Message interface matching StudentChat
export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date | string;
  senderName?: string;
  displayedText?: string;
  isTyping?: boolean;
  read?: boolean; // Track if message has been read
  synced?: boolean; // Track if message has been synced to database
  senderId?: number; // User ID of sender
}

// Storage keys
const MESSAGES_KEY_PREFIX = 'chat_messages_';
const UNREAD_KEY = 'chat_unread_counts';
const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Centralized Chat Storage Service
 * Single source of truth for all chat messages
 * Syncs to database every 10 minutes
 */
export class ChatStorageService {
  private activeChat: string | null = null; // Track which chat is currently open
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;

  /**
   * Set the currently active/open chat
   */
  setActiveChat(chatId: string | number | null): void {
    this.activeChat = chatId ? String(chatId) : null;
    console.log(`[ChatStorage] Active chat set to: ${this.activeChat}`);
  }

  /**
   * Save a new message to localStorage
   * This is atomic - either fully succeeds or fails
   */
  saveMessage(chatId: string | number, message: Omit<ChatMessage, 'read' | 'synced'>): void {
    try {
      const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
      const existing = localStorage.getItem(key);
      const messages: ChatMessage[] = existing ? JSON.parse(existing) : [];

      // Check for duplicates
      const isDuplicate = messages.some(m =>
        m.text === message.text &&
        Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000
      );

      if (!isDuplicate) {
        // If this chat is currently open, mark as read immediately
        const isRead = String(chatId) === this.activeChat;

        // Get current user ID for syncing
        let senderId: number | undefined;
        try {
          const userData = localStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            senderId = message.isUser ? user.id : undefined;
          }
        } catch { }

        // Add message with read status and synced = false
        const newMessage: ChatMessage = {
          ...message,
          read: isRead,
          synced: false, // Will be synced later
          senderId,
          timestamp: typeof message.timestamp === 'string'
            ? message.timestamp
            : message.timestamp.toISOString()
        };

        messages.push(newMessage);
        localStorage.setItem(key, JSON.stringify(messages));

        console.log(`[ChatStorage] Saved message to chat ${chatId} (read: ${isRead}, synced: false)`);
      }
    } catch (e) {
      console.error(`[ChatStorage] Failed to save message to chat ${chatId}:`, e);
    }
  }

  /**
   * Get all messages for a chat
   */
  getMessages(chatId: string | number): ChatMessage[] {
    try {
      const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const messages = JSON.parse(stored);
      // Convert timestamp strings back to dates if needed
      return messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    } catch (e) {
      console.error(`[ChatStorage] Failed to get messages for chat ${chatId}:`, e);
      return [];
    }
  }

  /**
   * Get unread count for a chat
   * Counts messages where read === false
   */
  getUnreadCount(chatId: string | number): number {
    const messages = this.getMessages(chatId);
    return messages.filter(m => m.read === false).length;
  }

  /**
   * Mark all messages as read for a chat
   */
  markAsRead(chatId: string | number): void {
    try {
      const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
      const messages = this.getMessages(chatId);

      // Update all messages to read=true
      const updatedMessages = messages.map(m => ({
        ...m,
        read: true,
        timestamp: typeof m.timestamp === 'string'
          ? m.timestamp
          : m.timestamp.toISOString()
      }));

      localStorage.setItem(key, JSON.stringify(updatedMessages));
      console.log(`[ChatStorage] Marked ${messages.length} messages as read in chat ${chatId}`);
    } catch (e) {
      console.error(`[ChatStorage] Failed to mark messages as read for chat ${chatId}:`, e);
    }
  }

  /**
   * Get the last message for a chat (for preview)
   */
  getLastMessage(chatId: string | number): ChatMessage | null {
    const messages = this.getMessages(chatId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }

  /**
   * Clear all messages for a chat
   */
  clearChat(chatId: string | number): void {
    try {
      const key = `${MESSAGES_KEY_PREFIX}${chatId}`;
      localStorage.removeItem(key);
      console.log(`[ChatStorage] Cleared chat ${chatId}`);
    } catch (e) {
      console.error(`[ChatStorage] Failed to clear chat ${chatId}:`, e);
    }
  }

  /**
   * Sync all unsynced messages to the database
   */
  async syncToDatabase(): Promise<void> {
    if (this.isSyncing) {
      console.log('[ChatStorage] Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    console.log('[ChatStorage] Starting sync to database...');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('[ChatStorage] No auth token, skipping sync');
        return;
      }

      // Get all chat message keys from localStorage
      const chatKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(MESSAGES_KEY_PREFIX)) {
          chatKeys.push(key);
        }
      }

      let totalSynced = 0;

      for (const key of chatKeys) {
        const chatId = key.replace(MESSAGES_KEY_PREFIX, '');
        const messages = this.getMessages(chatId);

        // Filter unsynced messages
        const unsyncedMessages = messages.filter(m => m.synced === false && m.isUser);

        if (unsyncedMessages.length === 0) continue;

        console.log(`[ChatStorage] Syncing ${unsyncedMessages.length} messages for chat ${chatId}`);

        try {
          const response = await fetch(getApiUrl(`api/chats/${chatId}/sync`), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: unsyncedMessages.map(m => ({
                text: m.text,
                userId: m.senderId,
                timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString()
              }))
            })
          });

          if (response.ok) {
            const result = await response.json();
            totalSynced += result.inserted || 0;

            // Mark messages as synced
            const updatedMessages = messages.map(m => ({
              ...m,
              synced: true,
              timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString()
            }));
            localStorage.setItem(key, JSON.stringify(updatedMessages));
          } else {
            console.error(`[ChatStorage] Failed to sync chat ${chatId}: ${response.status}`);
          }
        } catch (err) {
          console.error(`[ChatStorage] Error syncing chat ${chatId}:`, err);
        }
      }

      console.log(`[ChatStorage] Sync complete. Total synced: ${totalSynced}`);
    } catch (e) {
      console.error('[ChatStorage] Sync failed:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Start periodic sync (every 10 minutes)
   */
  startPeriodicSync(): void {
    if (this.syncInterval) {
      console.log('[ChatStorage] Periodic sync already running');
      return;
    }

    console.log('[ChatStorage] Starting periodic sync (every 10 minutes)');

    // Sync immediately on start
    this.syncToDatabase();

    // Then sync every 10 minutes
    this.syncInterval = setInterval(() => {
      this.syncToDatabase();
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[ChatStorage] Periodic sync stopped');
    }
  }
}

// Export singleton instance
export const chatStorage = new ChatStorageService();

