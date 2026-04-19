'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const image = formData.get('image') as File | null

  if (!name) throw new Error('Name is required')

  let image_url = null

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('catalog_media')
      .upload(fileName, image, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('catalog_media')
      .getPublicUrl(fileName)
      
    image_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    image_url,
  })

  if (error) throw new Error(`Database error: ${error.message}`)

  revalidatePath('/')
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const image = formData.get('image') as File | null

  const updateData: Record<string, string> = {}
  if (name) updateData.name = name

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('catalog_media')
      .upload(fileName, image)

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('catalog_media')
      .getPublicUrl(fileName)
      
    updateData.image_url = publicUrlData.publicUrl
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw new Error(`Database error: ${error.message}`)
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Optionally delete image from storage if needed. Since categories are deleted, items will cascade.
  // Images left in storage will be orphaned, which is fine for now or can be cleaned up later.

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(`Delete failed: ${error.message}`)

  revalidatePath('/')
  return { success: true }
}
