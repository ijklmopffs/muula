import { supabase } from './supabaseClient'

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password })
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
