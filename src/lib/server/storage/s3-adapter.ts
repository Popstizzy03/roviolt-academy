import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "$env/dynamic/private";
import type { StorageAdapter } from "./types";

export class S3CompatibleAdapter implements StorageAdapter {
	private client: S3Client;
	private bucket: string;
	private publicDomain: string;

	constructor() {
		this.client = new S3Client({
			region: env.STORAGE_REGION,
			endpoint: env.STORAGE_ENDPOINT || undefined,
			credentials: {
				accessKeyId: env.STORAGE_ACCESS_KEY_ID!,
				secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY!,
			},
			forcePathStyle: env.STORAGE_PROVIDER === "r2",
		});
		this.bucket = env.STORAGE_BUCKET_NAME!;
		this.publicDomain = env.STORAGE_PUBLIC_DOMAIN!;
	}

	async getUploadUrl({ filename, contentType, size }: { filename: string; contentType: string; size: number }) {
		if (size > 200 * 1024 * 1024) {
			throw new Error("File exceeds maximum allowed size of 200MB");
		}

		const key = `courses/assets/${crypto.randomUUID()}-${filename}`;
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,
			ContentType: contentType,
		});

		const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });

		return {
			uploadUrl,
			publicUrl: `https://${this.publicDomain}/${key}`,
		};
	}

	getPublicUrl(key: string): string {
		return `https://${this.publicDomain}/${key}`;
	}
}
