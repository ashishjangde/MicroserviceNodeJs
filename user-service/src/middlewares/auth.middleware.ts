import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helper/JwtHelper.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";



export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json(new ApiResponse(null, new ApiError(401, 'No token provided')) );
        }

        const token = authorization.split(' ')[1];
        const user = await verifyToken(token); 

        req.user = user; 
        next();
    } catch (error) {
        res.status(401).json( new ApiResponse(null, new ApiError(401, 'Unauthorized: Invalid token')) );
    }
};
