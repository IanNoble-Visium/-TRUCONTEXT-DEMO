import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box } from '@chakra-ui/react'

interface PageTransitionProps {
  children: React.ReactNode
  animationKey?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
  delay?: number
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  animationKey = 'page',
  direction = 'up',
  duration = 0.5,
  delay = 0
}) => {
  const getVariants = () => {
    const distance = 30
    
    switch (direction) {
      case 'left':
        return {
          initial: { opacity: 0, x: -distance },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: distance }
        }
      case 'right':
        return {
          initial: { opacity: 0, x: distance },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -distance }
        }
      case 'down':
        return {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -distance }
        }
      case 'up':
      default:
        return {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -distance }
        }
    }
  }

  const variants = getVariants()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          duration,
          delay,
          ease: "easeInOut"
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Box width="100%" height="100%">
          {children}
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition 