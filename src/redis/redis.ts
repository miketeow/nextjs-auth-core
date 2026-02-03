import { env } from "@/env";
import Redis from "ioredis";

const getRedisClient = () => {
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL);
  }

  throw new Error("REDIS_URL is not defined");
};

export const redis = getRedisClient();
