'use client'

export interface PublicPromo {
  message: string
  is_active: boolean
  popup: {
    image_url: string
    link: string
    repeat_minutes: number
    version: string
  } | null
}

// One request per page load, shared by the top bar and the popup
let promoPromise: Promise<PublicPromo | null> | null = null

export function getPublicPromo(): Promise<PublicPromo | null> {
  if (!promoPromise) {
    promoPromise = fetch('/api/promo')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
  }
  return promoPromise
}
