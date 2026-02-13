import { v2 as cloudinary } from "cloudinary";
import strict from "node:assert/strict";
import { resolve } from "node:dns";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadCategoryImage(
    buffer: Buffer,
    businessId: string,
    categoryId: string,
){
    return new Promise<{ secure_url: string }>(resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `pos/${businessId}/categories`,
                public_id: categoryId,
                overwrite: true,
                resource_type: "image",

            },
            (error, result)=> {
                if(error || !result) return reject(error);
                resolve({ secure_url: result.secure_url});
            }
        ).end(buffer)
    }
}