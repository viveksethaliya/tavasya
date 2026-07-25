export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          sku: string | null
          short_description: string | null
          description: string | null
          category: string | null
          status: 'draft' | 'published'
          is_featured: boolean
          primary_image_id: string | null
          sort_order: number
          seo_title: string | null
          meta_description: string | null
          canonical_url: string | null
          og_image_id: string | null
          robots: string | null
          keywords: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sku?: string | null
          short_description?: string | null
          description?: string | null
          category?: string | null
          status?: 'draft' | 'published'
          is_featured?: boolean
          primary_image_id?: string | null
          sort_order?: number
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          og_image_id?: string | null
          robots?: string | null
          keywords?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      media: {
        Row: {
          id: string
          file_path: string
          file_url: string
          file_name: string
          mime_type: string | null
          size_bytes: number | null
          alt_text: string | null
          width: number | null
          height: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_path: string
          file_url: string
          file_name: string
          mime_type?: string | null
          size_bytes?: number | null
          alt_text?: string | null
          width?: number | null
          height?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['media']['Insert']>
      }
      admin_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_profiles']['Insert']>
      }
      collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_id: string | null
          status: 'draft' | 'published'
          sort_order: number
          seo_title: string | null
          meta_description: string | null
          canonical_url: string | null
          og_image_id: string | null
          robots: string | null
          keywords: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_id?: string | null
          status?: 'draft' | 'published'
          sort_order?: number
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          og_image_id?: string | null
          robots?: string | null
          keywords?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['collections']['Insert']>
      }
      collection_products: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['collection_products']['Insert']>
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          cover_image_id: string | null
          author_name: string | null
          status: 'draft' | 'published'
          published_at: string | null
          seo_title: string | null
          meta_description: string | null
          canonical_url: string | null
          og_image_id: string | null
          robots: string | null
          keywords: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          cover_image_id?: string | null
          author_name?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          seo_title?: string | null
          meta_description?: string | null
          canonical_url?: string | null
          og_image_id?: string | null
          robots?: string | null
          keywords?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never
