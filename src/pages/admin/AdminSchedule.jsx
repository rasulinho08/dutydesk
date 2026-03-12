import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Check, RefreshCw, User, Clock, Search, Zap } from 'lucide-react'
import './AdminSchedule.css'

function AdminSchedule() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
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

  const token = localStorage.getItem('token') || ''
  const [workers, setWorkers] = useState([])
  const [shifts, setShifts] = useState([])
  const [teamsList, setTeamsList] = useState([])

  // Auto Generate state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateTeam, setGenerateTeam] = useState('')
  const [generateYear, setGenerateYear] = useState(() => new Date().getFullYear())
  const [generateMonth, setGenerateMonth] = useState(() => new Date().getMonth() + 1)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch teams for generate modal
  useEffect(() => {
    const fetchTeams = async () => {
      if (!token) return
      try {
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/teams', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          setTeamsList(json.data || [])
        }
      } catch (err) {
        console.error('Teams fetch xətası:', err)
      }
    }
    fetchTeams()
  }, [token])

  // Fetch workers from API
  useEffect(() => {
    const fetchWorkers = async () => {
      if (!token) return
      try {
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/users?page=1&limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data?.users) {
            const mapped = json.data.users
              .filter(u => u.role === 'employee' && u.isActive)
              .map(u => ({
                id: u.id,
                name: `${u.firstName}${u.lastName ? ' ' + u.lastName : ''}`.trim(),
                email: u.email,
                team: u.team?.name?.replace(/ Team$/i, '') || 'Digər',
                status: 'Əlçatandır'
              }))
            setWorkers(mapped)
          }
        }
      } catch (err) {
        console.error('Workers fetch xətası:', err)
      }
    }
    fetchWorkers()
  }, [token])

  // Helper: get ISO week string for a date
  const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
  }

  // Get all weeks that cover the current month
  const getWeeksForMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const weeks = new Set()
    for (let day = 1; day <= 31; day++) {
      const d = new Date(year, month, day)
      if (d.getMonth() !== month) break
      weeks.add(getISOWeek(d))
    }
    return [...weeks]
  }

  // Fetch schedules from API
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!token) return
      setIsLoading(true)
      try {
        const weeks = getWeeksForMonth(currentDate)
        const allShifts = []
        let shiftId = 1

        for (const week of weeks) {
          try {
            const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/schedules?week=${week}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            if (res.ok) {
              const json = await res.json()
              if (json.success && json.data?.days) {
                json.data.days.forEach(dayData => {
                  const dateObj = new Date(dayData.date)
                  const dayNum = dateObj.getDate()
                  const dayMonth = dateObj.getMonth()

                  if (dayMonth === currentDate.getMonth()) {
                    const shiftTypes = { day: '08:00-16:00', evening: '16:00-00:00', night: '00:00-08:00' }
                    Object.entries(shiftTypes).forEach(([type, time]) => {
                      const shiftList = dayData.shifts?.[type] || []
                      shiftList.forEach(s => {
                        allShifts.push({
                          id: shiftId++,
                          date: dayNum,
                          team: s.teamName?.replace(/ Team$/i, '') || 'APM',
                          time,
                          worker: s.userName || 'N/A'
                        })
                      })
                    })
                  }
                })
              }
            }
          } catch (err) {
            console.error(`Week ${week} fetch xətası:`, err)
          }
        }

        setShifts(allShifts)
      } catch (err) {
        console.error('Schedules fetch xətası:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSchedules()
  }, [token, currentDate])

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

  const teams = ['APM', 'NOC', 'SOC']

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
    
    // Check if shift already exists for same day, team, and time
    const existingShift = shifts.find(s => 
      s.date === selectedDay && 
      s.team === newShift.team && 
      s.time === newShift.time
    )
    
    if (existingShift) {
      displayToast(`❌ Bu növbə artıq doludur! ${newShift.team} komandası üçün ${newShift.time} növbəsinə ${existingShift.worker} təyin edilib.`)
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
    displayToast('✓ Növbə uğurla əlavə edildi!')
  }

  const handleDeleteShift = () => {
    setShifts(shifts.filter(s => s.id !== selectedShift.id))
    setShowDetailModal(false)
    displayToast('Növbə silindi!')
  }

  const handleGenerate = async () => {
    if (!generateTeam) {
      displayToast('Komanda seçin!')
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/schedules/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: generateTeam,
          year: generateYear,
          month: generateMonth
        })
      })
      const json = await res.json()
      console.log('generate response:', json)
      if (res.ok && json.success) {
        displayToast('1 aylıq növbə cədvəli uğurla yaradıldı!')
        setShowGenerateModal(false)
        // Refresh calendar if generated month matches current view
        if (generateYear === currentDate.getFullYear() && generateMonth === currentDate.getMonth() + 1) {
          setCurrentDate(new Date(currentDate)) // trigger re-fetch
        }
      } else {
        displayToast(json.error?.message || json.message || 'Xəta baş verdi!')
      }
    } catch (err) {
      console.error('Generate xətası:', err)
      displayToast('Server xətası!')
    } finally {
      setIsGenerating(false)
    }
  }

  const openGenerateModal = () => {
    setGenerateYear(currentDate.getFullYear())
    setGenerateMonth(currentDate.getMonth() + 1)
    setGenerateTeam(teamsList.length > 0 ? teamsList[0].id : '')
    setShowGenerateModal(true)
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

      {/* Schedule Container with Border */}
      <div className="schedule-container animate-fade-in">
        {/* Header */}
        <div className="schedule-header">
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
            <button className="btn-generate" onClick={openGenerateModal}>
              <Zap size={16} />
              Auto Generate
            </button>
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
        <div className="calendar-card">
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
      {/* End of Schedule Container */}
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

      {/* Auto Generate Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Avtomatik Növbə Yarat</h3>
                <p style={{ fontSize: '13px', color: '#888', marginTop: 4 }}>
                  Seçilmiş komanda üçün 1 aylıq növbə cədvəli yaradılacaq
                </p>
              </div>
              <button className="close-btn" onClick={() => setShowGenerateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-label">
                  <User size={16} />
                  Komanda
                </div>
                <select
                  className="generate-select"
                  value={generateTeam}
                  onChange={e => setGenerateTeam(e.target.value)}
                >
                  <option value="">Komanda seçin</option>
                  {teamsList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name.replace(/ Team$/i, '')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="detail-section">
                <div className="detail-label">
                  <Calendar size={16} />
                  İl
                </div>
                <select
                  className="generate-select"
                  value={generateYear}
                  onChange={e => setGenerateYear(Number(e.target.value))}
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="detail-section">
                <div className="detail-label">
                  <Calendar size={16} />
                  Ay
                </div>
                <select
                  className="generate-select"
                  value={generateMonth}
                  onChange={e => setGenerateMonth(Number(e.target.value))}
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowGenerateModal(false)}>
                Ləğv et
              </button>
              <button
                className="btn-confirm"
                onClick={handleGenerate}
                disabled={isGenerating || !generateTeam}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Yaradılır...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSchedule
