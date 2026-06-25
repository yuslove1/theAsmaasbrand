import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types'
import ShopClient from '@/components/shop/ShopClient'

interface Props {
  searchParams: { gender?: string; category?: string; q?: string }
}

async function getProducts(gender?: string, category?: string, q?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (gender) query = query.contains('category', [gender])
  if (category) query = query.eq('subcategory', category)
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error } = await query
  if (error) return []
  return data || []
}

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from('categories').select('*').order('name')
  return data || []
}

export default async function ShopPage({ searchParams }: Props) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams.gender, searchParams.category, searchParams.q),
    getCategories(),
  ])

  return <ShopClient products={products} categories={categories} searchParams={searchParams} />
}
