/*
import redisClient from '../../data/redis.js';

export const setCache = async (key, value, ttlSec = 3600) => {
  await redisClient.set(key, JSON.stringify(value), { EX: ttlSec });
};

export const getCache = async (key) => {
  const val = await redisClient.get(key);
  return val ? JSON.parse(val) : null;
};

export const delCache = async (key) => {
  await redisClient.del(key);
};
*/