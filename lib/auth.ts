import { betterAuth } from "better-auth"
import { Pool } from "pg"

const configuredBaseURL = process.env.BETTER_AUTH_URL
const baseURL = configuredBaseURL?.startsWith("http")
  ? configuredBaseURL
  : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) || process.env.V0_RUNTIME_URL

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL

const normalizedDatabaseUrl = databaseUrl?.replace(/[?&]sslmode=require/g, "")

export const auth = betterAuth({
  database: new Pool({
    connectionString: normalizedDatabaseUrl,
    ssl: { rejectUnauthorized: false },
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    ...[process.env.V0_RUNTIME_URL, process.env.V0_DEV_APP_URL, process.env.V0_BUILD_URL, process.env.V0_SANDBOX_URL].filter(Boolean) as string[],
  ],
  emailAndPassword: { enabled: true },
  ...(process.env.NODE_ENV === "development" ? { advanced: { defaultCookieAttributes: { sameSite: "none" as const, secure: true } } } : {}),
})
