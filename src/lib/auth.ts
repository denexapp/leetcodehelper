import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/db";
import { nextCookies } from "better-auth/next-js";
import * as schema from "./db/schema";

// Debug environment variables
const baseURL = process.env.BETTER_AUTH_URL || (
  process.env.NODE_ENV === "production" 
    ? process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : undefined
    : "http://localhost:3000"
);

console.log("🔧 Auth Configuration Debug:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("- VERCEL_URL:", process.env.VERCEL_URL);
console.log("- Calculated baseURL:", baseURL);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  baseURL,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
  ],
});
