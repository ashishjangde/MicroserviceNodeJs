import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const connectDB = () => {
  return new Promise<void>((resolve, reject) => {
    prisma.$connect()
      .then(() => {
        console.log('Database connected successfully.');
        resolve(); 
      })
      .catch((error:any) => {
        console.error('Failed to connect to the database:', error);
        reject(error); 
      });
  });
};

const gracefulShutdown = async () => {
  console.log('Disconnecting Prisma Client...');
  await prisma.$disconnect();
  console.log('Prisma Client disconnected.');
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export { prisma, connectDB };
