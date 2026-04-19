'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CategoryCard } from './CategoryCard'
import { CategoryModal } from './CategoryModal'
import { deleteCategory } from '@/app/actions/categories'

interface Category {
  id: string
  name: string
  image_url: string | null
}

export function CategoryDashboard({ initialCategories }: { initialCategories: Category[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      await deleteCategory(id)
    }
  }

  const handleAddNew = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl">Collections</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Collection</span>
        </button>
      </div>

      {initialCategories.length === 0 ? (
        <div className="text-center py-24 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">No collections yet.</p>
          <button
            onClick={handleAddNew}
            className="text-sm font-medium text-neutral-900 dark:text-white hover:underline"
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {initialCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTimeout(() => setEditingCategory(null), 200)
        }}
        category={editingCategory}
      />
    </>
  )
}
