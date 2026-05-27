export interface StorageAdapter {
	getUploadUrl(params: {
		filename: string;
		contentType: string;
		size: number;
	}): Promise<{ uploadUrl: string; publicUrl: string }>;
	getPublicUrl(key: string): string;
}
