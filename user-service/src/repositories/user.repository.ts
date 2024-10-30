import { prisma } from "../db/dbConnect.js"
import { handleDatabaseOperation } from "../utils/handelDatabaseOperation.js"
import { User } from "@prisma/client"


export const userRepository = {

    createUser: ( userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User> =>
        handleDatabaseOperation(() =>
            prisma.user.create({ data: userData as User })
        ),

    getUserByEmail: async (email: string): Promise<User | null> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.user.findUnique({ where: { email } });
        });
    },

    getUserById: async (id: string): Promise<User | null> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.user.findUnique({ where: { id } });
        });
    },

    getUserByUsername: async (username: string): Promise<User | null> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.user.findUnique({ where: { username } });
        })
    },
    saveUser: async (user: User & Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "email">>): Promise<User> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.user.update({ where: { id: user.id }, data: user });
        });
    }
};