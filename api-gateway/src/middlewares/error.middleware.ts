import { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';
import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';


interface ErrorResponse {
    message?: string;
    error?: string;
    details?: string;
}


export const isApiResponse = (data: any): data is ApiResponse => {
    return (
        data &&
        typeof data === 'object' &&
        'localDateTime' in data &&
        'data' in data &&
        'apiError' in data
    );
};

const errorHandler = (
    err: Error | AxiosError,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    let errorResponse = new ApiResponse(
        null,
        new ApiError(500, 'Internal Gateway Error')
    );

    if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        const status = axiosError.response?.status || 500;
        const mainMessage = axiosError.response?.data?.message || axiosError.message || 'Unknown error occurred';
        const subMessages = [
            axiosError.response?.data?.error,
            axiosError.response?.data?.details,
        ].filter(Boolean) as string[];

        const apiError = new ApiError(status, mainMessage, subMessages);

        if (axiosError.response?.data && isApiResponse(axiosError.response.data)) {
            res.status(status).json(axiosError.response.data);
            return;
        }

        errorResponse = new ApiResponse(null, apiError);

    } else if (err instanceof Error) {
        const apiError = new ApiError(500, err.message);
        errorResponse = new ApiResponse(null, apiError);
    }

    res.status(errorResponse.apiError?.statusCode || 500).json(errorResponse);
};

export default errorHandler;
