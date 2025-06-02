import type { IImageUploadService } from "../../application/interface/image-upload-service.interface.js";

/**
 * ImageShare implementation of the image upload service
 * Note: Currently not used due to Vercel Blob's client-side architecture
 * Kept for future implementation when server-side uploads are supported
 */
export class ImageShareUploadService implements IImageUploadService {
	/**
	 * Generate a data URL from an image buffer
	 * @param {Buffer} imageBuffer - The image buffer
	 * @returns {string} Base64 data URL
	 */
	generateDataUrl(imageBuffer: Buffer): string {
		const base64: string = imageBuffer.toString("base64");

		return `data:image/png;base64,${base64}`;
	}

	/**
	 * Upload an image buffer to ImageShare
	 * @param {Buffer} _imageBuffer - The image buffer to upload
	 * @param {string} _fileName - The file name for the upload
	 * @returns {Promise<string>} The public URL of the uploaded image
	 */
	uploadImage(_imageBuffer: Buffer, _fileName: string): Promise<string> {
		// ImageShare uses Vercel Blob which is designed for client-side uploads
		// This makes it difficult to use from a Node.js CLI environment
		return Promise.reject(new Error("ImageShare upload is not currently supported from server-side Node.js. " + "Please use the Imgur upload service or upload manually to ImageShare through the web interface."));
	}
}
