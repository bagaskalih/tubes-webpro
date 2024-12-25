import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@mail.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existingUser = await db.user.findUnique({
          where: { email: credentials?.email },
        });
        if (!existingUser) {
          return null;
        }

        const passwordMatch = await bcryptjs.compare(
          credentials.password,
          existingUser.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: `${existingUser.id}`,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          profileImage: existingUser.profileImage || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Update the token when session is updated
        token.name = session.user.name;
        token.profileImage = session.user.profileImage;
        return token;
      }

      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          profileImage: token.profileImage,
        },
      };
    },
  },
};
