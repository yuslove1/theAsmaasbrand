# 🌙 The Asmaa's Brand — Website

> **...best of your choices** · Full-stack Islamic fashion e-commerce built with Next.js 14, Supabase, Cloudinary & Resend.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Database  | Supabase (PostgreSQL + Auth)      |
| Images    | Cloudinary (free tier)            |
| Email     | Resend (free tier — 3,000/month)  |
| Payments  | Ready for Paystack integration    |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── shop/                 # Shop & product pages
│   ├── cart/                 # Cart
│   ├── checkout/             # Checkout + success
│   ├── featured/             # Shareable "Items of the Week" page
│   ├── admin/                # Admin panel (dashboard, products, categories, featured, orders)
│   └── api/                  # API routes (orders, products, categories, upload)
├── components/
│   ├── layout/               # Navbar, Footer
│   ├── home/                 # Hero, Categories, Featured, About sections
│   ├── shop/                 # ShopClient, ProductDetail
│   ├── admin/                # AdminSidebar
│   └── ui/                   # ShareButton
├── hooks/
│   └── useCart.ts            # Zustand cart store (persisted)
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── cloudinary.ts         # Cloudinary upload helper
└── types/
    └── index.ts              # All TypeScript types
supabase/
└── schema.sql                # Full database schema — run this first
```

---

## Setup Guide

### Step 1 — Clone & Install

```bash
cd asmaa-brand
npm install
```

### Step 2 — Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. In your project dashboard → **SQL Editor** → paste the entire contents of `supabase/schema.sql` → Run
3. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 3 — Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → Create free account
2. In your dashboard → **Settings → Upload** → Add Upload Preset:
   - Name it: `asmaa_brand_unsigned`
   - Mode: **Unsigned**
   - Save
3. Copy your **Cloud Name** from the dashboard

### Step 4 — Resend (Email)

1. Go to [resend.com](https://resend.com) → Create free account
2. Create an API key
3. For production, verify your domain. For testing, use `onboarding@resend.dev` as sender

### Step 5 — Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RESEND_API_KEY=re_xxxx
ADMIN_EMAIL=asmaurufai37@gmail.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SECRET_KEY=choose_a_strong_random_key_here

# Also add this for admin panel actions from browser:
NEXT_PUBLIC_ADMIN_KEY=same_value_as_ADMIN_SECRET_KEY
```

> ⚠️ **NEXT_PUBLIC_ADMIN_KEY** must match **ADMIN_SECRET_KEY** exactly.
> For production, implement proper Supabase Auth instead of the secret key approach.

### Step 6 — Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Pages Overview

| URL | Description |
|-----|-------------|
| `/` | Homepage — Hero, categories, Items of the Week, About, Contact |
| `/shop` | All products with Women/Men filter |
| `/shop?gender=women` | Women's collection |
| `/shop?gender=men` | Men's collection |
| `/shop/[slug]` | Single product page with add to cart |
| `/cart` | Shopping cart |
| `/checkout` | Checkout form (customer details + delivery) |
| `/checkout/success` | Order confirmation page |
| `/featured` | Shareable Items of the Week page |
| `/featured/[token]` | Unique shareable link for socials |
| `/admin` | Admin dashboard |
| `/admin/products` | Add, edit, delete products |
| `/admin/categories` | Manage Women & Men categories |
| `/admin/featured` | Toggle Items of the Week + share link |
| `/admin/orders` | View & update all orders |

---

## How Order Flow Works

1. Customer browses shop → adds items to cart (with color/size notes)
2. Fills checkout form (name, email, phone, WhatsApp, delivery address)
3. Order is saved to Supabase
4. **Admin receives a styled email** with full order details
5. **Customer receives a confirmation email** with bank transfer instructions
6. Admin updates order & payment status from `/admin/orders`

---

## How "Items of the Week" Sharing Works

1. Admin goes to `/admin/featured`
2. Stars any products to mark them as featured
3. Clicks **Share to Socials** → gets a unique link like `/featured/abc12345`
4. Shares to Instagram/TikTok/Facebook
5. Visitors land on the clean featured page → can browse items → are nudged to visit the full store

---

## Deploying to Production (Vercel — Recommended)

```bash
npm install -g vercel
vercel
```

Then add all your `.env.local` variables in the Vercel dashboard under **Settings → Environment Variables**.

Update `NEXT_PUBLIC_APP_URL` to your live domain.

---

## Contacts

- 📧 asmaurufai37@gmail.com
- 📱 08143378187 (WhatsApp)
- 📞 08024928389
- 📍 13 Shoyinka Street, Fadeyi, Lagos
- 📍 Lagos State University, Ojo, Lagos
- 📱 @the Asmaa's Brand (Instagram · TikTok · Facebook)
