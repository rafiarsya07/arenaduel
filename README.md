# Arena Duel — Real-Time 1v1 Tactical Combat

A server-authoritative real-time multiplayer duel game. Two players connect
from different devices anywhere in the world, pick simultaneous actions each
round, and the server resolves the outcome fairly and deterministically.

No database. No accounts. No AI. Pure real-time game logic, the kind of
system design that comes up in technical interviews when discussing state
machines, race conditions, and authoritative multiplayer architecture.

---

## Why this is a strong portfolio piece

This project demonstrates several concrete, defensible engineering decisions:

1. Server-authoritative architecture: the server is the single source
   of truth for game state. Clients send intents ("I choose Attack"), never
   results. This is the same principle every real online game uses to
   prevent cheating, a malicious client cannot simply declare itself the
   winner.

2. Simultaneous action resolution: both players choose an action at the
   same time without seeing the opponent's choice. The server must wait for
   both submissions (or a timeout) before resolving, then compute a
   deterministic outcome from a complete 3x3 action matchup table. This is a
   real concurrency problem, not just an if/else chain.

3. Explicit state machine: every match moves through clearly defined
   phases (waiting_for_opponent, countdown, selecting, resolving, ended),
   with no ambiguous in-between states.

4. Cooldown and resource management: the Special action has a
   round-based cooldown, enforced server-side (not just hidden in the UI),
   so it can't be bypassed by a modified client.

5. Disconnect/reconnect handling: a dropped connection doesn't
   immediately end the match; there's a grace period before the match is
   torn down, which is a real production concern for any real-time system.

---

## Stack

- Backend: Node.js + Express + Socket.IO, all game state lives in
  memory (a Map), nothing persisted to disk or a database
- Frontend: React + Vite + Tailwind, all visuals are SVG/CSS, no image
  assets
- No AI, no paid API, no database

---

## How a match works, step by step

1. Create / Join: Player A creates a room and gets a 5-character room
   code. Player B enters that code to join. No accounts, no login.
2. Countdown: once both players are in, a 3-second countdown plays for
   both clients simultaneously.
3. Selecting: each round lasts 5 seconds. Both players privately choose
   Attack, Defend, or Special. The opponent only sees "they've locked in",
   never what they chose, until the round resolves.
4. Resolving: the moment both players have submitted (or the timer
   expires, defaulting non-responders to Defend), the server runs the
   action-matchup table, applies damage, updates cooldowns, and broadcasts
   the result to both clients at once.
5. Repeat until someone's HP reaches 0 (or a 30-round safety cap is hit,
   highest HP wins, tied HP is a draw).

---

## The action matchup table

| Action 1 | Action 2 | Result |
|---|---|---|
| Attack | Attack | Both take 12 damage (trade) |
| Attack | Defend | Defender blocks fully; attacker takes 6 counter damage |
| Attack | Special | Both connect, Attack does 18, Special does 30 |
| Defend | Defend | Nothing happens |
| Defend | Special | Special partially breaks through Defend for 10 damage |
| Special | Special | Both take 15 (reduced trade) |

Special has a 3-round cooldown after use, enforced server-side via
isActionAvailable(), a client cannot submit Special while on cooldown; the
server silently rejects the submission.

---

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
You should see: `Arena Duel backend running on http://localhost:4002`

### 2. Frontend

In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open `http://localhost:5175`.

### 3. Play a match

1. Open the app in two different browser tabs (or two devices on the same
   network, or two devices anywhere once deployed)
2. In tab 1: click "Create Room", note the 5-character code
3. In tab 2: enter that code and click "Join Room"
4. Both tabs will show a 3-second countdown, then the duel begins
5. Pick Attack / Defend / Special each round, try to out-think your opponent

---

## Project structure

```
arena-duel/
backend/
  src/
    game/
      gameRules.js        all balance numbers and phase constants in one place
      actionResolver.js    the 3x3 matchup resolution algorithm
      Match.js              per-match state machine (the core logic)
      MatchManager.js        in-memory registry of all active matches
    socket/
      socketHandlers.js     wires Socket.IO events to game logic, drives the
                              round timer loop
    server.js
frontend/
  src/
    components/
      Fighter.jsx           SVG character, poses driven by game state
      HPBar.jsx
      ActionButton.jsx      attack/defend/special buttons with cooldown display
      RoundTimer.jsx          circular countdown
      FloatingDamage.jsx       animated damage numbers
    pages/
      LobbyPage.jsx          create/join room
      WaitingPage.jsx         waiting for opponent, room code display
      GamePage.jsx              the actual duel screen
    hooks/
      useSocket.js            Socket.IO connection management
    App.jsx                    routes between lobby/waiting/game, owns all
                                 socket event subscriptions
```

---

## Deploying so it works across the internet (not just localhost)

Real-time multiplayer needs a server that stays running and supports
persistent WebSocket connections, this rules out static hosting for the
backend.

### Backend - Render.com (or Railway/Fly.io)
1. Push this repo to GitHub
2. On Render: New, Web Service, connect repo, root directory backend
3. Build command: npm install. Start command: npm start
4. Add environment variable FRONTEND_URL set to your deployed frontend URL
5. Note the backend's public URL

### Frontend - Cloudflare Pages
1. New Pages project, connect repo, root directory frontend
2. Build command: npm run build. Output directory: dist
3. Environment variable VITE_SOCKET_URL = your Render backend URL
4. Deploy, then add a custom subdomain if desired (e.g. duel.yourdomain.com)

A note on free-tier hosting and real-time games: Render's free tier
sleeps after inactivity, which adds a roughly 30 second wake-up delay on the
first connection after idling. For a portfolio demo this is a known,
explainable tradeoff (and a good talking point: "in production this would
run on an always-on instance or use a keep-alive ping").

---

## Known limitations (good interview talking points)

- No matchmaking queue, players must share a room code manually. A natural
  next step would be a "quick match" queue that auto-pairs two waiting
  players.
- No reconnection token, if a player refreshes the page mid-match, they get
  a new socket ID and can't rejoin their old session even within the grace
  period. Adding a persisted (in-memory) reconnect token keyed by a
  client-generated session ID would fix this.
- Balance numbers are illustrative, not rigorously playtested, the point of
  this project is the system design, not competitive game balance.

## Possible next steps

- Add a "quick match" auto-matchmaking queue
- Add a best-of-3 format instead of single elimination
- Swap the SVG fighters for real sprite assets, the rendering layer
  (Fighter.jsx) is intentionally decoupled from the game logic, so this is
  a presentation-only change with zero impact on the backend
# arenaduel
