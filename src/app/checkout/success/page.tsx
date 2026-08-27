import Link from 'next/link'
import MarkPaidButton from '@/components/checkout/MarkPaidButton'
import { supabaseAdmin } from '@/lib/supabase'
import type { PaymentAccount } from '@/types'

interface Props { searchParams: { order?: string } }

async function getActiveAccounts(): Promise<PaymentAccount[]> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('payment_accounts')
    .select('*')
    .eq('is_active', true)
    .order('created_at')
  return data || []
}

export default async function SuccessPage({ searchParams }: Props) {
  const accounts = await getActiveAccounts()

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
        <p className="text-brand-navy/50 font-body text-sm mb-6 leading-relaxed">
          Your order will be processed once payment is confirmed.
          If you have questions, reach us on WhatsApp:{' '}
          <a href="https://wa.me/2348143378187" className="text-brand-wine underline">
            08143378187
          </a>
        </p>

        {accounts.length > 0 && (
          <div className="bg-white border border-brand-stone p-5 mb-6 text-left">
            <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3 text-center">
              Send Payment To
            </p>
            <div className="space-y-4">
              {accounts.map((a) => (
                <div key={a.id} className="border-b border-brand-stone/50 last:border-0 pb-4 last:pb-0">
                  <p className="font-body text-sm text-brand-navy/50">{a.bank_name}</p>
                  <p className="font-body font-semibold text-brand-navy">{a.account_name}</p>
                  <p className="font-mono text-lg text-brand-wine mt-0.5">{a.account_number}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchParams.order && (
          <div className="mb-6">
            <MarkPaidButton orderNumber={searchParams.order} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
          <Link href="/" className="btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
