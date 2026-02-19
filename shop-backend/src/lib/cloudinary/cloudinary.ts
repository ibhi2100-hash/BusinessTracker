import { v2 as cloudinary } from "cloudinary";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not defined`);
  return value;
}

cloudinary.config({
  cloud_name: env("CLOUDINARY_CLOUD_NAME" as string ),
  api_key: env("CLOUDINARY_API_KEY" as string),
  api_secret: env("CLOUDINARY_API_SECRET" as string),
});

export default cloudinary;
