import app from "./app.js";

import  dotenv from "dotenv";
import { registerRoutes } from "./routes/dynamic.routes.js";
dotenv.config();

const PORT = process.env.PORT || 8080;


const startServer = async () => {
    await registerRoutes(app);
    app.listen(PORT, () => {
        console.log(`API Gateway listening on http://localhost:${PORT}`);
    });
};

startServer().catch(err => {
    console.error("Error starting the server:", err);
});
