// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { MatchManager } from './game/MatchManager.js';
import { registerSocketHandlers } from './socket/socketHandlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

app.use(cors({ origin: FRONTEND_URL }));

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

const matchManager = new MatchManager();

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeMatches: matchManager.activeMatchCount,
    timestamp: new Date().toISOString(),
  });
});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket, matchManager);
});

const PORT = process.env.PORT || 4002;
httpServer.listen(PORT, () => {
  console.log(`Arena Duel backend running on http://localhost:${PORT}`);
});
