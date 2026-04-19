'use client'

import { Share2, Printer, Check } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductActionsProps {
  item: {
    name: string
    barcode_url: string | null
  }
}

export function ProductActions({ item }: ProductActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Check out the barcode for ${item.name}`,
          url: item.barcode_url || window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(item.barcode_url || window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    if (item.barcode_url) {
      const printWindow = window.open(item.barcode_url, '_blank')
      printWindow?.addEventListener('load', () => {
        printWindow.print()
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-4 rounded-full font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-neutral-200 dark:shadow-none"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Link Copied</span>
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Product Info</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {item.barcode_url && (
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 py-4 rounded-full font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Printer className="w-5 h-5" />
          <span>Print Barcode</span>
        </button>
      )}
    </div>
  )
}
