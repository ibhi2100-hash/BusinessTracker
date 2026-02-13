import { cloudinary } from "../../../infrastructure/cloudinary/cloudinary.js";
import streamifier from "streamifier";

export class UploadService {
  async uploadImage(file: Express.Multer.File, folder: string) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }
}