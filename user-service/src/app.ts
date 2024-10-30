// app.ts
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import userRouter from "./routes/user.routes.js";


const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Mount your routes
app.use("/", userRouter);
// Error handler middleware (must come after routes)
app.use(errorHandler);

export default app;
