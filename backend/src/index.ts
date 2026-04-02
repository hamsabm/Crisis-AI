import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { authRouter } from './routes/auth.js';
import { alertRouter } from './routes/alerts.js';
import { scenarioRouter } from './routes/scenarios.js';
import { chatRouter } from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
// @ts-ignore
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { startDataIngestion } from './services/dataIngestion.js';
import { alertProcessor } from './services/alertProcessor.js';

// Connect to MongoDB
let mongoReady = false;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crisisiq')
  .then(() => {
    mongoReady = true;
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));

// Basic service health endpoints (used by Kubernetes probes)
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => {
  const ready = mongoReady;
  res.status(ready ? 200 : 503).json({ ready, mongoReady });
});

const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();
app.use('/graphql', expressMiddleware(apolloServer));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/alerts', authenticate, alertRouter);
app.use('/api/scenarios', authenticate, scenarioRouter);
app.use('/api/chat', authenticate, chatRouter);

// WebSocket connection handling
// We skip full validation here for basic setup
io.use(async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;
    if (!token) return next(new Error('Authentication failed'));

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'jwt_dev_secret_12345') as any;
    if (!payload?.userId || !payload?.role) {
      return next(new Error('Authentication failed'));
    }

    (socket as any).user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket: any) => {
  console.log(`User connected: ${socket.user.id}`);
  
  socket.join(`user:${socket.user.id}`);
  if (socket.user.role === 'responder') {
    socket.join('responders');
  }
  
  socket.on('subscribe:location', (coords: any) => {
    socket.join(`geo:${coords.region}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startDataIngestion();
  alertProcessor.setIo(io);
  alertProcessor.start();
});

export { io };
