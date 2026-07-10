import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "@/lib/token";
import { createExpiry } from "@/lib/expiry";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { refreshToken, sessionToken } = body;

    if (!refreshToken || !sessionToken) {
      return NextResponse.json(
        { error: "Missing refreshToken or sessionToken" },
        { status: 400 }
      );
    }

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 401 }
      );
    }

    if (session.refreshToken !== refreshToken) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (new Date() > session.expires) {
      return NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const expiry = createExpiry();
    const newAccessToken = generateAccessToken();
    const newRefreshToken = generateRefreshToken();
    const newAccessTokenExpires = expiry.accessToken(user.role ?? "user");

    await db
      .update(sessions)
      .set({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpires: newAccessTokenExpires,
        lastActivity: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sessions.sessionToken, sessionToken));

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpires: newAccessTokenExpires,
    });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}