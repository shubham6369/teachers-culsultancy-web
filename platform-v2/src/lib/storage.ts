import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 Configuration
// These should be set in environment variables (.env.local or Cloudflare Dashboard)
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "your-accountId";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "guruwale-storage";

// The S3 Client configured for Cloudflare R2
export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Generates a presigned URL to securely upload a file directly from the browser to Cloudflare R2.
 * This saves bandwidth on your Next.js Edge functions.
 */
export async function generateUploadUrl(fileName: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
    });

    // URL expires in 15 minutes
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    return signedUrl;
}

/**
 * Generates a presigned URL to securely download or view a file from R2.
 * Cloudflare R2 egress is $0, meaning infinite free downloads for users.
 */
export async function generateDownloadUrl(fileName: string) {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
    });

    // Public URL logic can be used here if the bucket is public
    // Example: return `https://pub-123.r2.dev/${fileName}`

    // For protected files:
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    return signedUrl;
}
