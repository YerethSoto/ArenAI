import { createServer } from 'http';
import { Server } from 'socket.io';
import { appConfig } from './config/env.js';
import { createApp } from './app.js';
import { initSocket } from './services/socketService.js';

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// Initialize Socket Logic
initSocket(io);

httpServer.listen(appConfig.port, () => {
  console.log(`API and Socket listening on port ${appConfig.port}`);
});
