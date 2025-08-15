import crypto from "crypto";

const BOT_UID = "BOT_1"; // fixed for simplicity

async function fetchBotUsername() {
  try {
    const response = await fetch("https://randomuser.me/api/");
    if (!response.ok) throw new Error("Failed to fetch bot username");

    const data = await response.json();
    // The API returns results[0].login.username as username
    return data.results[0].login.username;
  } catch (error) {
    console.error("Error fetching bot username:", error);
    return "RockyBot"; // fallback username
  }
}


export async function createHiddenBot( player ) {

  const randomElo = player.elo + Math.floor(Math.random() * (200)) - 100;
  const username = await fetchBotUsername();

  return {
    uid: BOT_UID,
    elo: randomElo,
    username: username,
    photoURL: null,
    socketId: null,
    isBot: true,
  };
}

// Random bot move
export function getBotMove() {
  const choices = ["ROCK", "PAPER", "SCISSORS"];
  return choices[Math.floor(Math.random() * choices.length)];
}

// Play bot move after delay, emit to human player only
export function playBotRound(io, roomId, game, acceptChoices) {
  const humanPlayer = game.players.find(p => !p.isBot);
  if (!humanPlayer) return;

  const round = game.round;
  if (!game.playerChoices[round]) game.playerChoices[round] = {};


  const actualPlayTime = Math.floor(Math.random() * 3) + 2;

  
  setTimeout(() => {
    const botChoice = getBotMove();
    game.playerChoices[round][BOT_UID] = botChoice;
    if (game.playerChoices[round][humanPlayer.uid] && !game.choicesAccepted[round]) {
      acceptChoices(roomId);
    }
  },actualPlayTime * 1000)

  const fakeOutCount = Math.floor(Math.random() * 15) + 50;
  const maxDuration = 30000; // 30 seconds
  const showTimes = [];
  const hands = ["ROCK", "PAPER", "SCISSORS"]

  for (let i = 0; i < fakeOutCount; i++) {
    showTimes.push(Math.floor(Math.random() * maxDuration));
  }
  showTimes.push(Math.floor(Math.random() * 5000) + (maxDuration - 5000));
  showTimes.sort((a, b) => a - b);

  const timeouts = [];

  showTimes.forEach((time) => {
    const timeoutId = setTimeout(() => {
      io.to(humanPlayer.socketId).emit("opponent-shown-hand", {
        hand: hands[Math.floor(Math.random() * 3)],
      });
    }, time);

    timeouts.push(timeoutId);
  });

  // Return a cancel function
  return () => {
    timeouts.forEach(clearTimeout);
  };
}
