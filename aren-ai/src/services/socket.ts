import { io, Socket } from 'socket.io-client';

// Use environment or default to localhost for dev
const URL = 'http://localhost:3002'; // Might need to make this dynamic later

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket) return;
    this.socket = io(URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to socket server', this.socket?.id);
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
