import jwt from 'jsonwebtoken';
import { User } from '../middlewares/auth.middleware.js';
import dotenv from 'dotenv';
dotenv.config();


const secret = process.env.JWT_SECRET!;




export const verifyToken = (token: string) => {
    return new Promise<User>((resolve, reject) => {
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                return reject(err);
            }
            resolve(user as User);
        });
    });
};
