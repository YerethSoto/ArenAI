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
}

// Storage keys
const MESSAGES_KEY_PREFIX = 'chat_messages_';
const UNREAD_KEY = 'chat_unread_counts';

/**
 * Centralized Chat Storage Service
 * Single source of truth for all chat messages
 */
export class ChatStorageService {
  private activeChat: string | null = null; // Track which chat is currently open

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
  saveMessage(chatId: string | number, message: Omit<ChatMessage, 'read'>): void {
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
        
        // Add message with read status
        const newMessage: ChatMessage = {
          ...message,
          read: isRead, // Auto-read if viewing this chat
          timestamp: typeof message.timestamp === 'string' 
            ? message.timestamp 
            : message.timestamp.toISOString()
        };
        
        messages.push(newMessage);
        localStorage.setItem(key, JSON.stringify(messages));
        
        console.log(`[ChatStorage] Saved message to chat ${chatId} (read: ${isRead})`);
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
}

// Export singleton instance
export const chatStorage = new ChatStorageService();
