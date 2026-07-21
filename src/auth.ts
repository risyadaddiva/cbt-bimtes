import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { username },
          include: { participant: true },
        });

        if (!user || !user.isActive) return null;

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return null;

        // Check for active exam session (prevent duplicate login for participants)
        if (user.role === "PARTICIPANT" && user.participant) {
          const activeSession = await prisma.examSession.findFirst({
            where: {
              participantId: user.participant.id,
              status: "IN_PROGRESS",
            },
          });

          // Log this login attempt
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: activeSession ? "LOGIN_BLOCKED_ACTIVE_SESSION" : "LOGIN",
              metadata: { username, hasActiveSession: !!activeSession },
            },
          });

          if (activeSession) {
            throw new Error("ACTIVE_SESSION");
          }
        } else if (user.role === "ADMIN") {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: "ADMIN_LOGIN",
              metadata: { username },
            },
          });
        }

        return {
          id: user.id,
          username: user.username,
          role: user.role,
          participantId: user.participant?.id ?? null,
          name: user.participant?.name ?? user.username,
          school: user.participant?.school ?? null,
          track: user.participant?.track ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.participantId = (user as any).participantId;
        token.school = (user as any).school;
        token.track = (user as any).track;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).participantId = token.participantId;
        (session.user as any).school = token.school;
        (session.user as any).track = token.track;
      }
      return session;
    },
  },
});
