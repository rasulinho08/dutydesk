  import { useState, useEffect } from 'react'
import {
  Bell, AlertTriangle, Clock, Users, Calendar,
  ChevronRight, UserPlus, X, Check, Search,
  RefreshCw, Eye, Edit, Trash2, Activity, LogIn, LogOut,
  FileText, Zap, TrendingUp, UserCheck, AlertCircle,
  Timer, CheckCircle2, XCircle, Phone, Mail
} from 'lucide-react'
import './AdminDashboard.css'

function AdminDashboard() {

  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teams, setTeams] = useState([])


  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showOnDutyModal, setShowOnDutyModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [selectedOnDuty, setSelectedOnDuty] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeHeaderDropdown, setTimeHeaderDropdown] = useState(false)
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Bütün vaxtlar')

  const token = localStorage.getItem('token') || ''



  // Helper function to check if current time is within shift range
  const isShiftActive = (timeRange) => {
    const now = currentTime
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    // Parse time range (e.g., "08:00 - 16:00" or "00:00 - 08:00")
    const [start, end] = timeRange.split(' - ').map(t => {
      const [hours, minutes] = t.split(':').map(Number)
      return hours * 60 + minutes
    })

    // Handle overnight shifts (e.g., 16:00 - 24:00 or 00:00 - 08:00)
    if (end === 0 || end === 1440) {
      // 16:00 - 24:00 case
      return currentTimeInMinutes >= start
    } else if (start > end) {
      // Overnight shift that crosses midnight
      return currentTimeInMinutes >= start || currentTimeInMinutes < end
    } else {
      // Normal shift within same day
      return currentTimeInMinutes >= start && currentTimeInMinutes < end
    }
  }
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        setError('Token tapılmadı. Zəhmət olmasa yenidən daxil olun.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          throw new Error(`Xəta: ${res.status} ${res.statusText}`)
        }

        const json = await res.json()

        setDashboardData(json.data || {})
        setAlerts(json.data?.alerts || [])
        // Populate notifications from alerts
        const alertNotifs = (json.data?.alerts || [])
          .filter(a => a.type === 'empty-shift')
          .map(a => ({
            id: a.id,
            team: a.team || '',
            message: a.message || `${a.team} komandası üçün növbə boşdur`,
            type: 'warning',
            read: false
          }))
        setNotifications(alertNotifs)
        console.log('dashboard:', json.data)

      } catch (err) {
        console.error('Dashboard fetch xətası:', err)
        setError(err.message || 'Məlumat yüklənə bilmədi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()

    // Hər 3 dəqiqədən bir yenilə (real-time effekti üçün)
    const interval = setInterval(fetchDashboard, 180000)
    return () => clearInterval(interval)

  }, [token])

  // Fetch teams for member counts
  useEffect(() => {
    const fetchTeams = async () => {
      if (!token) return
      try {
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/teams', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (res.ok) {
          const json = await res.json()
          setTeams(json.data || [])
          console.log('teams:', json.data)
        }
      } catch (err) {
        console.error('Teams fetch xətası:', err)
      }
    }
    fetchTeams()
  }, [token])

  // Fetch workers from API (for assign modal)
  useEffect(() => {
    const fetchWorkers = async () => {
      if (!token) return
      try {
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/users?page=1&limit=50', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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

  // Fetch upcoming shifts from API
  useEffect(() => {
    const fetchUpcomingShifts = async () => {
      if (!token) return
      try {
        const today = new Date()
        const fromDate = today.toISOString().split('T')[0]
        const toDate = new Date(today.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]

        const params = new URLSearchParams({
          from: fromDate,
          to: toDate,
          page: '1',
          limit: '20'
        })

        const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/shifts?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          console.log('upcoming shifts (dashboard):', json)
          if (json.success && json.data) {
            const shifts = json.data.shifts || json.data.items || json.data || []
            const mapped = (Array.isArray(shifts) ? shifts : []).map((s, idx) => {
              const teamShort = s.teamName?.toLowerCase().includes('noc') ? 'NOC'
                : s.teamName?.toLowerCase().includes('soc') ? 'SOC'
                : s.teamName?.toLowerCase().includes('apm') ? 'APM' : s.teamName?.replace(/ Team$/i, '') || 'APM'

              return {
                id: s.id || idx + 1,
                date: s.date || '',
                fullDate: s.date || '',
                team: teamShort,
                time: (s.startTime && s.endTime) ? `${s.startTime} - ${s.endTime}` : '—',
                worker: s.userName || 'Boş',
                status: s.userName ? 'Planlaşdırılıb' : 'Boş'
              }
            })
            setUpcomingShifts(mapped)
          }
        }
      } catch (err) {
        console.error('Upcoming shifts fetch xətası:', err)
      }
    }
    fetchUpcomingShifts()
  }, [token])

  // Fetch today's schedule for timeline from API
  useEffect(() => {
    const fetchTodaySchedule = async () => {
      if (!token) return
      try {
        const today = new Date().toISOString().split('T')[0]
        const params = new URLSearchParams({
          from: today,
          to: today,
          page: '1',
          limit: '50'
        })

        const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/shifts?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          console.log('today schedule (timeline):', json)
          if (json.success && json.data) {
            const shifts = json.data.shifts || json.data.items || json.data || []
            if (Array.isArray(shifts) && shifts.length > 0) {
              const timeSlots = {
                '00:00 - 08:00': { night: true },
                '08:00 - 16:00': { day: true },
                '16:00 - 24:00': { evening: true }
              }

              const teamColors = {
                APM: { active: '#1e5a8a', inactive: '#e0e7ff' },
                NOC: { active: '#22c55e', inactive: '#dcfce7' },
                SOC: { active: '#a855f7', inactive: '#f3e8ff' }
              }

              const teamShifts = { APM: {}, NOC: {}, SOC: {} }

              shifts.forEach(s => {
                const teamName = s.teamName?.toLowerCase().includes('noc') ? 'NOC'
                  : s.teamName?.toLowerCase().includes('soc') ? 'SOC'
                  : s.teamName?.toLowerCase().includes('apm') ? 'APM' : null

                if (!teamName) return

                // Map startTime/endTime to time slot
                const startHour = parseInt(s.startTime?.split(':')[0] || '0')
                let slot = '08:00 - 16:00'
                if (startHour >= 0 && startHour < 8) slot = '00:00 - 08:00'
                else if (startHour >= 16) slot = '16:00 - 24:00'

                teamShifts[teamName][slot] = s.userName || '—'
              })

              setTimelineData(prev => prev.map(row => {
                const team = row.team
                const colors = teamColors[team] || teamColors.APM
                return {
                  ...row,
                  shifts: row.shifts.map(shift => ({
                    ...shift,
                    worker: teamShifts[team]?.[shift.time] || '—',
                    color: teamShifts[team]?.[shift.time] ? colors.active : colors.inactive
                  }))
                }
              }))
            }
          }
        }
      } catch (err) {
        console.error('Today schedule fetch xətası:', err)
      }
    }
    fetchTodaySchedule()
  }, [token])

  // Helper to get memberCount by team name
  const getTeamMemberCount = (shortName) => {
    const team = teams.find(t => {
      const n = t.name.toLowerCase()
      if (shortName === 'APM') return n.includes('apm')
      if (shortName === 'NOC') return n.includes('noc')
      if (shortName === 'SOC') return n.includes('soc')
      return false
    })
    return team?.memberCount || 0
  }

  const totalEmployees = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0)

  // Mövcud isShiftActive funksiyası və timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])


  const onDutyNow = dashboardData?.onDutyNow || []
  const [alerts, setAlerts] = useState([])
  const stats = dashboardData?.overview || {
    totalOnDuty: 0,
    totalWorkers: 0,
    pendingHandovers: 0,
    emptyShifts: 0,
    todayShifts: 0,
    completedHandovers: 0
  }




  const [notifications, setNotifications] = useState([])
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeHeaderDropdown && !event.target.closest('.time-header-dropdown')) {
        setTimeHeaderDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [timeHeaderDropdown])


  //Get current active shift for each team
  const getActiveShiftInfo = (teamName) => {
    const teamData = timelineData.find(t => t.team === teamName)
    if (!teamData) return null

    const activeShift = teamData.shifts.find(s => s.active)
    return activeShift || teamData.shifts[0] // fallback to first shift if none active
  }

  const [timelineData, setTimelineData] = useState([
    {
      team: 'APM',
      shifts: [
        { time: '00:00 - 08:00', worker: '—', color: '#e0e7ff' },
        { time: '08:00 - 16:00', worker: '—', color: '#1e5a8a' },
        { time: '16:00 - 24:00', worker: '—', color: '#e0e7ff' }
      ]
    },
    {
      team: 'NOC',
      shifts: [
        { time: '00:00 - 08:00', worker: '—', color: '#dcfce7' },
        { time: '08:00 - 16:00', worker: '—', color: '#22c55e' },
        { time: '16:00 - 24:00', worker: '—', color: '#dcfce7' }
      ]
    },
    {
      team: 'SOC',
      shifts: [
        { time: '00:00 - 08:00', worker: '—', color: '#f3e8ff' },
        { time: '08:00 - 16:00', worker: '—', color: '#a855f7' },
        { time: '16:00 - 24:00', worker: '—', color: '#f3e8ff' }
      ]
    }
  ])

  // Update active shifts based on current time
  useEffect(() => {
    const updateActiveShifts = () => {
      setTimelineData(prevData =>
        prevData.map(teamData => ({
          ...teamData,
          shifts: teamData.shifts.map(shift => ({
            ...shift,
            active: isShiftActive(shift.time)
          }))
        }))
      )
    }

    updateActiveShifts()
    // Update every minute along with current time
    const interval = setInterval(updateActiveShifts, 60000)

    return () => clearInterval(interval)
  }, [currentTime])

  const [upcomingShifts, setUpcomingShifts] = useState([])

  const [workers, setWorkers] = useState([])

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAssign = (shift) => {
    setSelectedShift(shift)
    setShowAssignModal(true)
  }

  const handleSelectWorker = (worker) => {
    setSelectedWorker(worker.id === selectedWorker?.id ? null : worker)
  }
  //Teams
  const teamMap = {}

  onDutyNow.forEach(person => {
    const fullTeamName = person.team || 'Digər'

    let shortName = 'Digər'
    let cssClass = 'other'

    if (fullTeamName.toLowerCase().includes('apm')) {
      shortName = 'APM'
      cssClass = 'apm'
    } else if (fullTeamName.toLowerCase().includes('noc')) {
      shortName = 'NOC'
      cssClass = 'noc'
    } else if (fullTeamName.toLowerCase().includes('soc')) {
      shortName = 'SOC'
      cssClass = 'soc'
    }

    if (!teamMap[fullTeamName]) {
      teamMap[fullTeamName] = {
        displayName: shortName,
        cssClass: cssClass,
        onShift: 0,
        exampleWorker: null,
        shiftType: person.shiftType || 'day'
      }
    }

    teamMap[fullTeamName].onShift += 1

    if (!teamMap[fullTeamName].exampleWorker) {
      teamMap[fullTeamName].exampleWorker = person.name
    }
  })

  const dynamicTeams = Object.values(teamMap)

  // fallback
  if (dynamicTeams.length === 0) {
    dynamicTeams.push(
      { displayName: 'APM', cssClass: 'apm', onShift: 0, exampleWorker: '—', shiftType: 'day' },
      { displayName: 'NOC', cssClass: 'noc', onShift: 0, exampleWorker: '—', shiftType: 'day' },
      { displayName: 'SOC', cssClass: 'soc', onShift: 0, exampleWorker: '—', shiftType: 'day' }
    )
  }
  const handleConfirmAssign = () => {
    if (selectedWorker && selectedShift) {
      // Update the shift
      setUpcomingShifts(prev => prev.map(shift =>
        shift.id === selectedShift.id
          ? { ...shift, worker: selectedWorker.name, status: 'Planlaşdırılıb' }
          : shift
      ))

      // Remove notification if exists
      setNotifications(prev => prev.filter(n => n.id !== selectedShift.id))

      showToast(`${selectedWorker.name} ${selectedShift?.team || ''} növbəsinə təyin edildi!`)
      setShowAssignModal(false)
      setSelectedWorker(null)
      setSelectedShift(null)
    }
  }

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    showToast('Xəbərdarlıq silindi')
  }

  const showToast = (message) => {
    setToastMessage(message)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const timeOptions = [
    'Bütün vaxtlar',
    '08:00 - 16:00',
    '16:00 - 00:00',
    '00:00 - 08:00'
  ]

  const handleTimeFilterChange = (timeFilter) => {
    setSelectedTimeFilter(timeFilter)
    setTimeHeaderDropdown(false)
  }

  // Normalize time string for comparison (handle 24:00 vs 00:00, extra spaces, etc.)
  const normalizeTime = (t) => (t || '').replace(/\s+/g, '').replace('24:00', '00:00')

  const filteredShifts = selectedTimeFilter === 'Bütün vaxtlar'
    ? upcomingShifts
    : upcomingShifts.filter(shift => {
        const shiftNorm = normalizeTime(shift.time)
        const filterNorm = normalizeTime(selectedTimeFilter)
        // Also match by start hour if exact match fails
        if (shiftNorm === filterNorm) return true
        // Extract start hour from shift time and filter
        const shiftStart = shift.time?.split('-')[0]?.trim()
        const filterStart = selectedTimeFilter?.split('-')[0]?.trim()
        return shiftStart === filterStart
      })

  const handleChangeShift = (shiftId) => {
    const shift = upcomingShifts.find(s => s.id === shiftId)
    setSelectedShift(shift)
    setShowAssignModal(true)
  }

  const handleViewDetail = (shift) => {
    setSelectedShift(shift)
    setShowHandoverModal(true)
  }

  // New Alert Handlers
  const handleAlertAction = (alert) => {
    if (alert.action === 'assign') {
      setSelectedShift({ team: alert.team, time: alert.detail })
      setShowAssignModal(true)
    } else if (alert.action === 'contact') {
      const duty = onDutyNow.find(d => d.name === alert.worker || d.worker === alert.worker)
      if (duty) {
        setSelectedOnDuty(duty)
        setShowOnDutyModal(true)
      }
    } else if (alert.action === 'remind') {
      showToast(`${alert.worker}-a xatırlatma göndərildi`)
      setAlerts(prev => prev.filter(a => a.id !== alert.id))
    }
  }

  const handleDismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
    showToast('Xəbərdarlıq silindi')
  }

  const handleViewOnDuty = (duty) => {
    setSelectedOnDuty(duty)
    setShowOnDutyModal(true)
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'late-checkin': return <Timer size={18} />
      case 'empty-shift': return <AlertCircle size={18} />
      case 'handover-pending': return <FileText size={18} />
      default: return <AlertTriangle size={18} />
    }
  }

  const getAlertActionText = (action) => {
    switch (action) {
      case 'assign': return 'Təyin et'
      case 'contact': return 'Əlaqə'
      case 'remind': return 'Xatırlat'
      default: return 'Bax'
    }
  }

  if (isLoading) {
    return (
      <div className="admin-dashboard loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Yüklənir...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Success Toast */}
      <div className={`toast-notification ${showSuccessToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>

      {/* Header Actions Row */}
      <div className="dashboard-actions-row">
        <h2>Komanda Statusu</h2>
      </div>

      {/* Team Status */}
      <div className="team-status-section animate-fade-in">
        <div className="team-cards">
          {dynamicTeams.map((team, idx) => (
            <div
              key={team.displayName}
              className={`team-card ${team.cssClass}-card hover-lift`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="card-header">
                <div className={`team-icon-box ${team.cssClass}-bg`}>
                  <Users size={24} color="white" />
                </div>
                <div className="team-title-box">
                  <h3>{team.displayName}</h3>
                  <span className="member-count">
                    {getTeamMemberCount(team.displayName)} İşçi
                  </span>
                </div>
                <span className={`shift-badge ${team.cssClass}-badge`}>
                  {team.onShift} növbədə
                </span>
              </div>
              <div className="card-body">
                <div className="current-shift-info">
                  <div className="info-label">
                    <Clock size={14} />
                    <span>Cari Növbə</span>
                  </div>
                  <div className="shift-time-text">
                    {team.shiftType === 'day' ? '08:00 - 16:00' :
                      team.shiftType === 'evening' ? '16:00 - 00:00' :
                        team.shiftType === 'night' ? '00:00 - 08:00' : '—'}
                  </div>
                  <div className="shift-worker-name">
                    {team.onShift > 0 ? team.exampleWorker : 'Hazırda boşdur'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24 Hour Timeline */}
      <div className="timeline-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2>24 Saatlıq Növbə Timeline</h2>

        {/* Re-implementing timeline using the previous data structure but new styling */}
        <div className="timeline-grid-new">
          {timelineData.map((row) => (
            <div key={row.team} className="timeline-row-new">
              <div className={`team-tag ${row.team.toLowerCase()}-tag`}>{row.team}</div>
              <div className="shifts-track">
                {row.shifts.map((shift, idx) => (
                  <div
                    key={idx}
                    className={`shift-block-new ${shift.active ? 'active' : ''} ${row.team.toLowerCase()}-block`}
                  >
                    <div className="block-header">
                      <span className="time-text">{shift.time}</span>
                      {shift.active && <Clock size={12} />}
                    </div>
                    <div className="worker-text">{shift.worker}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-legend">
          <div className="legend-item"><span className="dot apm"></span> APM</div>
          <div className="legend-item"><span className="dot noc"></span> NOC</div>
          <div className="legend-item"><span className="dot soc"></span> SOC</div>
          <div className="legend-item"><span className="dot active-dot"></span> Aktiv növbə</div>
        </div>
      </div>

      {/* Upcoming Shifts */}
      <div className="upcoming-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2>Gələcək Növbələr (24-48 saat)</h2>
        <div className="shifts-table-container">
          <table className="shifts-table-new">
            <thead>
              <tr>
                <th>TARİX</th>
                <th>KOMANDA</th>
                <th className="time-header-dropdown">
                  <div
                    className="time-header-cell"
                    onClick={() => setTimeHeaderDropdown(!timeHeaderDropdown)}
                  >
                    NÖVBƏ VAXTI
                    <ChevronRight size={14} className={`dropdown-arrow ${timeHeaderDropdown ? 'open' : ''}`} />
                    {timeHeaderDropdown && (
                      <div className="time-header-options" onClick={e => e.stopPropagation()}>
                        {timeOptions.map((time, idx) => (
                          <div
                            key={idx}
                            className={`time-option ${selectedTimeFilter === time ? 'selected' : ''}`}
                            onClick={() => handleTimeFilterChange(time)}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </th>
                <th>TƏYİN EDİLMİŞ İŞÇİ</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift, idx) => (
                <tr key={shift.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td>
                    <div className="date-cell-new">
                      {shift.fullDate}
                    </div>
                  </td>
                  <td>
                    <span className={`team-badge-pill ${shift.team.toLowerCase()}-pill`}>{shift.team}</span>
                  </td>
                  <td>
                    <div className="time-cell-new">
                      <Clock size={14} />
                      {shift.time}
                    </div>
                  </td>
                  <td>
                    <div className="worker-cell-new">
                      <Users size={14} />
                      {shift.worker}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Növbəyə İşçi Təyin Et</h3>
                <span>Komanda: {selectedShift?.team || 'APM'} • Vaxt: 08:00 - 20:00</span>
              </div>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="İşçi axtar..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="workers-list">
                {filteredWorkers.map((worker, idx) => (
                  <div
                    key={worker.id}
                    className={`worker-item ${selectedWorker?.id === worker.id ? 'selected' : ''} animate-slide-in`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => handleSelectWorker(worker)}
                  >
                    <div className="worker-avatar">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="worker-info">
                      <span className="worker-name">{worker.name}</span>
                      <span className="worker-email">{worker.email}</span>
                    </div>
                    <span className={`worker-status ${worker.status === 'Növbədə' ? 'on-shift' : worker.status === 'Əlçatandır' ? 'available' : 'off'}`}>
                      {worker.status}
                    </span>
                    <span className="worker-team">{worker.team}</span>
                    {selectedWorker?.id === worker.id && (
                      <Check size={18} className="check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAssignModal(false)}>Ləğv et</button>
              <button
                className={`btn-confirm ${!selectedWorker ? 'disabled' : ''}`}
                onClick={handleConfirmAssign}
                disabled={!selectedWorker}
              >
                <Check size={16} />
                Təyin Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showHandoverModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowHandoverModal(false)}>
          <div className="modal-content detail-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Növbə Detalları</h3>
                <span>{selectedShift.team} • {selectedShift.fullDate} • {selectedShift.time}</span>
              </div>
              <button className="close-btn" onClick={() => setShowHandoverModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Komanda</label>
                  <span className={`team-badge ${selectedShift.team.toLowerCase()}`}>{selectedShift.team}</span>
                </div>
                <div className="detail-item">
                  <label>Tarix</label>
                  <span>{selectedShift.fullDate}</span>
                </div>
                <div className="detail-item">
                  <label>Vaxt</label>
                  <span>{selectedShift.time}</span>
                </div>
                <div className="detail-item">
                  <label>İşçi</label>
                  <span>{selectedShift.worker}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedShift.status === 'Boş' ? 'empty' : 'planned'}`}>
                    {selectedShift.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowHandoverModal(false)}>Bağla</button>
              <button className="btn-confirm" onClick={() => {
                setShowHandoverModal(false)
                handleChangeShift(selectedShift.id)
              }}>
                <Edit size={16} />
                Redaktə Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-Duty Detail Modal */}
      {showOnDutyModal && selectedOnDuty && (
        <div className="modal-overlay" onClick={() => setShowOnDutyModal(false)}>
          <div className="modal-content on-duty-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>İşçi Detalları</h3>
                <span>{selectedOnDuty.team} komandası • Cari növbə</span>
              </div>
              <button className="close-btn" onClick={() => setShowOnDutyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="on-duty-profile">
                <div className="profile-avatar large">
                  {selectedOnDuty.worker.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="profile-info">
                  <h4>{selectedOnDuty.worker}</h4>
                  <span className={`team-badge ${selectedOnDuty.team.toLowerCase()}`}>{selectedOnDuty.team}</span>
                </div>
              </div>
              <div className="contact-info">
                <a href={`mailto:${selectedOnDuty.email}`} className="contact-item">
                  <Mail size={16} />
                  <span>{selectedOnDuty.email}</span>
                </a>
                <a href={`tel:${selectedOnDuty.phone}`} className="contact-item">
                  <Phone size={16} />
                  <span>{selectedOnDuty.phone}</span>
                </a>
              </div>
              <div className="duty-info-grid">
                <div className="info-item">
                  <label>Növbə Vaxtı</label>
                  <span>{selectedOnDuty.shift}</span>
                </div>
                <div className="info-item">
                  <label>Check-in</label>
                  <span className={selectedOnDuty.checkIn ? 'success' : 'danger'}>
                    {selectedOnDuty.checkIn || 'Edilməyib'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedOnDuty.status === 'active' ? 'planned' : 'empty'}`}>
                    {selectedOnDuty.status === 'active' ? 'Aktiv' : 'Gecikmə'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Handover</label>
                  <span className={
                    selectedOnDuty.handoverStatus === 'completed' ? 'success' :
                      selectedOnDuty.handoverStatus === 'pending' ? 'warning' : 'danger'
                  }>
                    {selectedOnDuty.handoverStatus === 'completed' ? 'Tamamlanıb' :
                      selectedOnDuty.handoverStatus === 'pending' ? 'Gözləyir' : 'Yoxdur'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Aktiv Tapşırıqlar</label>
                  <span>{selectedOnDuty.tasksCount}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowOnDutyModal(false)}>Bağla</button>
              <button className="btn-secondary">
                <FileText size={16} />
                Handover Bax
              </button>
              <button className="btn-confirm">
                <Phone size={16} />
                Əlaqə Saxla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard