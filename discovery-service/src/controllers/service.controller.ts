import { consulClient } from "../config/consul.js";
import { Request ,Response } from "express";

export const getServices = async (req :Request, res :Response) => {
    try {
        const services = await consulClient.agent.services();
        const activeServices = Object.values(services).reduce((acc, service) => {
            acc[service.Service] = `http://${service.Address}:${service.Port}`;
            return acc;
        }, {});
        res.json(activeServices);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch services" });
    }
};

