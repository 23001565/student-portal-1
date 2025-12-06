import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  //url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

await redis.connect();

export default redis;
