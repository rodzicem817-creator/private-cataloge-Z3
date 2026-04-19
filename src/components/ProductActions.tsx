'use client'

import { Share2, Printer, Check, Loader2 } from 'lucide-react'
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
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (!item.barcode_url) {
      // Fallback if no barcode: share page URL
      if (navigator.share) {
        await navigator.share({
          title: item.name,
          url: window.location.href
        })
      }
      return
    }

    setIsSharing(true)
    try {
      // Fetch the PDF file to share it as a real document
      const response = await fetch(item.barcode_url)
      const blob = await response.blob()
      const fileName = `${item.name.replace(/\s+/g, '-')}-barcode.pdf`
      const file = new File([blob], fileName, { type: 'application/pdf' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Barcode for ${item.name}`,
          text: `PDF Barcode for ${item.name}`
        })
      } else if (navigator.share) {
        // Fallback to URL sharing if file sharing isn't supported
        await navigator.share({
          title: item.name,
          url: item.barcode_url
        })
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(item.barcode_url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Error sharing file:', error)
      // Final fallback to simple URL sharing
      if (navigator.share) {
        await navigator.share({ title: item.name, url: item.barcode_url })
      }
    } finally {
      setIsSharing(false)
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
        disabled={isSharing}
        className="w-full flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black py-4 rounded-full font-bold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg disabled:opacity-70"
      >
        <AnimatePresence mode="wait">
          {isSharing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Preparing File...</span>
            </motion.div>
          ) : copied ? (
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
              <span>Share to OpenLabel</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {item.barcode_url && (
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 py-4 rounded-full font-bold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700 active:scale-[0.98]"
        >
          <Printer className="w-5 h-5" />
          <span>Print Barcode</span>
        </button>
      )}
    </div>
  )
}
