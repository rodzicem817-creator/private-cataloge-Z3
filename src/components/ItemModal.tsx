'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, FileText } from 'lucide-react'
import { createItem, updateItem } from '@/app/actions/items'
import Image from 'next/image'

interface ItemModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: string
  item?: { id: string; name: string; image_url: string | null; barcode_url: string | null } | null
}

export function ItemModal({ isOpen, onClose, categoryId, item }: ItemModalProps) {
  const [isPending, startTransition] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image_url || null)
  const [barcodeName, setBarcodeName] = useState<string | null>(item?.barcode_url ? 'Existing PDF loaded' : null)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBarcodeName(file.name)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (item) {
          await updateItem(item.id, categoryId, formData)
        } else {
          await createItem(categoryId, formData)
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-[5%] sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-[#1C1C1E] flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="font-serif text-2xl font-bold text-black dark:text-white">
                {item ? 'Edit Item' : 'New Item'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-black dark:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={item?.name || ''}
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all text-black dark:text-white placeholder:text-neutral-400"
                  placeholder="e.g. Diamond Ring"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Item Image
                </label>
                <div className="relative group rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-800 aspect-square flex flex-col items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                        Upload item photo
                      </p>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                      <span className="text-white font-bold">Change Image</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Barcode (PDF)
                </label>
                <div className="relative rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-4 flex items-center gap-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors cursor-pointer overflow-hidden">
                  <input
                    name="barcode"
                    type="file"
                    accept="application/pdf"
                    onChange={handleBarcodeChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-black dark:text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-bold text-black dark:text-white truncate">
                      {barcodeName || 'Upload Barcode PDF'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                      Only PDF files accepted
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-700 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">{error}</div>
              )}

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1C1C1E] py-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  submit-id="item-submit"
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-full font-bold bg-black dark:bg-white text-white dark:text-black flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {item ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
