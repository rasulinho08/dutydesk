import { useState } from 'react'
import { Clock, Calendar, Download, Eye, FileText, CheckCircle, X, Check, AlertTriangle, Search } from 'lucide-react'
import './HandoverHistory.css'

function HandoverHistory() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const filters = [
    { id: 'all', label: 'Hamısı' },
    { id: 'week', label: 'Bu Həftə' },
    { id: 'month', label: 'Bu Ay' },
  ]

  const historyItems = [
    {
      id: 1,
      date: '13 Yanvar 2026, Bazar ertəsi',
      time: '08:00 - 16:00',
      handoverTime: '16:00',
      status: 'Tamamlanıb',
      summary: 'Bütün sistemlər normal işləyir. 3 incident həll olundu. Server monitoring aktiv.',
      problems: '3 incident (həll olunub)',
      acceptedBy: 'Leyla Məmmədova',
      incidents: 'INC001 - Database bağlantı problemi (həll olundu)\nINC002 - Email server gecikmə (həll olundu)\nINC003 - VPN timeout (həll olundu)',
      systemStatus: 'Normal',
      notes: 'Backup prosesi gecə 02:00-da uğurla tamamlandı.',
    },
    {
      id: 2,
      date: '12 Yanvar 2026, Bazar',
      time: '00:00 - 08:00',
      handoverTime: '08:00',
      status: 'Tamamlanıb',
      summary: 'Gecə növbəsi sakit keçdi. Monitoring sistemləri yoxlanıldı. Heç bir problem yoxdur.',
      problems: 'Heç bir problem yoxdur',
      acceptedBy: 'Rəşad Əliyev',
      incidents: 'Incident yoxdur',
      systemStatus: 'Normal',
      notes: 'Rutin yoxlamalar aparıldı. Bütün sistemlər stabil.',
    },
    {
      id: 3,
      date: '11 Yanvar 2026, Şənbə',
      time: '16:00 - 00:00',
      handoverTime: '00:00',
      status: 'Tamamlanıb',
      summary: 'Server yeniləmələri tamamlandı. Backup prosesi uğurla başa çatdı.',
      problems: '1 planned maintenance',
      acceptedBy: 'Günəl İbrahimova',
      incidents: 'Planned maintenance - Server yeniləmə',
      systemStatus: 'Normal',
      notes: 'Yeniləmə prosesi 2 saat çəkdi. Downtime minimuma endirildi.',
    },
    {
      id: 4,
      date: '10 Yanvar 2026, Cümə',
      time: '08:00 - 16:00',
      handoverTime: '16:05',
      status: 'Tamamlanıb',
      summary: 'Müştəri sorğuları cavablandırıldı. Network monitoring normal.',
      problems: '2 minor issues (resolved)',
      acceptedBy: 'Leyla Məmmədova',
      incidents: 'INC004 - Firewall rule update\nINC005 - SSL certificate renewal',
      systemStatus: 'Normal',
      notes: 'SSL sertifikat 3 ay üçün yeniləndi.',
    },
    {
      id: 5,
      date: '9 Yanvar 2026, Cümə axşamı',
      time: '00:00 - 08:00',
      handoverTime: '08:00',
      status: 'Tamamlanıb',
      summary: 'Gecə saatlarında rutin yoxlama aparıldı. Bütün sistemlər stabil.',
      problems: 'Heç bir problem yoxdur',
      acceptedBy: 'Rəşad Əliyev',
      incidents: 'Incident yoxdur',
      systemStatus: 'Normal',
      notes: 'Sakit növbə.',
    },
  ]

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleViewDetail = (item) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleDownload = (item) => {
    displayToast(`${item.date} tarixli hesabat yüklənir...`)
  }

  const handleExportAll = () => {
    displayToast('Bütün hesabatlar PDF formatında yüklənir...')
  }

  // Filter items
  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.acceptedBy.toLowerCase().includes(searchQuery.toLowerCase())
    
    // For demo, filter by week/month could check actual dates
    return matchesSearch
  })

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
        <button className="export-btn" onClick={handleExportAll}>
          <Download size={18} />
          <span>Export (PDF)</span>
        </button>
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
        {filteredItems.map((item, index) => (
          <div key={item.id} className="history-card animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="card-header">
              <h3 className="card-date">{item.date}</h3>
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
              <div className="detail-box accepted">
                <span className="detail-label">Növbəni Qəbul Edən</span>
                <span className="detail-value">{item.acceptedBy}</span>
              </div>
            </div>

            <div className="card-actions">
              <button className="view-btn" onClick={() => handleViewDetail(item)}>
                <Eye size={16} />
                <span>Ətraflı Bax</span>
              </button>
              <button className="download-btn" onClick={() => handleDownload(item)}>
                <Download size={16} />
                <span>Yüklə</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content large-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Təhvil-Təslim Detalları</h3>
                <span className="modal-subtitle">{selectedItem.date}</span>
              </div>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
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

              <div className="detail-section">
                <label>Əlavə Qeydlər</label>
                <div className="detail-box-full">
                  <p>{selectedItem.notes}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Bağla</button>
              <button className="btn-download" onClick={() => handleDownload(selectedItem)}>
                <Download size={16} />
                PDF Yüklə
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HandoverHistory
