import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// 1. Establish the connection to Redis
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null 
});

// 2. Create the Queue
export const aiQueue = new Queue("ai-generation-queue", { connection: connection as any });

console.log("Redis AI Queue initialized");