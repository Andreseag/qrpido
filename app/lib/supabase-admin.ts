import { createClient } from "@supabase/supabase-js";

/**
 * ⚠️ SOLO usar este cliente en Server Components, Route Handlers o
 * Server Actions — NUNCA en un archivo con "use client". Usa la
 * service role key, que se salta TODAS las políticas de RLS.
 *
 * Por eso mismo: cada query hecha con este cliente debe seleccionar
 * EXPLÍCITAMENTE solo las columnas seguras de mostrar. Nunca uses
 * `select("*")` en tablas con campos sensibles como `products.cost`
 * cuando el resultado se sirve a una página pública.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
