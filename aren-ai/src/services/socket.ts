import { io, Socket } from 'socket.io-client';

// Use environment or default to Cloud Backend
// Use environment or default to Cloud Backend
const CLOUD_URL = 'https://arenai-backend-271931294892.us-central1.run.app';
const URL = import.meta.env.VITE_API_BASE_URL || CLOUD_URL;

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
