'use client'
// A template re-mounts on every navigation, so each page fades in as you move around the site.
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Admin has fixed-position panels (mobile sidebar); a transformed wrapper would break them
  if (pathname.startsWith('/admin')) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
