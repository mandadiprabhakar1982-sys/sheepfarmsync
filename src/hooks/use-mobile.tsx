import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * @fileOverview A robust dimension-aware hook.
 * Handles SSR hydration safely and provides real-time viewport tracking.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
    }

    // Initial check
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // During SSR or first render before hydration, return undefined to allow parent to handle loading states
  return isMobile
}

export function useWindowDimensions() {
  const [dimensions, setDimensions] = React.useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  })

  React.useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dimensions
}
