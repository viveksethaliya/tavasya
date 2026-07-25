'use client'

import React, { useState } from 'react'
import { signIn } from '@/server/auth/actions'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    try {
      const result = await signIn(formData)
      if (result?.error) {
        let msg = 'Invalid email or password.'
        if (typeof result.error === 'string') {
          msg = result.error
        } else if (result.error && typeof result.error.message === 'string') {
          msg = result.error.message
        } else if (result.error && typeof result.error.message === 'object') {
          msg = JSON.stringify(result.error.message)
        }
        if (msg === '{}' || !msg.trim()) {
          msg = 'Invalid login credentials.'
        }
        setError(msg)
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; digest?: string }
      if (errorObj?.message === 'NEXT_REDIRECT' || errorObj?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err
      }
      setError(errorObj?.message || 'An unexpected error occurred.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {error}
          </div>
        )}
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
