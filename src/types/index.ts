// ─── Product ────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: ('women' | 'men')[]
  subcategory: string
  images: string[]          // Cloudinary URLs
  video_url?: string        // Cloudinary video URL
  is_featured: boolean      // Items of the Week
  is_available: boolean
  created_at: string
  updated_at: string
}

// ─── Category ───────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  gender: ('women' | 'men')[]
  description?: string
  image_url?: string
  created_at: string
}

// ─── Cart ───────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
  note: string             // customer's color/size/custom notes
}

// ─── Order ──────────────────────────────────────────────────────────────────
export interface OrderItem {
  product_id: string
  product_name: string
  product_image: string
  price: number
  quantity: number
  note: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_whatsapp: string
  delivery_address: string
  delivery_city: string
  delivery_state: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: 'bank_transfer'
  payment_status: 'pending' | 'confirmed' | 'failed'
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Featured / Items of the Week ───────────────────────────────────────────
export interface FeaturedCollection {
  id: string
  title: string
  subtitle?: string
  products: Product[]
  share_token: string      // unique token for shareable link
  active: boolean
  created_at: string
}

// ─── Admin ──────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  email: string
  role: 'admin'
}
