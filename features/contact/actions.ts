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

    const validated = contactSchema.parse(data)

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
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        company: validated.company || null,
        message: validated.message,
        ip_address: ip,
        user_agent: userAgent
      })

    if (error) throw error

    return { success: true }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (error as any).errors[0].message 
      }
    }
    console.error('Contact submission error:', error)
    return { success: false, error: "Failed to submit message. Please try again." }
  }
}
