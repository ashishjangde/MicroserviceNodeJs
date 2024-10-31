import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/dbConnect.js";


dotenv.config();

const PORT = process.env.PORT || 3214;



connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error);
    }
    );