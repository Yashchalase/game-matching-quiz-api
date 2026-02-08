const express = require("express");
const app = express();

app.use(express.json());

const waitingPlayers = {
  beginner: []
};

const gameSessions = {};

const quizQuestions = [
  {
    id: 1,
    question: "What is JavaScript?",
    options: ["Language", "Framework", "Database", "OS"],
    correct: "Language"
  },
  {
    id: 2,
    question: "What is Node.js?",
    options: ["Browser", "Runtime", "Library", "Framework"],
    correct: "Runtime"
  },
  {
    id: 3,
    question: "Which keyword is used to declare a variable?",
    options: ["var", "int", "define", "make"],
    correct: "var"
  }
];

//  HOME 
app.get("/", (req, res) => {
  res.send("Game backend running");
});

//  PLAYER MATCHMAKING 
app.post("/matchmaking/start", (req, res) => {
  const { playerId } = req.body;
  const level = "beginner";

  if (!playerId) {
    return res.status(400).json({ error: "playerId is required" });
  }

  if (waitingPlayers[level].length > 0) {
    const opponent = waitingPlayers[level].shift();
    const sessionId = Date.now().toString();

    gameSessions[sessionId] = {
      players: [playerId, opponent],
      questions: quizQuestions,
      answers: {},
      startTime: Date.now()
    };

    return res.json({
      status: "matched",
      sessionId,
      players: [playerId, opponent]
    });
  }

  waitingPlayers[level].push(playerId);
  res.json({ status: "waiting" });
});

// GET QUIZ 
app.get("/quiz/:sessionId", (req, res) => {
  const session = gameSessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });

  const questionsForPlayers = session.questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  res.json({ questions: questionsForPlayers });
});

//  SUBMIT ANSWERS 
app.post("/quiz/:sessionId/submit", (req, res) => {
  const { playerId, answers } = req.body;
  const session = gameSessions[req.params.sessionId];

  if (!session) return res.status(404).json({ error: "Session not found" });

  session.answers[playerId] = {
    answers,
    submittedAt: Date.now()
  };

  res.json({ message: "Answers submitted successfully" });
});

// RESULT & WINNER 
app.get("/quiz/:sessionId/result", (req, res) => {
  const session = gameSessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });

  const [player1, player2] = session.players;

  const calculateScore = (playerId) => {
    let score = 0;
    session.answers[playerId].answers.forEach((ans, index) => {
      if (ans === session.questions[index].correct) score++;
    });
    return score;
  };

  const p1Score = calculateScore(player1);
  const p2Score = calculateScore(player2);

  let winner;
  if (p1Score > p2Score) winner = player1;
  else if (p2Score > p1Score) winner = player2;
  else {
    winner =
      session.answers[player1].submittedAt <
      session.answers[player2].submittedAt
        ? player1
        : player2;
  }

  res.json({
    winner,
    scores: {
      [player1]: p1Score,
      [player2]: p2Score
    }
  });
});

// SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
