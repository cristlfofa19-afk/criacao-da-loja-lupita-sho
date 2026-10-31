import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import AdminDashboard from "./admin-dashboard"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/admin/login")
  return <AdminDashboard name={session.user.name || "Administradora"} />
}
