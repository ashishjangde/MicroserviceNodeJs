
import { NextFunction, Request, Response } from "express";

type ResponseType = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<Response | void> | Response | void;


export const asyncHandler = (fn: ResponseType) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(error => next(error));
};
