import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lniyanikhipfmrdubqvm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuaXlhbmlraGlwZm1yZHVicXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODMwMTksImV4cCI6MjA3MzI1OTAxOX0.eCv-tJQ-OT8FRmPYhNtJ1d8NWXBvq-XMQkH_ScsOZ0g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'hardbanrecords-lab'
    }
  }
})

// Storage configuration
export const STORAGE_BUCKET = 'hardbanrecords-files'
export const STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}`

// Helper functions for file uploads
export const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data
}

export const getPublicUrl = (path: string) => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

export const deleteFile = async (path: string) => {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path])

  if (error) throw error
}
