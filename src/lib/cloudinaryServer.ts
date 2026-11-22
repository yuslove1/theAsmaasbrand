// Server-only Cloudinary helpers (uses the API secret — never import from client components)
import { v2 as cloudinary } from 'cloudinary'
import type { PaymentReceipt } from '@/types'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

export function fileToDataUri(buffer: Buffer, mime: string): string {
  return `data:${mime};base64,${buffer.toString('base64')}`
}

export const RECEIPT_MAX_BYTES = 4 * 1024 * 1024 // Vercel caps request bodies at ~4.5MB
export const RECEIPT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

// Receipts are uploaded as "authenticated" assets: they can't be opened from a guessed
// URL, only through a link signed with our API secret (admin panel + admin email).
export async function uploadReceipt(buffer: Buffer, mime: string, orderNumber: string): Promise<PaymentReceipt> {
  const isPdf = mime === 'application/pdf'
  const result = await cloudinary.uploader.upload(fileToDataUri(buffer, mime), {
    folder: 'asmaa-brand/receipts',
    public_id: `${orderNumber}-${Date.now()}${isPdf ? '.pdf' : ''}`,
    type: 'authenticated',
    // PDFs go up as raw files: Cloudinary blocks PDF delivery as images on new accounts by default
    resource_type: isPdf ? 'raw' : 'image',
  })
  return {
    public_id: result.public_id,
    resource_type: isPdf ? 'raw' : 'image',
    format: isPdf ? 'pdf' : result.format,
    uploaded_at: new Date().toISOString(),
  }
}

export function receiptUrl(receipt: PaymentReceipt): string {
  return cloudinary.url(receipt.public_id, {
    resource_type: receipt.resource_type,
    type: 'authenticated',
    sign_url: true,
    secure: true,
    ...(receipt.resource_type === 'image' ? { format: receipt.format } : {}),
  })
}

export async function deleteReceipt(receipt: PaymentReceipt): Promise<void> {
  await cloudinary.uploader.destroy(receipt.public_id, {
    resource_type: receipt.resource_type,
    type: 'authenticated',
    invalidate: true,
  })
}
