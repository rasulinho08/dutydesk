import { useState, useEffect } from 'react'
import { Clock, Calendar, Download, Eye, FileText, CheckCircle, X, Check, AlertTriangle, Search, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './HandoverHistory.css'

const BASE_URL = 'https://dutydesk-g3ma.onrender.com'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
  } catch { return dateStr }
}

function HandoverHistory() {
  const { user } = useAuth()
  const token = localStorage.getItem('token') || ''

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [historyItems, setHistoryItems] = useState([])

  const filters = [
    { id: 'all', label: 'Hamısı' },
    { id: 'week', label: 'Bu Həftə' },
    { id: 'month', label: 'Bu Ay' },
  ]

  const getDateRange = () => {
    const now = new Date()
    const to = now.toISOString().split('T')[0]
    let from
    if (activeFilter === 'week') {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
      from = weekStart.toISOString().split('T')[0]
    } else if (activeFilter === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    } else {
      const past = new Date(now); past.setMonth(past.getMonth() - 3)
      from = past.toISOString().split('T')[0]
    }
    return { from, to }
  }

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token || !user) return
      setIsLoading(true)
      try {
        const { from, to } = getDateRange()
        const res = await fetch(`${BASE_URL}/api/admin/shifts?from=${from}&to=${to}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            const all = json.data?.shifts || json.data?.items || (Array.isArray(json.data) ? json.data : [])
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
            const today = new Date().toISOString().split('T')[0]
            const mine = all.filter(s =>
              (s.userId === user.id || s.userName === userName) &&
              s.date <= today
            )
            const mapped = mine.map((s, i) => ({
              id: s.id || i,
              date: s.date,
              time: `${s.startTime || '—'} - ${s.endTime || '—'}`,
              handoverTime: s.endTime || '—',
              status: s.status === 'completed' ? 'Tamamlanıb' : (s.status || 'Tamamlanıb'),
              summary: s.handoverNote || s.notes || 'Məlumat yoxdur',
              problems: s.incidents || 'Məlumat yoxdur',
              acceptedBy: s.acceptedBy || '—',
              incidents: s.incidents || 'Incident yoxdur',
              systemStatus: s.systemStatus || 'Normal',
              notes: s.notes || '',
            }))
            setHistoryItems(mapped)
          }
        }
      } catch (err) {
        console.error('HandoverHistory fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [token, user, activeFilter])

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const filteredItems = historyItems.filter(item =>
    item.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.acceptedBy?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="handover-history loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Tarixçə yüklənir...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="handover-history">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>

      {/* Header */}
      <div className="history-header animate-fade-in">
        <div className="header-title">
          <FileText size={24} />
          <div>
            <h1>Təhvil-Təslim Tarixçəsi</h1>
            <span className="header-subtitle">Keçmiş növbə qeydləri və xülasələr</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-row animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Axtar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="history-list">
        {filteredItems.length === 0 ? (
          <div className="empty-state-history">
            <FileText size={48} />
            <p>Heç bir nəticə tapılmadı</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={item.id} className="history-card animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-header">
                <h3 className="card-date">{formatDate(item.date)}</h3>
                <span className="card-status">
                  <CheckCircle size={14} />
                  {item.status}
                </span>
              </div>

              <div className="card-meta">
                <span className="meta-item">
                  <Clock size={14} />
                  {item.time}
                </span>
                <span className="meta-item">
                  <Calendar size={14} />
                  Təhvil: {item.handoverTime}
                </span>
              </div>

              <div className="card-summary">
                <span className="summary-label">📋 Xülasə:</span>
                <p className="summary-text">{item.summary}</p>
              </div>

              <div className="card-details">
                <div className="detail-box problems">
                  <span className="detail-label">Problemlər / İşlər</span>
                  <span className="detail-value">{item.problems}</span>
                </div>
                {item.acceptedBy !== '—' && (
                  <div className="detail-box accepted">
                    <span className="detail-label">Növbəni Qəbul Edən</span>
                    <span className="detail-value">{item.acceptedBy}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button className="view-btn" onClick={() => { setSelectedItem(item); setShowDetailModal(true) }}>
                  <Eye size={16} />
                  <span>Ətraflı Bax</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content large-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Təhvil-Təslim Detalları</h3>
                <span className="modal-subtitle">{formatDate(selectedItem.date)}</span>
              </div>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <div className="detail-col">
                    <label>Növbə Vaxtı</label>
                    <span>{selectedItem.time}</span>
                  </div>
                  <div className="detail-col">
                    <label>Təhvil Vaxtı</label>
                    <span>{selectedItem.handoverTime}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-col">
                    <label>Qəbul Edən</label>
                    <span>{selectedItem.acceptedBy}</span>
                  </div>
                  <div className="detail-col">
                    <label>Sistem Statusu</label>
                    <span className="status-normal">{selectedItem.systemStatus}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <label>İncidentlər</label>
                <div className="detail-box-full">
                  <pre>{selectedItem.incidents}</pre>
                </div>
              </div>

              <div className="detail-section">
                <label>Xülasə</label>
                <div className="detail-box-full">
                  <p>{selectedItem.summary}</p>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="detail-section">
                  <label>Əlavə Qeydlər</label>
                  <div className="detail-box-full">
                    <p>{selectedItem.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Bağla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HandoverHistory
