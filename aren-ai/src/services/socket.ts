import { io, Socket } from 'socket.io-client';

// Use environment or default to Cloud Backend
// Use environment or default to Cloud Backend
const CLOUD_URL = 'https://arenai-backend-271931294892.us-central1.run.app';
const URL = import.meta.env.VITE_API_BASE_URL || CLOUD_URL;

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket) return;
    
    const token = localStorage.getItem('authToken');
    
    this.socket = io(URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'], // Try websocket first, fall back to polling
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to socket server', this.socket?.id);
    });
    
    this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Helper getters
  get id() {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
