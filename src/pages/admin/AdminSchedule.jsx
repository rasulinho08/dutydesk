import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Check, RefreshCw, User, Clock } from 'lucide-react'
import './AdminSchedule.css'

function AdminSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))
  const [selectedTeam, setSelectedTeam] = useState('Hamısı')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedShift, setSelectedShift] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const [newShift, setNewShift] = useState({
    team: 'APM',
    time: '09:00-17:00',
    worker: ''
  })

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600)
  }, [])

  const teams = ['Hamısı', 'APM', 'NOC', 'SOC']

  const [shifts, setShifts] = useState([
    { id: 1, date: 13, team: 'APM', time: '09:00-17:00', worker: 'Leyla Mammadova', incomplete: true },
    { id: 2, date: 15, team: 'NOC', time: '09:00-17:00', worker: 'Boşdur' },
    { id: 3, date: 18, team: 'SOC', time: '09:00-17:00', worker: 'Kamran Hüseynov' },
    { id: 4, date: 20, team: 'APM', time: '08:00-20:00', worker: 'Rəşad İbrahimov' },
    { id: 5, date: 22, team: 'NOC', time: '20:00-08:00', worker: 'Aynur Əliyeva' }
  ])

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1 // Adjust for Monday start
    
    // Previous month days
    for (let i = 0; i < adjustedFirstDay; i++) {
      const prevMonthDays = new Date(year, month, 0).getDate()
      days.push({ day: prevMonthDays - adjustedFirstDay + i + 1, currentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true })
    }
    
    // Next month days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false })
    }
    
    return days
  }

  const getShiftForDay = (day) => {
    const dayShifts = shifts.filter(s => s.date === day)
    if (selectedTeam === 'Hamısı') return dayShifts[0]
    return dayShifts.find(s => s.team === selectedTeam)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (dayObj) => {
    if (!dayObj.currentMonth) return
    const shift = getShiftForDay(dayObj.day)
    if (shift) {
      setSelectedShift(shift)
      setShowDetailModal(true)
    } else {
      setSelectedDay(dayObj.day)
      setShowAddModal(true)
    }
  }

  const handleAddShift = () => {
    if (!newShift.worker) {
      displayToast('İşçi seçin!')
      return
    }
    const shift = {
      id: Date.now(),
      date: selectedDay,
      ...newShift
    }
    setShifts([...shifts, shift])
    setShowAddModal(false)
    setNewShift({ team: 'APM', time: '09:00-17:00', worker: '' })
    displayToast('Növbə əlavə edildi!')
  }

  const handleDeleteShift = () => {
    setShifts(shifts.filter(s => s.id !== selectedShift.id))
    setShowDetailModal(false)
    displayToast('Növbə silindi!')
  }

  const monthNames = ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12']
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  if (isLoading) {
    return (
      <div className="admin-schedule loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Cədvəl yüklənir...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-schedule">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>

      {/* Header */}
      <div className="schedule-header animate-fade-in">
        <div className="month-display">
          <Calendar size={20} />
          <h1>{currentDate.getFullYear()} {monthNames[currentDate.getMonth()]}</h1>
        </div>
        <div className="header-controls">
          <div className="team-filters">
            {teams.map(team => (
              <button
                key={team}
                className={`team-btn ${selectedTeam === team ? 'active' : ''}`}
                onClick={() => setSelectedTeam(team)}
              >
                {team}
              </button>
            ))}
          </div>
          <div className="nav-buttons">
            <button className="nav-btn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <button className="nav-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-card animate-slide-in">
        <div className="calendar-header">
          {dayNames.map(day => (
            <div key={day} className="day-name">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {getDaysInMonth(currentDate).map((dayObj, idx) => {
            const shift = dayObj.currentMonth ? getShiftForDay(dayObj.day) : null
            return (
              <div 
                key={idx} 
                className={`calendar-day ${!dayObj.currentMonth ? 'other-month' : ''} ${shift ? 'has-shift' : ''}`}
                onClick={() => handleDayClick(dayObj)}
              >
                <span className="day-number">
                  {dayObj.day}
                  {shift?.incomplete && <span className="incomplete-dot">●</span>}
                </span>
                {shift && (
                  <div className={`shift-event ${shift.team.toLowerCase()}`}>
                    <span className="shift-team">{shift.team}</span>
                    <span className="shift-time">{shift.time}</span>
                    <span className="shift-worker">{shift.worker}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend animate-fade-in">
        <h4>Rəng Açıqlaması</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color apm"></span>
            APM Komandası
          </div>
          <div className="legend-item">
            <span className="legend-color noc"></span>
            NOC Komandası
          </div>
          <div className="legend-item">
            <span className="legend-color soc"></span>
            SOC Komandası
          </div>
          <div className="legend-item">
            <span className="legend-dot"></span>
            Natamam
          </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Yeni Növbə Əlavə Et</h3>
              <span>{currentDate.getFullYear()}-{monthNames[currentDate.getMonth()]}-{selectedDay}</span>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Komanda</label>
                <select 
                  value={newShift.team}
                  onChange={e => setNewShift({...newShift, team: e.target.value})}
                >
                  <option>APM</option>
                  <option>NOC</option>
                  <option>SOC</option>
                </select>
              </div>
              <div className="form-group">
                <label>Vaxt</label>
                <select 
                  value={newShift.time}
                  onChange={e => setNewShift({...newShift, time: e.target.value})}
                >
                  <option>09:00-17:00</option>
                  <option>08:00-20:00</option>
                  <option>20:00-08:00</option>
                </select>
              </div>
              <div className="form-group">
                <label>İşçi</label>
                <select 
                  value={newShift.worker}
                  onChange={e => setNewShift({...newShift, worker: e.target.value})}
                >
                  <option value="">İşçi seçin...</option>
                  <option>Leyla Mammadova</option>
                  <option>Rəşad İbrahimov</option>
                  <option>Aynur Əliyeva</option>
                  <option>Kamran Hüseynov</option>
                  <option>Nərmin Quliyeva</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleAddShift}>
                <Plus size={16} />
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Detail Modal */}
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
              <div className="detail-section">
                <div className="detail-label">
                  <Calendar size={16} />
                  Tarix
                </div>
                <div className="detail-value">
                  {currentDate.getFullYear()}-{monthNames[currentDate.getMonth()]}-{selectedShift.date}
                </div>
              </div>
              <div className="detail-section">
                <div className="detail-label">
                  <User size={16} />
                  Komanda
                </div>
                <div className="detail-value">
                  <span className={`team-badge ${selectedShift.team.toLowerCase()}`}>{selectedShift.team}</span>
                </div>
              </div>
              <div className="detail-section">
                <div className="detail-label">
                  <Clock size={16} />
                  Vaxt
                </div>
                <div className="detail-value">{selectedShift.time}</div>
              </div>
              <div className="detail-section">
                <div className="detail-label">
                  <User size={16} />
                  İşçi
                </div>
                <div className="detail-value">{selectedShift.worker}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={handleDeleteShift}>Sil</button>
              <button className="btn-confirm" onClick={() => setShowDetailModal(false)}>Bağla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSchedule
