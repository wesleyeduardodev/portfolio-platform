import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider, UploadType } from "./types";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "sa-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "portfolio-platform-media";

export const s3Provider: StorageProvider = {
  async generatePresignedUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(s3, command, { expiresIn: 300 });
  },

  getPublicUrl(key: string): string {
    if (process.env.CLOUDFRONT_URL) {
      return `${process.env.CLOUDFRONT_URL}/${key}`;
    }
    return `https://${BUCKET}.s3.${process.env.AWS_REGION || "sa-east-1"}.amazonaws.com/${key}`;
  },

  buildKey(
    userId: string,
    type: UploadType,
    projectId: string | null,
    fileName: string
  ): string {
    const ext = fileName.split(".").pop() || "jpg";
    const uuid = crypto.randomUUID();

    switch (type) {
      case "profile-photo":
        return `${userId}/profile/photo-${Date.now()}.${ext}`;
      case "profile-cover":
        return `${userId}/profile/cover-${Date.now()}.${ext}`;
      case "project-media":
        return `${userId}/projects/${projectId}/original/${uuid}.${ext}`;
    }
  },

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    await s3.send(command);
  },
};
