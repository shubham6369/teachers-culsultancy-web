import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

admin.initializeApp();
const db = admin.firestore();

// Cloudflare R2 Config
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "your-accountId";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "guruwale-storage";

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Trigger: Runs every time a document is created in "global_certificate_logs"
 * Purpose: Generates a PDF and saves it explicitly to Cloudflare R2 ($0 egress fees)
 */
export const generateCertificatePDF = functions
    .runWith({
        timeoutSeconds: 300,
        memory: "1GB", // High memory for PDF processing
    })
    .firestore.document("global_certificate_logs/{requestId}")
    .onCreate(async (snap: any, context: any) => {
        const data = snap.data();
        const { teacherId, teacherName, type } = data;

        console.log(`[START] Generating ${type} certificate for ${teacherName}`);

        try {
            // Update status to 'PROCESSING'
            await snap.ref.update({ status: "PROCESSING" });

            // 1. Generate PDF (Using a fast library like 'pdf-lib' or a basic buffer stream for now)
            // Example: creating a fake buffer to simulate the PDF contents
            const pdfBuffer = Buffer.from(
                `%PDF-1.4\n1 0 obj\n<< /Title (${teacherName} - ${type} Certificate) >>\nendobj`
            );

            const fileName = `certificates/${teacherId}/${type}-${context.params.requestId}.pdf`;

            // 2. Upload to Cloudflare R2
            const putCommand = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: fileName,
                Body: pdfBuffer,
                ContentType: "application/pdf",
                Metadata: {
                    teacher: teacherId,
                    type: type,
                },
            });

            await r2Client.send(putCommand);
            console.log(`[SUCCESS] Saved to Cloudflare R2: ${fileName}`);

            // 3. Update Database statuses to 'COMPLETED'
            const batch = db.batch();

            // Update Global Log
            batch.update(snap.ref, {
                status: "COMPLETED",
                fileUrl: `https://pub-your_r2_dev_url.r2.dev/${fileName}`, // Substitute your public R2 URL
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Update Teacher's Private Collection
            const teacherLogRef = db.collection("users")
                .doc(teacherId)
                .collection("certificate_requests")
                .where("type", "==", type)
                .where("status", "==", "QUEUED")
                .limit(1);

            const teacherLogSnap = await teacherLogRef.get();
            if (!teacherLogSnap.empty) {
                batch.update(teacherLogSnap.docs[0].ref, {
                    status: "COMPLETED",
                    fileUrl: `https://pub-your_r2_dev_url.r2.dev/${fileName}`,
                    completedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            await batch.commit();

        } catch (error) {
            console.error(`[ERROR] Failed to generate certificate:`, error);
            // Mark as FAILED
            await snap.ref.update({ status: "FAILED", error: String(error) });
        }
    });
