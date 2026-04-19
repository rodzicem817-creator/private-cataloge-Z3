'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(categoryId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const image = formData.get('image') as File | null
  const barcode = formData.get('barcode') as File | null

  if (!name) throw new Error('Name is required')

  let image_url = null
  let barcode_url = null

  // Upload image
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/items/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('catalog_media')
      .upload(fileName, image)

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('catalog_media')
      .getPublicUrl(fileName)
      
    image_url = publicUrlData.publicUrl
  }

  // Upload barcode PDF
  if (barcode && barcode.size > 0) {
    const fileExt = barcode.name.split('.').pop()
    const fileName = `${user.id}/barcodes/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('catalog_media')
      .upload(fileName, barcode, { contentType: 'application/pdf' })

    if (error) throw new Error(`Barcode upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('catalog_media')
      .getPublicUrl(fileName)
      
    barcode_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('items').insert({
    user_id: user.id,
    category_id: categoryId,
    name,
    image_url,
    barcode_url,
  })

  if (error) throw new Error(`Database error: ${error.message}`)

  revalidatePath(`/category/${categoryId}`)
  return { success: true }
}

export async function updateItem(id: string, categoryId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const image = formData.get('image') as File | null
  const barcode = formData.get('barcode') as File | null

  const updateData: Record<string, string> = {}
  if (name) updateData.name = name

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}/items/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('catalog_media')
      .upload(fileName, image)

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('catalog_media')
      .getPublicUrl(fileName)
      
    updateData.image_url = publicUrlData.publicUrl
  }

  if (barcode && barcode.size > 0) {
    const fileExt = barcode.name.split('.').pop()
    const fileName = `${user.id}/barcodes/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('catalog_media')
      .upload(fileName, barcode, { contentType: 'application/pdf' })

    if (error) throw new Error(`Barcode upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage
      .from('catalog_media')
      .getPublicUrl(fileName)
      
    updateData.barcode_url = publicUrlData.publicUrl
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw new Error(`Database error: ${error.message}`)
  }

  revalidatePath(`/category/${categoryId}`)
  return { success: true }
}

export async function deleteItem(id: string, categoryId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(`Delete failed: ${error.message}`)

  revalidatePath(`/category/${categoryId}`)
  return { success: true }
}
