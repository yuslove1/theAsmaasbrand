import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import AboutSection from '@/components/home/AboutSection'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('updated_at', { ascending: false })
    .limit(4)

  if (error) return []
  return data || []
}

async function getActiveShareToken(): Promise<string> {
  const { data } = await supabase
    .from('featured_collections')
    .select('share_token')
    .eq('active', true)
    .single()
  return data?.share_token || 'default'
}

export default async function HomePage() {
  const [featuredProducts, shareToken] = await Promise.all([
    getFeaturedProducts(),
    getActiveShareToken(),
  ])

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection products={featuredProducts} shareToken={shareToken} />
      <AboutSection />
    </>
  )
}
