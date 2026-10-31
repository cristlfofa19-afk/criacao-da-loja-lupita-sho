import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/admin-auth"
import AdminDashboard from "./admin-dashboard"

export default async function AdminPage() {
  const admin = await getAdminUser()
  if (!admin) redirect("/admin/login?error=unauthorized")
  return <AdminDashboard name={admin.name} />
}
