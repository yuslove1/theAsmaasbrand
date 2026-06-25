'use client'
import { Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShareButton({ shareUrl }: { shareUrl: string }) {
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: "The Asmaa's Brand — Featured Items",
        text: "Check out these amazing pieces from The Asmaa's Brand! 🌟",
        url: shareUrl,
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-brand-gold text-brand-navy px-5 py-2 text-xs tracking-widest uppercase font-body hover:bg-brand-gold2 transition-all"
    >
      <Share2 size={14} /> Share This Collection
    </button>
  )
}
