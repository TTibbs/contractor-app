import { addSignature, getSignatureByJobId } from "@/database/db";
import { Signature } from "@/types/job";
import * as FileSystem from "expo-file-system/legacy";

const baseDir = (FileSystem as any).documentDirectory ?? "";
const SIGNATURES_DIR = `${baseDir}signatures/`;

async function ensureSignaturesDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(SIGNATURES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SIGNATURES_DIR, {
      intermediates: true,
    });
  }
}

export async function saveSignatureForJob(
  jobId: string,
  base64Png: string,
): Promise<Signature> {
  await ensureSignaturesDirExists();

  // Strip data URL prefix if present (e.g. "data:image/png;base64,XXXXX")
  const commaIndex = base64Png.indexOf(",");
  const pureBase64 =
    commaIndex !== -1 ? base64Png.substring(commaIndex + 1) : base64Png;

  const fileName = `${jobId}-${Date.now()}.png`;
  const fileUri = `${SIGNATURES_DIR}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, pureBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return addSignature(jobId, fileUri);
}

export async function getJobSignature(
  jobId: string,
): Promise<Signature | null> {
  return getSignatureByJobId(jobId);
}
