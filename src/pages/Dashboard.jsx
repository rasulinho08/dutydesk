import { useState, useEffect } from 'react'
import {
  Clock, Calendar, ArrowRight, FileText, PlusCircle, CheckCircle, X, Check, RefreshCw,
  LogIn, LogOut, AlertTriangle, Timer, Activity
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [noteText, setNoteText] = useState('')
  const [timeLeft, setTimeLeft] = useState('2:30')
  const [notes, setNotes] = useState([])

  // Check-in/Check-out State
  const [checkInStatus, setCheckInStatus] = useState({
    checkedIn: false,
    checkInTime: null,
    checkedOut: false,
    checkOutTime: null
  })
  const [showCheckInConfirm, setShowCheckInConfirm] = useState(false)
  const [showCheckOutConfirm, setShowCheckOutConfirm] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500)

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Timer countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const [hours, minutes] = timeLeft.split(':').map(Number)
      if (hours === 0 && minutes === 0) {
        clearInterval(timer)
        return
      }
      let newMinutes = minutes - 1
      let newHours = hours
      if (newMinutes < 0) {
        newMinutes = 59
        newHours = hours - 1
      }
      setTimeLeft(`${newHours}:${newMinutes.toString().padStart(2, '0')}`)
    }, 60000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const upcomingShifts = [
    { date: '15 Yanvar', time: '08:00 - 16:00', type: 'Gündüz', typeClass: 'day' },
    { date: '16 Yanvar', time: '16:00 - 00:00', type: 'Axşam', typeClass: 'evening' },
    { date: '17 Yanvar', time: '00:00 - 08:00', type: 'Gecə', typeClass: 'night' },
  ]

  const [recentHandovers, setRecentHandovers] = useState([
    {
      id: 1,
      date: '13 Yanvar, 16:00',
      description: 'Bütün sistemlər normal işləyir. 3 incident həll olundu.',
    },
    {
      id: 2,
      date: '12 Yanvar, 08:00',
      description: 'Gecə növbəsi sakit keçdi. Monitoring aktiv.',
    },
  ])

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAddNote = () => {
    if (!noteText.trim()) {
      displayToast('Qeyd mətni daxil edin!')
      return
    }
    const newNote = {
      id: Date.now(),
      text: noteText,
      time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
    }
    setNotes([newNote, ...notes])
    setNoteText('')
    setShowNoteModal(false)
    displayToast('Qeyd əlavə edildi!')
  }

  const handleGoToForm = () => {
    navigate('/handover-form')
  }

  const handleViewAllShifts = () => {
    navigate('/my-shifts')
  }

  // Check-in Handler
  const handleCheckIn = () => {
    const now = new Date()
    setCheckInStatus(prev => ({
      ...prev,
      checkedIn: true,
      checkInTime: now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
    }))
    setShowCheckInConfirm(false)
    displayToast('Check-in uğurla tamamlandı!')
  }

  // Check-out Handler
  const handleCheckOut = () => {
    const now = new Date()
    setCheckInStatus(prev => ({
      ...prev,
      checkedOut: true,
      checkOutTime: now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
    }))
    setShowCheckOutConfirm(false)
    displayToast('Check-out uğurla tamamlandı!')
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
            <h1 className="shift-time">08:00 - 16:00</h1>
            <span className="shift-date">14 Yanvar 2026, Çərşənbə</span>
          </div>

          <div className="shift-status">
            <div className="status-circle pulse">
              <Clock size={28} />
            </div>
            <span className="status-label">Aktiv</span>
            <span className="status-time">{timeLeft}h qalıb</span>
          </div>
        </div>
        <div className="shift-stats">
          <div className="stat-card-dashboard blue animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <span className="stat-value">8h</span>
            <span className="stat-label-dashboard">Növbə müddəti</span>
          </div>
          <div className="stat-card-dashboard light animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <span className="stat-value">APM</span>
            <span className="stat-label-dashboard">Komanda</span>
          </div>
          <div className="stat-card-dashboard white animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <span className="stat-value">Gündüz</span>
            <span className="stat-label-dashboard">Növbə tipi</span>
          </div>
        </div>
      </div>
      {/* Check-in/Check-out Panel */}
      {/* <div className="checkin-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="checkin-status">
          <div className="checkin-info">
            <Activity size={20} className="pulse" />
            <span className="checkin-title">Növbə Statusu</span>
            <span className="current-time-display">
              {currentTime.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="checkin-details">
            <div className={`checkin-item ${checkInStatus.checkedIn ? 'done' : 'pending'}`}>
              <LogIn size={18} />
              <span>Check-in</span>
              <span className="checkin-time">
                {checkInStatus.checkInTime || '--:--'}
              </span>
              {checkInStatus.checkedIn && <CheckCircle size={16} className="done-icon" />}
            </div>
            <div className={`checkin-item ${checkInStatus.checkedOut ? 'done' : 'pending'}`}>
              <LogOut size={18} />
              <span>Check-out</span>
              <span className="checkin-time">
                {checkInStatus.checkOutTime || '--:--'}
              </span>
              {checkInStatus.checkedOut && <CheckCircle size={16} className="done-icon" />}
            </div>
          </div>
        </div>
        <div className="checkin-actions">
          {!checkInStatus.checkedIn ? (
            <button
              className="checkin-btn check-in"
              onClick={() => setShowCheckInConfirm(true)}
            >
              <LogIn size={20} />
              Check-in Et
            </button>
          ) : !checkInStatus.checkedOut ? (
            <button
              className="checkin-btn check-out"
              onClick={() => setShowCheckOutConfirm(true)}
            >
              <LogOut size={20} />
              Check-out Et
            </button>
          ) : (
            <div className="checkin-complete">
              <CheckCircle size={24} />
              <span>Növbə tamamlandı</span>
            </div>
          )}
        </div>
      </div> */}

      {/* Handover Reminder - show if checked in but handover not done */}
      {checkInStatus.checkedIn && !checkInStatus.checkedOut && (
        <div className="handover-reminder animate-slide-in">
          <div className="reminder-icon warning">
            <AlertTriangle size={20} />
          </div>
          <div className="reminder-text-content">
            <strong>Handover Tamamlanmayıb</strong>
            <p>Növbə dəyişməzdən əvvəl təhvil-təslim formunu doldurun.</p>
          </div>
          <button className="reminder-action" onClick={handleGoToForm}>
            Formu Doldur
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Shift Stats */}
      {/* <div className="shift-stats">
        <div className="stat-card blue animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <span className="stat-value">8h</span>
          <span className="stat-label">Növbə müddəti</span>
        </div>
        <div className="stat-card light animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <span className="stat-value">APM</span>
          <span className="stat-label">Komanda</span>
        </div>
        <div className="stat-card white animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <span className="stat-value">Gündüz</span>
          <span className="stat-label">Növbə tipi</span>
        </div>
      </div> */}

      {/* Action Buttons */}
      {/* <div className="action-buttons animate-fade-in">
        <button className="action-btn primary" onClick={handleGoToForm}>
          <FileText size={18} />
          <span>Təhvil-Təslim Formu</span>
        </button>
        <button className="action-btn secondary" onClick={() => setShowNoteModal(true)}>
          <PlusCircle size={18} />
          <span>Qeyd Əlavə Et</span>
        </button>
      </div> */}

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

      {/* Content Grid */}
      {/* <div className="content-grid"> */}
      {/* Upcoming Shifts */}
      <div className="card animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="card-header">
          <div className="card-title">
            <Calendar size={18} />
            <span>Gələcək Növbələr</span>
          </div>
          {/* <button className="card-link" onClick={handleViewAllShifts}>
            Hamısını Gör <ArrowRight size={14} />
          </button> */}
        </div>
        <div className="card-content">
          {upcomingShifts.map((shift, index) => (
            <div key={index} className="shift-item-dashboard">
              <div className="shift-item-info">
                <span className="shift-item-date">{shift.date}</span>
                <span className="shift-item-time">
                  <Clock size={14} />
                  {shift.time}
                </span>
              </div>
              <span className={`shift-badge ${shift.typeClass}`}>
                {shift.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Handovers */}
      {/* <div className="card animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} />
              <span>Son Təhvil-Təslimlər</span>
            </div>
            <button className="card-link" onClick={() => navigate('/history')}>
              Tarixçə <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-content">
            {recentHandovers.map((handover) => (
              <div key={handover.id} className="handover-item">
                <div className="handover-status">
                  <CheckCircle size={18} className="check-icon" />
                  <span className="handover-date">{handover.date}</span>
                </div>
                <p className="handover-description">{handover.description}</p>
              </div>
            ))}
          </div>
        </div> */}
      {/* </div> */}

      {/* Reminder Banner */}
      {/* <div className="reminder-banner animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="reminder-icon">
          <Clock size={24} />
        </div>
        <div className="reminder-content">
          <div className="reminder-title">
            <span className="reminder-emoji">📋</span>
            <strong>Xatırlatma</strong>
          </div>
          <p className="reminder-text">
            Növbə bitənə <strong>30 dəqiqə qalmış</strong> təhvil-təslim formunu doldurmağa başlayın.
            Bütün sahələri düzgün və aydın doldurduğunuzdan əmin olun.
          </p>
        </div>
      </div> */}

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

      {/* Check-in Confirmation Modal */}
      {showCheckInConfirm && (
        <div className="modal-overlay" onClick={() => setShowCheckInConfirm(false)}>
          <div className="modal-content small-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Check-in Təsdiqi</h3>
              <button className="close-btn" onClick={() => setShowCheckInConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body center-content">
              <div className="confirm-icon green">
                <LogIn size={32} />
              </div>
              <p className="confirm-text">
                <strong>{currentTime.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}</strong>
                {' '}saatında check-in etmək istəyirsiniz?
              </p>
              <span className="confirm-note">Növbəniz: 08:00 - 16:00</span>
            </div>
            <div className="modal-footer center">
              <button className="btn-cancel" onClick={() => setShowCheckInConfirm(false)}>Ləğv et</button>
              <button className="btn-confirm green" onClick={handleCheckIn}>
                <LogIn size={16} />
                Check-in Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Confirmation Modal */}
      {showCheckOutConfirm && (
        <div className="modal-overlay" onClick={() => setShowCheckOutConfirm(false)}>
          <div className="modal-content small-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Check-out Təsdiqi</h3>
              <button className="close-btn" onClick={() => setShowCheckOutConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body center-content">
              <div className="confirm-icon orange">
                <LogOut size={32} />
              </div>
              <p className="confirm-text">
                <strong>{currentTime.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}</strong>
                {' '}saatında check-out etmək istəyirsiniz?
              </p>
              <span className="confirm-note">Check-in vaxtı: {checkInStatus.checkInTime}</span>
            </div>
            <div className="modal-footer center">
              <button className="btn-cancel" onClick={() => setShowCheckOutConfirm(false)}>Ləğv et</button>
              <button className="btn-confirm orange" onClick={handleCheckOut}>
                <LogOut size={16} />
                Check-out Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
