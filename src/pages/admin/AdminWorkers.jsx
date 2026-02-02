import { useState, useEffect } from 'react'
import { 
  Search, Filter, Users, Mail, Phone, 
  MoreVertical, Edit, Trash2, Plus, X, Check, RefreshCw, UserPlus
} from 'lucide-react'
import './AdminWorkers.css'

function AdminWorkers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('Bütün Komandalar')
  const [selectedStatus, setSelectedStatus] = useState('Bütün Statuslar')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)

  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    phone: '',
    team: 'APM',
    status: 'Əlçatandır'
  })

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600)
  }, [])

  const [workers, setWorkers] = useState([
    { id: 1, name: 'Leyla Mammadova', email: 'leyla@company.az', phone: '+994 50 123 45 67', team: 'APM', status: 'Növbədə' },
    { id: 2, name: 'Rəşad İbrahimov', email: 'rashad@company.az', phone: '+994 50 234 56 78', team: 'APM', status: 'Əlçatandır' },
    { id: 3, name: 'Aynur Əliyeva', email: 'aynur@company.az', phone: '+994 50 345 67 89', team: 'NOC', status: 'İstirahətdə' },
    { id: 4, name: 'Kamran Hüseynov', email: 'kamran@company.az', phone: '+994 50 456 78 90', team: 'NOC', status: 'Növbədə' },
    { id: 5, name: 'Nərmin Quliyeva', email: 'narmin@company.az', phone: '+994 50 567 89 01', team: 'SOC', status: 'Əlçatandır' },
    { id: 6, name: 'Tural Məmmədov', email: 'tural@company.az', phone: '+994 50 678 90 12', team: 'SOC', status: 'Əlçatandır' }
  ])

  const stats = [
    { label: 'Ümumi İşçi', value: workers.length, icon: Users, color: '#1e5a8a' },
    { label: 'APM Komandası', sublabel: `${workers.filter(w => w.team === 'APM' && w.status === 'Növbədə').length} növbədə`, value: workers.filter(w => w.team === 'APM').length, color: '#1e5a8a' },
    { label: 'NOC Komandası', sublabel: `${workers.filter(w => w.team === 'NOC' && w.status === 'Növbədə').length} növbədə`, value: workers.filter(w => w.team === 'NOC').length, color: '#22c55e' },
    { label: 'SOC Komandası', sublabel: `${workers.filter(w => w.team === 'SOC' && w.status === 'Növbədə').length} növbədə`, value: workers.filter(w => w.team === 'SOC').length, color: '#a855f7' }
  ]

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam = selectedTeam === 'Bütün Komandalar' || worker.team === selectedTeam
    const matchesStatus = selectedStatus === 'Bütün Statuslar' || worker.status === selectedStatus
    return matchesSearch && matchesTeam && matchesStatus
  })

  const displayToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAddWorker = () => {
    if (!newWorker.name || !newWorker.email) {
      displayToast('Ad və email daxil edin!')
      return
    }
    const worker = {
      id: Date.now(),
      ...newWorker
    }
    setWorkers([...workers, worker])
    setShowAddModal(false)
    setNewWorker({ name: '', email: '', phone: '', team: 'APM', status: 'Əlçatandır' })
    displayToast('İşçi uğurla əlavə edildi!')
  }

  const handleEditWorker = () => {
    setWorkers(workers.map(w => w.id === selectedWorker.id ? selectedWorker : w))
    setShowEditModal(false)
    displayToast('İşçi məlumatları yeniləndi!')
  }

  const handleDeleteWorker = () => {
    setWorkers(workers.filter(w => w.id !== selectedWorker.id))
    setShowDeleteModal(false)
    displayToast('İşçi silindi!')
  }

  const openEditModal = (worker) => {
    setSelectedWorker({...worker})
    setShowEditModal(true)
    setActiveDropdown(null)
  }

  const openDeleteModal = (worker) => {
    setSelectedWorker(worker)
    setShowDeleteModal(true)
    setActiveDropdown(null)
  }

  const getAvatarColor = (status) => {
    switch(status) {
      case 'Növbədə': return '#1e5a8a'
      case 'Əlçatandır': return '#22c55e'
      case 'İstirahətdə': return '#6b7280'
      default: return '#1e5a8a'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Növbədə': return { bg: '#dbeafe', color: '#1e5a8a' }
      case 'Əlçatandır': return { bg: '#dcfce7', color: '#16a34a' }
      case 'İstirahətdə': return { bg: '#f3f4f6', color: '#6b7280' }
      default: return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  if (isLoading) {
    return (
      <div className="admin-workers loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>İşçilər yüklənir...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-workers">
      {/* Toast */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>

      {/* Stats Cards */}
      <div className="workers-stats">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card animate-slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              {stat.sublabel && <span className="stat-sublabel">{stat.sublabel}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-row animate-fade-in">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="İşçi axtar..."
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
          <Filter size={16} />
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option>Bütün Statuslar</option>
            <option>Növbədə</option>
            <option>Əlçatandır</option>
            <option>İstirahətdə</option>
          </select>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          Yeni İşçi
        </button>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {filteredWorkers.length} İşçi göstərilir
      </div>

      {/* Workers Grid */}
      <div className="workers-grid">
        {filteredWorkers.map((worker, idx) => {
          const statusStyle = getStatusColor(worker.status)
          return (
            <div 
              key={worker.id} 
              className="worker-card animate-scale-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="card-header">
                <div 
                  className="worker-avatar"
                  style={{ backgroundColor: getAvatarColor(worker.status) }}
                >
                  {worker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="worker-info">
                  <h4>{worker.name}</h4>
                  <span 
                    className="worker-status"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                  >
                    {worker.status}
                  </span>
                </div>
                <div className="card-menu">
                  <button 
                    className="menu-btn"
                    onClick={() => setActiveDropdown(activeDropdown === worker.id ? null : worker.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {activeDropdown === worker.id && (
                    <div className="dropdown-menu animate-fade-in">
                      <button onClick={() => openEditModal(worker)}>
                        <Edit size={14} />
                        Redaktə et
                      </button>
                      <button className="danger" onClick={() => openDeleteModal(worker)}>
                        <Trash2 size={14} />
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="info-row team">
                  <Users size={14} />
                  <span className="team-badge">{worker.team}</span>
                </div>
                <div className="info-row">
                  <Mail size={14} />
                  <span>{worker.email}</span>
                </div>
                <div className="info-row">
                  <Phone size={14} />
                  <span>{worker.phone}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Yeni İşçi Əlavə Et</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Ad Soyad</label>
                <input 
                  type="text" 
                  value={newWorker.name}
                  onChange={e => setNewWorker({...newWorker, name: e.target.value})}
                  placeholder="Ad Soyad daxil edin"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={newWorker.email}
                  onChange={e => setNewWorker({...newWorker, email: e.target.value})}
                  placeholder="Email daxil edin"
                />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input 
                  type="text" 
                  value={newWorker.phone}
                  onChange={e => setNewWorker({...newWorker, phone: e.target.value})}
                  placeholder="+994 XX XXX XX XX"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Komanda</label>
                  <select 
                    value={newWorker.team}
                    onChange={e => setNewWorker({...newWorker, team: e.target.value})}
                  >
                    <option>APM</option>
                    <option>NOC</option>
                    <option>SOC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={newWorker.status}
                    onChange={e => setNewWorker({...newWorker, status: e.target.value})}
                  >
                    <option>Əlçatandır</option>
                    <option>Növbədə</option>
                    <option>İstirahətdə</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleAddWorker}>
                <Plus size={16} />
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWorker && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>İşçi Redaktə Et</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Ad Soyad</label>
                <input 
                  type="text" 
                  value={selectedWorker.name}
                  onChange={e => setSelectedWorker({...selectedWorker, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={selectedWorker.email}
                  onChange={e => setSelectedWorker({...selectedWorker, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input 
                  type="text" 
                  value={selectedWorker.phone}
                  onChange={e => setSelectedWorker({...selectedWorker, phone: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Komanda</label>
                  <select 
                    value={selectedWorker.team}
                    onChange={e => setSelectedWorker({...selectedWorker, team: e.target.value})}
                  >
                    <option>APM</option>
                    <option>NOC</option>
                    <option>SOC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={selectedWorker.status}
                    onChange={e => setSelectedWorker({...selectedWorker, status: e.target.value})}
                  >
                    <option>Əlçatandır</option>
                    <option>Növbədə</option>
                    <option>İstirahətdə</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleEditWorker}>
                <Check size={16} />
                Yadda saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWorker && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>İşçini Sil</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={48} />
                <p><strong>{selectedWorker.name}</strong> adlı işçini silmək istədiyinizdən əminsiniz?</p>
                <span>Bu əməliyyat geri qaytarıla bilməz.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Ləğv et</button>
              <button className="btn-danger" onClick={handleDeleteWorker}>
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWorkers
