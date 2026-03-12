import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock, MapPin, Info, X, Check, Calendar, FileText,
  PlusCircle, ChevronRight, AlertTriangle, RefreshCw
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './MyShifts.css'

const BASE_URL = 'https://dutydesk-g3ma.onrender.com'

const getShiftType = (startTime) => {
  const h = parseInt((startTime || '').split(':')[0])
  if (h >= 8 && h < 16) return 'Gündüz növbəsi'
  if (h >= 16) return 'Axşam növbəsi'
  return 'Gecə növbəsi'
}
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
  } catch { return dateStr }
}
const getStatusLabel = (status) => {
  if (!status) return 'Planlaşdırılıb'
  if (status === 'active') return 'Aktiv'
  if (status === 'completed') return 'Tamamlandı'
  if (status === 'cancelled') return 'Ləğv edildi'
  return 'Planlaşdırılıb'
}
const getStatusClass = (status) => {
  if (status === 'active') return 'active'
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'planned'
}

function MyShifts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = localStorage.getItem('token') || ''

  const [isLoading, setIsLoading] = useState(true)
  const [shifts, setShifts] = useState([])
  const [currentShift, setCurrentShift] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [changeReason, setChangeReason] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  useEffect(() => {
    const fetchShifts = async () => {
      if (!token || !user) return
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const future = new Date()
        future.setDate(future.getDate() + 30)
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
            setShifts(mine.filter(s => s.date >= today))
          }
        }
      } catch (err) {
        console.error('MyShifts fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShifts()
  }, [token, user])

  const displayToast = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSubmitChange = () => {
    if (!changeReason.trim()) { displayToast('Səbəb daxil edin!', 'error'); return }
    setShowChangeModal(false)
    displayToast('Dəyişiklik sorğusu göndərildi!')
    setChangeReason('')
  }

  if (isLoading) {
    return (
      <div className="my-shifts loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Növbələr yüklənir...</span>
        </div>
      </div>
    )
  }

  const shiftTime = currentShift ? `${currentShift.startTime} - ${currentShift.endTime}` : '—'
  const shiftDate = currentShift ? formatDate(currentShift.date) : '—'
  const teamName = currentShift?.teamName?.replace(/ Team$/i, '') || '—'
  const shiftTypeName = currentShift ? getShiftType(currentShift.startTime) : '—'

  return (
    <div className="my-shifts">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''} ${toastType}`}>
        {toastType === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
        <span>{toastMessage}</span>
      </div>

      {/* Current Shift Overview */}
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
            <span className="stat-value">{shiftTypeName.split(' ')[0]}</span>
            <span className="stat-label-dashboard">Növbə tipi</span>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      <div className="shifts-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="section-header">
          <div className="section-title">
            <Calendar size={20} />
            <div>
              <h2>Gələcək Növbələr</h2>
              <span className="section-subtitle">Planlaşdırılmış növbələriniz</span>
            </div>
          </div>
        </div>

        <div className="shifts-list">
          {shifts.length === 0 ? (
            <div className="empty-state-shifts">
              <Calendar size={40} />
              <p>Gələcək növbə tapılmadı</p>
            </div>
          ) : (
            shifts.map((shift, index) => (
              <div
                key={shift.id || index}
                className="shift-card-my animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="shift-card-header">
                  <h3 className="shift-card-date">{formatDate(shift.date)}</h3>
                  <span className={`shift-status ${getStatusClass(shift.status)}`}>
                    {getStatusLabel(shift.status)}
                  </span>
                </div>
                <div className="shift-card-details">
                  <span className="shift-detail">
                    <Clock size={14} />
                    {shift.startTime} - {shift.endTime}
                  </span>
                  <span className="shift-detail-text">• {getShiftType(shift.startTime)}</span>
                </div>
                <div className="shift-card-team">
                  <MapPin size={14} />
                  <span>{shift.teamName?.replace(/ Team$/i, '') || '—'} Komandası</span>
                </div>
                <div className="shift-card-actions">
                  <button className="detail-btn" onClick={() => { setSelectedShift(shift); setShowDetailModal(true) }}>
                    Ətraflı
                    <ChevronRight size={14} />
                  </button>
                  {shift.status !== 'active' && (
                    <button className="change-btn" onClick={() => { setSelectedShift(shift); setChangeReason(''); setShowChangeModal(true) }}>
                      Dəyişiklik Sorğusu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Növbə Detalları</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Tarix</label>
                  <span>{formatDate(selectedShift.date)}</span>
                </div>
                <div className="detail-item">
                  <label>Vaxt</label>
                  <span>{selectedShift.startTime} - {selectedShift.endTime}</span>
                </div>
                <div className="detail-item">
                  <label>Növbə Tipi</label>
                  <span>{getShiftType(selectedShift.startTime)}</span>
                </div>
                <div className="detail-item">
                  <label>Komanda</label>
                  <span>{selectedShift.teamName?.replace(/ Team$/i, '') || '—'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusClass(selectedShift.status)}`}>
                    {getStatusLabel(selectedShift.status)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Bağla</button>
              {selectedShift.status !== 'active' && (
                <button className="btn-confirm" onClick={() => { setShowDetailModal(false); setChangeReason(''); setShowChangeModal(true) }}>
                  Dəyişiklik Sorğusu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Request Modal */}
      {showChangeModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowChangeModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dəyişiklik Sorğusu</h3>
              <button className="close-btn" onClick={() => setShowChangeModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="change-info">
                <div className="change-shift">
                  <Calendar size={16} />
                  <span>{formatDate(selectedShift.date)}</span>
                </div>
                <div className="change-shift">
                  <Clock size={16} />
                  <span>{selectedShift.startTime} - {selectedShift.endTime}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Dəyişiklik Səbəbi *</label>
                <textarea
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="Niyə bu növbəni dəyişmək istəyirsiniz?"
                  rows={4}
                />
              </div>
              <div className="warning-box">
                <AlertTriangle size={16} />
                <span>Dəyişiklik sorğusu supervizor tərəfindən təsdiqlənməlidir.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowChangeModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleSubmitChange}>
                <Check size={16} />
                Sorğu Göndər
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyShifts
