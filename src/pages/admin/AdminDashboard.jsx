import { useState, useEffect } from 'react'
import { 
  Bell, AlertTriangle, Clock, Users, Calendar, 
  ChevronRight, Download, UserPlus, X, Check, Search,
  RefreshCw, Eye, Edit, Trash2, Activity, LogIn, LogOut,
  FileText, Zap, TrendingUp, UserCheck, AlertCircle, 
  Timer, CheckCircle2, XCircle, Phone, Mail
} from 'lucide-react'
import './AdminDashboard.css'

function AdminDashboard() {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [showOnDutyModal, setShowOnDutyModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [selectedOnDuty, setSelectedOnDuty] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Real-time On-Duty Status
  const [onDutyNow, setOnDutyNow] = useState([
    { 
      id: 1, 
      team: 'APM', 
      worker: 'Leyla Məmmədova', 
      email: 'leyla@company.az',
      phone: '+994 50 123 4567',
      shift: '08:00 - 16:00', 
      checkIn: '07:55', 
      status: 'active',
      handoverStatus: 'completed',
      tasksCount: 3
    },
    { 
      id: 2, 
      team: 'NOC', 
      worker: 'Rəşad İbrahimov', 
      email: 'rashad@company.az',
      phone: '+994 55 987 6543',
      shift: '08:00 - 16:00', 
      checkIn: '08:02', 
      status: 'active',
      handoverStatus: 'pending',
      tasksCount: 5
    },
    { 
      id: 3, 
      team: 'SOC', 
      worker: 'Günəl Həsənova', 
      email: 'gunel@company.az',
      phone: '+994 70 555 1234',
      shift: '08:00 - 16:00', 
      checkIn: null, 
      status: 'late',
      handoverStatus: 'not-started',
      tasksCount: 0
    }
  ])

  // Alerts/Issues
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      type: 'late-checkin', 
      severity: 'high',
      team: 'SOC', 
      worker: 'Günəl Həsənova',
      message: 'Check-in edilməyib', 
      detail: 'Növbə başlamasından 25 dəq keçib',
      time: '08:25',
      action: 'contact'
    },
    { 
      id: 2, 
      type: 'empty-shift', 
      severity: 'high',
      team: 'APM', 
      worker: null,
      message: 'Bu gün axşam növbəsi boşdur', 
      detail: '16:00 - 24:00 arası işçi yoxdur',
      time: '08:00',
      action: 'assign'
    },
    { 
      id: 3, 
      type: 'handover-pending', 
      severity: 'medium',
      team: 'NOC', 
      worker: 'Rəşad İbrahimov',
      message: 'Handover hələ tamamlanmayıb', 
      detail: 'Əvvəlki növbədən qeydlər gözlənilir',
      time: '08:15',
      action: 'remind'
    },
    { 
      id: 4, 
      type: 'empty-shift', 
      severity: 'medium',
      team: 'SOC', 
      worker: null,
      message: 'Sabah səhər növbəsi boşdur', 
      detail: '08:00 - 16:00 arası işçi yoxdur',
      time: '08:00',
      action: 'assign'
    }
  ])

  // Quick Stats
  const [stats, setStats] = useState({
    totalOnDuty: 2,
    totalWorkers: 9,
    pendingHandovers: 2,
    emptyShifts: 2,
    todayShifts: 9,
    completedHandovers: 7
  })

  const [notifications, setNotifications] = useState([
    { id: 1, team: 'APM', message: 'APM komandası üçün bu gün gecə növbəsi boşdur (16:00-24:00)', type: 'warning', read: false },
    { id: 2, team: 'SOC', message: 'SOC komandası üçün sabah gündüz növbəsi boşdur (08:00-16:00)', type: 'warning', read: false }
  ])
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800)
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])

  const teams = [
    { name: 'APM', members: 3, color: '#1e5a8a', currentShift: '09:00-17:00', worker: 'Leyla Məmmədova', onShift: 1 },
    { name: 'NOC', members: 3, color: '#22c55e', currentShift: '09:00-17:00', worker: 'Rəşad İbrahimov', onShift: 1 },
    { name: 'SOC', members: 3, color: '#a855f7', currentShift: '09:00-17:00', worker: 'Günəl Həsənova', onShift: 1 }
  ]

  const [timelineData, setTimelineData] = useState([
    { 
      team: 'APM', 
      shifts: [
        { time: '00:00 - 08:00', worker: 'Əli Məmmədov', color: '#e0e7ff' },
        { time: '08:00 - 16:00', worker: 'Leyla Həsənova', color: '#1e5a8a', active: true },
        { time: '16:00 - 24:00', worker: 'Rəşad İsmayılov', color: '#e0e7ff' }
      ]
    },
    { 
      team: 'NOC', 
      shifts: [
        { time: '00:00 - 08:00', worker: 'Əli Məmmədov', color: '#dcfce7' },
        { time: '08:00 - 16:00', worker: 'Leyla Həsənova', color: '#22c55e', active: true },
        { time: '16:00 - 24:00', worker: 'Rəşad İsmayılov', color: '#dcfce7' }
      ]
    },
    { 
      team: 'SOC', 
      shifts: [
        { time: '00:00 - 08:00', worker: 'Əli Məmmədov', color: '#f3e8ff' },
        { time: '08:00 - 16:00', worker: 'Leyla Həsənova', color: '#a855f7', active: true },
        { time: '16:00 - 24:00', worker: 'Rəşad İsmayılov', color: '#f3e8ff' }
      ]
    }
  ])

  const [upcomingShifts, setUpcomingShifts] = useState([
    { id: 1, date: 'Sabah', fullDate: '12-01-2026', team: 'APM', time: '09:00-17:00', worker: 'Əli Quliyev', status: 'Planlaşdırılıb' },
    { id: 2, date: 'Sabah', fullDate: '13-01-2026', team: 'NOC', time: '09:00-17:00', worker: 'Elvin Əliyev', status: 'Planlaşdırılıb' },
    { id: 3, date: 'Sabah', fullDate: '12-01-2026', team: 'SOC', time: '09:00-17:00', worker: 'Elvin Əliyev', status: 'Boş' }
  ])

  const workers = [
    { id: 1, name: 'Leyla Məmmədova', email: 'leyla@company.az', team: 'APM', status: 'Növbədə' },
    { id: 2, name: 'Əli Quliyev', email: 'ali@company.az', team: 'APM', status: 'Əlçatandır' },
    { id: 3, name: 'Nigar Həmidova', email: 'nigar@company.az', team: 'APM', status: 'İstirahətdə' },
    { id: 4, name: 'Rəşad İbrahimov', email: 'rashad@company.az', team: 'NOC', status: 'Əlçatandır' },
    { id: 5, name: 'Günəl Həsənova', email: 'gunel@company.az', team: 'SOC', status: 'Əlçatandır' }
  ]

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

  const handleExport = () => {
    showToast('Məlumatlar Excel formatında yüklənir...')
  }

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
      const duty = onDutyNow.find(d => d.worker === alert.worker)
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
    switch(type) {
      case 'late-checkin': return <Timer size={18} />
      case 'empty-shift': return <AlertCircle size={18} />
      case 'handover-pending': return <FileText size={18} />
      default: return <AlertTriangle size={18} />
    }
  }

  const getAlertActionText = (action) => {
    switch(action) {
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

      {/* Quick Stats Row */}
      <div className="quick-stats-row animate-fade-in">
        <div className="stat-card green">
          <div className="stat-icon">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOnDuty}</span>
            <span className="stat-label">Hal-hazırda Növbədə</span>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalWorkers}</span>
            <span className="stat-label">Ümumi İşçi</span>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingHandovers}</span>
            <span className="stat-label">Gözləyən Handover</span>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.emptyShifts}</span>
            <span className="stat-label">Boş Növbə</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.todayShifts}</span>
            <span className="stat-label">Bu gün Növbələr</span>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedHandovers}</span>
            <span className="stat-label">Tamamlanmış Handover</span>
          </div>
        </div>
      </div>

      {/* On-Duty Now Section */}
      <div className="on-duty-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <div className="section-title">
            <Activity size={20} className="pulse" />
            <span>Hal-hazırda Növbədə</span>
            <span className="live-badge">
              <span className="live-dot"></span>
              CANLI
            </span>
          </div>
          <span className="current-time">
            <Clock size={14} />
            {currentTime.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="on-duty-grid">
          {onDutyNow.map((duty, idx) => (
            <div 
              key={duty.id} 
              className={`on-duty-card ${duty.status} hover-lift`}
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => handleViewOnDuty(duty)}
            >
              <div className="duty-header">
                <span className={`team-badge ${duty.team.toLowerCase()}`}>{duty.team}</span>
                <span className={`status-indicator ${duty.status}`}>
                  {duty.status === 'active' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {duty.status === 'active' ? 'Aktiv' : 'Gecikmə'}
                </span>
              </div>
              <div className="duty-worker">
                <div className="worker-avatar">
                  {duty.worker.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="worker-name">{duty.worker}</span>
                  <span className="worker-shift">{duty.shift}</span>
                </div>
              </div>
              <div className="duty-details">
                <div className="detail-item">
                  <LogIn size={14} />
                  <span>Check-in: {duty.checkIn || '--:--'}</span>
                </div>
                <div className="detail-item">
                  <FileText size={14} />
                  <span>Handover: {
                    duty.handoverStatus === 'completed' ? '✓ Tamamlanıb' :
                    duty.handoverStatus === 'pending' ? '⏳ Gözləyir' : '✗ Yoxdur'
                  }</span>
                </div>
              </div>
              {duty.status === 'late' && (
                <div className="late-warning">
                  <AlertTriangle size={14} />
                  <span>Check-in edilməyib!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="alerts-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <div className="section-title">
            <AlertTriangle size={20} />
            <span>Xəbərdarlıqlar və Problemlər</span>
            <span className="count-badge high">{alerts.filter(a => a.severity === 'high').length} kritik</span>
          </div>
          <button className="btn-text" onClick={() => setAlerts([])}>
            Hamısını sil
          </button>
        </div>
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <div className="empty-alerts">
              <CheckCircle2 size={32} />
              <span>Heç bir problem yoxdur!</span>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <div 
                key={alert.id} 
                className={`alert-card ${alert.severity} animate-slide-in`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`alert-icon ${alert.severity}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <span className={`team-badge ${alert.team.toLowerCase()}`}>{alert.team}</span>
                    {alert.worker && <span className="alert-worker">{alert.worker}</span>}
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-detail">{alert.detail}</span>
                </div>
                <div className="alert-actions">
                  <button className="btn-action" onClick={() => handleAlertAction(alert)}>
                    {getAlertActionText(alert.action)}
                  </button>
                  <button className="btn-dismiss-small" onClick={() => handleDismissAlert(alert.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Header with notifications - moved after stats */}
      <div className="dashboard-header animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="notifications-section">
          <div className="section-title">
            <Bell size={20} />
            <span>Bildirişlər</span>
            <span className="count">({notifications.length})</span>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
              <UserPlus size={16} />
              Növbə Təyin Et
            </button>
            <button className="btn-outline" onClick={handleExport}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <Check size={24} />
              <span>Aktiv xəbərdarlıq yoxdur</span>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div 
                key={notif.id} 
                className="notification-card animate-slide-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="notif-content">
                  <AlertTriangle size={18} className="warning-icon pulse" />
                  <div>
                    <p>{notif.message}</p>
                    <span className="notif-team">Komanda: {notif.team}</span>
                  </div>
                </div>
                <div className="notif-actions">
                  <button className="btn-assign" onClick={() => handleAssign(notif)}>
                    Təyin et
                  </button>
                  <button className="btn-dismiss" onClick={() => handleDismissNotification(notif.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Status */}
      <div className="team-status-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2>Komanda Statusu</h2>
        <div className="team-cards">
          {teams.map((team, idx) => (
            <div 
              key={team.name} 
              className="team-card hover-lift"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="team-header">
                <div className="team-icon" style={{ backgroundColor: team.color + '20', color: team.color }}>
                  <Users size={20} />
                </div>
                <div className="team-info">
                  <h3>{team.name}</h3>
                  <span>{team.members} İşçi</span>
                </div>
                <span className="on-shift-badge pulse-badge">{team.onShift} növbədə</span>
              </div>
              <div className="team-current">
                <Clock size={14} />
                <span>Cari Növbə</span>
              </div>
              <div className="shift-time">{team.currentShift}</div>
              <div className="shift-worker">{team.worker}</div>
              <button className="team-detail-btn">
                Ətraflı <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 24 Hour Timeline */}
      <div className="timeline-section animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2>24 Saatlıq Növbə Timeline</h2>
        <div className="timeline-grid">
          {timelineData.map((row, rowIdx) => (
            <div key={row.team} className="timeline-row">
              <span className="team-label" style={{ 
                color: row.team === 'APM' ? '#1e5a8a' : row.team === 'NOC' ? '#22c55e' : '#a855f7' 
              }}>
                {row.team}
              </span>
              <div className="shifts-row">
                {row.shifts.map((shift, idx) => (
                  <div 
                    key={idx} 
                    className={`shift-block ${shift.active ? 'active' : ''} hover-scale`}
                    style={{ 
                      backgroundColor: shift.active ? shift.color : shift.color,
                      color: shift.active ? 'white' : '#374151',
                      animationDelay: `${(rowIdx * 3 + idx) * 0.05}s`
                    }}
                  >
                    <span className="shift-time-label">{shift.time}</span>
                    <span className="shift-worker-label">{shift.worker}</span>
                    {shift.active && <span className="active-indicator">●</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="timeline-legend">
          <span><span className="dot apm"></span> APM</span>
          <span><span className="dot noc"></span> NOC</span>
          <span><span className="dot soc"></span> SOC</span>
          <span><span className="dot active-dot"></span> Aktiv növbə</span>
        </div>
      </div>

      {/* Upcoming Shifts */}
      <div className="upcoming-section animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h2>Gələcək Növbələr (24-48 saat)</h2>
        <div className="shifts-table">
          <div className="table-header">
            <span>TARİX</span>
            <span>KOMANDA</span>
            <span>NÖVBƏ VAXTI</span>
            <span>TƏYİN EDİLMİŞ İŞÇİ</span>
            <span>STATUS</span>
            <span>ƏMƏLİYYAT</span>
          </div>
          {upcomingShifts.map((shift, idx) => (
            <div 
              key={shift.id} 
              className="table-row animate-slide-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="date-cell">
                <span className="date-label">{shift.date}</span>
                <span className="date-full">{shift.fullDate}</span>
              </div>
              <div>
                <span className={`team-badge ${shift.team.toLowerCase()}`}>{shift.team}</span>
              </div>
              <div className="time-cell">
                <Clock size={14} />
                {shift.time}
              </div>
              <div className="worker-cell">
                <Users size={14} />
                {shift.worker}
              </div>
              <div>
                <span className={`status-badge ${shift.status === 'Boş' ? 'empty' : 'planned'}`}>
                  {shift.status}
                </span>
              </div>
              <div className="actions-cell">
                <button className="action-btn" onClick={() => handleChangeShift(shift.id)}>
                  <Edit size={14} />
                  Dəyiş
                </button>
                <button className="action-btn" onClick={() => handleViewDetail(shift)}>
                  <Eye size={14} />
                  Detalı
                </button>
              </div>
            </div>
          ))}
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
