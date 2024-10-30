import { User } from "@prisma/client";
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET!;

export const generateAccessToken = (id: User["id"], email: User["email"]) => {
    return new Promise<string>((resolve, reject) => {
        const accessToken = jwt.sign({ id, email }, secret, { expiresIn: '10m' });
        if (accessToken) {
            resolve(accessToken);
        } else {
            reject("Failed to generate access token");
        }
    });
};

export const generateRefreshToken = (id: User["id"]) => {
    return new Promise<string>((resolve, reject) => {
        const refreshToken = jwt.sign({ id }, secret, { expiresIn: '1y' });
        if (refreshToken) {
            resolve(refreshToken);
        } else {
            reject("Failed to generate refresh token");
        }
    });
};

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
