import { consulClient } from "../config/consul.js";
import { servicesConfig } from "../config/serviceConfig.js";

const activeServices = new Set<string>(); // Track active services

// Define the Service interface
interface Service {
    id: string;
    name: string;
    host: string;
    port: number;
}

// Type guard to check if an error is of type Error
const isError = (error: unknown): error is Error => {
    return (error as Error).message !== undefined;
};

// Error logging variables
const errorLogCounts = new Map<string, number>(); // Track error counts for each service
const ERROR_LOG_LIMIT = 3; // Maximum number of times to log an error for a service
const LOG_THROTTLE_MS = 1000; // Throttle duration in milliseconds

const registerService = async (service: Service): Promise<void> => {
    try {
        await consulClient.agent.service.register({
            id: service.id,
            name: service.name,
            address: service.host,
            port: service.port,
            check: {
                name: `${service.name} health check`,
                http: `http://${service.host}:${service.port}/health`,
                interval: "10s",
                timeout: "5s",
                deregistercriticalserviceafter: "30s",
            },
        });
        console.log(`Service ${service.name} registered with Consul`);
        activeServices.add(service.id); // Track active service
    } catch (error) {
        if (isError(error)) {
            console.error(`Failed to register service ${service.name}:`, error.message);
        } else {
            console.error(`Failed to register service ${service.name}:`, error);
        }
    }
};


const isServiceRunning = async (service: Service, retries: number = 3): Promise<boolean> => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(`http://${service.host}:${service.port}/health`);
            return response.ok; // Return true if the health check succeeds
        } catch (error) {
            const errorKey = `${service.id}-${attempt}`;
            const currentCount = errorLogCounts.get(errorKey) || 0;

            if (currentCount < ERROR_LOG_LIMIT) {
                const now = Date.now();
                if (now - (errorLogCounts.get(service.id) || 0) > LOG_THROTTLE_MS) {
                    if (isError(error)) {
                        console.error(`Health check failed for service "${service.name}" (ID: ${service.id}) - ${error.message}`);
                    } else {
                        console.error(`Health check failed for service "${service.name}" (ID: ${service.id}) -`, error);
                    }
                    errorLogCounts.set(service.id, now);
                    errorLogCounts.set(errorKey, currentCount + 1);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
    }
    return false; 
};

export const deregisterService = async (service: Service): Promise<void> => {
    try {
        await consulClient.agent.service.deregister(service.id);
        console.log(`Service ${service.id} deregistered from Consul`);
        activeServices.delete(service.id); 
    } catch (error) {
        if (isError(error)) {
            console.error(`Failed to deregister service ${service.id}:`, error.message);
        } else {
            console.error(`Failed to deregister service ${service.id}:`, error);
        }
    }
};

export const monitorServices = async (): Promise<void> => {
    for (const service of servicesConfig) {
        const { id } = service as Service; 

        const isRunning = await isServiceRunning(service);

        if (isRunning && !activeServices.has(id)) {
            await registerService(service);
        } else if (!isRunning && activeServices.has(id)) {
            await deregisterService(service);
        }
    }
};


export const startServiceMonitoring = (): void => {
    setInterval(monitorServices, 15000); // Check every 15 seconds
};
