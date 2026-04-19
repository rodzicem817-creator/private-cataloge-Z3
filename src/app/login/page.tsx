'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup } from './actions'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const action = isLogin ? login : signup
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl tracking-tight mb-2">Private Catalog</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans">
            Exclusive access to our collections
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1E] p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors text-base"
                  placeholder="name@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-3 rounded-full font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{isLogin ? 'Sign In' : 'Request Access'}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
