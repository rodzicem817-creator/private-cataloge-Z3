'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2 } from 'lucide-react'
import { createCategory, updateCategory } from '@/app/actions/categories'
import Image from 'next/image'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: { id: string; name: string; image_url: string | null } | null
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (category) {
      setPreview(category.image_url)
    } else {
      setPreview(null)
    }
  }, [category, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (category) {
          await updateCategory(category.id, formData)
        } else {
          await createCategory(formData)
        }
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-serif text-2xl">
                {category ? 'Edit Collection' : 'New Collection'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={category?.name || ''}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Summer Collection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Cover Image
                </label>
                <div className="relative group rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 aspect-video flex flex-col items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500">
                        Click or drag to upload
                      </p>
                    </div>
                  )}
                  {preview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                      <span className="text-white font-medium">Change Image</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-full font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {category ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
