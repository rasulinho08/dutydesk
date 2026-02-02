/**
 * Toast Notification Component
 * 
 * Bildiriş mesajları üçün yenidən istifadə edilə bilən komponent
 * 
 * @param {boolean} show - Toast göstərilsin/gizlədilsin
 * @param {string} message - Göstəriləcək mesaj
 * @param {string} type - Toast tipi: 'success' | 'error' | 'warning' | 'info'
 */
import { Check, X, AlertTriangle, Info } from 'lucide-react'
import './Toast.css'

function Toast({ show, message, type = 'success', onClose }) {
  const icons = {
    success: <Check size={18} />,
    error: <X size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />
  }

  return (
    <div className={`toast-notification ${show ? 'show' : ''} toast-${type}`}>
      {icons[type]}
      <span>{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default Toast
