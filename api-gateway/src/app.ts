import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/dynamic.routes.js";
import { healthCheck } from "./controllers/health.controller.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthCheck);


registerRoutes(app);

export default app;
