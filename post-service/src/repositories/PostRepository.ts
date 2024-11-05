import { Post } from "@prisma/client";
import { handleDatabaseOperation } from "../utils/handelDatabaseOperation.js";
import { prisma } from "../db/dbConnect.js";

export const PostRepository = {
    createPost: async (post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<Post> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.post.create({
                data: post,
            });
        });
    },



    getPostById: async (id: string): Promise<Post | null> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.post.findUnique({
                where: {
                    id,
                },
            });
        });
    },

     async getPostByUserId(userId: string, page: number = 1, count: number = 10): Promise<Post[]> {
        return await prisma.post.findMany({
            where: {
                userId: userId
            },
            skip: (page - 1) * count,
            take: count,
            orderBy: {
                createdAt: 'desc' 
            }
        });
    },

    deletePost: async (id: string): Promise<Post> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.post.delete({
                where: {
                    id,
                },
            });
        });
    },

    async getPostCount(userId: string): Promise<number> {
        return await prisma.post.count({
            where: {
                userId: userId
            }
        });
    }
};
