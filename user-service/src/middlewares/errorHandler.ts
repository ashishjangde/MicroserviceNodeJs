import { ApiError} from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {  Response} from 'express';

export const errorHandler = (err: any, res: Response,): void => {
  if (err instanceof ApiError) {
    const apiResponse = new ApiResponse(null, err);
    console.log(apiResponse);
    res.status(err.statusCode).json(apiResponse);
  } else {
    console.error(err);
    const defaultError = new ApiResponse(null, new ApiError(500, 'Internal Server Error'));
    res.status(500).json(defaultError);
  }
};

