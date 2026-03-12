import { useState, useEffect } from 'react'
import {
  Clock, Calendar, PlusCircle, X, Check, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const BASE_URL = 'https://dutydesk-g3ma.onrender.com'

const getShiftType = (startTime) => {
  const h = parseInt((startTime || '').split(':')[0])
  if (h >= 8 && h < 16) return 'Gündüz'
  if (h >= 16) return 'Axşam'
  return 'Gecə'
}
const getShiftTypeClass = (startTime) => {
  const h = parseInt((startTime || '').split(':')[0])
  if (h >= 8 && h < 16) return 'day'
  if (h >= 16) return 'evening'
  return 'night'
}
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
  } catch { return dateStr }
}

function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState([])
  const [currentShift, setCurrentShift] = useState(null)
  const [upcomingShifts, setUpcomingShifts] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      setIsLoading(true)
      try {
        // Current shift
        const currentRes = await fetch(`${BASE_URL}/api/shifts/current`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (currentRes.ok) {
          const json = await currentRes.json()
          if (json.success && json.data) setCurrentShift(json.data)
        }

        // Upcoming shifts
        const today = new Date().toISOString().split('T')[0]
        const future = new Date(); future.setDate(future.getDate() + 14)
        const toDate = future.toISOString().split('T')[0]
        const upRes = await fetch(`${BASE_URL}/api/shifts?from=${today}&to=${toDate}&page=1&limit=10`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (upRes.ok) {
          const json = await upRes.json()
          if (json.success) {
            const items = json.data?.items || json.data?.shifts || (Array.isArray(json.data) ? json.data : [])
            setUpcomingShifts(items.slice(0, 3))
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [token])

  const calcTimeLeft = () => {
    if (!currentShift?.endTime) return '—'
    const now = new Date()
    const [h, m] = (currentShift.endTime === '24:00' ? '00:00' : currentShift.endTime).split(':').map(Number)
    const end = new Date(); end.setHours(h, m, 0, 0)
    if (end <= now) end.setDate(end.getDate() + 1)
    const diff = Math.max(0, end - now)
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
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

  const shiftTime = displayShift ? `${displayShift.startTime} - ${displayShift.endTime}` : '—'
  const shiftDate = displayShift ? formatDate(displayShift.date) : '—'
  const teamName = displayShift?.teamName?.replace(/ Team$/i, '') || '—'
  const shiftTypeName = displayShift ? getShiftType(displayShift.startTime) : '—'

  return (
    <div className="dashboard">
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} />
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
            <span className="status-time">{currentShift ? `${calcTimeLeft()}h qalıb` : '—'}</span>
          </div>
        </div>
        <div className="shift-stats">
          <div className="stat-card-dashboard blue animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <span className="stat-value">8h</span>
            <span className="stat-label-dashboard">Növbə müddəti</span>
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
                  <span className="shift-item-date">{formatDate(shift.date)}</span>
                  <span className="shift-item-time">
                    <Clock size={14} />
                    {shift.startTime} - {shift.endTime}
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
