import "dotenv/config";
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bookRoutes from "./routes/book.routes";
import userRoutes from "./routes/user.routes";
const app = express();
app.use(express.json());
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export default app;
