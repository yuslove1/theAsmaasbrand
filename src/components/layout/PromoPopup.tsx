'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getPublicPromo, type PublicPromo } from '@/lib/promoClient'

const STORAGE_KEY = 'asmaa-promo-popup'
const FIRST_SHOW_DELAY_MS = 4000
const RECHECK_EVERY_MS = 60_000

// Don't interrupt people while they're paying or working in admin
const HIDDEN_ON = ['/admin', '/checkout', '/cart']

type Seen = { version: string; closedAt: number }

function readSeen(): Seen | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSeen(seen: Seen) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen))
  } catch {}
}

function isDue(popup: NonNullable<PublicPromo['popup']>): boolean {
  const seen = readSeen()
  if (!seen || seen.version !== popup.version) return true
  return Date.now() - seen.closedAt >= popup.repeat_hours * 60 * 60 * 1000
}

export default function PromoPopup() {
  const pathname = usePathname()
  const [popup, setPopup] = useState<PublicPromo['popup']>(null)
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const hidden = HIDDEN_ON.some((p) => pathname.startsWith(p))

  useEffect(() => {
    getPublicPromo().then((data) => setPopup(data?.popup ?? null))
  }, [])

  // Show a few seconds after arriving, then check again every minute so it comes back
  // "once in a while" for visitors who stay on the site longer than the repeat time.
  useEffect(() => {
    if (!popup || hidden || open) return
    const tryOpen = () => { if (isDue(popup)) setOpen(true) }
    const first = setTimeout(tryOpen, FIRST_SHOW_DELAY_MS)
    const again = setInterval(tryOpen, RECHECK_EVERY_MS)
    return () => { clearTimeout(first); clearInterval(again) }
  }, [popup, hidden, open])

  const close = useCallback(() => {
    if (popup) writeSeen({ version: popup.version, closedAt: Date.now() })
    setOpen(false)
  }, [popup])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Navigating into checkout/admin closes it without counting as dismissed
  useEffect(() => { if (hidden) setOpen(false) }, [hidden])

  if (!popup) return null

  const image = (
    <Image
      src={popup.image_url}
      alt="Current promotion"
      width={1200}
      height={1200}
      sizes="(max-width: 640px) 92vw, 520px"
      className="block w-auto h-auto max-w-full max-h-[75vh] mx-auto"
      priority
    />
  )
  const isExternal = /^https?:\/\//.test(popup.link)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="promo-popup"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Promotion"
            className="relative w-full max-w-[520px] bg-white shadow-2xl"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              onClick={close}
              aria-label="Close promotion"
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-lg hover:bg-brand-wine transition-colors"
            >
              <X size={18} />
            </button>

            {popup.link ? (
              isExternal ? (
                <a href={popup.link} target="_blank" rel="noopener noreferrer" onClick={close}>{image}</a>
              ) : (
                <Link href={popup.link} onClick={close}>{image}</Link>
              )
            ) : (
              image
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
