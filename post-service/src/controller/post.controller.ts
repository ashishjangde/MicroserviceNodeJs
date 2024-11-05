import asyncHandler from "../utils/asyncHandler.js";
import { PostRepository } from "../repositories/PostRepository.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PostCreationSchema } from "../schema/PostCreationSchema.js";
import { formatValidationErrors } from "../utils/ZodErrorFormator.js";
import postRedisRepository from "../redis-repository/post-repository.redis.js";

export const getAllPosts = asyncHandler(async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    // Parse pagination parameters with validation
    const page = Math.max(1, parseInt(req.query.page as string) || 1); // Ensure minimum page is 1
    const count = Math.min(50, Math.max(1, parseInt(req.query.count as string) || 10)); // Limit count between 1 and 50

    // First try to get total count for pagination
    const totalPosts = await PostRepository.getPostCount(userId);
    const totalPages = Math.ceil(totalPosts / count);

    // Validate page number
    if (page > totalPages && totalPages > 0) {
        throw new ApiError(400, `Page ${page} does not exist. Total pages: ${totalPages}`);
    }

    // Try to get posts from Redis
    let posts = await postRedisRepository.getPostByUserId(userId, page, count);

    // If not in Redis, get from database and cache
    if (!posts) {
        posts = await PostRepository.getPostByUserId(userId, page, count);
        if (posts && posts.length > 0) {
            await postRedisRepository.setAllPostByUserId(userId, posts);
        }
    }

    // Return pagination metadata along with posts
    res.status(200).json(new ApiResponse({
        posts: posts || [],
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            postsPerPage: count,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    }));
});

export const getPostById = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    
    // Try to get from Redis first
    let post = await postRedisRepository.getPostById(postId);
    
    // If not in Redis, get from database and cache
    if (!post) {
        post = await PostRepository.getPostById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }
        await postRedisRepository.setPostById(postId, post);
    }

    res.status(200).json(new ApiResponse(post));
});

export const createPost = asyncHandler(async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    const result = await PostCreationSchema.safeParse(req.body);
    if (!result.success) {
        const error = formatValidationErrors(result.error);
        throw new ApiError(400, "Validation error", error);
    }

    const post = await PostRepository.createPost({
        ...result.data,
        userId,
    });

    // Cache the new post
    await postRedisRepository.setPostById(post.id, post);
    
    // Update the user's post list in cache
    const userPosts = await PostRepository.getPostByUserId(userId, 1, 10);
    await postRedisRepository.setAllPostByUserId(userId, userPosts);

    res.status(201).json(new ApiResponse(post));
});

export const deletePost = asyncHandler(async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    const postId = req.params.postId;
    
    // Check if post exists and user is authorized
    let post = await postRedisRepository.getPostById(postId);
    if (!post) {
        post = await PostRepository.getPostById(postId);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }
    }

    if (post.userId !== userId) {
        throw new ApiError(403, "You are not authorized to delete this post");
    }

    // Delete from database
    const postDeleted = await PostRepository.deletePost(postId);
    if (!postDeleted) {
        throw new ApiError(400, "Something went wrong while deleting the post");
    }

    // Delete from Redis cache
    await postRedisRepository.deletePostById(postId);
    
    // Update user's post list in cache
    const updatedPosts = await PostRepository.getPostByUserId(userId, 1, 10);
    await postRedisRepository.setAllPostByUserId(userId, updatedPosts);

    res.status(200).json(new ApiResponse({ message: "Post deleted successfully" }));
});