'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import throttle from 'lodash/throttle'
import { breakpoints } from '@/styles/theme.json'

export interface ResizeState {
  window_width: number
  window_height: number
}

// Server render and first client render use the desktop width so hydration
// matches; the real size is set right after mount.
const initialState: ResizeState = { window_width: breakpoints.desktop, window_height: 0 }

const WindowSizeContext = createContext<ResizeState>(initialState)

export function WindowSizeProvider({ children }: { children: React.ReactNode }) {
  const [resizeState, setResizeState] = useState<ResizeState>(initialState)

  useEffect(() => {
    const resizeHandler = () =>
      setResizeState({ window_width: window.innerWidth, window_height: window.innerHeight })
    const throttled = throttle(resizeHandler, 50)
    resizeHandler()
    window.addEventListener('resize', throttled)
    return () => {
      window.removeEventListener('resize', throttled)
      throttled.cancel()
    }
  }, [])

  return <WindowSizeContext.Provider value={resizeState}>{children}</WindowSizeContext.Provider>
}

export const useWindowSize = () => useContext(WindowSizeContext)
