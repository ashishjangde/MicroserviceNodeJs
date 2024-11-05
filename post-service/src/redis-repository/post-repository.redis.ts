import { Post } from "@prisma/client";
import { redisClient } from "../db/dbConnect.js";
import { handleDatabaseOperation } from "../utils/handelDatabaseOperation.js";

const EXPIRATION_TIME = 60; // 1 minute

const postRedisRepository = {
    getPostById: async (postId: string): Promise<Post | null> => {
        return await handleDatabaseOperation(async () => {
            const post = await redisClient.get(`post:${postId}`); // Add prefix
            if (post) {
                await redisClient.expire(`post:${postId}`, EXPIRATION_TIME);
                return JSON.parse(post) as Post;
            }
            return null;
        });
    },

    setPostById: async (postId: string, post: Post): Promise<void> => {
        await handleDatabaseOperation(async () => {
            await redisClient.set(`post:${postId}`, JSON.stringify(post));
            await redisClient.expire(`post:${postId}`, EXPIRATION_TIME);
        });
    },

    deletePostById: async (postId: string): Promise<number> => {
        return await handleDatabaseOperation(async () => {
            const post = await redisClient.get(`post:${postId}`);
            if (post) {
                const parsedPost = JSON.parse(post) as Post;
                const userKey = `user:${parsedPost.userId}:posts`;
                await redisClient.lRem(userKey, 0, JSON.stringify(parsedPost));
            }
            return await redisClient.del(`post:${postId}`);
        });
    },

    setAllPostByUserId: async (userId: string, posts: Post[]): Promise<void> => {
        await handleDatabaseOperation(async () => {
            const userKey = `user:${userId}:posts`;
            
            // Clear existing list
            await redisClient.del(userKey);
            
            if (posts.length > 0) {
                // Store posts in reverse chronological order
                const postStrings = posts.map(post => JSON.stringify(post));
                await redisClient.rPush(userKey, postStrings);
                await redisClient.expire(userKey, EXPIRATION_TIME);
            }
        });
    },

    getPostByUserId: async (userId: string, page: number = 1, count: number = 10): Promise<Post[] | null> => {
        return await handleDatabaseOperation(async () => {
            const userKey = `user:${userId}:posts`;
            
            // Calculate start and end indices for pagination
            const start = (page - 1) * count;
            const end = start + count - 1;
            
            // Get posts from Redis
            const posts = await redisClient.lRange(userKey, start, end);
            
            // If no posts found or invalid range, return null to trigger DB fetch
            if (!posts || posts.length === 0) {
                return null;
            }
            
            return posts.map(post => JSON.parse(post) as Post);
        });
    },

    deletePostByUserId: async (userId: string): Promise<number> => {
        return await handleDatabaseOperation(async () => {
            return await redisClient.del(`user:${userId}:posts`);
        });
    },
};

export default postRedisRepository;