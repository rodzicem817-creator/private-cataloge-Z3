'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Edit2, Trash2, ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CategoryCardProps {
  category: {
    id: string
    name: string
    image_url: string | null
  }
  onEdit: (category: { id: string; name: string; image_url: string | null }) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCardClick = () => {
    router.push(`/category/${category.id}`)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)
    onEdit(category)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)
    onDelete(category.id)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="group cursor-pointer relative rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="aspect-[4/5] relative bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImageIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-600" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 flex items-center justify-between bg-white dark:bg-[#1C1C1E] relative z-10 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-lg truncate pr-4 text-black dark:text-white">
          {category.name}
        </h3>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-2 -mr-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden z-50 origin-bottom-right"
              >
                <div className="p-1.5">
                  <button
                    onClick={handleEditClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-black dark:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
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
