import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOrderNumber(): string {
  const date = new Date()
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `TAB-${ymd}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, subtotal, total } = body

    // Validate
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: 'Missing required customer fields' }, { status: 400 })
    }

    const order_number = generateOrderNumber()
    const db = supabaseAdmin()

    // Save order to Supabase
    const { data: order, error } = await db
      .from('orders')
      .insert({
        order_number,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_whatsapp: customer.whatsapp || '',
        delivery_address: customer.address,
        delivery_city: customer.city,
        delivery_state: customer.state,
        items,
        subtotal,
        delivery_fee: 0,
        total,
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        order_status: 'pending',
        notes: customer.notes || '',
      })
      .select()
      .single()

    if (error) throw error

    // Build items HTML for email
    const itemsHtml = items
      .map(
        (item: any) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            <strong>${item.product_name}</strong>
            ${item.note ? `<br/><span style="color:#888;font-size:12px;">${item.note}</span>` : ''}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₦${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join('')

    // ─── Email to Admin ────────────────────────────────────────────────
    await resend.emails.send({
      from: 'The Asmaa\'s Brand <orders@resend.dev>',
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
              <tr><td><strong>Name:</strong></td><td>${customer.name}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${customer.email}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${customer.phone}</td></tr>
              <tr><td><strong>WhatsApp:</strong></td><td>${customer.whatsapp || 'Not provided'}</td></tr>
              <tr><td><strong>Address:</strong></td><td>${customer.address}, ${customer.city}, ${customer.state}</td></tr>
              ${customer.notes ? `<tr><td><strong>Notes:</strong></td><td>${customer.notes}</td></tr>` : ''}
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
    await resend.emails.send({
      from: 'The Asmaa\'s Brand <orders@resend.dev>',
      to: customer.email,
      subject: `Order Confirmed — ${order_number} · The Asmaa's Brand`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">...best of your choices</p>
          </div>

          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <h2 style="color:#0A1628;">Assalamu Alaikum, ${customer.name}! 🌙</h2>
            <p style="color:#666;">Your order has been received. JazakAllahu Khairan for shopping with us.</p>

            <div style="background:#0A1628;color:white;padding:16px;text-align:center;margin:20px 0;">
              <p style="margin:0;font-size:12px;letter-spacing:3px;color:#C9A84C;">ORDER NUMBER</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:bold;">${order_number}</p>
            </div>

            <h3 style="color:#6B1A2A;">Payment Instructions</h3>
            <div style="background:white;border:1px solid #E8E0D5;padding:16px;">
              <p style="margin:0;font-size:14px;color:#444;">
                Please make a bank transfer for <strong>₦${total.toLocaleString()}</strong> and send 
                proof of payment to our WhatsApp: <strong>08143378187</strong> with your order number.
              </p>
              <br/>
              <p style="margin:0;font-size:12px;color:#888;">
                Bank details will be provided via WhatsApp or you can contact us at asmaurufai37@gmail.com
              </p>
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
              Questions? WhatsApp: 08143378187 · Email: asmaurufai37@gmail.com
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ order_number, id: order.id })
  } catch (err: any) {
    console.error('Order error:', err)
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 })
  }
}

export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
