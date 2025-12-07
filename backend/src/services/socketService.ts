import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  health: number;
  maxHealth: number;
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
            [p1.id]: { id: p1.id, name: p1.name, avatar: p1.avatar, score: 0, health: 100, maxHealth: 100 },
            [p2.id]: { id: p2.id, name: p2.name, avatar: p2.avatar, score: 0, health: 100, maxHealth: 100 }
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

        // Notify Players Individually
        if (s1) s1.emit('match_found', { roomId, opponent: p2 });
        if (s2) s2.emit('match_found', { roomId, opponent: p1 });
        
        // Use a slight delay to ensure client navigation? 
        // Better: Client emits 'ready_for_battle' after nav, then server starts round.
        // For simplicity: Emit round start immediately but client handles it.
        
        // Actually, let's wait for basic 'ready' or just start
        io.to(roomId).emit('round_start', { questionIndex: 0 });
      }
    });

    // --- GAMEPLAY ---
    socket.on('submit_answer', (data: { roomId: string; correct: boolean }) => {
      const game = activeGames[data.roomId];
      if (!game) return;

      // prevent double answer
      if (game.answers[socket.id]) return;

      const timeTaken = (Date.now() - game.roundStartTime) / 1000;
      game.answers[socket.id] = { time: timeTaken, correct: data.correct };

      // Notify opponent that this player answered (for the bar animation)
      socket.to(data.roomId).emit('opponent_answered');

      // Check if both answered
      const playerIds = Object.keys(game.players);
      if (Object.keys(game.answers).length === playerIds.length) {
        resolveRound(io, game);
      }
    });

    // Emergency cleanup
    socket.on('disconnect', () => {
      const idx = waitingQueue.findIndex(p => p.id === socket.id);
      if (idx !== -1) waitingQueue.splice(idx, 1);
      
      // Handle active game disconnects (win by default) if needed
    });
  });
};

const resolveRound = (io: Server, game: GameState) => {
  const pIds = Object.keys(game.players);
  const p1Id = pIds[0];
  const p2Id = pIds[1];
  
  const a1 = game.answers[p1Id];
  const a2 = game.answers[p2Id];

  // Logic:
  // Both Correct -> Faster one deals 5-10
  // One Correct -> Deals 25-30 (Crit)
  // Both Wrong -> No damage

  let damages: Record<string, number> = { [p1Id]: 0, [p2Id]: 0 };
  let messages: Record<string, string> = { [p1Id]: '', [p2Id]: '' };

  if (a1.correct && a2.correct) {
    // RACE
    const winner = a1.time < a2.time ? p1Id : p2Id;
    const damage = Math.floor(Math.random() * 6) + 5; // 5-10
    
    // Winner deals damage to Loser
    const loser = winner === p1Id ? p2Id : p1Id;
    damages[loser] = damage;
    messages[winner] = '¡Más rápido! (Daño Ligero)';
    messages[loser] = '¡Demasiado lento!';
  } else if (a1.correct) {
    // Only P1 Correct (CRIT)
    const damage = Math.floor(Math.random() * 6) + 25; // 25-30
    damages[p2Id] = damage; // P1 damage P2
    messages[p1Id] = '¡GOLPE CRÍTICO!';
    messages[p2Id] = 'Respuesta Incorrecta';
  } else if (a2.correct) {
     // Only P2 Correct (CRIT)
    const damage = Math.floor(Math.random() * 6) + 25; // 25-30
    damages[p1Id] = damage; // P2 damage P1
    messages[p2Id] = '¡GOLPE CRÍTICO!';
    messages[p1Id] = 'Respuesta Incorrecta';
  } else {
    // Both wrong
    messages[p1Id] = 'Ambos fallaron';
    messages[p2Id] = 'Ambos fallaron';
  }

  // Apply damage
  game.players[p1Id].health = Math.max(0, game.players[p1Id].health - damages[p1Id]);
  game.players[p2Id].health = Math.max(0, game.players[p2Id].health - damages[p2Id]);

  // Check Game Over
  let gameOver = false;
  let winnerId: string | null = null;

  if (game.players[p1Id].health <= 0) { gameOver = true; winnerId = p2Id; }
  else if (game.players[p2Id].health <= 0) { gameOver = true; winnerId = p1Id; }

  // Send Results
  io.to(game.roomId).emit('round_result', {
    damages,
    healths: { [p1Id]: game.players[p1Id].health, [p2Id]: game.players[p2Id].health },
    messages
  });

  // Reset for next round
  game.answers = {};
  
  if (gameOver) {
     setTimeout(() => {
        io.to(game.roomId).emit('game_over', { winnerId });
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
