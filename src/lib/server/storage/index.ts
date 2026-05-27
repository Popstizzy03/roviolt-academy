import { env } from "$env/dynamic/private";
import type { StorageAdapter } from "./types";
import { S3CompatibleAdapter } from "./s3-adapter";

let _adapter: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
	if (!_adapter) {
		const provider = env.STORAGE_PROVIDER || "r2";
		switch (provider) {
			case "r2":
			case "supabase":
				_adapter = new S3CompatibleAdapter();
				break;
			default:
				throw new Error(`Unknown STORAGE_PROVIDER: ${provider}`);
		}
	}
	return _adapter;
}
