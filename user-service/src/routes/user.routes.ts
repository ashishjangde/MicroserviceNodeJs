import { Router } from "express";
import {Login,Logout,Refresh ,Signup ,Verify} from "../controller/user.controller.js";


const userRouter = Router();

userRouter.post("/signup", Signup);
userRouter.post("/login", Login);
userRouter.post("/logout", Logout);
userRouter.post("/refresh", Refresh);
userRouter.post("/verify", Verify);

export default userRouter