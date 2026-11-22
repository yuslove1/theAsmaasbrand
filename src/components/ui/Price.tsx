// Product price with an optional "was" price struck through (only when it's higher).
type Size = 'sm' | 'md' | 'lg'

const PRICE_CLS: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-sm sm:text-base',
  lg: 'text-2xl',
}
const WAS_CLS: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-base',
}

export function hasDiscount(price: number, compareAt?: number | null): compareAt is number {
  return compareAt != null && Number(compareAt) > Number(price)
}

/** Whole-number percentage off, e.g. 25 for ₦7,500 → ₦10,000 */
export function discountPercent(price: number, compareAt?: number | null): number {
  if (!hasDiscount(price, compareAt)) return 0
  const was = Number(compareAt)
  return Math.round(((was - Number(price)) / was) * 100)
}

export default function Price({
  price,
  compareAt,
  size = 'md',
  className = '',
}: {
  price: number
  compareAt?: number | null
  size?: Size
  className?: string
}) {
  const discounted = hasDiscount(price, compareAt)
  return (
    <span className={`inline-flex items-baseline flex-wrap gap-x-2 ${className}`}>
      <span className={`font-body font-semibold text-brand-wine ${PRICE_CLS[size]}`}>
        ₦{Number(price).toLocaleString()}
      </span>
      {discounted && (
        <s className={`font-body text-brand-navy/40 ${WAS_CLS[size]}`} aria-label={`was ₦${compareAt.toLocaleString()}`}>
          ₦{Number(compareAt).toLocaleString()}
        </s>
      )}
    </span>
  )
}

/** Small "-25%" corner badge for product cards; renders nothing without a discount */
export function DiscountBadge({ price, compareAt, className = '' }: { price: number; compareAt?: number | null; className?: string }) {
  const pct = discountPercent(price, compareAt)
  if (pct < 1) return null
  return (
    <span className={`bg-brand-gold text-brand-navy text-[10px] font-bold tracking-wider px-2 py-0.5 font-body w-fit ${className}`}>
      -{pct}%
    </span>
  )
}
