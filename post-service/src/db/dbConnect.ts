import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

const prisma = new PrismaClient();
let redisClient: ReturnType<typeof createClient>;


const connectDB = async () => {
  return prisma.$connect()
    .then(() => {
      console.log("Database connected successfully.");

      redisClient = createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
      });


      return redisClient.connect();
    })
    .then(() => {
      console.log("Redis client connected successfully.");

      redisClient.on("error", (error) => {
        console.error("Redis connection error:", error);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to the database or Redis:", error);
      return Promise.reject(error); // Rethrow to indicate failure
    });
};


const gracefulShutdown = () => {
  console.log("Starting graceful shutdown...");

  return prisma.$disconnect()
    .then(() => {
      console.log("Prisma Client disconnected.");
      return redisClient ? redisClient.disconnect() : Promise.resolve();
    })
    .then(() => {
      if (redisClient) console.log("Redis Client disconnected.");
    })
    .catch((error) => {
      console.error("Error during shutdown:", error);
    });
};


process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export { prisma, redisClient, connectDB };
