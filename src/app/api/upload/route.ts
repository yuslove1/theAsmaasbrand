import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { cloudinary, fileToDataUri } from '@/lib/cloudinaryServer'

// Admin image uploads. `kind` picks how the image is stored:
//  - product (default): cropped to the 3:4 product-card shape
//  - promo: kept at its own shape (popup ads), only scaled down if very large
const UPLOAD_KINDS = {
  product: {
    folder: 'asmaa-brand/products',
    transformation: [{ width: 800, height: 1067, crop: 'fill', quality: 'auto' }],
  },
  promo: {
    folder: 'asmaa-brand/promos',
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
} as const

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload an image file' }, { status: 400 })
    }

    const kind = formData.get('kind') === 'promo' ? 'promo' : 'product'
    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await cloudinary.uploader.upload(fileToDataUri(buffer, file.type), {
      folder: UPLOAD_KINDS[kind].folder,
      transformation: [...UPLOAD_KINDS[kind].transformation],
    })

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
