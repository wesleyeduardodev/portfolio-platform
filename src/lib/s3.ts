import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "sa-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.S3_BUCKET_NAME || "portfolio-media";

export async function generatePresignedUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

export function getPublicUrl(key: string): string {
  if (process.env.CLOUDFRONT_URL) {
    return `${process.env.CLOUDFRONT_URL}/${key}`;
  }
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export function buildS3Key(
  type: "profile-photo" | "profile-cover" | "project-media",
  projectId?: string,
  fileName?: string
): string {
  const ext = fileName?.split(".").pop() || "jpg";
  const uuid = crypto.randomUUID();

  switch (type) {
    case "profile-photo":
      return `portfolio-media/profile/photo-${Date.now()}.${ext}`;
    case "profile-cover":
      return `portfolio-media/profile/cover-${Date.now()}.${ext}`;
    case "project-media":
      return `portfolio-media/projects/${projectId}/original/${uuid}.${ext}`;
  }
}
