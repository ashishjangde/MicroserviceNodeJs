import { Router } from "express";
import { createPost , deletePost , getAllPosts, getPostById  } from "../controller/post.controller.js";

const postRouter = Router();

postRouter.post("/", createPost);
postRouter.get("/", getAllPosts);
postRouter.get("/:postId", getPostById);
postRouter.delete("/delete/:postId", deletePost);

export default postRouter;