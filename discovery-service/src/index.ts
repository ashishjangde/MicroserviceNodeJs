import express from "express";
import dotenv from "dotenv";
import { startServiceMonitoring,  deregisterService} from "./services/serviceRegistry.js"; 
import { healthCheck } from "./controllers/healthController.js"; 
import { servicesConfig } from "./config/serviceConfig.js";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000; 


app.use(express.json()); 


app.get("/health", healthCheck);


app.listen(PORT, async () => {
    console.log(`Service is running on port ${PORT}`);
    
    startServiceMonitoring();
});


process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await deregisterAllServices(); 
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await deregisterAllServices(); 
    process.exit(0);
});


const deregisterAllServices = async () => {
    for (const service of servicesConfig) {
        await deregisterService(service); 
    }
};
