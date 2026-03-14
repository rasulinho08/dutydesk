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

const englishMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '—'

  const monthCodeMatch = String(dateStr).match(/^(\d{4})-M(0[1-9]|1[0-2])-(\d{1,2})(.*)?$/)
  if (monthCodeMatch) {
    const year = Number(monthCodeMatch[1])
    const month = Number(monthCodeMatch[2])
    const day = Number(monthCodeMatch[3])
    const monthName = englishMonthNames[month - 1]
    return `${day} ${monthName} ${year}`
  }

  const parsed = new Date(dateStr)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    })
  }

  const normalized = String(dateStr).replace(/-M(0[1-9]|1[0-2])-/, '-$1-')
  const normalizedParsed = new Date(normalized)
  if (!Number.isNaN(normalizedParsed.getTime())) {
    return normalizedParsed.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    })
  }

  return String(dateStr).replace(/M(0[1-9]|1[0-2])/g, (_, code) => englishMonthNames[Number(code) - 1] || `M${code}`)
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

export const formatShiftTime = (timeValue) => {
  if (!timeValue) return '—'
  const asDate = new Date(timeValue)
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toLocaleTimeString('az-AZ', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const raw = String(timeValue).trim()
  if (raw === '24:00') return '00:00'
  const [hh, mm] = raw.split(':')
  if (hh !== undefined && mm !== undefined) {
    return `${String(hh).padStart(2, '0')}:${String(mm).slice(0, 2).padStart(2, '0')}`
  }
  return raw
}

export const getShiftHour = (timeValue) => {
  if (!timeValue) return NaN
  const asDate = new Date(timeValue)
  if (!Number.isNaN(asDate.getTime())) return asDate.getHours()
  const [hh] = String(timeValue).split(':')
  return Number(hh)
}

export const formatShiftTimeRange = (startTime, endTime) => {
  if (!startTime && !endTime) return '—'
  return `${formatShiftTime(startTime)} - ${formatShiftTime(endTime)}`
}

export const getShiftTeamName = (shift) => {
  if (!shift) return '—'
  const candidates = [
    shift.teamName,
    shift.team?.name,
    shift.team?.teamName,
    shift.user?.team?.name,
    shift.team
  ]
  for (const candidate of candidates) {
    if (candidate && String(candidate).trim()) {
      return String(candidate).replace(/ Team$/i, '').trim()
    }
  }
  return '—'
}
