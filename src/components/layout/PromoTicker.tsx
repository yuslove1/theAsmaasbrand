// Scrolling promo message for the top bar (news-ticker style).
// Two identical halves slide left by 50% on a loop, so the scroll is seamless.
const COPIES_PER_HALF = 4

export default function PromoTicker({ message }: { message: string }) {
  // Longer messages scroll for longer so the reading speed stays about the same
  const seconds = Math.min(90, Math.max(18, message.length * 0.9))

  const half = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {Array.from({ length: COPIES_PER_HALF }, (_, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6">{message}</span>
          <span className="text-brand-gold/50" aria-hidden>✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="promo-ticker relative overflow-hidden" role="marquee" aria-label={message}>
      <div className="promo-ticker-track flex w-max" style={{ animationDuration: `${seconds}s` }}>
        {half(false)}
        {half(true)}
      </div>
    </div>
  )
}
