// app/api/admin/hairstyle/delete-file/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 },
      );
    }

    // Extract filename from public URL
    // Example: /storage/hairmodel/hairstyle_123456_abc.jpg
    const filename = filePath.split("/").pop();
    if (!filename) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Build full path
    const fullPath = path.join(
      process.cwd(),
      "public",
      "storage",
      "hairmodel",
      filename,
    );

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({
        success: true,
        message: "File already removed",
      });
    }

    // Delete file
    await unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
