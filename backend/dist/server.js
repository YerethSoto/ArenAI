import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { initSocket } from './services/socketService.js';
import { initCronJobs } from './services/cronService.js';
const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    // Tuning for faster disconnect detection (Heartbeat)
    pingInterval: 2000, // Send ping every 2 seconds
    pingTimeout: 5000 // Wait 5 seconds for pong response before disconnecting
});
// Initialize Socket Logic
initSocket(io);
// Initialize Cron Jobs (Insight Generation)
initCronJobs();
// Cloud Run uses 8080 by default, or the PORT env var
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔌 Socket.io listo para conexiones`);
    console.log(`⏰ Cron jobs inicializados`);
});
