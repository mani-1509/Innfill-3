import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(rememberMe?: boolean) {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Only modify cookie options during login
              // If rememberMe is explicitly false, make it a session cookie
              // If rememberMe is true, extend to 7 days
              // If rememberMe is undefined, use default Supabase behavior
              let cookieOptions = options
              
              if (rememberMe === true) {
                cookieOptions = { ...options, maxAge: 7 * 24 * 60 * 60 } // 7 days
              } else if (rememberMe === false) {
                cookieOptions = { ...options, maxAge: undefined } // Session cookie
              }
              
              cookieStore.set(name, value, cookieOptions)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
