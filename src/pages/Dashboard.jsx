import { useState, useEffect, useCallback } from 'react'
import {
  Clock, Calendar, PlusCircle, X, Check, RefreshCw, AlertTriangle, LogIn, LogOut, CheckCircle2
} from 'lucide-react'
import './Dashboard.css'
import { formatDisplayDate, formatShiftTime, formatShiftTimeRange, getShiftHour, getShiftTeamName } from '../utils/dateUtils'
import { BASE_URL } from '../constants'

const getShiftType = (startTime) => {
  const h = getShiftHour(startTime)
  if (h >= 8 && h < 16) return 'Gündüz'
  if (h >= 16) return 'Axşam'
  return 'Gecə'
}
const getShiftTypeClass = (startTime) => {
  const h = getShiftHour(startTime)
  if (h >= 8 && h < 16) return 'day'
  if (h >= 16) return 'evening'
  return 'night'
}
const SHIFT_DURATION_SECONDS = 8 * 60 * 60
const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const secs = safeSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
function Dashboard() {
  const token = localStorage.getItem('token') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [isCheckActionLoading, setIsCheckActionLoading] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState([])
  const [currentShift, setCurrentShift] = useState(null)
  const [upcomingShifts, setUpcomingShifts] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const displayToast = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const readResponsePayload = useCallback(async (res) => {
    const raw = await res.text()
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return { message: raw }
    }
  }, [])

  const fetchCurrentShift = useCallback(async () => {
    if (!token) return null
    try {
      const currentRes = await fetch(`${BASE_URL}/api/shifts/current`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!currentRes.ok) {
        setCurrentShift(null)
        return null
      }
      const json = await readResponsePayload(currentRes)
      const payload = json?.data?.currentShift || json?.data || json?.currentShift || null
      if (json?.success === false || !payload) {
        setCurrentShift(null)
        return null
      }
      setCurrentShift(payload)
      return payload
    } catch (err) {
      console.error('Current shift fetch error:', err)
      setCurrentShift(null)
      throw err
    }
  }, [token, readResponsePayload])

  const fetchUpcomingShifts = useCallback(async () => {
    if (!token) return
    const today = new Date().toISOString().split('T')[0]
    const future = new Date()
    future.setDate(future.getDate() + 14)
    const toDate = future.toISOString().split('T')[0]
    const upRes = await fetch(`${BASE_URL}/api/shifts?from=${today}&to=${toDate}&page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    if (!upRes.ok) return
    const json = await upRes.json()
    if (json.success) {
      const items = json.data?.items || json.data?.shifts || (Array.isArray(json.data) ? json.data : [])
      setUpcomingShifts(items.slice(0, 3))
    }
  }, [token])

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      setIsLoading(true)
      try {
        await Promise.all([fetchCurrentShift(), fetchUpcomingShifts()])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        displayToast('Məlumatlar yüklənmədi', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [token, fetchCurrentShift, fetchUpcomingShifts])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getCountdownSeconds = () => {
    if (!currentShift) return null
    const checkinStatus = (currentShift?.checkin?.status || '').toLowerCase()
    const checkInTime = currentShift?.checkin?.checkInTime
    const checkOutTime = currentShift?.checkin?.checkOutTime
    const hasCheckedIn = Boolean(checkInTime) || checkinStatus === 'checked_in' || checkinStatus === 'checked_out'
    const hasCheckedOut = Boolean(checkOutTime) || checkinStatus === 'checked_out'

    if (!hasCheckedIn) return SHIFT_DURATION_SECONDS
    if (hasCheckedOut) return 0

    const checkInDate = new Date(checkInTime)
    if (!Number.isNaN(checkInDate.getTime())) {
      const elapsedSeconds = Math.floor((currentTime.getTime() - checkInDate.getTime()) / 1000)
      return Math.max(0, SHIFT_DURATION_SECONDS - Math.max(0, elapsedSeconds))
    }

    const remainingTime = Number(currentShift?.remainingTime)
    if (!Number.isNaN(remainingTime) && remainingTime >= 0) {
      return Math.max(0, Math.min(SHIFT_DURATION_SECONDS, remainingTime))
    }

    return SHIFT_DURATION_SECONDS
  }

  const handleCheckIn = async () => {
    const shiftId = currentShift?.id || currentShift?.shiftId || currentShift?.scheduleId
    if (!currentShift) {
      displayToast('Aktiv növbə tapılmadı', 'error')
      return
    }
    setIsCheckActionLoading(true)
    try {
      const body = shiftId ? { shiftId, note: '' } : { note: '' }
      const res = await fetch(`${BASE_URL}/api/shifts/check-in`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await readResponsePayload(res)
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error?.message || json?.message || 'Check-in alınmadı')
      }
      await Promise.all([fetchCurrentShift(), fetchUpcomingShifts()])
      displayToast('Check-in uğurla tamamlandı')
    } catch (err) {
      console.error('Check-in error:', err)
      displayToast(err.message || 'Check-in zamanı xəta baş verdi', 'error')
    } finally {
      setIsCheckActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    const shiftId = currentShift?.id || currentShift?.shiftId || currentShift?.scheduleId
    if (!currentShift) {
      displayToast('Aktiv növbə tapılmadı', 'error')
      return
    }
    setIsCheckActionLoading(true)
    try {
      const body = shiftId ? { shiftId, note: '' } : { note: '' }
      const res = await fetch(`${BASE_URL}/api/shifts/check-out`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await readResponsePayload(res)
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error?.message || json?.message || 'Check-out alınmadı')
      }
      await Promise.all([fetchCurrentShift(), fetchUpcomingShifts()])
      displayToast('Check-out uğurla tamamlandı')
    } catch (err) {
      console.error('Check-out error:', err)
      displayToast(err.message || 'Check-out zamanı xəta baş verdi', 'error')
    } finally {
      setIsCheckActionLoading(false)
    }
  }

  const handleAddNote = () => {
    if (!noteText.trim()) { displayToast('Qeyd mətni daxil edin!'); return }
    setNotes([{ id: Date.now(), text: noteText, time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }) }, ...notes])
    setNoteText('')
    setShowNoteModal(false)
    displayToast('Qeyd əlavə edildi!')
  }

  if (isLoading) {
    return (
      <div className="dashboard loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Dashboard yüklənir...</span>
        </div>
      </div>
    )
  }

  const displayShift = currentShift || upcomingShifts[0] || null
  const isUpcoming = !currentShift && !!upcomingShifts[0]

  const shiftTime = displayShift ? formatShiftTimeRange(displayShift.startTime, displayShift.endTime) : '—'
  const shiftDate = displayShift ? formatDisplayDate(displayShift.date || displayShift.startTime) : '—'
  const teamName = getShiftTeamName(displayShift)
  const shiftTypeName = displayShift ? getShiftType(displayShift.startTime) : '—'
  const checkInTime = currentShift?.checkin?.checkInTime
  const checkOutTime = currentShift?.checkin?.checkOutTime
  const checkinStatus = (currentShift?.checkin?.status || '').toLowerCase()
  const hasCheckedIn = Boolean(checkInTime) || checkinStatus === 'checked_in' || checkinStatus === 'checked_out'
  const hasCheckedOut = Boolean(checkOutTime) || checkinStatus === 'checked_out'
  const canCheckIn = Boolean(currentShift) && !hasCheckedIn
  const canCheckOut = Boolean(currentShift) && hasCheckedIn && !hasCheckedOut
  const countdownSeconds = getCountdownSeconds()
  const countdownLabel = countdownSeconds === null ? '—' : formatDuration(countdownSeconds)

  return (
    <div className="dashboard">
      <div className={`toast-notification ${showToast ? 'show' : ''} ${toastType}`}>
        {toastType === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
        <span>{toastMessage}</span>
      </div>

      {/* Shift Info Header */}
      <div className='shift-container'>
        <div className="shift-header animate-fade-in">
          <div className="shift-info">
            <span className="shift-label">{isUpcoming ? 'Növbəti Növbə' : 'İndiki Növbə'}</span>
            <h1 className="shift-time">{shiftTime}</h1>
            <span className="shift-date">{shiftDate}</span>
          </div>
          <div className="shift-status">
            <div className="status-circle pulse">
              <Clock size={28} />
            </div>
            <span className="status-label">{currentShift ? 'Aktiv' : isUpcoming ? 'Planlaşdırılıb' : 'Yoxdur'}</span>
            <span className="status-time">{currentShift ? countdownLabel : '—'}</span>
          </div>
        </div>
        <div className="shift-stats">
          <div className="stat-card-dashboard blue animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <span className="stat-value">{countdownLabel}</span>
            <span className="stat-label-dashboard">Qalan vaxt</span>
          </div>
          <div className="stat-card-dashboard light animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <span className="stat-value">{teamName}</span>
            <span className="stat-label-dashboard">Komanda</span>
          </div>
          <div className="stat-card-dashboard white animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <span className="stat-value">{shiftTypeName}</span>
            <span className="stat-label-dashboard">Növbə tipi</span>
          </div>
        </div>
      </div>

      <div className="checkin-panel animate-slide-in" style={{ animationDelay: '0.15s' }}>
        <div className="checkin-status">
          <div className="checkin-header-row">
            <div className="checkin-info">
              <span className="checkin-title">Check-in / Check-out</span>
              <span className="checkin-subtitle">Növbə davamiyyəti real vaxtda yenilənir</span>
            </div>
            <div className="checkin-head-right">
              {!currentShift && (
                <span className="shift-state-badge idle">Aktiv növbə yoxdur</span>
              )}
              {currentShift && canCheckIn && (
                <span className="shift-state-badge waiting">Check-in gözlənilir</span>
              )}
              {currentShift && canCheckOut && (
                <span className="shift-state-badge active">Növbə aktivdir</span>
              )}
            </div>
          </div>
          <div className="checkin-details">
            <div className={`checkin-item ${hasCheckedIn ? 'done' : ''}`}>
              <LogIn size={16} className={hasCheckedIn ? 'done-icon' : ''} />
              <div className="checkin-item-content">
                <span className="checkin-label">Check In</span>
                <span className="checkin-time">{checkInTime ? formatShiftTime(checkInTime) : 'Edilməyib'}</span>
              </div>
            </div>
            <div className={`checkin-item ${hasCheckedOut ? 'done' : ''}`}>
              <LogOut size={16} className={hasCheckedOut ? 'done-icon' : ''} />
              <div className="checkin-item-content">
                <span className="checkin-label">Check Out</span>
                <span className="checkin-time">{checkOutTime ? formatShiftTime(checkOutTime) : 'Edilməyib'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="checkin-actions">
          {canCheckIn && (
            <button className="checkin-btn check-in" onClick={handleCheckIn} disabled={isCheckActionLoading}>
              {isCheckActionLoading ? <RefreshCw size={16} className="spin" /> : <LogIn size={16} />}
              {isCheckActionLoading ? 'Yoxlanılır...' : 'Check In et'}
            </button>
          )}
          {canCheckOut && (
            <button className="checkin-btn check-out" onClick={handleCheckOut} disabled={isCheckActionLoading}>
              {isCheckActionLoading ? <RefreshCw size={16} className="spin" /> : <LogOut size={16} />}
              {isCheckActionLoading ? 'Yoxlanılır...' : 'Check Out et'}
            </button>
          )}
          {currentShift && hasCheckedOut && (
            <div className="checkin-complete">
              <CheckCircle2 size={18} />
              <span>Növbə tamamlandı</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {notes.length > 0 && (
        <div className="notes-list animate-fade-in">
          <h4>Bugünkü Qeydlər</h4>
          {notes.map(note => (
            <div key={note.id} className="note-item animate-slide-in">
              <span className="note-time">{note.time}</span>
              <p>{note.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Shifts */}
      <div className="card animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="card-header">
          <div className="card-title">
            <Calendar size={18} />
            <span>Gələcək Növbələr</span>
          </div>
        </div>
        <div className="card-content">
          {upcomingShifts.length === 0 ? (
            <p style={{ color: '#888', padding: '8px 0', fontSize: '14px' }}>Gələcək növbə tapılmadı</p>
          ) : (
            upcomingShifts.map((shift, i) => (
              <div key={shift.id || i} className="shift-item-dashboard">
                <div className="shift-item-info">
                  <span className="shift-item-date">{formatDisplayDate(shift.date)}</span>
                  <span className="shift-item-time">
                    <Clock size={14} />
                    {formatShiftTimeRange(shift.startTime, shift.endTime)}
                  </span>
                </div>
                <span className={`shift-badge ${getShiftTypeClass(shift.startTime)}`}>
                  {getShiftType(shift.startTime)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Qeyd Əlavə Et</h3>
              <button className="close-btn" onClick={() => setShowNoteModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Qeyd mətni</label>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Qeydinizi bura yazın..." rows={4} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNoteModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleAddNote}>
                <PlusCircle size={16} />
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
