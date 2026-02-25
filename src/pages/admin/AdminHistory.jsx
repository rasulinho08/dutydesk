import { useState, useEffect } from 'react'
import { 
  Search, Filter, Calendar, Download, Eye, X, User, 
  FileText, Clock, ChevronDown, RefreshCw, Check
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import './AdminHistory.css'

function AdminHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('Bütün Komandalar')
  const [selectedPeriod, setSelectedPeriod] = useState('Bu ay')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600)
  }, [])

  const [historyRecords, setHistoryRecords] = useState([
    {
      id: 1,
      team: 'APM',
      date: '2026-01-11',
      time: '08:00 - 20:00',
      worker: 'Leyla Məmmədova',
      submittedAt: '2026 M01 11 21:33',
      systemStatus: 'Bütün sistemlər normal işləyir. CPU istifadəsi 45%, Memory 62%.',
      incidents: '3 incident hall olundu. 1 kritik (database bağlantı problemi), 2 orta səviyyəli...',
      completedTasks: 'Server yeniləmələri tamamlandı. Monitoring konfiqurasiyası yeniləndi.',
      pendingTasks: 'Database backup schedule yenidən planlaşdırılmalıdır.',
      notes: 'Sabah səhər APM tool update ediləcək.'
    },
    {
      id: 2,
      team: 'NOC',
      date: '2026-01-11',
      time: '08:00 - 20:00',
      worker: 'Leyla Məmmədova',
      submittedAt: '2026 M01 11 21:33',
      systemStatus: 'Bütün sistemlər normal işləyir. CPU istifadəsi 45%, Memory 62%.',
      incidents: '3 incident hall olundu.',
      completedTasks: 'Server yeniləmələri tamamlandı.',
      pendingTasks: 'Database backup schedule yenidən planlaşdırılmalıdır.',
      notes: ''
    },
    {
      id: 3,
      team: 'SOC',
      date: '2026-01-11',
      time: '08:00 - 20:00',
      worker: 'Rəşad İbrahimov',
      submittedAt: '2026 M01 11 21:33',
      systemStatus: 'Network performansı optimal. Laency <5 ms.',
      incidents: 'Heç bir incident olmayıb.',
      completedTasks: 'Firewall rules yeniləndi.',
      pendingTasks: '',
      notes: ''
    }
  ])

  const filteredRecords = historyRecords.filter(record => {
    const matchesSearch = record.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.systemStatus.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam = selectedTeam === 'Bütün Komandalar' || record.team === selectedTeam
    return matchesSearch && matchesTeam
  })

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text('Novbe Tarixcesi ve Hesabatlar', 14, 20)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Tarix: ${new Date().toLocaleDateString('az-AZ')}`, 14, 28)
    doc.text(`Filter: ${selectedTeam} | ${selectedPeriod}`, 14, 34)
    
    // Prepare table data
    const tableData = filteredRecords.map(record => [
      record.date,
      record.team,
      record.worker,
      record.time,
      record.systemStatus.substring(0, 50) + '...',
      record.submittedAt
    ])
    
    // Add table
    doc.autoTable({
      startY: 40,
      head: [['Tarix', 'Komanda', 'Isci', 'Novbe', 'Sistem Statusu', 'Tehvil Tarixi']],
      body: tableData,
      styles: { 
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [19, 128, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 }
    })
    
    // Save PDF
    doc.save(`novbe-tarixcesi-${new Date().toLocaleDateString('az-AZ')}.pdf`)
    displayToast('PDF yuklendi!')
  }

  const handleExportExcel = () => {
    displayToast('Excel formatında yüklənir...')
  }

  const handleDownloadPDF = () => {
    if (!selectedRecord) return
    
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text('Tehvil-Teslim Qeydi', 14, 20)
    
    // Add metadata
    doc.setFontSize(11)
    doc.text(`Komanda: ${selectedRecord.team}`, 14, 32)
    doc.text(`Tarix: ${selectedRecord.date}`, 14, 40)
    doc.text(`Novbe Vaxti: ${selectedRecord.time}`, 14, 48)
    doc.text(`Isci: ${selectedRecord.worker}`, 14, 56)
    doc.text(`Tehvil Tarixi: ${selectedRecord.submittedAt}`, 14, 64)
    
    // Add sections
    let yPos = 76
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Sistem Statusu:', 14, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const statusLines = doc.splitTextToSize(selectedRecord.systemStatus, 180)
    doc.text(statusLines, 14, yPos + 8)
    yPos += statusLines.length * 6 + 12
    
    if (selectedRecord.incidents) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Incident-ler:', 14, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const incidentLines = doc.splitTextToSize(selectedRecord.incidents, 180)
      doc.text(incidentLines, 14, yPos + 8)
      yPos += incidentLines.length * 6 + 12
    }
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Tamamlanmis Tapsiriglar:', 14, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const completedLines = doc.splitTextToSize(selectedRecord.completedTasks, 180)
    doc.text(completedLines, 14, yPos + 8)
    yPos += completedLines.length * 6 + 12
    
    if (selectedRecord.pendingTasks) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Gozleyen Tapsiriglar:', 14, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const pendingLines = doc.splitTextToSize(selectedRecord.pendingTasks, 180)
      doc.text(pendingLines, 14, yPos + 8)
      yPos += pendingLines.length * 6 + 12
    }
    
    if (selectedRecord.notes) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Elave Qeydler:', 14, yPos)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const notesLines = doc.splitTextToSize(selectedRecord.notes, 180)
      doc.text(notesLines, 14, yPos + 8)
    }
    
    // Save PDF
    doc.save(`tehvil-qeydi-${selectedRecord.team}-${selectedRecord.date}.pdf`)
    displayToast('Qeyd PDF olaraq yuklendi!')
    setShowDetailModal(false)
  }

  if (isLoading) {
    return (
      <div className="admin-history loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Tarixçə yüklənir...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-history">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>

      {/* Header */}
      <div className="history-header animate-fade-in">
        <div className="header-left">
          <h1>Növbə Tarixçəsi və Hesabatlar</h1>
          <p>Təhvil-təslim qeydləri və növbə məlumatları</p>
        </div>
        <div className="header-actions">
          <button className="btn-export pdf" onClick={handleExportPDF}>
            <Download size={16} />
            PDF Export
          </button>
          <button className="btn-export excel" onClick={handleExportExcel}>
            <Download size={16} />
            Excel Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="İşçi və ya qeyd axtar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <Filter size={16} />
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option>Bütün Komandalar</option>
            <option>APM</option>
            <option>NOC</option>
            <option>SOC</option>
          </select>
        </div>
        <div className="filter-dropdown">
          <Calendar size={16} />
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            <option>Bu ay</option>
            <option>Bu həftə</option>
            <option>Bugün</option>
            <option>Custom</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {filteredRecords.length} nəticə tapıldı
      </div>

      {/* History List */}
      <div className="history-list">
        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>Heç bir nəticə tapılmadı</p>
          </div>
        ) : (
          filteredRecords.map((record, idx) => (
            <div 
              key={record.id} 
              className="history-card animate-slide-in"
              style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
            >
              <div className="card-header">
                <span className={`team-badge ${record.team.toLowerCase()}`}>{record.team}</span>
                <span className="date-info">{record.date} {record.time}</span>
              </div>
              <div className="card-body">
                <div className="worker-info">
                  <User size={16} />
                  <span>{record.worker}</span>
                </div>
                <div className="submission-info">
                  Təhvil tarixi: {record.submittedAt}
                </div>
                <div className="status-preview">
                  <strong>Sistem Statusu:</strong>
                  <p>{record.systemStatus}</p>
                </div>
                {record.incidents && (
                  <div className="incidents-preview">
                    <strong>Incident-lər:</strong>
                    <p>{record.incidents}</p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button className="view-btn" onClick={() => handleViewDetail(record)}>
                  <Eye size={16} />
                  Bax
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Təhvil-Təslim Qeydi Detalları</h3>
                <span>{selectedRecord.team} • {selectedRecord.date} • {selectedRecord.time}</span>
              </div>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section animate-slide-in">
                <div className="detail-label">
                  <User size={16} />
                  İşçi
                </div>
                <div className="detail-value">{selectedRecord.worker}</div>
              </div>

              <div className="detail-section animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <div className="detail-label">Tamamlanmış Tapşırıqlar</div>
                <div className="detail-box">{selectedRecord.completedTasks}</div>
              </div>

              <div className="detail-section animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <div className="detail-label">Gözləyən Tapşırıqlar</div>
                <div className="detail-box">{selectedRecord.pendingTasks || 'Yoxdur'}</div>
              </div>

              <div className="detail-section animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <div className="detail-label">Sistem Statusu</div>
                <div className="detail-box">{selectedRecord.systemStatus}</div>
              </div>

              <div className="detail-section animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <div className="detail-label">Əlavə Qeydlər</div>
                <div className="detail-box">{selectedRecord.notes || 'Yoxdur'}</div>
              </div>

              <div className="submission-time">
                Təhvil tarixi: {selectedRecord.submittedAt}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Bağla</button>
              <button className="btn-confirm" onClick={handleDownloadPDF}>
                <Download size={16} />
                PDF olaraq yüklə
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminHistory
