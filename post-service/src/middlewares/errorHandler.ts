import { ApiError} from '../utils/ApiError.js';
import { APIResponse } from '../utils/ApiResponse.js';
import {  Response} from 'express';

export const errorHandler = (err: any, res: Response,): void => {
  if (err instanceof ApiError) {
    const apiResponse = new APIResponse(null, err);
    console.log(apiResponse);
    res.status(err.statusCode).json(apiResponse);
  } else {
    console.error(err);
    const defaultError = new APIResponse(null, new ApiError(500, 'Internal Server Error'));
    res.status(500).json(defaultError);
  }
};

