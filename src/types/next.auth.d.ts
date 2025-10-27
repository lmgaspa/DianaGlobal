// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    // do DefaultUser: email?: string | null; name?: string | null; image?: string | null;
    id: string;
    accessToken?: string;
    refreshToken?: string | null;
  }

  interface Session {
    user: {
      id: string;                       // adicionado
      email?: string | null;            // herdado do DefaultSession["user"]
      name?: string | null;             // herdado do DefaultSession["user"]
      image?: string | null;            // herdado do DefaultSession["user"]
    };
    accessToken?: string;
    refreshToken?: string | undefined;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string | null;
  }
}
