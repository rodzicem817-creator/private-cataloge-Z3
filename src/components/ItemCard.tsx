'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Edit2, Trash2, ImageIcon, ScanBarcode, Share, Printer } from 'lucide-react'

interface Item {
  id: string
  name: string
  image_url: string | null
  barcode_url: string | null
}

interface ItemCardProps {
  item: Item
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)
    onEdit(item)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)
    onDelete(item.id)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)

    if (!item.barcode_url) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Barcode for ${item.name}`,
          url: item.barcode_url,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      window.open(item.barcode_url, '_blank')
    }
  }

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)
    
    if (item.barcode_url) {
      const printWindow = window.open(item.barcode_url, '_blank')
      printWindow?.addEventListener('load', () => {
        printWindow.print()
      })
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
        )}
        
        {item.barcode_url && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur px-2.5 py-1.5 rounded-lg flex items-center gap-2 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50">
            <ScanBarcode className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Barcode</span>
          </div>
        )}
      </div>

      <div className="p-4 flex items-center justify-between bg-white dark:bg-[#1C1C1E]">
        <h3 className="font-serif text-lg truncate pr-4 text-neutral-900 dark:text-neutral-100">
          {item.name}
        </h3>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-2 -mr-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 origin-bottom-right"
              >
                <div className="p-1 flex flex-col">
                  {item.barcode_url && (
                    <>
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                      >
                        <Share className="w-4 h-4" />
                        Share Barcode
                      </button>
                      <button
                        onClick={handlePrint}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                      >
                        <Printer className="w-4 h-4" />
                        Print Barcode
                      </button>
                      <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1 mx-2" />
                    </>
                  )}
                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Item
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Item
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
