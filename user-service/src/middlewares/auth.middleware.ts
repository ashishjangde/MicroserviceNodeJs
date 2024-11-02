import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helper/JwtHelper.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


declare module 'express' {
    interface Request {
        user?: any; 
    }
}

interface User {
    id: string;
   
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            res.status(401).json(
                new ApiResponse(null ,new ApiError(401, 'No token provided'))
            );
            return;
        }

        const token = authorization.split(' ')[1];
        const user = await verifyToken(token) as User;

        req.user = user;

        next();
    } catch (error) {
        res.status(401).json(
            new ApiResponse(null ,new ApiError(401, 'Unauthorized: Invalid token'))
        );
    }
};