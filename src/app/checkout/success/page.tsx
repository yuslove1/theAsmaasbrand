import Link from 'next/link'

interface Props { searchParams: { order?: string } }

export default function SuccessPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-brand-cream pt-28 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Arabic bismillah */}
        <p
          className="text-brand-gold text-4xl mb-4 opacity-60"
          style={{ fontFamily: 'var(--font-amiri)' }}
        >
          الحمد لله
        </p>

        <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-4xl text-brand-navy mb-3">Order Placed!</h1>
        <p className="text-brand-navy/50 font-body mb-2">
          Your order{' '}
          <span className="font-semibold text-brand-wine">{searchParams.order}</span>{' '}
          has been received.
        </p>
        <p className="text-brand-navy/50 font-body text-sm mb-8 leading-relaxed">
          We have sent a confirmation email with your bank transfer details.
          Your order will be processed once payment is confirmed.
          If you have questions, reach us on WhatsApp:{' '}
          <a href="https://wa.me/2348143378187" className="text-brand-wine underline">
            08143378187
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
          <Link href="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
