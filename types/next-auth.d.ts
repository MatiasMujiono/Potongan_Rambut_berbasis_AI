import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: Date;
    sessionToken?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
    } & DefaultSession["user"];
    
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: Date;
    sessionToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: Date;
    sessionToken?: string;
  }
}