/**
 * Modal Component
 * 
 * Yenidən istifadə edilə bilən modal dialog komponenti
 * 
 * @param {boolean} isOpen - Modal açıq/qapalı
 * @param {function} onClose - Modal bağlandıqda çağırılacaq funksiya
 * @param {string} title - Modal başlığı
 * @param {ReactNode} children - Modal məzmunu
 * @param {string} size - Modal ölçüsü: 'sm' | 'md' | 'lg'
 */
import { X } from 'lucide-react'
import './Modal.css'

function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            {showCloseButton && (
              <button className="modal-close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
