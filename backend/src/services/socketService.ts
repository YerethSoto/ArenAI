import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/env.js';
import { getUserChats } from '../repositories/chatRepository.js';

// --- Interfaces ---

interface Player {
    userId: string;
    socketId: string;
    name: string;
    avatar: string;
    score: number;
    health: number;
    maxHealth: number;
    winStreak: number;
    utilizationIndex: number;
    isDisconnected: boolean;
    hasAnswered: boolean; // Track if they answered current round
}

type GameStatus = 'waiting' | 'playing' | 'round_result' | 'finished';

interface GameState {
    roomId: string;
    status: GameStatus;
    players: Record<string, Player>; // Keyed by userId
    currentQuestionIndex: number;
    roundStartTime: number;
    roundEndTime: number; // For Hard Timer
    answers: Record<string, { time: number; correct: boolean }>;
    
    // System
    roundTimeout?: NodeJS.Timeout;
    isSuddenDeath?: boolean;
}

// --- State ---

const waitingQueue: { userId: string; name: string; avatar: string; socketId: string }[] = [];
// Map roomId -> GameState
const activeGames: Record<string, GameState> = {};
// Map userId -> roomId
const userGameMap: Record<string, string> = {};

const ROUND_DURATION_SEC = 15; // Soft limit for users
const HARD_TIMEOUT_SEC = 20;   // Hard limit to force resolution

export const initSocket = (io: Server) => {
    // Middleware: Lenient Auth (Try to get UserID, else use SocketID)
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                const payload = jwt.verify(token, appConfig.auth.jwtSecret) as any;
                socket.data.user = { id: String(payload.sub), username: payload.username };
            } catch (e) {
                // Invalid token? behave as guest/socket-only? 
                // For this app, let's enforce randomness if invalid, or error.
                // Better: error to force relogin if token is bad.
                // return next(new Error("Authentication Invalid"));
                // Fallback for dev/robustness:
                socket.data.user = { id: 'guest_' + socket.id, username: 'Guest' };
            }
        } else {
             socket.data.user = { id: 'guest_' + socket.id, username: 'Guest' };
        }
        next();
    });

    io.on('connection', async (socket: Socket) => {
        const userId = socket.data.user.id;
        console.log(`[Socket] Connected: ${userId} (${socket.id})`);

        // ===== CRITICAL: AUTO-JOIN CHAT ROOMS =====
        // This ensures users receive messages even if they haven't opened the chat yet
        // Without this, first-time app users won't get any messages
        try {
            // Only join if user has a real ID (not guest)
            if (!userId.startsWith('guest_')) {
                const userIdNum = parseInt(userId);
                if (!isNaN(userIdNum)) {
                    const chats = await getUserChats(userIdNum);
                    chats.forEach((chat: any) => {
                        const roomName = `chat_${chat.id}`;
                        socket.join(roomName);
                        console.log(`[Socket] Auto-joined ${userId} to room: ${roomName}`);
                    });
                    console.log(`[Socket] ${userId} joined ${chats.length} chat rooms automatically`);
                }
            }
        } catch (error) {
            console.error(`[Socket] Failed to auto-join chat rooms for ${userId}:`, error);
        }
        // ===== END AUTO-JOIN =====

        // --- 1. RECONNECTION CHECK ---
        const existingGameId = userGameMap[userId];
        if (existingGameId && activeGames[existingGameId]) {
            const game = activeGames[existingGameId];
            if (game.status !== 'finished') {
                handleReconnection(io, socket, game, userId);
            }
        }

        // --- 2. JOIN MATCH HANDLER (Explicit Sync Request) ---
        socket.on('join_match_session', (data: { roomId: string }) => {
            console.log(`[Socket] join_match_session: User=${userId} Room=${data.roomId}`);
            const game = activeGames[data.roomId];
            if (game) {
                console.log(`[Socket] Game found. Players: ${Object.keys(game.players).join(', ')}`);
                if (game.players[userId]) {
                     console.log(`[Socket] Player authorized. Resyncing...`);
                     handleReconnection(io, socket, game, userId);
                } else {
                     console.log(`[Socket] Player NOT in game players list.`);
                     socket.emit('game_error', { code: 'NOT_FOUND', message: 'You are not in this match.' });
                }
            } else {
                console.log(`[Socket] Game NOT found for Room=${data.roomId}`);
                socket.emit('game_error', { code: 'NOT_FOUND', message: 'Match not found.' });
            }
        });

        // --- 3. MATCHMAKING ---
        socket.on('join_queue', (data: { name: string; avatar: string }) => {
            // Remove from queue if exists
            const existingIdx = waitingQueue.findIndex(p => p.userId === userId);
            if (existingIdx !== -1) waitingQueue.splice(existingIdx, 1);

            waitingQueue.push({ userId, name: data.name, avatar: data.avatar, socketId: socket.id });
            console.log(`[Queue] ${data.name} joined. Size: ${waitingQueue.length}`);

            if (waitingQueue.length >= 2) {
                createMatch(io);
            }
        });

        // --- 4. GAMEPLAY ---
        socket.on('submit_answer', (data: { roomId: string; correct: boolean }) => {
            const game = activeGames[data.roomId];
            if (!game || game.status !== 'playing') return;

            // Check if player is in game
            if (!game.players[userId]) return;

            // Check if already answered
            if (game.answers[userId]) return;

            const timeTaken = (Date.now() - game.roundStartTime) / 1000;
            game.answers[userId] = { time: timeTaken, correct: data.correct };
            game.players[userId].hasAnswered = true;

            // Notify everyone that SOMEONE answered (for UI "Waiting for opponent")
            io.to(game.roomId).emit('opponent_answered', { userId });

            // Check if all answered
            const allAnswered = Object.values(game.players).every(p => !p.isDisconnected && (game.answers[p.userId] || p.isDisconnected));
            // Note: If opponent is disconnected, we don't wait for them? 
            // Better: 'allAnswered' means all ACTIVE players answered.
            // But for FAIRNESS and SIMPLICITY in this 'Fixed Logic':
            // If 2 players exist, we wait for 2 answers OR Timeout.
            // We do NOT resolve early if one is just slow. We resolve early if BOTH answer.
            
            const totalPlayers = Object.keys(game.players).length;
            const totalAnswers = Object.keys(game.answers).length;

            if (totalAnswers === totalPlayers) {
                resolveRound(io, game);
            } else if (!game.isSuddenDeath) {
                // First Answer -> Trigger Sudden Death (10s)
                game.isSuddenDeath = true;
                if (game.roundTimeout) clearTimeout(game.roundTimeout);
                
                const suddenDeathDuration = 10;
                game.roundEndTime = Date.now() + (suddenDeathDuration * 1000);
                
                game.roundTimeout = setTimeout(() => {
                    resolveRound(io, game);
                }, suddenDeathDuration * 1000);
                
                io.to(game.roomId).emit('sudden_death_start', { endTime: game.roundEndTime });
            }
        });

        socket.on('leave_match', (data: { roomId: string }) => {
            handleForfeit(io, userId, data.roomId, 'abandoned');
        });

        socket.on('disconnect', () => {
             console.log(`[Socket] Disconnect: ${userId}`);
             // If in queue
             const qIdx = waitingQueue.findIndex(p => p.userId === userId);
             if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

             // If in game
             const gameId = userGameMap[userId];
             if (gameId && activeGames[gameId]) {
                 const game = activeGames[gameId];
                 if (game.status !== 'finished') {
                     if (game.players[userId]) {
                         game.players[userId].isDisconnected = true;
                         // Notify opponent
                         io.to(gameId).emit('player_status_change', { userId, status: 'disconnected' });
                     }
                 }
             }
        });


        // --- 5. GENERIC CHAT (Student/P2P) ---
        socket.on('join_chat', (data: { chatId: string }) => {
            const { chatId } = data;
            const roomName = `chat_${chatId}`;
            socket.join(roomName);
            console.log(`[Socket] ${userId} joined chat room: ${roomName}`);
        });

        socket.on('send_message', (data: { chatId: string; text: string; senderName?: string }) => {
            const { chatId, text, senderName } = data;
            const roomName = `chat_${chatId}`;
            
            // Broadcast to room (including sender, or exclude sender? Usually include for sync)
            // But frontend adds optimistically. Let's broadcast to others.
            socket.to(roomName).emit('receive_message', {
                chatId,
                text,
                senderId: userId,
                senderName: senderName || socket.data.user.username,
                timestamp: new Date().toISOString()
            });
            console.log(`[Socket] Message in ${roomName} from ${userId}: ${text}`);
        });
    });
};

const createMatch = (io: Server) => {
    const p1 = waitingQueue.shift()!;
    const p2 = waitingQueue.shift()!;
    const roomId = `room_${Date.now()}`;

    const game: GameState = {
        roomId,
        status: 'waiting',
        players: {
            [p1.userId]: { ...p1, score: 0, health: 100, maxHealth: 100, winStreak: 0, utilizationIndex: 0, isDisconnected: false, hasAnswered: false },
            [p2.userId]: { ...p2, score: 0, health: 100, maxHealth: 100, winStreak: 0, utilizationIndex: 0, isDisconnected: false, hasAnswered: false }
        },
        currentQuestionIndex: 0,
        roundStartTime: 0,
        roundEndTime: 0,
        answers: {}
    };

    activeGames[roomId] = game;
    userGameMap[p1.userId] = roomId;
    userGameMap[p2.userId] = roomId;

    const s1 = io.sockets.sockets.get(p1.socketId);
    const s2 = io.sockets.sockets.get(p2.socketId);
    s1?.join(roomId);
    s2?.join(roomId);

    // Notify Match Found (Lobby -> Game Transition)
    if (s1) {
        s1.emit('match_found', {
            roomId,
            opponent: { name: p2.name, avatar: p2.avatar }
        });
    }
    if (s2) {
        s2.emit('match_found', {
            roomId,
            opponent: { name: p1.name, avatar: p1.avatar }
        });
    }

    // Start Round 1
    startRound(io, game);
};

const startRound = (io: Server, game: GameState) => {
    if (game.status === 'finished') return;

    game.status = 'playing';
    game.roundStartTime = Date.now();
    game.roundEndTime = Date.now() + (HARD_TIMEOUT_SEC * 1000);
    game.answers = {};
    
    // Reset Round Flags
    Object.values(game.players).forEach(p => p.hasAnswered = false);

    // Clear any previous timer
    if (game.roundTimeout) clearTimeout(game.roundTimeout);

    // Set HARD TIMEOUT (safety fallback)
    // User requested "never happen unless one student answers". 
    // We set effectively INFINITE time (e.g. 24 hours) until first answer.
    const MAX_WAIT_TIME = 86400; 
    game.roundEndTime = Date.now() + (MAX_WAIT_TIME * 1000);
    game.isSuddenDeath = false;

    // We do NOT set a resolving timeout here anymore, or we set it for 24h.
    game.roundTimeout = setTimeout(() => {
        console.log(`[Game ${game.roomId}] Hard Timeout Triggered (24h limit)`);
        resolveRound(io, game); 
    }, MAX_WAIT_TIME * 1000);

    // Emit 'round_ready' to signal client to reset UI state
    io.to(game.roomId).emit('round_ready');
    
    // Full Sync Emit
    emitGameState(io, game);
};

const resolveRound = (io: Server, game: GameState) => {
    if (game.status !== 'playing') return; // Prevent double resolution

    game.status = 'round_result';
    if (game.roundTimeout) clearTimeout(game.roundTimeout);

    // Logic
    const pIds = Object.keys(game.players);
    const p1Id = pIds[0];
    const p2Id = pIds[1];

    const a1 = game.answers[p1Id];
    const a2 = game.answers[p2Id];

    // Default: 9999s, incorrect
    const a1Res = a1 || { time: 9999, correct: false };
    const a2Res = a2 || { time: 9999, correct: false };

    let damageDealt = 0;
    let roundWinnerId: string | null = null;
    const damages = { [p1Id]: 0, [p2Id]: 0 };
    const messages = { [p1Id]: '', [p2Id]: '' };
    let isCritical = false;

    if (a1Res.correct && a2Res.correct) {
        roundWinnerId = a1Res.time < a2Res.time ? p1Id : p2Id;
        damageDealt = Math.floor(Math.random() * 4) + 5;
        const loser = roundWinnerId === p1Id ? p2Id : p1Id;
        damages[loser] = damageDealt;
        messages[roundWinnerId] = '¡Más rápido!';
        messages[loser] = '¡Lento!';
    } else if (a1Res.correct) {
        roundWinnerId = p1Id;
        damageDealt = Math.floor(Math.random() * 6) + 25;
        damages[p2Id] = damageDealt;
        messages[p1Id] = 'CRITICAL HIT';
        messages[p2Id] = 'Wrong';
        isCritical = true;
    } else if (a2Res.correct) {
        roundWinnerId = p2Id;
        damageDealt = Math.floor(Math.random() * 6) + 25;
        damages[p1Id] = damageDealt;
        messages[p2Id] = 'CRITICAL HIT';
        messages[p1Id] = 'Wrong';
        isCritical = true;
    } else {
        // Both Wrong or Timeout
        messages[p1Id] = 'Fallaste';
        messages[p2Id] = 'Fallaste';
        roundWinnerId = 'draw';
    }

    // Apply Damage
    game.players[p1Id].health = Math.max(0, game.players[p1Id].health - damages[p1Id]);
    game.players[p2Id].health = Math.max(0, game.players[p2Id].health - damages[p2Id]);

    // Check Game Over
    let winnerId: string | null = null;
    if (game.players[p1Id].health <= 0) winnerId = p2Id;
    else if (game.players[p2Id].health <= 0) winnerId = p1Id;

    // Emit Result
    io.to(game.roomId).emit('round_result', {
        winnerId: roundWinnerId,
        damage: damageDealt,
        damages,
        healths: { [p1Id]: game.players[p1Id].health, [p2Id]: game.players[p2Id].health },
        messages,
        isCritical
    });

    if (winnerId) {
        game.status = 'finished';
        io.to(game.roomId).emit('game_over', { winnerId });
        // Cleanup
        setTimeout(() => {
            delete activeGames[game.roomId];
            delete userGameMap[p1Id];
            delete userGameMap[p2Id];
        }, 5000);
    } else {
        // Next Round
        setTimeout(() => {
            game.currentQuestionIndex++;
            startRound(io, game);
        }, 3000); 
    }
};

const handleReconnection = (io: Server, socket: Socket, game: GameState, userId: string) => {
    // Update socket ref
    const p = game.players[userId];
    if (p) {
        p.socketId = socket.id;
        p.isDisconnected = false;
        socket.join(game.roomId);
        
        console.log(`[Reconnect] ${userId} rejoining ${game.roomId}`);
        
        // Notify others
        io.to(game.roomId).emit('player_status_change', { userId, status: 'connected' });
        
        // Send Full State
        emitGameState(io, game, socket);
    }
};

const handleForfeit = (io: Server, loserId: string, roomId: string, reason: string) => {
    const game = activeGames[roomId];
    if (!game || game.status === 'finished') return;
    
    game.status = 'finished';
    if (game.roundTimeout) clearTimeout(game.roundTimeout);
    
    // Determine winner
    const winnerId = Object.keys(game.players).find(pid => pid !== loserId);
    
    io.to(roomId).emit('game_over', { winnerId, reason });
    
    // Cleanup
    setTimeout(() => {
         delete activeGames[roomId];
         Object.keys(game.players).forEach(uid => delete userGameMap[uid]);
    }, 1000);
};

// --- HELPER: Emit Full Snapshot ---
const emitGameState = (io: Server, game: GameState, targetSocket?: Socket) => {
    const payload = {
        roomId: game.roomId,
        status: game.status,
        currentQuestionIndex: game.currentQuestionIndex,
        roundEndTime: game.roundEndTime,
        isSuddenDeath: game.isSuddenDeath,
        players: game.players, // Contains health, scores, hasAnswered
    };
    
    if (targetSocket) {
        targetSocket.emit('sync_state', payload);
    } else {
        io.to(game.roomId).emit('sync_state', payload);
    }
};
