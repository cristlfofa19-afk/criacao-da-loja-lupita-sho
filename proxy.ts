import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseCookieOptions } from "@/lib/supabase/cookie-options"
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env"

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, ...supabaseCookieOptions }),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")

  if (isAdminPage && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
