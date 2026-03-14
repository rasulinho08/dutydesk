import { useState, useEffect } from 'react'
import { Clock, Calendar, Eye, FileText, CheckCircle, X, Check, Search, RefreshCw } from 'lucide-react'
import './HandoverHistory.css'
import { formatDisplayDate, formatShiftTimeRange } from '../utils/dateUtils'
import { BASE_URL } from '../constants'

function HandoverHistory() {
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
      if (!token) return
      setIsLoading(true)
      try {
        const { from, to } = getDateRange()
        const params = new URLSearchParams({ from, to, page: '1', limit: '50' })
        const res = await fetch(`${BASE_URL}/api/handovers?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            const items = json.data?.items || json.data?.handovers || (Array.isArray(json.data) ? json.data : [])
            setHistoryItems(items)
          }
        }
      } catch (err) {
        console.error('HandoverHistory fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [token, activeFilter])

  const displayToast = (message) => {
    setToastMessage(message); setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const filteredItems = historyItems.filter(item => {
    const text = `${item.date || ''} ${item.summary || ''} ${item.incidents || ''} ${item.acceptedBy || ''}`.toLowerCase()
    return text.includes(searchQuery.toLowerCase())
  })

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
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} /><span>{toastMessage}</span>
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
          <input type="text" placeholder="Axtar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="filters">
          {filters.map((filter) => (
            <button key={filter.id} className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`} onClick={() => setActiveFilter(filter.id)}>
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
            <div key={item.id || index} className="history-card animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-header">
                <h3 className="card-date">{formatDisplayDate(item.date || item.createdAt)}</h3>
                <span className="card-status">
                  <CheckCircle size={14} />
                  {item.status === 'submitted' ? 'Göndərildi' : item.status === 'approved' ? 'Təsdiqləndi' : 'Tamamlanıb'}
                </span>
              </div>

              <div className="card-meta">
                {item.startTime && (
                  <span className="meta-item"><Clock size={14} />{formatShiftTimeRange(item.startTime, item.endTime)}</span>
                )}
              </div>

              <div className="card-summary">
                <span className="summary-label">📋 Xülasə:</span>
                <p className="summary-text">{item.summary || item.incidents || item.additionalNotes || 'Məlumat yoxdur'}</p>
              </div>

              {item.incidents && (
                <div className="card-details">
                  <div className="detail-box problems">
                    <span className="detail-label">İncidentlər</span>
                    <span className="detail-value">{item.incidents}</span>
                  </div>
                </div>
              )}

              <div className="card-actions">
                <button className="view-btn" onClick={() => { setSelectedItem(item); setShowDetailModal(true) }}>
                  <Eye size={16} /><span>Ətraflı Bax</span>
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
                <span className="modal-subtitle">{formatDisplayDate(selectedItem.date || selectedItem.createdAt)}</span>
              </div>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {(selectedItem.startTime || selectedItem.endTime) && (
                <div className="detail-section">
                  <div className="detail-row">
                    <div className="detail-col"><label>Növbə Vaxtı</label><span>{formatShiftTimeRange(selectedItem.startTime, selectedItem.endTime)}</span></div>
                    <div className="detail-col"><label>Sistem Statusu</label><span className="status-normal">{selectedItem.systemStatus || 'Normal'}</span></div>
                  </div>
                </div>
              )}
              {selectedItem.incidents && (
                <div className="detail-section">
                  <label>İncidentlər</label>
                  <div className="detail-box-full"><pre>{selectedItem.incidents}</pre></div>
                </div>
              )}
              <div className="detail-section">
                <label>Xülasə</label>
                <div className="detail-box-full"><p>{selectedItem.summary || selectedItem.additionalNotes || 'Məlumat yoxdur'}</p></div>
              </div>
              {selectedItem.nextShiftInfo && (
                <div className="detail-section">
                  <label>Növbəti Növbəyə Məlumat</label>
                  <div className="detail-box-full"><p>{selectedItem.nextShiftInfo}</p></div>
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
