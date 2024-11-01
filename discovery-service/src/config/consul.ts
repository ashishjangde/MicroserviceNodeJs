import dotenv from "dotenv";
dotenv.config();
import consul from "consul";

const consulClient = new consul({
    host: process.env.CONSUL_HOST || "localhost",
    port: Number(process.env.CONSUL_PORT) || 8500,
});

export { consulClient };
