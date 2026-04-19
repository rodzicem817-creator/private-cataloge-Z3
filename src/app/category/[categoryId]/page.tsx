import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LogOut } from 'lucide-react'
import { ItemDashboard } from '@/components/ItemDashboard'

interface PageProps {
  params: Promise<{
    categoryId: string
  }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch Category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('user_id', user.id)
    .single()

  if (!category) {
    redirect('/')
  }

  // Fetch Items
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight">Private Catalog</h1>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ItemDashboard 
          categoryId={category.id} 
          categoryName={category.name} 
          initialItems={items || []} 
        />
      </main>
    </div>
  )
}
