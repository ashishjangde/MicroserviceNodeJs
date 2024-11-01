import axios from "axios";
import  { Express, Request, Response } from "express";

// Function to fetch services and register routes with `/api/v1` prefix
export const registerRoutes = async (app: Express) => {
    try {
        // Fetch the list of services from the discovery service
        const { data: services } = await axios.get("http://localhost:3000/services");

        // Iterate over services and register routes for each, excluding discovery and gateway
        for (const [serviceName, serviceUrl] of Object.entries(services)) {
            if (serviceName !== "discovery" && serviceName !== "gateway") {
                // Register route with `/api/v1` prefix for each service
                app.use(`/api/v1/${serviceName}`, createProxy(serviceUrl as string));
                console.log(`Route registered: /api/v1/${serviceName} -> ${serviceUrl}`);
            }
        }
    } catch (error) {
        console.error("Failed to fetch services from discovery:", error);
    }
};

// Proxy middleware function
const createProxy = (serviceUrl: string) => async (req: Request, res: Response) => {
    try {
        console.log(`Forwarding request to ${serviceUrl}${req.path}:`);
        console.log(`Method: ${req.method}`);
        console.log(`Headers: ${JSON.stringify(req.headers)}`);
        console.log(`Body: ${JSON.stringify(req.body)}`);

        const response = await axios({
            method: req.method,
            url: `${serviceUrl}${req.path}`,
            headers: req.headers,
            data: req.body,
            params: req.query,
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error forwarding request to ${serviceUrl}:`, error);
        res.status(500).json({ error: "Error forwarding request" });
    }
};
