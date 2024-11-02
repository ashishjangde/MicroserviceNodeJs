import { consulClient } from "../config/consul.js";
import { Request, Response } from "express";

export const getServices = async (req: Request, res: Response) => {
    try {
        const services = await consulClient.agent.services();
        
        // Map services to include their metadata
        const activeServices = Object.values(services).reduce((acc, service) => {
            acc[service.Service] = {
                url: `http://${service.Address}:${service.Port}`,
                meta: service.Meta || {} 
            };
            return acc;
        }, {});

        res.json(activeServices);
    } catch (error) {
        console.error('Failed to fetch services:', error);
        res.status(500).json({ error: "Failed to fetch services" });
    }
};
