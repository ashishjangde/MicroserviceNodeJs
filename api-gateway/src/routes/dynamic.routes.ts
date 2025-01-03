import { Express, Request, Response, NextFunction, Router } from 'express';
import axios, { AxiosResponse } from 'axios';
import { match } from 'path-to-regexp';
import errorHandler from '../middlewares/error.middleware.js';
import { isApiResponse } from '../middlewares/error.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

interface ServiceRegistry {
    [key: string]: {
        url: string;
        meta?: {
            routes?: string;
        };
    };
}

interface RouteMetadata {
    requiresAuth: boolean;
    methods: {
        [method: string]: boolean;
    };
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

const createServiceRouter = (serviceUrl: string, routeMeta: Record<string, RouteMetadata> = {}): Router => {
    const router = Router();

    router.all('*', async (req: Request, res: Response, next: NextFunction) => {
        const normalizedPath = req.path;
        let routeInfo: RouteMetadata | undefined;

        for (const [routePattern, meta] of Object.entries(routeMeta)) {
            const matcher = match(routePattern, { decode: decodeURIComponent });
            if (matcher(normalizedPath)) {
                routeInfo = meta;
                break;
            }
        }

        const methodRequiresAuth = routeInfo?.methods?.[req.method.toUpperCase()] || false;

        // If route requires auth, pass to authMiddleware
        if (routeInfo?.requiresAuth && methodRequiresAuth) {
            authMiddleware(req, res, async (err: any) => {
                if (err) return next(err); 
                await proxyRequestToService();
            });
        } else {
            await proxyRequestToService();
        }

        async function proxyRequestToService() {
            try {
                const headers = { ...req.headers };
                delete headers.host;
                delete headers['content-length'];
                headers['x-user-id'] = req.headers['x-user-id'];

                const response: AxiosResponse = await axios({
                    method: req.method,
                    url: `${serviceUrl}${req.path}`,
                    headers: headers,
                    data: req.body,
                    params: req.query,
                    validateStatus: () => true,
                    withCredentials: true
                });

                if (response.headers['set-cookie']) {
                    res.setHeader('Set-Cookie', response.headers['set-cookie']);
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

        Object.entries(services).forEach(([serviceName, serviceInfo]) => {
            if (serviceName !== "discovery" && serviceName !== "gateway") {
                const basePath = `/api/v1/${serviceName}`;
                
                // Parse route metadata if available
                const routeMeta: Record<string, RouteMetadata> = serviceInfo.meta?.routes
                    ? JSON.parse(serviceInfo.meta.routes)
                    : {};

                const serviceRouter = createServiceRouter(serviceInfo.url, routeMeta);
                app.use(basePath, serviceRouter);
                console.log(`[Gateway] Registered route: ${basePath} -> ${serviceInfo.url}`);
            }
        });

        app.use(errorHandler);
    } catch (error) {
        console.error("[Gateway] Failed to fetch services from discovery:", error);
        throw error;
    }
};
