import { Request, Response } from "express";
import { UploadService } from "../service/upload.service.js";

const uploadService = new UploadService();

export class UploadController {
  async uploadProductImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const result = await uploadService.uploadImage(
        req.file,
        "products"
      );

      return res.status(201).json({
        message: "Upload successful",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Upload failed",
        error,
      });
    }
  }
}