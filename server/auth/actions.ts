'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { success: false, error: { message: 'Email and password are required' } }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const message = typeof error.message === 'string' && error.message.trim() !== '' && error.message !== '{}'
        ? error.message 
        : 'Invalid login credentials or authentication error.'
      return { success: false, error: { message } }
    }
  } catch (err: unknown) {
    const errorObj = err as { message?: string; digest?: string }
    if (errorObj?.message === 'NEXT_REDIRECT' || errorObj?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err
    }
    return { 
      success: false, 
      error: { message: errorObj?.message || 'An unexpected error occurred during authentication.' } 
    }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
