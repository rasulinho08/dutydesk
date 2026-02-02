/**
 * Button Component
 * 
 * Yenidən istifadə edilə bilən düymə komponenti
 * 
 * @param {string} variant - Düymə tipi: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
 * @param {string} size - Ölçü: 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Yükləmə vəziyyəti
 * @param {boolean} disabled - Deaktiv vəziyyət
 * @param {boolean} fullWidth - Tam en
 */
import './Button.css'

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="btn-spinner"></span>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

export default Button
