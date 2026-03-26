import express from 'express';
import { Alert } from '../models/Alert.js';

export const alertRouter = express.Router();

alertRouter.get('/', async (req, res) => {
  const { status, limit } = req.query;
  const query = status ? { status } : {};
  const parsedLimit = Math.min(Number(limit) || 50, 200);

  const alerts = await Alert.find(query)
    .sort({ createdAt: -1 })
    .limit(parsedLimit);

  res.json(alerts);
});

alertRouter.get('/active', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const alerts = await Alert.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(alerts);
});
