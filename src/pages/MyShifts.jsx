import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Clock, MapPin, Info, X, Check, Calendar, FileText, 
  PlusCircle, ChevronRight, AlertTriangle, RefreshCw,
  User, Phone, Mail
} from 'lucide-react'
import './MyShifts.css'

function MyShifts() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [changeReason, setChangeReason] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')

  const shifts = [
    {
      id: 1,
      date: '14 Yanvar 2026, Çərşənbə',
      time: '08:00 - 16:00',
      type: 'Gündüz növbəsi',
      team: 'APM Komandası',
      status: 'Aktiv',
      statusClass: 'active',
      supervisor: 'Kamran Həsənov',
      location: 'Mərkəzi Ofis',
      notes: 'Server monitoring tapşırığı var',
    },
    {
      id: 2,
      date: '15 Yanvar 2026, Cümə axşamı',
      time: '08:00 - 16:00',
      type: 'Gündüz növbəsi',
      team: 'APM Komandası',
      status: 'Planlaşdırılıb',
      statusClass: 'planned',
      supervisor: 'Kamran Həsənov',
      location: 'Mərkəzi Ofis',
      notes: '',
    },
    {
      id: 3,
      date: '16 Yanvar 2026, Cümə',
      time: '16:00 - 00:00',
      type: 'Axşam növbəsi',
      team: 'APM Komandası',
      status: 'Planlaşdırılıb',
      statusClass: 'planned',
      supervisor: 'Leyla Məmmədova',
      location: 'Mərkəzi Ofis',
      notes: 'Backup prosesi nəzarət',
    },
    {
      id: 4,
      date: '17 Yanvar 2026, Şənbə',
      time: '00:00 - 08:00',
      type: 'Gecə növbəsi',
      team: 'APM Komandası',
      status: 'Planlaşdırılıb',
      statusClass: 'planned',
      supervisor: 'Rəşad İbrahimov',
      location: 'Mərkəzi Ofis',
      notes: '',
    },
  ]

  const displayToast = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleViewDetail = (shift) => {
    setSelectedShift(shift)
    setShowDetailModal(true)
  }

  const handleChangeRequest = (shift) => {
    setSelectedShift(shift)
    setChangeReason('')
    setShowChangeModal(true)
  }

  const handleSubmitChange = () => {
    if (!changeReason.trim()) {
      displayToast('Səbəb daxil edin!', 'error')
      return
    }
    setShowChangeModal(false)
    displayToast('Dəyişiklik sorğusu göndərildi!')
    setChangeReason('')
  }

  const handleGoToForm = () => {
    navigate('/handover-form')
  }

  const handleAddNote = () => {
    if (!noteText.trim()) {
      displayToast('Qeyd mətni daxil edin!', 'error')
      return
    }
    setShowNoteModal(false)
    displayToast('Qeyd əlavə edildi!')
    setNoteText('')
  }

  return (
    <div className="my-shifts">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''} ${toastType}`}>
        {toastType === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
        <span>{toastMessage}</span>
      </div>

      {/* Header Section */}
      <div className="page-header animate-fade-in">
        <div className="header-left">
          <span className="header-label">İndiki Növbə</span>
          <h1 className="header-time">08:00 - 16:00</h1>
          <div className="header-team">
            <MapPin size={14} />
            <span>APM Komandası</span>
          </div>
        </div>
        <div className="header-status">
          <div className="status-icon pulse">
            <Clock size={24} />
          </div>
          <span className="status-text">Status</span>
          <span className="status-value">Aktiv</span>
        </div>
      </div>

      {/* Shift Info Banner */}
      <div className="shift-info-banner animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="info-dot pulse"></div>
        <div className="info-content">
          <span className="info-label">Növbə Məlumatı</span>
          <span className="info-text">14 Yanvar 2026, Çərşənbə • Gündüz növbəsi • 8 saat</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-row animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button className="form-btn" onClick={handleGoToForm}>
          <FileText size={18} />
          <span>Təhvil-Təslim Formu</span>
        </button>
        <button className="note-btn" onClick={() => setShowNoteModal(true)}>
          <PlusCircle size={18} />
          <span>Qeyd Əlavə Et</span>
        </button>
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
          {shifts.map((shift, index) => (
            <div 
              key={shift.id} 
              className="shift-card animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="shift-card-header">
                <h3 className="shift-card-date">{shift.date}</h3>
                <span className={`shift-status ${shift.statusClass}`}>
                  {shift.status}
                </span>
              </div>
              <div className="shift-card-details">
                <span className="shift-detail">
                  <Clock size={14} />
                  {shift.time}
                </span>
                <span className="shift-detail-text">• {shift.type}</span>
              </div>
              <div className="shift-card-team">
                <MapPin size={14} />
                <span>{shift.team}</span>
              </div>
              {shift.notes && (
                <div className="shift-card-note">
                  <Info size={14} />
                  <span>{shift.notes}</span>
                </div>
              )}
              <div className="shift-card-actions">
                <button className="detail-btn" onClick={() => handleViewDetail(shift)}>
                  Ətraflı
                  <ChevronRight size={14} />
                </button>
                {shift.status !== 'Aktiv' && (
                  <button className="change-btn" onClick={() => handleChangeRequest(shift)}>
                    Dəyişiklik Sorğusu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Növbə Detalları</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Tarix</label>
                  <span>{selectedShift.date}</span>
                </div>
                <div className="detail-item">
                  <label>Vaxt</label>
                  <span>{selectedShift.time}</span>
                </div>
                <div className="detail-item">
                  <label>Növbə Tipi</label>
                  <span>{selectedShift.type}</span>
                </div>
                <div className="detail-item">
                  <label>Komanda</label>
                  <span>{selectedShift.team}</span>
                </div>
                <div className="detail-item">
                  <label>Supervizor</label>
                  <span>{selectedShift.supervisor}</span>
                </div>
                <div className="detail-item">
                  <label>Lokasiya</label>
                  <span>{selectedShift.location}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Status</label>
                  <span className={`status-badge ${selectedShift.statusClass}`}>
                    {selectedShift.status}
                  </span>
                </div>
                {selectedShift.notes && (
                  <div className="detail-item full-width">
                    <label>Qeydlər</label>
                    <span>{selectedShift.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Bağla</button>
              {selectedShift.status !== 'Aktiv' && (
                <button className="btn-confirm" onClick={() => {
                  setShowDetailModal(false)
                  handleChangeRequest(selectedShift)
                }}>
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
              <button className="close-btn" onClick={() => setShowChangeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="change-info">
                <div className="change-shift">
                  <Calendar size={16} />
                  <span>{selectedShift.date}</span>
                </div>
                <div className="change-shift">
                  <Clock size={16} />
                  <span>{selectedShift.time}</span>
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

export default MyShifts
