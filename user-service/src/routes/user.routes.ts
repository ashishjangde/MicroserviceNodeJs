// src/routes/user.routes.ts
import { Router } from "express";
import { Login, Logout, Refresh, Signup, Verify } from "../controller/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/signup", Signup);
userRouter.post("/login", Login);
userRouter.post("/logout", authMiddleware, Logout);
userRouter.post("/refresh", Refresh);
userRouter.post("/verify", Verify);
userRouter.get("hello" , (req, res)=>{
    console.log("hello")
    res.status(200).json({
        message: "response sucessfull"
    })
})

export default userRouter;