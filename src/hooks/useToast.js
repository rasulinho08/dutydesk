/**
 * useToast Hook
 * 
 * Toast bildirişlərini idarə etmək üçün custom hook
 * 
 * İstifadə:
 * const { showToast, toast, hideToast } = useToast()
 * showToast('Mesaj!', 'success')
 */
import { useState, useCallback } from 'react'

function useToast(duration = 3000) {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, duration)
  }, [duration])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }))
  }, [])

  return { toast, showToast, hideToast }
}

export default useToast
