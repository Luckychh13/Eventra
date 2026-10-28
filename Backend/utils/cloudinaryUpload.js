import { Readable } from "node:stream";
import cloudinary, {
  configureCloudinary,
  hasCloudinaryConfig,
} from "../config/cloudinary.js";

export const uploadBuffer = (buffer, folder) => {
  if (!Buffer.isBuffer(buffer)) {
    return Promise.reject(
      new Error("A valid image buffer is required.")
    );
  }

  if (!hasCloudinaryConfig()) {
    return Promise.reject(
      new Error("Cloudinary is not configured.")
    );
  }

  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);

        if (!result) {
          return reject(
            new Error("Cloudinary returned no upload result.")
          );
        }

        resolve(result);
      }
    );

    Readable.from([buffer]).pipe(uploadStream);
  });
};