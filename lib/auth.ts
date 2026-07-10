import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { ArgonService } from "./argon";
import { generateAccessToken, generateRefreshToken } from "./token";
import { createExpiry } from "./expiry";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.SESSION_MAXAGE) || 30 * 24 * 60 * 60,
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(credentials, req) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        const user = await db.query.users.findFirst({
          where: eq(users.email, identifier),
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error("User password not set");
        }

        const valid = await ArgonService.verify(password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }

        const accessToken = generateAccessToken();
        const refreshToken = generateRefreshToken();
        const expiry = createExpiry();
        const accessTokenExpires = expiry.accessToken(user.role || "user");
        const sessionExpires = expiry.session();
        const sessionToken = crypto.randomUUID();

        await db.insert(sessions).values({
          id: crypto.randomUUID(),
          sessionToken,
          userId: user.id,
          accessToken,
          refreshToken,
          accessTokenExpires,
          expires: sessionExpires,
          lastActivity: new Date(),
          ipAddress: req?.headers?.get("x-forwarded-for") ?? null,
          userAgent: req?.headers?.get("user-agent") ?? null,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role || "user",
          accessToken,
          refreshToken,
          accessTokenExpires,
          sessionToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.sessionToken = user.sessionToken;
      }

      if (trigger === "update" && session) {
        if (session.accessToken) token.accessToken = session.accessToken;
        if (session.refreshToken) token.refreshToken = session.refreshToken;
        if (session.accessTokenExpires) {
          token.accessTokenExpires = session.accessTokenExpires;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.accessTokenExpires = token.accessTokenExpires as Date;
      session.sessionToken = token.sessionToken as string;

      return session;
    },
  },

  events: {
    async signOut(message) {
      if ("token" in message && message.token?.sessionToken) {
        try {
          await db
            .delete(sessions)
            .where(eq(sessions.sessionToken, message.token.sessionToken as string));
          console.log("Session deleted:", message.token.sessionToken);
        } catch (error) {
          console.error("Failed to delete session:", error);
        }
      }
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});