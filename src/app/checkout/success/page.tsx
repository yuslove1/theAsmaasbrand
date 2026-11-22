import Link from 'next/link'
import MarkPaidButton from '@/components/checkout/MarkPaidButton'
import SuccessCheck from '@/components/checkout/SuccessCheck'
import { supabaseAdmin } from '@/lib/supabase'
import { CONTACT_WHATSAPP, CONTACT_WHATSAPP_LINK } from '@/lib/contact'
import type { PaymentAccount } from '@/types'

interface Props { searchParams: { order?: string; id?: string } }

async function getActiveAccounts(): Promise<PaymentAccount[]> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('payment_accounts')
    .select('*')
    .eq('is_active', true)
    .order('created_at')
  return data || []
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Only resolves when both the order number and its private id match
async function getPaymentState(orderNumber?: string, id?: string) {
  if (!orderNumber || !id || !UUID_RE.test(id)) return null
  const db = supabaseAdmin()
  const { data } = await db
    .from('orders')
    .select('payment_status, payment_reported_at')
    .eq('id', id)
    .eq('order_number', orderNumber)
    .maybeSingle()
  if (!data) return null
  if (data.payment_status === 'confirmed') return 'confirmed' as const
  return data.payment_reported_at ? ('reported' as const) : ('pending' as const)
}

export default async function SuccessPage({ searchParams }: Props) {
  const [accounts, paymentState] = await Promise.all([
    getActiveAccounts(),
    getPaymentState(searchParams.order, searchParams.id),
  ])

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

        <SuccessCheck />

        <h1 className="font-display text-4xl text-brand-navy mb-3">Order Placed!</h1>
        <p className="text-brand-navy/50 font-body mb-2">
          Your order{' '}
          <span className="font-semibold text-brand-wine">{searchParams.order}</span>{' '}
          has been received.
        </p>
        <p className="text-brand-navy/50 font-body text-sm mb-6 leading-relaxed">
          Your order will be processed once payment is confirmed.
          If you have questions, reach us on WhatsApp:{' '}
          <a href={CONTACT_WHATSAPP_LINK} className="text-brand-wine underline">
            {CONTACT_WHATSAPP}
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

        {searchParams.order && searchParams.id && paymentState && (
          <div className="mb-6">
            <MarkPaidButton
              orderNumber={searchParams.order}
              orderId={searchParams.id}
              initialStatus={paymentState}
            />
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
