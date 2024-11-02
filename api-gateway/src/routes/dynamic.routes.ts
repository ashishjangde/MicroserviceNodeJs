import { Express, Request, Response, NextFunction, Router } from 'express';
import axios, { AxiosResponse } from 'axios';
import errorHandler from '../middlewares/error.middleware.js';
import { isApiResponse } from '../middlewares/error.middleware.js';

interface ServiceRegistry {
    [key: string]: string;
}

interface ApiResponse<T = any> {
    localDateTime: string;
    data: T | null;
    apiError: {
        message: string;
        status: number;
        subMessages: string[];
    } | null;
}

const createServiceRouter = (serviceUrl: string): Router => {
    const router = Router();

    router.all('*', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const headers = { ...req.headers };
            delete headers.host;
            delete headers['content-length'];

            const response: AxiosResponse = await axios({
                method: req.method,
                url: `${serviceUrl}${req.path}`,
                headers: headers,
                data: req.body,
                params: req.query,
                validateStatus: (status) => true,
                withCredentials: true
            });

            // Handle Set-Cookie headers including cookie clearing
            if (response.headers['set-cookie']) {
                const cookies = response.headers['set-cookie'];
                
                res.setHeader('Set-Cookie', cookies);
            }

            if (isApiResponse(response.data)) {
                res.status(response.status).json(response.data);
                return;
            }

            const apiResponse: ApiResponse = {
                localDateTime: new Date().toISOString(),
                data: response.data,
                apiError: null
            };

            res.status(response.status).json(apiResponse);
        } catch (error) {
            next(error);
        }
    });

    return router;
};

export const registerRoutes = async (app: Express): Promise<void> => {
    try {
        app.use((req: Request, res: Response, next: NextFunction) => {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Set-Cookie');
            next();
        });

        const { data: services } = await axios.get<ServiceRegistry>("http://localhost:3000/services");

        if (!services || typeof services !== 'object') {
            throw new Error('Invalid services data received from discovery service');
        }

        Object.entries(services).forEach(([serviceName, serviceUrl]) => {
            if (serviceName !== "discovery" && serviceName !== "gateway") {
                const basePath = `/api/v1/${serviceName}`;
                const serviceRouter = createServiceRouter(serviceUrl);
                app.use(basePath, serviceRouter);
                console.log(`[Gateway] Registered route: ${basePath} -> ${serviceUrl}`);
            }
        });

        app.use(errorHandler);
    } catch (error) {
        console.error("[Gateway] Failed to fetch services from discovery:", error);
        throw error;
    }
};