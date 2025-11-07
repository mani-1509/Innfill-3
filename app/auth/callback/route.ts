import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/events'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      // Create profile if it doesn't exist (for new OAuth users)
      if (!profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            username: `temp_${data.user.id.slice(0, 8)}`, // Temporary username
            role: 'client', // Temporary role - will be updated in onboarding
            display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            avatar_url: data.user.user_metadata?.avatar_url || null,
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
        }

        // Redirect new OAuth users to onboarding
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/onboarding`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/onboarding`)
        } else {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      // Existing user with complete profile - redirect to next
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}
