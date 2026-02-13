import { PrismaClient } from "./prisma/generated/client.js";
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
    connectionString,
});

export const prisma = new PrismaClient({
    adapter
})