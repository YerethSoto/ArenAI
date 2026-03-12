import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

// Use the centralized API_BASE_URL from config (driven by VITE_API_BASE_URL in .env)
const URL = API_BASE_URL;

class SocketService {
  public socket: Socket | null = null;
  private lastToken: string | null = null;

  connect() {
    const token = localStorage.getItem('authToken');

    // 1. Check if we need to full reset (Token Changed)
    if (this.socket && this.lastToken !== token) {
      console.log("[SocketService] Token changed, forcing full reconnect.");
      this.disconnect();
    }

    // 2. Determine if we are already connected/connecting
    if (this.socket) {
        if (this.socket.connected) {
             // Already happy
             return;
        } else {
            // Socket object exists but disconnected (idle timeout etc)
            console.log("[SocketService] Socket exists but disconnected, attempting reconnect...");
            this.socket.connect();
            return;
        }
    }
    
    // 3. Create New Connection
    this.lastToken = token; // Update tracker

    console.log("[SocketService] Creating new socket connection...");
    this.socket = io(URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
      reconnectionAttempts: 10,  // Increase attempts
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // Connection timeout
      forceNew: true // Ensure a fresh connection object
    });
    
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to socket server', this.socket?.id);
    });
    
    this.socket.on('connect_error', (err) => {
        console.error('[SocketService] Socket connection error:', err.message);
        // If auth error, maybe clear token? For now just log.
    });

    this.socket.on('disconnect', (reason) => {
        console.log('[SocketService] Disconnected:', reason);
        if (reason === 'io server disconnect') {
            // Server disconnected explicitly, maybe token invalid.
            // Client should not auto-reconnect unless we fix token.
        }
    });

    // Handle server kicking this socket due to a duplicate connection
    // (e.g., user opened a new tab). Don't try to reconnect — the new
    // connection is the authoritative one.
    this.socket.on('force_disconnect', (data: { reason: string }) => {
        console.log('[SocketService] Force disconnected by server:', data.reason);
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.lastToken = null;
        }
    });

    // Listen for insight generation updates from cron job
    this.socket.on('insight_update', (data: { timestamp: string; message: string; data?: any }) => {
        console.log('');
        console.log('%c╔══════════════════════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
        console.log('%c║       🧠 INSIGHT ANALYTICS UPDATE                    ║', 'color: #00ff00; font-weight: bold');
        console.log('%c╚══════════════════════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');
        console.log(`%c📡 ${data.message}`, 'color: #00ccff; font-size: 14px');
        console.log('%c⏰ Time:', 'color: #888', data.timestamp);
        
        // If this is an insight result, display the content prominently
        if (data.data) {
            if (data.data.status === 'insight_saved') {
                console.log('%c━━━━━━━━━━━━━ STUDENT SUMMARY ━━━━━━━━━━━━━', 'color: #ffcc00; font-weight: bold');
                console.log(`%c👤 User ID: ${data.data.userId}`, 'color: #fff; font-size: 12px');
                console.log(`%c📚 Subject: ${data.data.subject}`, 'color: #fff; font-size: 12px');
                
                if (data.data.knowledgeGaps && data.data.knowledgeGaps.length > 0) {
                    console.log('%c📊 KNOWLEDGE GAPS (What student struggles with):', 'color: #ff6666; font-weight: bold; font-size: 13px');
                    data.data.knowledgeGaps.forEach((gap: string, i: number) => {
                        console.log(`%c   ${i + 1}. ${gap}`, 'color: #ff9999; font-size: 12px');
                    });
                }
                
                console.log(`%c😊 SENTIMENT: ${data.data.sentiment}`, 'color: #66ff66; font-weight: bold; font-size: 13px');
                
                if (data.data.studyTips && data.data.studyTips.length > 0) {
                    console.log('%c💡 STUDY TIPS:', 'color: #66ccff; font-weight: bold; font-size: 13px');
                    data.data.studyTips.forEach((tip: string, i: number) => {
                        console.log(`%c   ${i + 1}. ${tip}`, 'color: #99ddff; font-size: 12px');
                    });
                }
                
                console.log(`%c📝 Messages analyzed: ${data.data.messagesAnalyzed}`, 'color: #888');
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ffcc00; font-weight: bold');
            } else {
                console.log('%c📊 Details:', 'color: #ff9900', data.data);
            }
        }
        console.log('');
    });
  }

  disconnect() {
    console.log("[SocketService] disconnect() called. Socket exists?", !!this.socket);
    if (this.socket) {
      this.socket.removeAllListeners(); // Clean up listeners to prevent leaks
      this.socket.disconnect();
      this.socket = null;
      this.lastToken = null; // Reset token tracking
    }
  }

  // Helper getters
  get id() {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
