import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import AdminDashboard from "./admin-dashboard"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const sessionEmail = session?.user?.email?.trim().toLowerCase()
  if (!session?.user || !adminEmail || sessionEmail !== adminEmail) redirect("/admin/login?error=unauthorized")
  return <AdminDashboard name={session.user.name || "Administradora"} />
}
