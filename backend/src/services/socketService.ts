import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  health: number;
  maxHealth: number;
  winStreak: number;
  utilizationIndex: number;
}

interface GameState {
  roomId: string;
  players: Record<string, Player>;
  currentQuestionIndex: number;
  roundStartTime: number;
  answers: Record<string, { time: number; correct: boolean }>;
}

const waitingQueue: { id: string; name: string; avatar: string }[] = [];
const activeGames: Record<string, GameState> = {};

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // --- MATCHMAKING ---
    socket.on('join_queue', (data: { name: string; avatar: string }) => {
      console.log(`${data.name} joined queue`);

      // Check if user is already in queue
      const existingIndex = waitingQueue.findIndex(p => p.id === socket.id);
      if (existingIndex !== -1) return;

      waitingQueue.push({ id: socket.id, name: data.name, avatar: data.avatar });

      if (waitingQueue.length >= 2) {
        // Match found!
        const p1 = waitingQueue.shift()!;
        const p2 = waitingQueue.shift()!;
        const roomId = `room_${Date.now()}`;

        // Create Game State
        activeGames[roomId] = {
          roomId,
          players: {
            [p1.id]: { id: p1.id, name: p1.name, avatar: p1.avatar, score: 0, health: 100, maxHealth: 100, winStreak: 0, utilizationIndex: 0 },
            [p2.id]: { id: p2.id, name: p2.name, avatar: p2.avatar, score: 0, health: 100, maxHealth: 100, winStreak: 0, utilizationIndex: 0 }
          },
          currentQuestionIndex: 0,
          roundStartTime: Date.now(),
          answers: {}
        };

        // Join Room
        const s1 = io.sockets.sockets.get(p1.id);
        const s2 = io.sockets.sockets.get(p2.id);

        s1?.join(roomId);
        s2?.join(roomId);
        io.to(roomId).emit('round_start', { questionIndex: 0 });
      }
    });

    // --- GAMEPLAY ---
    socket.on('submit_answer', (data: { roomId: string; correct: boolean }) => {
      const game = activeGames[data.roomId];
      if (!game) {
        socket.emit('game_error', { code: 'GAME_NOT_FOUND', message: 'Game session not found.' });
        return;
      }

      // prevent double answer
      if (game.answers[socket.id]) return;

      const timeTaken = (Date.now() - game.roundStartTime) / 1000;
      game.answers[socket.id] = { time: timeTaken, correct: data.correct };

      // Notify ALL players that a player answered (triggers 8s timer for everyone)
      io.to(data.roomId).emit('opponent_answered');

      // Check if both answered
      const playerIds = Object.keys(game.players);
      const answerCount = Object.keys(game.answers).length;

      if (answerCount === playerIds.length) {
        // Both answered, resolve immediately
        resolveRound(io, game);
      } else if (answerCount === 1) {
        // First answer received - Start 8s "Sudden Death" timer
        // Store timeout to clear it if 2nd answer comes fast
        (game as any).roundTimeout = setTimeout(() => {
          resolveRound(io, game);
        }, 8000);
      }
    });

    socket.on('check_game_status', (data: { roomId: string }) => {
      if (!activeGames[data.roomId]) {
        socket.emit('game_error', { code: 'GAME_NOT_FOUND', message: 'Session invalid/expired.' });
      }
    });

    // Emergency cleanup & Disconnect Handling
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`);

      const idx = waitingQueue.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        console.log(`Removing ${socket.id} from waiting queue`);
        waitingQueue.splice(idx, 1);
      }

      const gameId = Object.keys(activeGames).find(gid => activeGames[gid].players[socket.id]);
      if (gameId) {
        const game = activeGames[gameId];
        console.log(`Player ${socket.id} disconnected from active game ${gameId}`);

        const opponentId = Object.keys(game.players).find(pid => pid !== socket.id);
        if (opponentId) {
          console.log(`Awarding win to opponent ${opponentId}`);
          // Auto-Win for opponent
          game.players[opponentId].winStreak += 1;
          game.players[opponentId].utilizationIndex += 5;
          io.to(game.roomId).emit('game_over', {
            winnerId: opponentId,
            reason: 'disconnect',
            stats: {
              winStreak: game.players[opponentId].winStreak,
              utilizationIndex: game.players[opponentId].utilizationIndex
            }
          });
        }
        delete activeGames[gameId];
      } else {
        console.log(`User ${socket.id} was not in an active game`);
      }
    });
  });
};

const resolveRound = (io: Server, game: GameState) => {
  // Clear any pending timeout since we are resolving now
  if ((game as any).roundTimeout) {
    clearTimeout((game as any).roundTimeout);
    (game as any).roundTimeout = null;
  }

  const pIds = Object.keys(game.players);
  const p1Id = pIds[0];
  const p2Id = pIds[1];

  const a1 = game.answers[p1Id];
  const a2 = game.answers[p2Id];

  // Handle timeout case: If answer is missing, treat as wrong (and very slow)
  const a1Res = a1 || { time: 9999, correct: false };
  const a2Res = a2 || { time: 9999, correct: false };

  let damages: Record<string, number> = { [p1Id]: 0, [p2Id]: 0 };
  let messages: Record<string, string> = { [p1Id]: '', [p2Id]: '' };
  let isCritical = false;
  let roundWinnerId: string | null = null;
  let damageDealt = 0;

  // Logic:
  // Both Correct -> Faster one deals 5-8% (Speed)
  // One Correct -> Deals 25-30% (Crit)
  // Both Wrong -> No damage

  if (a1Res.correct && a2Res.correct) {
    // RACE Condition
    roundWinnerId = a1Res.time < a2Res.time ? p1Id : p2Id;
    damageDealt = Math.floor(Math.random() * 4) + 5; // 5-8 inclusive

    // Winner deals damage to Loser
    const loser = roundWinnerId === p1Id ? p2Id : p1Id;
    damages[loser] = damageDealt;
    messages[roundWinnerId] = '¡Más rápido!';
    messages[loser] = '¡Lento!';
    isCritical = false;
  } else if (a1Res.correct) {
    // Only P1 Correct (CRIT)
    roundWinnerId = p1Id;
    damageDealt = Math.floor(Math.random() * 6) + 25; // 25-30 inclusive
    damages[p2Id] = damageDealt;
    messages[p1Id] = '¡GOLPE CRÍTICO!';
    messages[p2Id] = 'Incorrecto';
    isCritical = true;
  } else if (a2Res.correct) {
    // Only P2 Correct (CRIT)
    roundWinnerId = p2Id;
    damageDealt = Math.floor(Math.random() * 6) + 25; // 25-30 inclusive
    damages[p1Id] = damageDealt;
    messages[p2Id] = '¡GOLPE CRÍTICO!';
    messages[p1Id] = 'Incorrecto';
    isCritical = true;
  } else {
    // Both wrong
    messages[p1Id] = 'Fallaste';
    messages[p2Id] = 'Fallaste';
    roundWinnerId = 'draw'; // Signal no winner
  }

  // Apply damage
  game.players[p1Id].health = Math.max(0, game.players[p1Id].health - damages[p1Id]);
  game.players[p2Id].health = Math.max(0, game.players[p2Id].health - damages[p2Id]);

  // Check Game Over
  let gameOver = false;
  let winnerId: string | null = null;

  if (game.players[p1Id].health <= 0) { gameOver = true; winnerId = p2Id; }
  else if (game.players[p2Id].health <= 0) { gameOver = true; winnerId = p1Id; }

  if (gameOver && winnerId) {
    const loserId = winnerId === p1Id ? p2Id : p1Id;
    game.players[winnerId].winStreak += 1;
    game.players[winnerId].utilizationIndex += 10;
    game.players[loserId].winStreak = 0;
    game.players[loserId].utilizationIndex += 2;
  }

  // Send Results
  io.to(game.roomId).emit('round_result', {
    winnerId: roundWinnerId,
    damage: damageDealt,
    damages, // Keep for legacy if needed, but updated frontend uses above
    healths: { [p1Id]: game.players[p1Id].health, [p2Id]: game.players[p2Id].health },
    messages,
    isCritical
  });

  // Reset for next round
  game.answers = {};

  if (gameOver) {
    setTimeout(() => {
      const winnerStats = winnerId ? {
        winStreak: game.players[winnerId].winStreak,
        utilizationIndex: game.players[winnerId].utilizationIndex
      } : undefined;

      io.to(game.roomId).emit('game_over', { winnerId, stats: winnerStats });
      delete activeGames[game.roomId];
    }, 2000);
  } else {
    setTimeout(() => {
      game.currentQuestionIndex++;
      game.roundStartTime = Date.now();
      io.to(game.roomId).emit('round_start', { questionIndex: game.currentQuestionIndex });
    }, 3000); // 3s delay to show animations
  }
};
