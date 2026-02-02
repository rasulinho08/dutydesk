/**
 * Validasiya Utility Funksiyaları
 * 
 * Form validasiyası üçün köməkçi funksiyalar
 */

/**
 * Email validasiyası
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Şifrə gücünü yoxlayır
 * @param {string} password 
 * @returns {Object} - { level: 'weak'|'good'|'strong', text: string, color: string }
 */
export const getPasswordStrength = (password) => {
  let strength = 0
  
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  if (strength <= 2) return { level: 'weak', text: 'Zəif', color: '#ef4444' }
  if (strength <= 3) return { level: 'good', text: 'Yaxşı', color: '#f59e0b' }
  return { level: 'strong', text: 'Güclü', color: '#22c55e' }
}

/**
 * Boş dəyər yoxlaması
 * @param {any} value 
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Telefon nömrəsi validasiyası (Azərbaycan formatı)
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const regex = /^(\+994|0)(50|51|55|70|77|99)\d{7}$/
  return regex.test(phone.replace(/\s/g, ''))
}
