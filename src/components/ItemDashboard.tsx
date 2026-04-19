'use client'

import { useState } from 'react'
import { Plus, ArrowLeft } from 'lucide-react'
import { ItemCard } from './ItemCard'
import { ItemModal } from './ItemModal'
import { deleteItem } from '@/app/actions/items'
import Link from 'next/link'

interface Item {
  id: string
  name: string
  image_url: string | null
  barcode_url: string | null
}

interface ItemDashboardProps {
  categoryId: string
  categoryName: string
  initialItems: Item[]
}

export function ItemDashboard({ categoryId, categoryName, initialItems }: ItemDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id, categoryId)
    }
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Collections
        </Link>
        
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-3xl">{categoryName}</h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Item</span>
          </button>
        </div>
      </div>

      {initialItems.length === 0 ? (
        <div className="text-center py-24 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">No items in this collection yet.</p>
          <button
            onClick={handleAddNew}
            className="text-sm font-medium text-neutral-900 dark:text-white hover:underline"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {initialItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTimeout(() => setEditingItem(null), 200)
        }}
        categoryId={categoryId}
        item={editingItem}
      />
    </>
  )
}
