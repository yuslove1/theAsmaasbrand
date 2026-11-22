import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { escapeHtml } from '@/lib/html'
import { RECEIPT_MAX_BYTES, RECEIPT_MIME_TYPES, receiptUrl, uploadReceipt } from '@/lib/cloudinaryServer'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "The Asmaa's Brand <onboarding@resend.dev>"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Buyer reports payment by uploading proof of the bank transfer.
// Expects multipart form data: order_number, order_id, receipt (image or PDF).
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData().catch(() => null)
    if (!form) return NextResponse.json({ error: 'Please attach your payment receipt' }, { status: 400 })

    const order_number = form.get('order_number')
    const order_id = form.get('order_id')
    const receipt = form.get('receipt')

    // The order's UUID is only ever given to the buyer who placed it (success-page URL and
    // confirmation email), so requiring it stops anyone reporting payment on someone else's order.
    if (typeof order_number !== 'string' || typeof order_id !== 'string' || !UUID_RE.test(order_id)) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 })
    }
    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json({ error: 'Please attach your payment receipt' }, { status: 400 })
    }
    if (!RECEIPT_MIME_TYPES.includes(receipt.type)) {
      return NextResponse.json({ error: 'Receipt must be a photo (JPG, PNG, WebP) or a PDF' }, { status: 400 })
    }
    if (receipt.size > RECEIPT_MAX_BYTES) {
      return NextResponse.json({ error: 'Receipt file is too large (max 4MB)' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data: existing } = await db
      .from('orders')
      .select('id, payment_status, payment_reported_at')
      .eq('id', order_id)
      .eq('order_number', order_number)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (existing.payment_status === 'confirmed') {
      return NextResponse.json({ ok: true, already: 'confirmed' })
    }
    if (existing.payment_reported_at) {
      return NextResponse.json({ ok: true, already: 'reported' })
    }

    const uploaded = await uploadReceipt(Buffer.from(await receipt.arrayBuffer()), receipt.type, order_number)

    const { data: order, error } = await db
      .from('orders')
      .update({ payment_reported_at: new Date().toISOString(), payment_receipt: uploaded })
      .eq('id', order_id)
      .is('payment_reported_at', null)
      .select()
      .maybeSingle()

    if (error) throw error
    if (!order) return NextResponse.json({ ok: true, already: 'reported' }) // a concurrent request won

    const viewUrl = receiptUrl(uploaded)
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.ADMIN_EMAIL!,
      subject: `💰 Payment Receipt Uploaded — ${order.order_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">PAYMENT RECEIPT UPLOADED</p>
          </div>
          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <p style="font-size:14px;color:#444;">
              <strong>${escapeHtml(order.customer_name)}</strong> has uploaded a payment receipt for order
              <strong>${order.order_number}</strong> (₦${Number(order.total).toLocaleString()}).
            </p>
            <p style="font-size:13px;color:#666;">
              Check that the money has actually arrived in your bank account before confirming payment
              in your admin panel — a receipt alone is not proof the transfer went through.
            </p>
            <div style="text-align:center;margin:20px 0;">
              <a href="${viewUrl}" style="display:inline-block;background:#6B1A2A;color:#ffffff;text-decoration:none;padding:12px 22px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                View Receipt
              </a>
            </div>
            <table style="width:100%;font-size:14px;color:#444;margin-top:12px;">
              <tr><td><strong>Email:</strong></td><td>${escapeHtml(order.customer_email)}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${escapeHtml(order.customer_phone)}</td></tr>
            </table>
          </div>
        </div>
      `,
    })
    if (emailError) console.error('Payment-reported email failed:', emailError)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Mark-paid error:', err)
    return NextResponse.json({ error: 'Could not upload your receipt. Please try again.' }, { status: 500 })
  }
}
