'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ImageIcon, 
  Share, 
  Printer, 
  ArrowUpRight,
  Loader2
} from 'lucide-react'

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
  const [isSharing, setIsSharing] = useState(false)
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
    router.push(`/product/${item.id}`)
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(false)
    action()
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!item.barcode_url) return

    setIsSharing(true)
    try {
      const response = await fetch(item.barcode_url)
      const blob = await response.blob()
      const fileName = `${item.name.replace(/\s+/g, '-')}-barcode.pdf`
      const file = new File([blob], fileName, { type: 'application/pdf' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Barcode for ${item.name}`,
        })
      } else if (navigator.share) {
        await navigator.share({
          title: `Barcode for ${item.name}`,
          url: item.barcode_url,
        })
      } else {
        window.open(item.barcode_url, '_blank')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      if (navigator.share) {
        await navigator.share({
          title: `Barcode for ${item.name}`,
          url: item.barcode_url,
        })
      }
    } finally {
      setIsSharing(false)
      setIsMenuOpen(false)
    }
  }

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="aspect-square relative">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-600" />
          </div>
        )}
        
        {item.barcode_url && (
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-neutral-200 dark:border-white/10 z-10">
            <span className="text-[10px] font-bold tracking-wider text-black dark:text-white uppercase">Barcode</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
           <span className="text-white text-xs font-semibold flex items-center gap-1.5">
             View Details <ArrowUpRight className="w-3 h-3" />
           </span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-sm text-black dark:text-white truncate pr-8 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
          {item.name}
        </h3>
      </div>

      <div 
        className="absolute top-2 right-2 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md transition-colors text-white shadow-sm"
          >
            {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden z-[100]"
              >
                <div className="p-1.5">
                  {item.barcode_url && (
                    <>
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-lg text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Share className="w-4 h-4 text-neutral-600 dark:text-neutral-400" /> Share to OpenLabel
                      </button>
                      <button
                        onClick={handlePrint}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-lg text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-400" /> Print Barcode
                      </button>
                      <hr className="my-1.5 border-neutral-200 dark:border-neutral-800" />
                    </>
                  )}
                  <button
                    onClick={(e) => handleAction(e, () => onEdit(item))}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-lg text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" /> Edit Item
                  </button>
                  <button
                    onClick={(e) => handleAction(e, () => onDelete(item.id))}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Item
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
