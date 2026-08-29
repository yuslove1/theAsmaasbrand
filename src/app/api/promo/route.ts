import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const isAdmin = req.headers.get('x-admin-key') === process.env.ADMIN_SECRET_KEY
  const db = supabaseAdmin()
  const { data, error } = await db.from('promo_banner').select('*').eq('id', 'main').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!isAdmin && !data.is_active) {
    return NextResponse.json({ id: 'main', message: '', is_active: false })
  }
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('x-admin-key')
  if (auth !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('promo_banner')
    .update({
      message: body.message,
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'main')
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
