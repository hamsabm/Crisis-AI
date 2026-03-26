import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// Only connect if not already connected (prevent multi-call issues)
if (!redis.isOpen) {
  redis.connect().catch(console.error);
}
