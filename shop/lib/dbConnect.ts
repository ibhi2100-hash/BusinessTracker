import mongoose from "mongoose";

export default async function dbConnect() {
  if (mongoose.connection.readyState >= 1) return;

  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL environment variable is not defined");
  }

  return mongoose.connect(mongoUrl);
}
