import "dotenv/config";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "src/infrastructure/postgresql/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

