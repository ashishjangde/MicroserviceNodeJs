// app.ts
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import userRouter from "./routes/user.routes.js";
// import userRouter from "./routes/user.routes.js";


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());


 app.use("/user", userRouter);

app.use(errorHandler);

export default app;
