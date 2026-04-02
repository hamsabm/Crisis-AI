import { Alert } from '../models/Alert.js';

export const getAlerts = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const query = status ? { status } : {};
    const parsedLimit = Math.min(Number(limit) || 50, 200);

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

export const getActiveAlerts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const alerts = await Alert.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active alerts' });
  }
};
