import React from 'react'
import Lottie from 'lottie-react'
import { Box } from '@chakra-ui/react'

interface LottieAnimationProps {
  animationPath: string
  width?: number | string
  height?: number | string
  loop?: boolean
  autoplay?: boolean
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationPath,
  width = 200,
  height = 200,
  loop = true,
  autoplay = true
}) => {
  const [animationData, setAnimationData] = React.useState<any>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(animationPath)
        if (!response.ok) {
          throw new Error('Failed to load animation')
        }
        const data = await response.json()
        setAnimationData(data)
      } catch (err) {
        console.error('Error loading Lottie animation:', err)
        setError(true)
      }
    }

    loadAnimation()
  }, [animationPath])

  if (error || !animationData) {
    return null
  }

  return (
    <Box width={width} height={height}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  )
}

export default LottieAnimation 