import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/dynamic.routes.js";
import { healthCheck } from "./controllers/health.controller.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthCheck);


registerRoutes(app);

export default app;
