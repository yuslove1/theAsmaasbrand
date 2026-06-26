import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/types'
import ProductDetail from '@/components/shop/ProductDetail'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

async function getProduct(slug: string): Promise<Product | null> {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return data
}

async function getRelated(product: Product): Promise<Product[]> {
  const db = supabaseAdmin()
  const { data } = await db
    .from('products')
    .select('*')
    .overlaps('category', product.category)
    .neq('id', product.id)
    .eq('is_available', true)
    .limit(4)
  return data || []
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)
  if (!product) notFound()
  const related = await getRelated(product)
  return <ProductDetail product={product} related={related} />
}
