import asyncHandler from "../utils/asyncHandler.js";
import { PostRepository } from "../repositories/PostRepository.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { PostCreationSchema } from "../schema/PostCreationSchema.js";
import { formatValidationErrors } from "../utils/ZodErrorFormator.js";



export const getAllPosts = asyncHandler(async (req, res) => {
    const userId = req.headers["x-user-id"];
        console.log(userId);
    if (!userId) {
        throw new ApiError(404 , "User not found");
    }
    const posts = await PostRepository.getPostByUserId(userId as string); 
    

    res.status(200).json(
        new ApiResponse(
            posts,
        )
    );

});


export const getPostById = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const post = await PostRepository.getPostById(postId);
    if (!post) {
        throw new ApiError(404 , "Post not found");
    }
    res.status(200).json(
        new ApiResponse(
            post
        )
    );

});

export const createPost = asyncHandler(async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    if (!userId)  throw new ApiError(404 , "User not found");

    const result = await PostCreationSchema.safeParse(req.body);
    if (!result.success) {
        const error = formatValidationErrors(result.error);
        throw new ApiError(400, "Validation error", error);
    }

    const post = await PostRepository.createPost({
        ...result.data,
        userId
    });

    res.status(201).json(
        new ApiResponse(
            post
        )
    );
});


export const deletePost = asyncHandler(async (req, res) => {
    const userId = req.headers["x-user-id"] as string;
    console.log(userId);
    if (!userId)  throw new ApiError(404 , "User not found");
    const postId = req.params.postId;

    const post = await PostRepository.getPostById(postId);
    if (post?.userId !== userId) {
        throw new ApiError(404 , "You are not authorized to delete this post");
    }
    const postTobeDeleted = await PostRepository.deletePost(postId);

    if (!postTobeDeleted) {
        throw new ApiError(400 , "something went wrong while deleting post");
    }

    res.status(200).json(
        new ApiResponse(
            post
        )
    );
})