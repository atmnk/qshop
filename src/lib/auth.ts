import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import nodemailer from "nodemailer";
import { db } from "@/db";
import * as schema from "@/db/schema";

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  auth: {
    user: process.env.MAILJET_API_KEY!,
    pass: process.env.MAILJET_SECRET_KEY!,
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await transporter.sendMail({
        from: `"qshop" <${process.env.MAILJET_FROM_EMAIL}>`,
        to: user.email,
        subject: "Verify your qshop email",
        html: `
          <p>Hi ${user.name},</p>
          <p>Click the link below to verify your email address:</p>
          <p><a href="${url}" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
          <p>This link expires in 24 hours.</p>
        `,
      });
    },
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "buyer",
        input: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
