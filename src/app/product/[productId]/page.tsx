import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LogOut, ArrowLeft, ScanBarcode, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ProductActions } from '@/components/ProductActions'

interface PageProps {
  params: Promise<{
    productId: string
  }>
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: item } = await supabase
    .from('items')
    .select('*, categories(name)')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/category/${item.category_id}`} className="flex items-center gap-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline font-bold text-sm">Back</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <form action="/auth/signout" method="post">
              <button type="submit" className="p-2 rounded-full text-neutral-600 hover:text-black transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ScanBarcode className="w-20 h-20 text-neutral-300 dark:text-neutral-700" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
                {item.categories?.name || 'Collection'}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
                {item.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-neutral-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Added {new Date(item.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ProductActions 
                item={{
                  name: item.name,
                  barcode_url: item.barcode_url
                }} 
              />
              
              {item.barcode_url && (
                <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl shadow-sm">
                      <ScanBarcode className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Barcode PDF</p>
                      <p className="text-xs text-neutral-500">Document ready for sharing or printing</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
