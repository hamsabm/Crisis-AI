import { Alert } from '../models/Alert.js';

export const resolvers = {
  Query: {
    alerts: async (_, { limit = 50, severity }) => {
      const query = severity ? { severity } : {};
      return await Alert.find(query).sort({ createdAt: -1 }).limit(limit);
    },
    alert: async (_, { id }) => {
      return await Alert.findById(id);
    }
  }
};
