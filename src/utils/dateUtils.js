/**
 * Tarix və Vaxt Utility Funksiyaları
 * 
 * Proyektdə istifadə edilən tarix/vaxt formatlaşdırma funksiyaları
 */

/**
 * Tarixi Azərbaycan formatında qaytarır
 * @param {Date} date - Tarix obyekti
 * @returns {string} - Format: "14 Yanvar 2026"
 */
export const formatDateAz = (date = new Date()) => {
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ]
  
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${day} ${month} ${year}`
}

/**
 * Həftənin gününü Azərbaycan dilində qaytarır
 * @param {Date} date - Tarix obyekti
 * @returns {string} - Məs: "Çərşənbə"
 */
export const getWeekdayAz = (date = new Date()) => {
  const weekdays = [
    'Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə',
    'Cümə axşamı', 'Cümə', 'Şənbə'
  ]
  
  return weekdays[date.getDay()]
}

/**
 * Vaxtı HH:MM formatında qaytarır
 * @param {Date} date - Tarix obyekti
 * @returns {string} - Format: "14:30"
 */
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('az-AZ', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

/**
 * Vaxtı HH:MM:SS formatında qaytarır
 * @param {Date} date - Tarix obyekti
 * @returns {string} - Format: "14:30:45"
 */
export const formatTimeWithSeconds = (date = new Date()) => {
  return date.toLocaleTimeString('az-AZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Saniyələri MM:SS formatına çevirir
 * @param {number} seconds - Saniyə
 * @returns {string} - Format: "02:30"
 */
export const formatSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Nisbi vaxt qaytarır (məs: "5 dəqiqə əvvəl")
 * @param {Date} date - Tarix obyekti
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'İndicə'
  if (diffMins < 60) return `${diffMins} dəqiqə əvvəl`
  if (diffHours < 24) return `${diffHours} saat əvvəl`
  if (diffDays < 7) return `${diffDays} gün əvvəl`
  
  return formatDateAz(date)
}
