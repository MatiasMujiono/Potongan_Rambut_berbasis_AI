// app/api/admin/hairstyle/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hairstyle } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await db
      .select()
      .from(hairstyle)
      .where(eq(hairstyle.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Hairstyle not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching hairstyle:", error);
    return NextResponse.json(
      { error: "Failed to fetch hairstyle" },
      { status: 500 },
    );
  }
}

// PUT - Update hairstyle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { modelrambut, images, spesifikasi, deleteOldImage } = body;

    // Check if hairstyle exists
    const existing = await db
      .select()
      .from(hairstyle)
      .where(eq(hairstyle.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Hairstyle not found" },
        { status: 404 },
      );
    }

    // Delete old image if requested and image has changed
    if (deleteOldImage && existing[0].images && existing[0].images !== images) {
      try {
        const oldFilename = existing[0].images.split("/").pop();
        if (oldFilename) {
          const oldFilePath = path.join(
            process.cwd(),
            "public",
            "storage",
            "hairmodel",
            oldFilename,
          );

          if (existsSync(oldFilePath)) {
            await unlink(oldFilePath);
            console.log(`Deleted old image: ${oldFilename}`);
          }
        }
      } catch (error) {
        console.error("Error deleting old image:", error);
        // Continue even if delete fails
      }
    }

    // Parse spesifikasi jika ada
    let parsedSpesifikasi = existing[0].spesifikasi;
    if (spesifikasi !== undefined) {
      if (typeof spesifikasi === "string") {
        try {
          parsedSpesifikasi = JSON.parse(spesifikasi);
        } catch (error) {
          parsedSpesifikasi = { value: spesifikasi };
        }
      } else if (typeof spesifikasi === "object") {
        parsedSpesifikasi = spesifikasi;
      }
    }

    // Update hairstyle
    await db
      .update(hairstyle)
      .set({
        modelrambut: modelrambut || existing[0].modelrambut,
        images: images !== undefined ? images : existing[0].images,
        spesifikasi: parsedSpesifikasi,
        updatedAt: new Date(),
      })
      .where(eq(hairstyle.id, id));

    // Get updated data
    const updatedData = await db
      .select()
      .from(hairstyle)
      .where(eq(hairstyle.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: updatedData[0],
      message: "Model rambut berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating hairstyle:", error);
    return NextResponse.json(
      { error: "Failed to update hairstyle" },
      { status: 500 },
    );
  }
}

// DELETE - Delete hairstyle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if hairstyle exists
    const existing = await db
      .select()
      .from(hairstyle)
      .where(eq(hairstyle.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Hairstyle not found" },
        { status: 404 },
      );
    }

    // Delete associated image file
    if (existing[0].images) {
      try {
        const filename = existing[0].images.split("/").pop();
        if (filename) {
          const filePath = path.join(
            process.cwd(),
            "public",
            "storage",
            "hairmodel",
            filename,
          );

          if (existsSync(filePath)) {
            await unlink(filePath);
            console.log(`Deleted image: ${filename}`);
          }
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        // Continue even if delete fails
      }
    }

    // Delete hairstyle
    await db.delete(hairstyle).where(eq(hairstyle.id, id));

    return NextResponse.json({
      success: true,
      message: "Model rambut berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting hairstyle:", error);
    return NextResponse.json(
      { error: "Failed to delete hairstyle" },
      { status: 500 },
    );
  }
}
