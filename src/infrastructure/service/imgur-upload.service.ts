import type { AxiosResponse } from "axios";

import type { IImageUploadService } from "../../application/interface/image-upload-service.interface.js";

import axios from "axios";
import FormData from "form-data";

/**
 * Imgur implementation of the image upload service
 */
export class ImgurImageUploadService implements IImageUploadService {
	private readonly API_URL: string = "https://api.imgur.com/3/image";

	private readonly CLIENT_ID: string = "7c0c0de3ea0c3a9"; // Public client ID for anonymous uploads

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
	 * Upload an image buffer to Imgur
	 * @param {Buffer} imageBuffer - The image buffer to upload
	 * @param {string} fileName - The file name for the upload
	 * @returns {Promise<string>} The public URL of the uploaded image
	 */
	async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
		try {
			const formData: FormData = new FormData();
			formData.append("image", imageBuffer.toString("base64"));
			formData.append("type", "base64");
			formData.append("name", fileName);

			interface IImgurResponse {
				data: {
					link: string;
				};
			}

			const response: AxiosResponse<IImgurResponse> = await axios.post(this.API_URL, formData, {
				headers: {
					...formData.getHeaders(),
					Authorization: `Client-ID ${this.CLIENT_ID}`,
				},
			});

			if (response.data?.data?.link) {
				return response.data.data.link;
			}

			throw new Error("No URL received from Imgur");
		} catch (error) {
			if (axios.isAxiosError(error)) {
				interface IImgurErrorResponse {
					data?: {
						error?: string;
					};
				}

				const errorResponse: IImgurErrorResponse | undefined = error.response?.data as IImgurErrorResponse | undefined;
				const errorMessage: string = errorResponse?.data?.error ?? error.message;

				throw new Error(`Imgur upload failed: ${errorMessage}`);
			}

			throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
