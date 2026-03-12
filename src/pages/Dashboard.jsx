import { useState, useEffect } from 'react'
import {
  Clock, Calendar, ArrowRight, FileText, PlusCircle, CheckCircle, X, Check, RefreshCw,
  LogIn, LogOut, AlertTriangle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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
  const { user } = useAuth()
  const token = localStorage.getItem('token') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentShift, setCurrentShift] = useState(null)
  const [upcomingShifts, setUpcomingShifts] = useState([])

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch user's shifts
  useEffect(() => {
    const fetchShifts = async () => {
      if (!token || !user) return
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const future = new Date()
        future.setDate(future.getDate() + 14)
        const toDate = future.toISOString().split('T')[0]

        const res = await fetch(`${BASE_URL}/api/admin/shifts?from=${today}&to=${toDate}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            const all = json.data?.shifts || json.data?.items || (Array.isArray(json.data) ? json.data : [])
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
            const mine = all.filter(s => s.userId === user.id || s.userName === userName)
            setCurrentShift(mine.find(s => s.date === today) || null)
            setUpcomingShifts(mine.filter(s => s.date > today).slice(0, 3))
          }
        }
      } catch (err) {
        console.error('Shifts fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShifts()
  }, [token, user])

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

  const shiftTime = currentShift ? `${currentShift.startTime} - ${currentShift.endTime}` : '—'
  const shiftDate = currentShift ? formatDate(currentShift.date) : '—'
  const teamName = currentShift?.teamName?.replace(/ Team$/i, '') || '—'
  const shiftTypeName = currentShift ? getShiftType(currentShift.startTime) : '—'

  return (
    <div className="dashboard">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>

      {/* Shift Info Header */}
      <div className='shift-container'>
        <div className="shift-header animate-fade-in">
          <div className="shift-info">
            <span className="shift-label">İndiki Növbə</span>
            <h1 className="shift-time">{shiftTime}</h1>
            <span className="shift-date">{shiftDate}</span>
          </div>
          <div className="shift-status">
            <div className="status-circle pulse">
              <Clock size={28} />
            </div>
            <span className="status-label">{currentShift ? 'Aktiv' : 'Yoxdur'}</span>
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

      {/* Notes List */}
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
            upcomingShifts.map((shift, index) => (
              <div key={shift.id || index} className="shift-item-dashboard">
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
              <button className="close-btn" onClick={() => setShowNoteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Qeyd mətni</label>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Qeydinizi bura yazın..."
                  rows={4}
                />
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
