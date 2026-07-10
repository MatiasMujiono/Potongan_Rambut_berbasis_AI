import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArgonService } from "@/lib/argon";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({
        exists: false,
        passwordValid: false,
        message: "Identifier dan password wajib diisi",
      });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, identifier),
    });

    if (!user) {
      return NextResponse.json({
        exists: false,
        passwordValid: false,
        message: "User tidak ditemukan",
      });
    }

    if (!user.password) {
      return NextResponse.json({
        exists: true,
        passwordValid: false,
        message: "User tidak memiliki password terdaftar",
      });
    }

    const validPassword = await ArgonService.verify(password, user.password);

    if (!validPassword) {
      return NextResponse.json({
        exists: true,
        passwordValid: false,
        message: "Password salah",
      });
    }

    return NextResponse.json({
      exists: true,
      passwordValid: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("CHECK USER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}