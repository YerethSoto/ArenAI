import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { initSocket } from './services/socketService.js';

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Initialize Socket Logic
initSocket(io);

// Cloud Run uses 8080 by default, or the PORT env var
const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔌 Socket.io listo para conexiones`);
});
