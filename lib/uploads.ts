// import { mkdir, unlink, writeFile } from "fs/promises";
import { mkdir, unlink, writeFile, access } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_BASE_DIR = path.join(process.cwd(), "public", "uploads");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function saveUpload(file: File, folder: string) {
  const ext = path.extname(file.name) || "";
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase();
  const fileName = `${Date.now()}-${randomUUID()}${ext}`;
  const targetDir = path.join(UPLOAD_BASE_DIR, safeFolder);
  const targetPath = path.join(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);

  return {
    fileName,
    url: `/uploads/${safeFolder}/${fileName}`,
  };
}



export async function deleteUploadByUrl(url: string) {
  try {
    console.log("Attempting to delete file from URL:", url);
    
    // Handle relative URLs (from your uploads)
    // If URL starts with /uploads/, use it directly
    if (url.startsWith('/uploads/')) {
      const targetPath = path.join(process.cwd(), 'public', url);
      console.log("Target path:", targetPath);
      
      // Check if file exists
      try {
        await access(targetPath);
        console.log("File exists, deleting...");
        await unlink(targetPath);
        console.log("File deleted successfully:", targetPath);
        return;
      } catch (err) {
        console.log("File doesn't exist or error accessing:", err);
        return;
      }
    }
    
    // Original logic for full URLs
    const parsed = new URL(url, "http://localhost");
    const normalized = path.normalize(parsed.pathname);
    console.log("Parsed pathname:", parsed.pathname);
    console.log("Normalized path:", normalized);

    if (!normalized.startsWith("/uploads/")) {
      console.log("Path doesn't start with /uploads/, skipping");
      return;
    }

    const targetPath = path.join(process.cwd(), "public", normalized);
    console.log("Full target path:", targetPath);
    
    if (!targetPath.startsWith(UPLOAD_BASE_DIR)) {
      console.log("Target path outside upload base directory, skipping");
      return;
    }

    await unlink(targetPath);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error in deleteUploadByUrl:", error);
    return;
  }
}
