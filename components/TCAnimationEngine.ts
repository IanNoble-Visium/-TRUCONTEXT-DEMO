import { Core, NodeSingular, EdgeSingular } from 'cytoscape'

export interface AnimationConfig {
  type: 'pulse' | 'flash' | 'strobe' | 'glow' | 'flow'
  duration?: number
  intensity?: number
  speed?: number
}

export class TCAnimationEngine {
  private cy: Core
  private activeAnimations: Map<string, any> = new Map()
  private animationIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(cy: Core) {
    this.cy = cy
  }

  // Start animation for an element
  startAnimation(elementId: string, config: AnimationConfig) {
    try {
      // Validate Cytoscape instance
      if (!this.cy || this.cy.destroyed()) {
        console.warn('Cannot start animation: Cytoscape instance is not available')
        return
      }

      // Stop any existing animation for this element
      this.stopAnimation(elementId)

      const element = this.cy.getElementById(elementId)
      if (!element || element.length === 0) {
        console.warn(`Cannot start animation: Element ${elementId} not found`)
        return
      }

      // Validate element state
      if (element.removed()) {
        console.warn(`Cannot start animation: Element ${elementId} has been removed`)
        return
      }

      const isNode = element.isNode()

      switch (config.type) {
        case 'pulse':
          this.startPulseAnimation(elementId, element, config, isNode)
          break
        case 'flash':
          this.startFlashAnimation(elementId, element, config)
          break
        case 'strobe':
          this.startStrobeAnimation(elementId, element, config)
          break
        case 'glow':
          this.startGlowAnimation(elementId, element, config, isNode)
          break
        case 'flow':
          if (!isNode) {
            this.startFlowAnimation(elementId, element as EdgeSingular, config)
          }
          break
      }
    } catch (error) {
      console.error(`Error starting animation for element ${elementId}:`, error)
    }
  }

  // Stop animation for an element
  stopAnimation(elementId: string) {
    try {
      // Stop any running animation
      const animation = this.activeAnimations.get(elementId)
      if (animation) {
        try {
          animation.stop()
        } catch (animError) {
          console.warn(`Error stopping animation for ${elementId}:`, animError)
        }
        this.activeAnimations.delete(elementId)
      }

      // Clear any intervals
      const interval = this.animationIntervals.get(elementId)
      if (interval) {
        clearInterval(interval)
        this.animationIntervals.delete(elementId)
      }

      // Reset element to original state
      if (this.cy && !this.cy.destroyed()) {
        const element = this.cy.getElementById(elementId)
        if (element && element.length > 0 && !element.removed()) {
          try {
            element.stop()
            // Reset any animation-specific styles
            element.removeStyle('opacity')
            element.removeStyle('background-color')
            element.removeStyle('line-color')
            element.removeStyle('border-color')
            element.removeStyle('width')
            element.removeStyle('height')
          } catch (styleError) {
            console.warn(`Error resetting styles for ${elementId}:`, styleError)
          }
        }
      }
    } catch (error) {
      console.error(`Error stopping animation for element ${elementId}:`, error)
    }
  }

  // Stop all animations
  stopAllAnimations() {
    this.activeAnimations.forEach((animation, elementId) => {
      this.stopAnimation(elementId)
    })
  }

  // Pulse animation - rhythmic size/opacity changes
  private startPulseAnimation(elementId: string, element: NodeSingular | EdgeSingular, config: AnimationConfig, isNode: boolean) {
    const duration = config.duration || 1000
    const intensity = config.intensity || 0.3

    const originalSize = isNode ? element.style('width') : element.style('width')
    const originalOpacity = element.style('opacity')
    
    const pulseUp = () => {
      const animation = (element as any).animation({
        style: {
          ...(isNode ? {
            width: `${parseFloat(originalSize) * (1 + intensity)}px`,
            height: `${parseFloat(originalSize) * (1 + intensity)}px`
          } : {
            width: `${parseFloat(originalSize) * (1 + intensity)}px`
          }),
          opacity: Math.min(1, parseFloat(originalOpacity) * (1 + intensity))
        }
      }, {
        duration: duration / 2,
        easing: 'ease-in-out'
      })

      animation.play().promise('complete').then(() => {
        if (this.activeAnimations.has(elementId)) {
          pulseDown()
        }
      })

      this.activeAnimations.set(elementId, animation)
    }

    const pulseDown = () => {
      const animation = (element as any).animation({
        style: {
          ...(isNode ? {
            width: originalSize,
            height: originalSize
          } : {
            width: originalSize
          }),
          opacity: originalOpacity
        }
      }, {
        duration: duration / 2,
        easing: 'ease-in-out'
      })

      animation.play().promise('complete').then(() => {
        if (this.activeAnimations.has(elementId)) {
          pulseUp()
        }
      })

      this.activeAnimations.set(elementId, animation)
    }

    pulseUp()
  }

  // Flash animation - rapid color/opacity blinking
  private startFlashAnimation(elementId: string, element: NodeSingular | EdgeSingular, config: AnimationConfig) {
    const duration = config.duration || 200
    const isNode = element.isNode()
    
    const originalColor = isNode ? element.style('background-color') : element.style('line-color')
    const flashColor = '#ffff00' // Yellow flash
    
    let isFlashing = false
    
    const flash = () => {
      isFlashing = !isFlashing
      const targetColor = isFlashing ? flashColor : originalColor
      
      const animation = (element as any).animation({
        style: isNode ? {
          'background-color': targetColor
        } : {
          'line-color': targetColor
        }
      }, {
        duration: duration / 2,
        easing: 'linear'
      })

      animation.play()
      this.activeAnimations.set(elementId, animation)
    }

    const interval = setInterval(flash, duration)
    this.animationIntervals.set(elementId, interval)
  }

  // Strobe animation - high-frequency on/off visibility
  private startStrobeAnimation(elementId: string, element: NodeSingular | EdgeSingular, config: AnimationConfig) {
    const duration = config.duration || 100
    
    let isVisible = true
    
    const strobe = () => {
      isVisible = !isVisible
      
      const animation = (element as any).animation({
        style: {
          opacity: isVisible ? 1 : 0
        }
      }, {
        duration: duration / 4,
        easing: 'linear'
      })

      animation.play()
      this.activeAnimations.set(elementId, animation)
    }

    const interval = setInterval(strobe, duration)
    this.animationIntervals.set(elementId, interval)
  }

  // Glow animation - smooth color intensity variations
  private startGlowAnimation(elementId: string, element: NodeSingular | EdgeSingular, config: AnimationConfig, isNode: boolean) {
    const duration = config.duration || 1500
    const intensity = config.intensity || 0.5

    const originalColor = isNode ? element.style('background-color') : element.style('line-color')
    const glowColor = this.adjustColorBrightness(originalColor, intensity)
    
    const glowUp = () => {
      const animation = (element as any).animation({
        style: isNode ? {
          'background-color': glowColor,
          'border-color': glowColor
        } : {
          'line-color': glowColor
        }
      }, {
        duration: duration / 2,
        easing: 'ease-in-out'
      })

      animation.play().promise('complete').then(() => {
        if (this.activeAnimations.has(elementId)) {
          glowDown()
        }
      })

      this.activeAnimations.set(elementId, animation)
    }

    const glowDown = () => {
      const animation = (element as any).animation({
        style: isNode ? {
          'background-color': originalColor,
          'border-color': originalColor
        } : {
          'line-color': originalColor
        }
      }, {
        duration: duration / 2,
        easing: 'ease-in-out'
      })

      animation.play().promise('complete').then(() => {
        if (this.activeAnimations.has(elementId)) {
          glowUp()
        }
      })

      this.activeAnimations.set(elementId, animation)
    }

    glowUp()
  }

  // Flow animation - for edges, animate line-dash-offset for flowing effect
  private startFlowAnimation(elementId: string, element: EdgeSingular, config: AnimationConfig) {
    const speed = config.speed || 1000
    
    // Set up dashed line style
    element.style({
      'line-style': 'dashed',
      'line-dash-pattern': [6, 3]
    })

    let offset = 0
    
    const flow = () => {
      offset -= 2
      if (offset <= -18) offset = 0 // Reset when pattern completes
      
      const animation = (element as any).animation({
        style: {
          'line-dash-offset': offset
        }
      }, {
        duration: 50,
        easing: 'linear'
      })

      animation.play()
      this.activeAnimations.set(elementId, animation)
    }

    const interval = setInterval(flow, 50)
    this.animationIntervals.set(elementId, interval)
  }

  // Helper function to adjust color brightness
  private adjustColorBrightness(color: string, factor: number): string {
    // Simple brightness adjustment - in a real implementation, you'd want more sophisticated color manipulation
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const num = parseInt(hex, 16)
      const r = Math.min(255, Math.floor((num >> 16) * (1 + factor)))
      const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) * (1 + factor)))
      const b = Math.min(255, Math.floor((num & 0x0000FF) * (1 + factor)))
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    }
    return color
  }

  // Clean up when component unmounts
  destroy() {
    this.stopAllAnimations()
  }
}
