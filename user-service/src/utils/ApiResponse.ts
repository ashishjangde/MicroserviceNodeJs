import { ApiError } from "./ApiError.js";

export class ApiResponse {
    public localDateTime: string;
    public data?: any;
    public apiError?: ApiError | null;

    constructor(data?: any, apiError?: ApiError) {
        this.localDateTime = new Date().toISOString(); 

        if (data) {
            this.data = data;
            this.apiError = null;
        } else if (apiError) {
            this.apiError = apiError;
            this.data = null; 
        } else {
            this.apiError = null;
        }
    }
}

