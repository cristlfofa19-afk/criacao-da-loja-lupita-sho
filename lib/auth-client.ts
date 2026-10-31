import { createAuthClient } from "better-auth/react"

const clientBaseURL = typeof window !== "undefined"
  ? window.location.origin
  : process.env.BETTER_AUTH_URL?.startsWith("http")
    ? process.env.BETTER_AUTH_URL
    : "http://localhost:3000"

export const authClient = createAuthClient({ baseURL: clientBaseURL })
