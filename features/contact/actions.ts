'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { headers } from 'next/headers'

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function submitContactForm(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      message: formData.get('message') as string,
    }

    const validated = contactSchema.safeParse(data)
    
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues?.[0]?.message || "Validation failed"
      }
    }

    // Get IP address for rate limiting
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const supabase = await createClient()

    // Rate Limiting Check (max 5 submissions per hour per IP)
    if (ip !== 'unknown') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count, error: countError } = await supabase
        .from('contact_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', oneHourAgo)
      
      if (!countError && count !== null && count >= 5) {
        return { 
          success: false, 
          error: "You have submitted too many requests recently. Please try again later." 
        }
      }
    }

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone || null,
        company: validated.data.company || null,
        message: validated.data.message,
        ip_address: ip,
        user_agent: userAgent
      })

    if (error) throw error

    return { success: true }
  } catch (error: unknown) {
    console.error('Contact submission error:', error)
    return { success: false, error: "Failed to submit message. Please try again." }
  }
}

export async function updateInquiryStatus(id: string, status: 'new' | 'read' | 'replied' | 'archived') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_submissions')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Error updating inquiry status:', error)
    return { success: false, error: 'Failed to update status' }
  }

  return { success: true }
}
