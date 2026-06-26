import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'The Asmaa\'s Brand — Best of Your Choices',
  description:
    'Dealer in all kinds of Scarves, Abayas, Jalabias, Inner Caps, Hijabs, Hijab Pins, Islamic Essentials, Islamic Art & Signs, and Gift Items. Based in Lagos, Nigeria.',
  keywords: 'abaya, hijab, jalabia, islamic fashion, muslim wear, lagos, nigeria, asmaa brand',
  openGraph: {
    title: 'The Asmaa\'s Brand',
    description: '...best of your choices',
    images: ['/images/theasmaasbrand.jpeg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
              borderRadius: 0,
              border: '1px solid #E8E0D5',
            },
          }}
        />
      </body>
    </html>
  )
}
