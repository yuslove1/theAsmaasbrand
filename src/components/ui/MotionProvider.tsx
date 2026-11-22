'use client'
import { MotionConfig } from 'framer-motion'

// Every animation on the site follows the visitor's OS "reduce motion" setting
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
