import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() valida la sesión y refresca el token si es necesario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 🚀 1. Si YA estás logueado e intentas entrar a /login, te redirige a /admin
  if (user && pathname === "/login") {
    url.pathname = "/admin";
    const redirectResponse = NextResponse.redirect(url);

    // Copiamos las cookies refrescadas para no perder la sesión
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  // 🔒 2. Si NO estás logueado e intentas entrar a /admin, te manda al login
  if (!user && pathname.startsWith("/admin")) {
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);

    // Copiamos las cookies también en esta redirección
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  // Si no hay redirección, devolvemos la respuesta normal con las cookies sincronizadas
  return supabaseResponse;
}

export const config = {
  // El matcher vigila la ruta raíz, login y todo el panel de administración
  matcher: ["/admin", "/admin/:path*", "/login", "/"],
};
