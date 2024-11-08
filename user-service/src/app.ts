import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { healthCheck } from "./controller/healthController.js";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/health", healthCheck);
app.use("/auth", userRouter);



 app.use(errorMiddleware);

export default app;
