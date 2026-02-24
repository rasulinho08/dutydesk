import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Check, RefreshCw, User, Clock, Search } from 'lucide-react'
import './AdminSchedule.css'

function AdminSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1))
  const [selectedTeam, setSelectedTeam] = useState('Hamısı')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedShift, setSelectedShift] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [workerSearch, setWorkerSearch] = useState('')

  const [newShift, setNewShift] = useState({
    team: 'APM',
    time: '09:00-17:00',
    worker: ''
  })

  const workers = [
    { id: 1, name: 'Leyla Mammadova', email: 'leyla@company.az', team: 'APM', status: 'Növbədə' },
    { id: 2, name: 'Əli Quliyev', email: 'ali@company.az', team: 'APM', status: 'Ölçələndir' },
    { id: 3, name: 'Nigar Həmidova', email: 'nigar@company.az', team: 'APM', status: 'İstirahətdə' },
    { id: 4, name: 'Rəşad İbrahimov', email: 'rashad@company.az', team: 'NOC', status: 'Əlçatandır' },
    { id: 5, name: 'Aynur Əliyeva', email: 'aynur@company.az', team: 'NOC', status: 'Növbədə' },
    { id: 6, name: 'Kamran Hüseynov', email: 'kamran@company.az', team: 'NOC', status: 'Əlçatandır' },
    { id: 7, name: 'Nərmin Quliyeva', email: 'narmin@company.az', team: 'SOC', status: 'İstirahətdə' }
  ]

  const filteredWorkers = workers.filter(w => 
    w.team === newShift.team && 
    (w.name.toLowerCase().includes(workerSearch.toLowerCase()) || 
     w.email.toLowerCase().includes(workerSearch.toLowerCase()))
  )

  const getStatusClass = (status) => {
    return status.toLowerCase()
      .replace(/ə/g, 'e')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ı/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/\s+/g, '')
  }

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600)
  }, [])

  const teams = ['APM', 'NOC', 'SOC']

  const [shifts, setShifts] = useState([
    // Day 1
    { id: 1, date: 1, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    { id: 2, date: 1, team: 'APM', time: '17:00-01:00', worker: 'Həsan' },
    { id: 3, date: 1, team: 'APM', time: '01:00-09:00', worker: 'Leyla' },
    // Day 2
    { id: 4, date: 2, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    { id: 5, date: 2, team: 'APM', time: '17:00-01:00', worker: 'Həsan' },
    { id: 6, date: 2, team: 'APM', time: '01:00-09:00', worker: 'Leyla' },
    // Day 3
    { id: 7, date: 3, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    { id: 8, date: 3, team: 'APM', time: '17:00-01:00', worker: 'Həsan' },
    { id: 9, date: 3, team: 'APM', time: '01:00-09:00', worker: 'Leyla' },
    // Day 5
    { id: 10, date: 5, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    { id: 11, date: 5, team: 'APM', time: '17:00-01:00', worker: 'Həsan' },
    // Day 6
    { id: 12, date: 6, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    // Day 7
    { id: 13, date: 7, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    // Day 8
    { id: 14, date: 8, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    // Day 9
    { id: 15, date: 9, team: 'APM', time: '09:00-17:00', worker: 'Əli' },
    // Day 10
    { id: 16, date: 10, team: 'APM', time: '09:00-17:00', worker: 'Əli' }
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

  const getShiftsForDay = (day) => {
    const dayShifts = shifts.filter(s => s.date === day)
    if (selectedTeam === 'Hamısı') return dayShifts
    return dayShifts.filter(s => s.team === selectedTeam)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (dayObj) => {
    if (!dayObj.currentMonth) return
    setSelectedDay(dayObj.day)
    setWorkerSearch('')
    setNewShift({ team: 'APM', time: '08:00 - 20:00', worker: '' })
    setShowAddModal(true)
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
    setWorkerSearch('')
    setNewShift({ team: 'APM', time: '08:00 - 20:00', worker: '' })
    displayToast('Növbə əlavə edildi!')
  }

  const handleDeleteShift = () => {
    setShifts(shifts.filter(s => s.id !== selectedShift.id))
    setShowDetailModal(false)
    displayToast('Növbə silindi!')
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
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
        <div className="left-section">
          <div className="month-display">
            <Calendar size={20} />
            <h1>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h1>
          </div>
          <div className="teams-legend">
            <span className="legend-label">Teams:</span>
            <div className="legend-item">
              <span className="legend-dot noc"></span>
              <span>NOC</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot soc"></span>
              <span>SOC</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot apm"></span>
              <span>APM</span>
            </div>
          </div>
        </div>
        <div className="header-controls">
          <div className="team-filters">
            {teams.map(team => (
              <button
                key={team}
                className={`team-btn ${selectedTeam === team ? 'active' : ''}`}
                onClick={() => setSelectedTeam(selectedTeam === team ? 'Hamısı' : team)}
              >
                {team}
              </button>
            ))}
          </div>
          <div className="nav-buttons">
            <button className="nav-btn" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <button className="nav-btn" onClick={nextMonth}>
              <ChevronRight size={18} />
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
            const dayShifts = dayObj.currentMonth ? getShiftsForDay(dayObj.day) : []
            return (
              <div
                key={idx}
                className={`calendar-day ${!dayObj.currentMonth ? 'other-month' : ''} ${dayShifts.length > 0 ? 'has-shift' : ''}`}
                onClick={() => handleDayClick(dayObj)}
              >
                <span className="day-number">
                  {dayObj.day}
                </span>
                {dayShifts.length > 0 && (
                  <div className="shifts-container">
                    {dayShifts.map(shift => (
                      <div key={shift.id} className={`shift-card ${shift.team.toLowerCase()}`}>
                        <div className="shift-card-header">
                          <span className="shift-worker-name">● {shift.worker}</span>
                          <span className={`team-badge-mini ${shift.team.toLowerCase()}`}>{shift.team}</span>
                        </div>
                        <div className="shift-card-time">
                          <Clock size={12} />
                          <span>{shift.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-assign animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-assign">
              <div>
                <h3>Növbəyə işçi Tayin Et</h3>
                <p className="modal-subtitle">Komanda: {newShift.team} • Vaxt: {newShift.time}</p>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="worker-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="İşçi axtar..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
              />
            </div>

            <div className="workers-list">
              {filteredWorkers.map(worker => (
                <div 
                  key={worker.id} 
                  className={`worker-item ${newShift.worker === worker.name ? 'selected' : ''}`}
                  onClick={() => setNewShift({ ...newShift, worker: worker.name })}
                >
                  <div className="worker-details">
                    <h4>{worker.name}</h4>
                    <p>{worker.email}</p>
                    <div className="worker-meta">
                      <span className={`status-badge-mini ${getStatusClass(worker.status)}`}>
                        {worker.status}
                      </span>
                      <span className={`team-badge-mini ${worker.team.toLowerCase()}`}>
                        {worker.team}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer-assign">
              <button className="btn-cancel-assign" onClick={() => setShowAddModal(false)}>
                Ləğv et
              </button>
              <button 
                className="btn-confirm-assign" 
                onClick={handleAddShift}
                disabled={!newShift.worker}
              >
                <Check size={16} />
                Təyin Et
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
