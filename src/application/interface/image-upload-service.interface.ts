/**
 * Interface for image upload services
 */
export interface IImageUploadService {
	/**
	 * Generate a data URL from an image buffer
	 * @param {Buffer} imageBuffer - The image buffer
	 * @returns {string} Base64 data URL
	 */
	generateDataUrl(imageBuffer: Buffer): string;

	/**
	 * Upload an image buffer to an external hosting service
	 * @param {Buffer} imageBuffer - The image buffer to upload
	 * @param {string} fileName - The file name for the upload
	 * @returns {Promise<string>} The public URL of the uploaded image
	 */
	uploadImage(imageBuffer: Buffer, fileName: string): Promise<string>;
}
