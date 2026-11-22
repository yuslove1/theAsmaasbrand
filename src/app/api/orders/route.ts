import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase'
import { escapeHtml } from '@/lib/html'
import { CONTACT_EMAIL, CONTACT_WHATSAPP } from '@/lib/contact'
import { deleteReceipt, receiptUrl } from '@/lib/cloudinaryServer'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "The Asmaa's Brand <onboarding@resend.dev>"

// Unambiguous characters only (no 0/O, 1/I/L) so buyers can read the number back over WhatsApp
const ORDER_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateOrderNumber(): string {
  const date = new Date()
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  const code = Array.from(bytes, (b) => ORDER_CODE_ALPHABET[b % ORDER_CODE_ALPHABET.length]).join('')
  return `TAB-${ymd}-${code}`
}

const PAYMENT_STATUSES = ['pending', 'confirmed', 'failed']
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const MAX_QTY_PER_ITEM = 100
const MAX_NOTE_LENGTH = 500

function clean(value: unknown, max = 300): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawCustomer = body?.customer ?? {}
    const rawItems: unknown = body?.items

    const customer = {
      name: clean(rawCustomer.name, 120),
      email: clean(rawCustomer.email, 200),
      phone: clean(rawCustomer.phone, 40),
      whatsapp: clean(rawCustomer.whatsapp, 40),
      address: clean(rawCustomer.address, 500),
      city: clean(rawCustomer.city, 120),
      state: clean(rawCustomer.state, 120),
      notes: clean(rawCustomer.notes, 1000),
    }

    // Validate
    if (!customer.name || !customer.email || !customer.phone || !customer.address || !customer.city || !customer.state) {
      return NextResponse.json({ error: 'Missing required customer fields' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    // Merge duplicate lines and validate quantities. Only product_id, quantity and note
    // are taken from the client; name, image and price always come from the database.
    const requested = new Map<string, { quantity: number; note: string }>()
    for (const raw of rawItems as any[]) {
      const id = typeof raw?.product_id === 'string' ? raw.product_id : ''
      const qty = Number(raw?.quantity)
      if (!id || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
        return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 })
      }
      const prev = requested.get(id)
      requested.set(id, {
        quantity: (prev?.quantity ?? 0) + qty,
        note: prev?.note || clean(raw?.note, MAX_NOTE_LENGTH),
      })
    }

    const db = supabaseAdmin()

    const { data: products, error: productsError } = await db
      .from('products')
      .select('id, name, price, images, is_available')
      .in('id', Array.from(requested.keys()))
    if (productsError) throw productsError

    const byId = new Map((products || []).map((p) => [p.id, p]))
    const items = []
    for (const [id, { quantity, note }] of Array.from(requested.entries())) {
      const p = byId.get(id)
      if (!p || !p.is_available) {
        return NextResponse.json(
          { error: 'One or more items in your cart are no longer available. Please review your cart.' },
          { status: 409 }
        )
      }
      items.push({
        product_id: p.id,
        product_name: p.name,
        product_image: p.images?.[0] || '',
        price: Number(p.price),
        quantity,
        note,
      })
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const delivery_fee = 0
    const total = subtotal + delivery_fee

    // Save order to Supabase, retrying on the (unlikely) order-number collision
    let order: any = null
    let order_number = ''
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      order_number = generateOrderNumber()
      const { data, error } = await db
        .from('orders')
        .insert({
          order_number,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_whatsapp: customer.whatsapp,
          delivery_address: customer.address,
          delivery_city: customer.city,
          delivery_state: customer.state,
          items,
          subtotal,
          delivery_fee,
          total,
          payment_method: 'bank_transfer',
          payment_status: 'pending',
          order_status: 'pending',
          notes: customer.notes,
        })
        .select()
        .single()
      if (error) {
        if (error.code === '23505') continue // unique_violation on order_number
        throw error
      }
      order = data
    }
    if (!order) throw new Error('Could not generate a unique order number')

    // Private link back to the buyer's order page, where they upload their payment receipt
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '')
    const orderPageUrl = `${appUrl}/checkout/success?order=${encodeURIComponent(order_number)}&id=${encodeURIComponent(order.id)}`

    // Active bank accounts to show the buyer
    const { data: paymentAccounts } = await db
      .from('payment_accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at')

    const accountsHtml = (paymentAccounts || [])
      .map(
        (a) => `
        <div style="margin-bottom:12px;">
          <p style="margin:0;font-size:12px;color:#888;">${escapeHtml(a.bank_name)}</p>
          <p style="margin:0;font-size:14px;font-weight:bold;color:#0A1628;">${escapeHtml(a.account_name)}</p>
          <p style="margin:0;font-size:16px;color:#6B1A2A;font-family:monospace;">${escapeHtml(a.account_number)}</p>
        </div>`
      )
      .join('')

    // Build items HTML for email
    const itemsHtml = items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            <strong>${escapeHtml(item.product_name)}</strong>
            ${item.note ? `<br/><span style="color:#888;font-size:12px;">${escapeHtml(item.note)}</span>` : ''}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₦${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join('')

    // ─── Email to Admin ────────────────────────────────────────────────
    const adminEmail = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.ADMIN_EMAIL!,
      subject: `🛍️ New Order ${order_number} — ₦${total.toLocaleString()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">NEW ORDER RECEIVED</p>
          </div>

          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <h2 style="color:#0A1628;border-bottom:2px solid #C9A84C;padding-bottom:8px;">
              Order ${order_number}
            </h2>

            <h3 style="color:#6B1A2A;">Customer Details</h3>
            <table style="width:100%;font-size:14px;color:#444;">
              <tr><td><strong>Name:</strong></td><td>${escapeHtml(customer.name)}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${escapeHtml(customer.email)}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${escapeHtml(customer.phone)}</td></tr>
              <tr><td><strong>WhatsApp:</strong></td><td>${escapeHtml(customer.whatsapp || 'Not provided')}</td></tr>
              <tr><td><strong>Address:</strong></td><td>${escapeHtml(customer.address)}, ${escapeHtml(customer.city)}, ${escapeHtml(customer.state)}</td></tr>
              ${customer.notes ? `<tr><td><strong>Notes:</strong></td><td>${escapeHtml(customer.notes)}</td></tr>` : ''}
            </table>

            <h3 style="color:#6B1A2A;margin-top:20px;">Items Ordered</h3>
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <thead>
                <tr style="background:#0A1628;color:white;">
                  <th style="padding:10px;text-align:left;">Item</th>
                  <th style="padding:10px;text-align:center;">Qty</th>
                  <th style="padding:10px;text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr style="background:#FAF7F2;">
                  <td colspan="2" style="padding:12px;font-weight:bold;text-align:right;">Total:</td>
                  <td style="padding:12px;font-weight:bold;color:#6B1A2A;text-align:right;">₦${total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background:#fff;border:1px solid #E8E0D5;padding:16px;margin-top:20px;border-radius:4px;">
              <p style="margin:0;font-size:13px;color:#666;">
                <strong>Payment:</strong> Bank Transfer — confirm payment and update order status in your admin panel.
              </p>
            </div>
          </div>
        </div>
      `,
    })

    // ─── Email to Customer ─────────────────────────────────────────────
    const customerEmail = await resend.emails.send({
      from: EMAIL_FROM,
      to: customer.email,
      subject: `Order Confirmed — ${order_number} · The Asmaa's Brand`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">...best of your choices</p>
          </div>

          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <h2 style="color:#0A1628;">Assalamu Alaikum, ${escapeHtml(customer.name)}! 🌙</h2>
            <p style="color:#666;">Your order has been received. JazakAllahu Khairan for shopping with us.</p>

            <div style="background:#0A1628;color:white;padding:16px;text-align:center;margin:20px 0;">
              <p style="margin:0;font-size:12px;letter-spacing:3px;color:#C9A84C;">ORDER NUMBER</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:bold;">${order_number}</p>
            </div>

            <h3 style="color:#6B1A2A;">Payment Instructions</h3>
            <div style="background:white;border:1px solid #E8E0D5;padding:16px;">
              <p style="margin:0 0 12px;font-size:14px;color:#444;">
                Please make a bank transfer for <strong>₦${total.toLocaleString()}</strong> to the account below,
                then upload a screenshot or PDF of your transfer receipt on your order page and click
                &ldquo;I&apos;ve Made Payment&rdquo;. Your order is processed once we confirm the payment.
              </p>
              ${accountsHtml || `
              <p style="margin:0;font-size:12px;color:#888;">
                Bank details will be provided via WhatsApp or you can contact us at ${CONTACT_EMAIL}
              </p>`}
              <div style="text-align:center;margin-top:16px;">
                <a href="${orderPageUrl}" style="display:inline-block;background:#6B1A2A;color:#ffffff;text-decoration:none;padding:12px 22px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                  Upload Payment Receipt
                </a>
              </div>
            </div>

            <h3 style="color:#6B1A2A;margin-top:20px;">Your Order</h3>
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr><td colspan="2" style="padding:10px;font-weight:bold;text-align:right;border-top:2px solid #C9A84C;">
                  Total: ₦${total.toLocaleString()}
                </td></tr>
              </tfoot>
            </table>

            <p style="color:#888;font-size:12px;margin-top:20px;text-align:center;">
              Questions? WhatsApp: ${CONTACT_WHATSAPP} · Email: ${CONTACT_EMAIL}
            </p>
          </div>
        </div>
      `,
    })

    if (adminEmail.error) console.error('Admin order email failed:', adminEmail.error)
    if (customerEmail.error) console.error('Customer order email failed:', customerEmail.error)

    return NextResponse.json({ order_number, id: order.id })
  } catch (err: any) {
    console.error('Order error:', err)
    return NextResponse.json({ error: 'Failed to place order. Please try again.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })

  // Only status fields are editable from the admin panel; totals and items are never changed here
  const rest: { payment_status?: string; order_status?: string } = {}
  if (fields.payment_status !== undefined) {
    if (!PAYMENT_STATUSES.includes(fields.payment_status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }
    rest.payment_status = fields.payment_status
  }
  if (fields.order_status !== undefined) {
    if (!ORDER_STATUSES.includes(fields.order_status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    }
    rest.order_status = fields.order_status
  }
  if (!rest.payment_status && !rest.order_status) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const { data: existing } = await db
    .from('orders')
    .select('payment_status, order_status')
    .eq('id', id)
    .single()

  const { data, error } = await db
    .from('orders')
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the buyer only on the pending/failed → confirmed transition
  if (rest.payment_status === 'confirmed' && existing?.payment_status !== 'confirmed') {
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customer_email,
      subject: `Payment Confirmed — ${data.order_number} · The Asmaa's Brand`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">PAYMENT CONFIRMED</p>
          </div>
          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <h2 style="color:#0A1628;">Assalamu Alaikum, ${escapeHtml(data.customer_name)}! ✅</h2>
            <p style="color:#666;font-size:14px;">
              Your payment for order <strong>${data.order_number}</strong> has been confirmed
              by The Asmaa's Brand. JazakAllahu Khairan — we're preparing your order now.
            </p>
            <div style="background:#0A1628;color:white;padding:16px;text-align:center;margin:20px 0;">
              <p style="margin:0;font-size:12px;letter-spacing:3px;color:#C9A84C;">ORDER NUMBER</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:bold;">${data.order_number}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#ffffffaa;">₦${Number(data.total).toLocaleString()}</p>
            </div>
            <p style="color:#888;font-size:12px;margin-top:20px;text-align:center;">
              Questions? WhatsApp: ${CONTACT_WHATSAPP} · Email: ${CONTACT_EMAIL}
            </p>
          </div>
        </div>
      `,
    })
    if (emailError) console.error('Payment-confirmed email failed:', emailError)
  }

  // Notify the buyer only on the → shipped transition
  if (rest.order_status === 'shipped' && existing?.order_status !== 'shipped') {
    const { error: shippedEmailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customer_email,
      subject: `Your Order Is On The Way — ${data.order_number} · The Asmaa's Brand`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">ORDER SHIPPED</p>
          </div>
          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <h2 style="color:#0A1628;">Assalamu Alaikum, ${escapeHtml(data.customer_name)}! 📦</h2>
            <p style="color:#666;font-size:14px;">
              Your order <strong>${data.order_number}</strong> is on its way to you.
            </p>
            <div style="background:white;border:1px solid #E8E0D5;padding:16px;margin:20px 0;">
              <p style="margin:0;font-size:12px;color:#888;letter-spacing:1px;text-transform:uppercase;">Delivery Address</p>
              <p style="margin:4px 0 0;font-size:14px;color:#0A1628;">
                ${escapeHtml(data.delivery_address)}<br/>
                ${escapeHtml(data.delivery_city)}, ${escapeHtml(data.delivery_state)}
              </p>
            </div>
            <p style="color:#888;font-size:12px;margin-top:20px;text-align:center;">
              Questions? WhatsApp: ${CONTACT_WHATSAPP} · Email: ${CONTACT_EMAIL}
            </p>
          </div>
        </div>
      `,
    })
    if (shippedEmailError) console.error('Order-shipped email failed:', shippedEmailError)
  }

  // Notify the buyer only on the → delivered transition
  if (rest.order_status === 'delivered' && existing?.order_status !== 'delivered') {
    const { error: deliveredEmailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customer_email,
      subject: `Delivered! Thank You, ${data.customer_name} 🤍 · The Asmaa's Brand`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">ORDER DELIVERED</p>
          </div>
          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <h2 style="color:#0A1628;">Assalamu Alaikum, ${escapeHtml(data.customer_name)}! 🤍</h2>
            <p style="color:#444;font-size:14px;line-height:1.7;">
              Your order <strong>${data.order_number}</strong> has been delivered — we hope it arrived safely
              and that you fall in love with it the moment you open it.
            </p>
            <p style="color:#444;font-size:14px;line-height:1.7;">
              Thank you for trusting The Asmaa's Brand with your order. Every purchase means the world to
              our small business, and we truly appreciate you choosing us. JazakAllahu Khairan
              — may Allah bless you abundantly. 🤲
            </p>
            <p style="color:#444;font-size:14px;line-height:1.7;">
              If anything about your order isn't quite right, please reach out — we'd love to make it right.
              And if you loved it, we'd be so grateful if you shared a picture with us or told a friend!
            </p>
            <div style="background:#0A1628;color:white;padding:16px;text-align:center;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#C9A84C;font-style:italic;">
                "...best of your choices"
              </p>
            </div>
            <p style="color:#888;font-size:12px;margin-top:20px;text-align:center;">
              With love, The Asmaa's Brand · WhatsApp: ${CONTACT_WHATSAPP} · Email: ${CONTACT_EMAIL}
            </p>
          </div>
        </div>
      `,
    })
    if (deliveredEmailError) console.error('Order-delivered email failed:', deliveredEmailError)
  }

  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  // Orders contain customer names, emails, phones and addresses: admin only
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Receipts are private on Cloudinary; give the admin a signed link to view each one
  return NextResponse.json(
    (data || []).map((o) => ({
      ...o,
      payment_receipt_url: o.payment_receipt ? receiptUrl(o.payment_receipt) : null,
    }))
  )
}

// Permanently delete an order (e.g. test or spam orders). Also removes its private receipt.
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })

  const db = supabaseAdmin()
  const { data: order, error } = await db
    .from('orders')
    .delete()
    .eq('id', id)
    .select('id, payment_receipt')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (order.payment_receipt) {
    await deleteReceipt(order.payment_receipt).catch((err) => console.error('Receipt cleanup failed:', err))
  }
  return NextResponse.json({ success: true })
}
