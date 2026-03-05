import { s3Provider } from "./s3-provider";
import type { StorageProvider } from "./types";

// Strategy: troque aqui para usar outro provider (R2, Bunny, etc.)
export const storage: StorageProvider = s3Provider;

export type { StorageProvider, UploadType } from "./types";
