import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import postRouter from "./routes/post.routes.js";
import { healthCheck } from "./controller/healthController.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/health", healthCheck);
app.use("/post", postRouter);


app.use(errorMiddleware);


export default app;