import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
});

await redis.connect();

export default redis;
