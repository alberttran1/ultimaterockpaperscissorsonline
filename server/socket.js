import { Server } from "socket.io";
import crypto from "crypto";

import Match from "./models/Match.js";
import Round from "./models/Round.js";
import { createHiddenBot, playBotRound } from "./bot.js";

const unrankedQueue = new Set();
const competitiveQueue = new Map();
const competitiveGames = new Map();
const unrankedGames = new Map();
const customRooms = new Map();

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://ultimaterockpaperscissorsonline.netlify.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-queue", (player) => {
      if (!player) return;
      player.joinedAt = Date.now();
      player.socketId = socket.id;

      if (player.queueType === "COMPETITIVE") {
        competitiveQueue.set(socket.id, player);
        tryToMatchRankedPlayer(player);
      }

      if (player.queueType === "UNRANKED") {
        unrankedQueue.add(player);
        tryToMatchUnrankedPlayer();
      }
    });

    socket.on("leave-queue", () => {
      competitiveQueue.delete(socket.id);
      unrankedQueue.forEach((p) => {
        if (p.socketId === socket.id) unrankedQueue.delete(p);
      });
    });

    socket.on("create-custom-room", (player) => {
      const roomId = crypto.randomUUID();

      const game = {
        roomId,
        players: [
          {
            uid: player.uid,
            username: player.username,
            photoURL: player.photoURL,
            socketId: socket.id,
            elo: player.elo,
          },
        ],
        score: { [player.uid]: 0 },
        readyCheck: { [player.uid]: false },
        playerChoices: {},
        choicesAccepted: {},
        gameStarted: false,
        gameEnded: false,
        round: 0,
      };

      customRooms.set(roomId, game);
      socket.join(roomId);
      socket.emit("room-created", { roomId });
    });

    socket.on("join-custom-room", ({ roomId, player }) => {
      const game = customRooms.get(roomId);
      if (!game || game.players.length >= 2) {
        socket.emit("join-room-failed", { reason: "Room full or doesn't exist" });
        return;
      }

      game.players.push({
        uid: player.uid,
        username: player.username,
        photoURL: player.photoURL,
        socketId: socket.id,
        elo: player.elo,
      });

      game.score[player.uid] = 0;
      game.readyCheck[player.uid] = false;

      customRooms.set(roomId, game);
      socket.join(roomId);

      // move to unrankedGames once full
      customRooms.delete(roomId);
      unrankedGames.set(roomId, game);

      io.to(roomId).emit("match-found", game);
    });

    socket.on("rejoin-room", ({ roomId, playerId }) => {
      const game = competitiveGames.get(roomId) || unrankedGames.get(roomId);
      if (!game) {
        socket.emit("rejoin-failed", { reason: "Game not found" });
        return;
      }

      const player = game.players.find((p) => p.uid === playerId);
      if (!player) {
        socket.emit("rejoin-failed", { reason: "Player not in game" });
        return;
      }

      socket.join(roomId);
      player.socketId = socket.id;

      if (game.disconnectTimeout) {
        clearTimeout(game.disconnectTimeout);
        game.disconnectTimeout = null;
      }

      socket.emit("rejoin-success", game);
    });

    socket.on("game-ready", ({ roomId, playerId }) => {
      const game = competitiveGames.get(roomId) || unrankedGames.get(roomId);
      if (!game) return;

      game.readyCheck[playerId] = true;


      if (
        !game.gameStarted &&
        (Object.values(game.readyCheck).every((value) => value === true) || 
        game.players.find((p) => p.isBot))
      ) {
        game.gameStarted = true;
        startRound(roomId, true);
      }
    });

    socket.on("player-choice", ({ roomId, playerId, choice }) => {
      const game = competitiveGames.get(roomId) || unrankedGames.get(roomId);
      if (!game || game.playerChoices?.[game.round]?.[playerId]) return;

      if (!game.playerChoices[game.round]) {
        game.playerChoices[game.round] = {};
      }
      game.playerChoices[game.round][playerId] = choice;

      if (
        game.playerChoices[game.round][game.players[0].uid] &&
        game.playerChoices[game.round][game.players[1].uid] &&
        !game.choicesAccepted[game.round]
      ) {
        acceptChoices(roomId);
      }
    });

    socket.on("change-shown-hand", ({ roomId, playerId, hand }) => {
      const game = competitiveGames.get(roomId) || unrankedGames.get(roomId);
      if (!game) return;

      const validHands = ["ROCK", "PAPER", "SCISSORS", null];
      if (!validHands.includes(hand)) return;

      socket.to(roomId).emit("opponent-shown-hand", {
        hand,
      });
    });

    // Custom event triggered by bot.js to accept choices after bot plays
    socket.on("bot-round-ready", ({ roomId }) => {
      acceptChoices(roomId);
    });

    socket.on("disconnect", () => {
      competitiveQueue.delete(socket.id);
      unrankedQueue.forEach((p) => {
        if (p.socketId === socket.id) unrankedQueue.delete(p);
      });

      const game =
        Array.from(competitiveGames.values()).find(g =>
          g.players.some(p => p.socketId === socket.id)
        ) ||
        Array.from(unrankedGames.values()).find(g =>
          g.players.some(p => p.socketId === socket.id)
        );

      if (game && !game.gameEnded) {
        const disconnectedPlayer = game.players.find(p => p.socketId === socket.id);
        const opponent = game.players.find(p => p.socketId !== socket.id);

        game.disconnectTimeout = setTimeout(() => {
          if (!game.gameEnded) {
            game.gameEnded = true;
            game.winner = opponent.uid;

            io.to(game.roomId).emit("match-end", {
              finalScore: game.score,
              winner: opponent.uid,
              reason: "opponent-disconnected"
            });

            competitiveGames.delete(game.roomId);
            unrankedGames.delete(game.roomId);
          }
        }, 15000); // 15 seconds
      }
    });
  });

  function tryToMatchRankedPlayer(newPlayer) {
    const others = Array.from(competitiveQueue.values()).filter(
      (p) => p.socketId !== newPlayer.socketId
    );

    for (const p of others) {
      const diff = Math.abs(p.elo - newPlayer.elo);
      if (diff <= 100) {
        competitiveQueue.delete(p.socketId);
        competitiveQueue.delete(newPlayer.socketId);
        startMatch(p, newPlayer, "COMPETITIVE");
        return;
      }
    }

    // start with bot from 4-10 seconds after queue start
    const randomDelay = Math.floor(Math.random() * (10000)) + 2000; // random between 2000 and 10000 ms
    setTimeout(() => {
      startMatchWithBot(newPlayer, "COMPETITIVE");
    }, randomDelay);
  }

  function tryToMatchUnrankedPlayer() {
    const unranked = Array.from(unrankedQueue);

    if (unranked.length >= 2) {
      const p1 = unranked.pop();
      const p2 = unranked.pop();
      unrankedQueue.delete(p1);
      unrankedQueue.delete(p2);
      startMatch(p1, p2, "UNRANKED");
    }

    // start with bot from 4-10 seconds after queue start
    const randomDelay = Math.floor(Math.random() * (10000 - 4000 + 1)) + 4000; // random between 4000 and 10000 ms
    setTimeout(() => {
      if(unranked.length == 1) {
        const p1 = unranked.pop();
        unrankedQueue.delete(p1);
        startMatchWithBot(newPlayer, "UNRANKED");
      }
    }, randomDelay);
  }

  function getTolerance(waitTimeMs) {
    const base = 100;
    const growthPer10s = 50;
    const seconds = waitTimeMs / 1000;
    return base + Math.floor(seconds / 10) * growthPer10s;
  }

  setInterval(() => {
    const players = Array.from(competitiveQueue.values());
    players.sort((a, b) => a.elo - b.elo);

    const matched = new Set();

    for (let i = 0; i < players.length - 1; i++) {
      const p1 = players[i];
      const p2 = players[i + 1];

      if (matched.has(p1.socketId) || matched.has(p2.socketId)) continue;

      const diff = Math.abs(p1.elo - p2.elo);
      const waitTime = Math.min(
        Date.now() - p1.joinedAt,
        Date.now() - p2.joinedAt
      );
      const threshold = getTolerance(waitTime);

      if (diff <= threshold) {
        matched.add(p1.socketId);
        matched.add(p2.socketId);
        competitiveQueue.delete(p1.socketId);
        competitiveQueue.delete(p2.socketId);
        startMatch(p1, p2, "COMPETITIVE");
      }
    }

    tryToMatchUnrankedPlayer();
  }, 3000);

  async function startMatch(p1Data, p2Data, type) {
    const p1 = io.sockets.sockets.get(p1Data.socketId);
    const p2 = io.sockets.sockets.get(p2Data.socketId);
    if (!p1 || !p2) return;

    const roomId = crypto.randomUUID();
    p1.join(roomId);
    p2.join(roomId);

    const players = [p1Data, p2Data].map((user) => ({
      uid: user.uid,
      elo: user.elo,
      username: user.username,
      photoURL: user.photoURL,
      socketId: user.socketId,
    }));

    const score = new Map();
    score.set(p1Data.uid, 0);
    score.set(p2Data.uid, 0);

    const readyCheck = new Map();
    readyCheck.set(p1Data.uid, false);
    readyCheck.set(p2Data.uid, false);

    const game = {
      roomId,
      players,
      score: Object.fromEntries(score),
      readyCheck: Object.fromEntries(readyCheck),
      playerChoices: {},
      choicesAccepted: {},
      gameStarted: false,
      gameEnded: false,
      round: 0,
    };

    if (type === "COMPETITIVE") {
      competitiveGames.set(roomId, game);
    } else {
      unrankedGames.set(roomId, game);
    }

    io.to(roomId).emit("match-found", game);
  }

  function startRound(roomId, firstRound) {
    const game = competitiveGames.get(roomId) || unrankedGames.get(roomId);
    if (!game) return;

    game.round += 1;
    const currentRound = game.round;
    game.choicesAccepted[currentRound] = false;

    const roundDuration = firstRound ? 30000 : 30000;
    const roundEndTime = Date.now() + roundDuration;

    game.roundEndTime = roundEndTime;

    io.to(roomId).emit("round-start", {
      round: currentRound,
      endsAt: game.roundEndTime,
    });

    setTimeout(() => {
      const g = competitiveGames.get(roomId) || unrankedGames.get(roomId);
      if (!g || g.choicesAccepted[currentRound]) return;
      io.to(roomId).emit("request-hands");
    }, roundDuration);

    const botPlayer = game.players.find((p) => p.isBot);
    if (botPlayer) {
      game.stopBot = playBotRound(io, roomId, game, acceptChoices);
    }
  }

  async function acceptChoices(roomId) {
    const game = competitiveGames.get(roomId) || unrankedGames.get(roomId);
    if (!game) return;

    const round = game.round;
    const [p1, p2] = game.players;
    const choice1 = game.playerChoices[round]?.[p1.uid];
    const choice2 = game.playerChoices[round]?.[p2.uid];

    if (!choice1 || !choice2) return;

    game.stopBot()

    // Determine winner
    let winner = null;
    if (choice1 === choice2) {
      winner = "draw";
    } else if (
      (choice1 === "ROCK" && choice2 === "SCISSORS") ||
      (choice1 === "PAPER" && choice2 === "ROCK") ||
      (choice1 === "SCISSORS" && choice2 === "PAPER")
    ) {
      winner = p1.uid;
    } else {
      winner = p2.uid;
    }

    if (winner !== "draw") {
      game.score[winner] += 1;
    }

    game.choicesAccepted[round] = true;

    io.to(roomId).emit("round-results", {
      round,
      choices: {
        [p1.uid]: choice1,
        [p2.uid]: choice2,
      },
      winner,
      score: game.score,
    });

    try {
      if (!game.matchId) {
        const matchDoc = new Match({
          player1: game.players[0].uid,
          player2: game.players[1].uid,
          winner: null,
          createdAt: new Date(),
        });
        const savedMatch = await matchDoc.save();
        game.matchId = savedMatch._id;
      }

      let roundWinner = "draw";
      if (winner === game.players[0].uid) roundWinner = "player1";
      else if (winner === game.players[1].uid) roundWinner = "player2";

      const roundDoc = new Round({
        matchId: game.matchId,
        roundNumber: round,
        player1Hand: choice1,
        player2Hand: choice2,
        winner: roundWinner,
        timestamp: new Date(),
      });

      await roundDoc.save();
    } catch (error) {
      console.error("Error saving round to DB:", error);
    }

    const winsNeeded = 4;
    const scoreVals = Object.values(game.score);
    const maxScore = Math.max(...scoreVals);

    if (maxScore >= winsNeeded) {
      game.gameEnded = true;
      game.winner =
        game.score[p1.uid] > game.score[p2.uid]
          ? p1.uid
          : game.score[p2.uid] > game.score[p1.uid]
          ? p2.uid
          : "draw";

      io.to(roomId).emit("match-end", {
        finalScore: game.score,
        winner: game.winner,
      });

      try {
        if (game.matchId) {
          let matchWinner = "draw";
          if (game.winner === game.players[0].uid)
            matchWinner = game.players[0].uid;
          else if (game.winner === game.players[1].uid)
            matchWinner = game.players[1].uid;

          await Match.findByIdAndUpdate(game.matchId, {
            winner: matchWinner,
          });
        }
      } catch (error) {
        console.error("Error updating match results:", error);
      }

      competitiveGames.delete(roomId);
      unrankedGames.delete(roomId);
    } else {
      setTimeout(() => {
        startRound(roomId, false);
      }, 5000);
    }
  }

  async function startMatchWithBot(humanPlayer, type) {
    const roomId = crypto.randomUUID();
    const botPlayer = await createHiddenBot(humanPlayer);

    // Join human socket to room
    const humanSocket = io.sockets.sockets.get(humanPlayer.socketId);
    if (!humanSocket) return;
    humanSocket.join(roomId);

    const players = [
      {
        ...humanPlayer,
      },
      {
        ...botPlayer,
      },
    ];

    const score = new Map();
    score.set(humanPlayer.uid, 0);
    score.set(botPlayer.uid, 0);

    const readyCheck = new Map();
    readyCheck.set(humanPlayer.uid, false);
    readyCheck.set(botPlayer.uid, false);

    const game = {
      roomId,
      players,
      score: Object.fromEntries(score),
      readyCheck: Object.fromEntries(readyCheck),
      playerChoices: {},
      choicesAccepted: {},
      gameStarted: false,
      gameEnded: false,
      round: 0,
    };

    if (type === "COMPETITIVE") {
      competitiveGames.set(roomId, game);
    } else {
      unrankedGames.set(roomId, game);
    }

    io.to(roomId).emit("match-found", game);
  }
}