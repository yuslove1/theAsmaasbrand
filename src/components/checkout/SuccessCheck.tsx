'use client'
import { motion } from 'framer-motion'

// Animated "order placed" tick: the circle pops in, then the check draws itself
export default function SuccessCheck() {
  return (
    <motion.div
      className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center mx-auto mb-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
    >
      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}
