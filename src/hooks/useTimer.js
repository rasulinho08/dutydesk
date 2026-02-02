/**
 * useTimer Hook
 * 
 * Countdown timer üçün custom hook
 * 
 * İstifadə:
 * const { time, isRunning, start, pause, reset } = useTimer(120) // 120 saniyə
 */
import { useState, useEffect, useCallback, useRef } from 'react'

function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, seconds])

  const start = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true)
    }
  }, [seconds])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback((newSeconds = initialSeconds) => {
    setIsRunning(false)
    setSeconds(newSeconds)
  }, [initialSeconds])

  // Format time as MM:SS
  const formattedTime = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

  return {
    seconds,
    formattedTime,
    isRunning,
    start,
    pause,
    reset
  }
}

export default useTimer
