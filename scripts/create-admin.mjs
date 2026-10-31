import { createClient } from "@supabase/supabase-js"

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_INITIAL_PASSWORD

if (!email || !password) {
  console.error("Defina ADMIN_EMAIL e ADMIN_INITIAL_PASSWORD.")
  process.exit(1)
}
if (password.length < 8) {
  console.error("A senha deve ter pelo menos 8 caracteres.")
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === target)
    if (match || data.users.length < 200) return match ?? null
  }
  return null
}

let user = await findUserByEmail(email)
if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true })
  if (error) throw error
  user = data.user
  console.log("Usuária existente atualizada.")
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Lupita" },
  })
  if (error) throw error
  user = data.user
  console.log("Usuária administradora criada.")
}

const { error: allowError } = await supabase
  .from("admin_users")
  .upsert({ user_id: user.id, email }, { onConflict: "user_id" })
if (allowError) throw allowError

console.log("Acesso administrativo autorizado para", email)
