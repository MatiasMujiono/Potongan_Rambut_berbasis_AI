// app/api/admin/hairstyle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hairstyle } from "@/db/schema";
import { desc, eq, sql, like } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? like(hairstyle.modelrambut, `%${search}%`)
      : undefined;

    const data = await db
      .select()
      .from(hairstyle)
      .where(whereCondition)
      .orderBy(desc(hairstyle.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(hairstyle)
      .where(whereCondition);

    const total = Number(totalResult[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching hairstyles:", error);
    return NextResponse.json(
      { error: "Failed to fetch hairstyles" },
      { status: 500 },
    );
  }
}

// POST - Create new hairstyle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelrambut, images, spesifikasi } = body;

    if (!modelrambut) {
      return NextResponse.json(
        { error: "Model rambut is required" },
        { status: 400 },
      );
    }

    // Parse spesifikasi jika berupa string JSON
    let parsedSpesifikasi = {};
    if (spesifikasi) {
      if (typeof spesifikasi === "string") {
        try {
          parsedSpesifikasi = JSON.parse(spesifikasi);
        } catch (error) {
          // Jika gagal parse, simpan sebagai string
          parsedSpesifikasi = { value: spesifikasi };
        }
      } else if (typeof spesifikasi === "object") {
        parsedSpesifikasi = spesifikasi;
      }
    }

    const id = `HS_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(hairstyle).values({
      id,
      modelrambut,
      images: images || "",
      spesifikasi: parsedSpesifikasi,
    });

    const insertedData = await db
      .select()
      .from(hairstyle)
      .where(eq(hairstyle.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: insertedData[0],
      message: "Model rambut berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error creating hairstyle:", error);
    return NextResponse.json(
      { error: "Failed to create hairstyle" },
      { status: 500 },
    );
  }
}
