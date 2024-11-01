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

    getPostByUserId: async (
        userId: string,
        page: number = 1,
        count: number = 10,
    ): Promise<Post[]> => {
        return await handleDatabaseOperation(async () => {
            return await prisma.post.findMany({
                where: {
                    userId,
                },
                skip: (page - 1) * count,
                take: count,
            });
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
};
