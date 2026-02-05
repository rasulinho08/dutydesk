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
    { name: 'APM', members: 3, color: '#1380AF', currentShift: '09:00-17:00', worker: 'Leyla Məmmədova', onShift: 1 },
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

      {/* Header Actions Row */}
      <div className="dashboard-actions-row">
        <h2>Komanda Statusu</h2>
        <div className="header-buttons">
          <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
            <div className="icon-circle">
              <UserPlus size={16} />
            </div>
            Növbə Təyin Et
          </button>
          <button className="btn-outline" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Team Status */}
      <div className="team-status-section animate-fade-in">
        <div className="team-cards">
          {teams.map((team, idx) => (
            <div 
              key={team.name} 
              className={`team-card ${team.name.toLowerCase()}-card hover-lift`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="card-header">
                <div className={`team-icon-box ${team.name.toLowerCase()}-bg`}>
                  <Users size={24} color="white" />
                </div>
                <div className="team-title-box">
                  <h3>{team.name}</h3>
                  <span className="member-count">{team.members} İşçi</span>
                </div>
                <span className="shift-badge">{team.onShift} növbədə</span>
              </div>
              
              <div className="card-body">
                <div className="current-shift-info">
                  <div className="info-label">
                    <Clock size={14} />
                    <span>Cari Növbə</span>
                  </div>
                  <div className="shift-time-text">{team.currentShift}</div>
                  <div className="shift-worker-name">{team.worker}</div>
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
                <th>NÖVBƏ VAXTI</th>
                <th>TƏYİN EDİLMİŞ İŞÇİ</th>
              </tr>
            </thead>
            <tbody>
              {upcomingShifts.map((shift, idx) => (
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
