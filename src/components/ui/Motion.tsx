'use client'
// Shared scroll/entrance animations. Used from server and client components alike.
// All motion respects the visitor's "reduce motion" OS setting (see MotionConfig in app/template.tsx).
import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const // smooth "ease-out-quint"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

type Common = { children: ReactNode; className?: string }

/** Fades + rises into view the first time it scrolls on screen. */
export function Reveal({ children, className, delay = 0, y = 28 }: Common & { delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Grid/list wrapper: children wrapped in <StaggerItem> appear one after another. */
export function Stagger({ children, className, gap = 0.08 }: Common & { gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: Common) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}
