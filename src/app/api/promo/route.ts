import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // The site always gets the public shape (even for a logged-in admin browsing the shop,
  // so she sees the popup exactly as customers do). The admin page asks for ?admin=1.
  const wantsAdmin = req.nextUrl.searchParams.get('admin') === '1'
  if (wantsAdmin && !(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = supabaseAdmin()
  const { data, error } = await db.from('promo_banner').select('*').eq('id', 'main').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (wantsAdmin) return NextResponse.json(data)

  // Public view: only what is switched on
  const bannerOn = !!data.is_active && !!data.message?.trim()
  const popupOn = !!data.popup_is_active && !!data.popup_image_url
  return NextResponse.json({
    message: bannerOn ? data.message : '',
    is_active: bannerOn,
    popup: popupOn
      ? {
          image_url: data.popup_image_url,
          link: data.popup_link || '',
          repeat_hours: data.popup_repeat_hours || 6,
          // Changes whenever the admin saves, so a new promo shows even to people who closed the old one
          version: data.updated_at,
        }
      : null,
  })
}

function isSafeLink(link: string): boolean {
  if (!link) return true
  if (link.startsWith('/') && !link.startsWith('//')) return true
  try {
    const u = new URL(link)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const popupLink = typeof body.popup_link === 'string' ? body.popup_link.trim() : ''
  if (!isSafeLink(popupLink)) {
    return NextResponse.json({ error: 'Popup link must be a web address (https://…) or a site path like /shop' }, { status: 400 })
  }
  const repeatHours = Math.round(Number(body.popup_repeat_hours ?? 6))
  if (!Number.isFinite(repeatHours) || repeatHours < 1 || repeatHours > 720) {
    return NextResponse.json({ error: 'Show-again time must be between 1 and 720 hours' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('promo_banner')
    .update({
      message: typeof body.message === 'string' ? body.message : '',
      is_active: !!body.is_active,
      popup_image_url: typeof body.popup_image_url === 'string' ? body.popup_image_url : '',
      popup_link: popupLink,
      popup_is_active: !!body.popup_is_active,
      popup_repeat_hours: repeatHours,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'main')
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
