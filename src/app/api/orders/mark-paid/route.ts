import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "The Asmaa's Brand <onboarding@resend.dev>"

export async function POST(req: NextRequest) {
  try {
    const { order_number } = await req.json()
    if (!order_number) {
      return NextResponse.json({ error: 'Missing order_number' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data: order, error } = await db
      .from('orders')
      .update({ payment_reported_at: new Date().toISOString() })
      .eq('order_number', order_number)
      .select()
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: process.env.ADMIN_EMAIL!,
      subject: `💰 Payment Reported — ${order.order_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <div style="background:#0A1628;padding:24px;text-align:center;">
            <h1 style="color:#C9A84C;margin:0;font-size:28px;">The Asmaa's Brand</h1>
            <p style="color:#ffffff80;margin:4px 0 0;font-size:12px;letter-spacing:3px;">PAYMENT REPORTED BY CUSTOMER</p>
          </div>
          <div style="padding:24px;background:#FAF7F2;border:1px solid #E8E0D5;">
            <p style="font-size:14px;color:#444;">
              <strong>${order.customer_name}</strong> says they've made payment for order
              <strong>${order.order_number}</strong> (₦${Number(order.total).toLocaleString()}).
            </p>
            <p style="font-size:13px;color:#666;">
              Please verify the bank transfer and confirm payment in your admin panel.
            </p>
            <table style="width:100%;font-size:14px;color:#444;margin-top:12px;">
              <tr><td><strong>Email:</strong></td><td>${order.customer_email}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${order.customer_phone}</td></tr>
            </table>
          </div>
        </div>
      `,
    })
    if (emailError) console.error('Payment-reported email failed:', emailError)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Mark-paid error:', err)
    return NextResponse.json({ error: err.message || 'Failed to report payment' }, { status: 500 })
  }
}
