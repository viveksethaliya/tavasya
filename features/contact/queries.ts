import { createClient } from '@/lib/supabase/server'

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
}

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inquiries:', error)
    return []
  }

  return data as Inquiry[]
}
