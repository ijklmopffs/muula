import { supabase } from './supabaseClient'

export const checkUserOnboarding = async () => {
  let attempts = 0
  let user = null

  // Retry user fetch in case signup just completed
  while (attempts < 5 && !user) {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser()
    user = fetchedUser
    if (!user) await new Promise((r) => setTimeout(r, 300)) // wait 300ms
    attempts++
  }

  if (!user) return { redirect: '/signin' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  if (!profile?.name) return { redirect: '/profile' }

  return { redirect: '/feed' }
}
