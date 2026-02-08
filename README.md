
# Game Matching & Quiz API (Node.js)

## How to run
1. Install Node.js
2. npm install
3. node index.js
4. Server runs on http://localhost:3000

## APIs implemented
- POST /matchmaking/start
- GET /quiz/:sessionId
- POST /quiz/:sessionId/submit
- GET /quiz/:sessionId/result

## Logic
- Players are matched by level using an in-memory queue
- Same quiz questions are assigned per session
- Winner is decided by score, with completion time as tie-breaker
