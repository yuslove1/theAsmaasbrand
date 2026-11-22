'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Invalid email or password' }))
        throw new Error(error)
      }
      // Only follow same-site admin paths, never an external URL from the query string
      const next = searchParams.get('next') || ''
      router.push(next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative Arabic watermark */}
      <div
        className="absolute right-[-5%] top-1/2 -translate-y-1/2 text-white/[0.04] text-[240px] leading-none select-none pointer-events-none hidden lg:block"
        style={{ fontFamily: 'var(--font-amiri)' }}
      >
        أسماء
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <p
            className="text-brand-gold text-lg mb-2 opacity-80"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            تسجيل الدخول
          </p>
          <p className="font-display text-3xl text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
            The Asmaa&apos;s <span className="text-gold-shimmer italic">Brand</span>
          </p>
          <div className="w-12 h-0.5 bg-brand-gold mx-auto my-3" />
          <p className="text-white/40 text-[11px] font-body tracking-[0.25em] uppercase">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 sm:p-10 shadow-2xl border-t-4 border-brand-gold space-y-5"
        >
          <div>
            <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-navy/30 hover:text-brand-navy/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs font-body mt-6 tracking-wide">
          Restricted access · The Asmaa&apos;s Brand
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
