import { useState, useEffect, useRef } from 'react'
import {
  Search, Filter, Users, Mail, Phone,
  MoreVertical, Edit, Trash2, Plus, X, Check, RefreshCw, UserPlus
} from 'lucide-react'
import './AdminWorkers.css'

function AdminWorkers() {
  const [workers, setWorkers] = useState([])
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('Bütün Komandalar')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)

  const dropdownRef = useRef(null)
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/teams', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setTeams(json.data);
        }
      } catch (err) {
        console.error("Komandalar yüklənmədi", err);
      }
    };
    fetchTeams();
  }, []);
  const [newWorker, setNewWorker] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    teamId: '',
    role: 'employee'
  });
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem('token')

        const response = await fetch(
          'https://dutydesk-g3ma.onrender.com/api/admin/users?page=1&limit=50',
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          }
        )

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Giriş etmək lazımdır (401)')
          }
          throw new Error(`Server xətası: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'API xətası')
        }

        const mappedEmployees = result.data.users
          .filter(user =>
            user.role === 'employee' &&
            user.isActive === true
          )
          .map(user => ({
            id: user.id,
            name: `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim(),
            email: user.email,
            phone: user.phone || '+994 XX XXX XX XX',
            team: user.team?.name?.replace(/ Team$/i, '') || 'Digər',
            status: 'Əlçatandır'
          }))

        setWorkers(mappedEmployees)
      } catch (err) {
        console.error('Fetch xətası:', err)
        setError(err.message || 'İşçilər yüklənə bilmədi')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkers()
  }, [])

  // Dropdown xaricə klik → bağlanır
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowTeamDropdown(false)
      }
    }
    if (showTeamDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTeamDropdown])

  // Toast göstərmə
  const displayToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Filtrlənmiş işçilər
  const filteredWorkers = workers.filter(w => {
    const searchMatch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase())
    const teamMatch = selectedTeam === 'Bütün Komandalar' || w.team === selectedTeam
    return searchMatch && teamMatch
  })

  // Stats - backend teams API-dən gələn memberCount ilə
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

  const stats = [
    { label: 'Ümumi İşçi', value: totalEmployees, color: '#155DFC' },
    { label: 'APM Komandası', value: getTeamMemberCount('APM'), bg: '#1380AF' },
    { label: 'NOC Komandası', value: getTeamMemberCount('NOC'), bg: '#1D984B' },
    { label: 'SOC Komandası', value: getTeamMemberCount('SOC'), bg: '#7F38B2' },
  ]


  const handleAddWorker = async () => {
    if (!newWorker.firstName.trim() || !newWorker.lastName.trim()) {
      displayToast('Ad və soyad daxil edilməlidir!');
      return;
    }
    if (!newWorker.email.trim()) {
      displayToast('Email mütləqdir!');
      return;
    }
    if (!newWorker.phone || !/^\d{9}$/.test(newWorker.phone)) {
      displayToast('Telefon nömrəsi düzgün 9 rəqəm olmalıdır (məsələn: 501234567)');
      return;
    }
    if (!newWorker.password || newWorker.password.length < 6) {
      displayToast('Şifrə ən azı 6 simvol olmalıdır!');
      return;
    }
    if (!newWorker.teamId && newWorker.role === 'employee') {
      displayToast('Komanda seçilməlidir!');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },

        body: JSON.stringify({
          firstName: newWorker.firstName.trim(),
          lastName: newWorker.lastName.trim(),
          email: newWorker.email.trim(),
          phone: `+994${newWorker.phone}`,
          password: newWorker.password,
          role: newWorker.role,
          ...(newWorker.teamId && { teamId: newWorker.teamId }),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'İşçi əlavə edilə bilmədi');
      }

      // Uğurlu olduqda
      displayToast('İşçi uğurla əlavə edildi!');

      // Modalı bağla
      setShowAddModal(false);

      // Formu sıfırla
      setNewWorker({
        firstName: '', lastName: '', email: '', phone: '', password: '', teamId: '', role: 'employee'
      });

      // Siyahını yenilə 
      window.location.reload();

    } catch (err) {
      console.error('Əlavə xətası:', err);
      displayToast(err.message || 'Xəta baş verdi');
    }
  };

  const handleEditWorker = () => {
    if (!selectedWorker) return
    setWorkers(prev =>
      prev.map(w => (w.id === selectedWorker.id ? { ...selectedWorker } : w))
    )
    setShowEditModal(false)
    displayToast('Məlumatlar yeniləndi!')
  }

  const handleDeleteWorker = () => {
    if (!selectedWorker) return
    setWorkers(prev => prev.filter(w => w.id !== selectedWorker.id))
    setShowDeleteModal(false)
    displayToast('İşçi silindi!')
  }


  const getAvatarColor = team => {
    const colors = { APM: '#1380AF', NOC: '#1D984B', SOC: '#7F38B2' }
    return colors[team] || '#1e5a8a'
  }

  const getStatusColor = status => {
    const styles = {
      'Növbədə': { bg: '#dbeafe', color: '#1e40af' },
      'Əlçatandır': { bg: '#dcfce7', color: '#166534' },
      'İstirahətdə': { bg: '#f3f4f6', color: '#4b5563' },
      'Deaktiv': { bg: '#fee2e2', color: '#991b1b' },
    }
    return styles[status] || { bg: '#f3f4f6', color: '#6b7280' }
  }

  const openEditModal = worker => {
    setSelectedWorker({ ...worker })
    setShowEditModal(true)
    setActiveDropdown(null)
  }

  const openDeleteModal = worker => {
    setSelectedWorker(worker)
    setShowDeleteModal(true)
    setActiveDropdown(null)
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

      {/* Page Header */}
      <div className="page-header-workers">
        <div className="header-left">
          <div className="header-icon">
            <Users size={24} />
          </div>
          <h1>İşçilər</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="workers-stats">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card-workers animate-slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <span className="stat-value-workers">{stat.value}</span>
            <div className="stat-info-workers">
              <div className="stat-icon" style={{ color: stat.color || 'white', backgroundColor: stat.bg || '', marginBottom: "15px" }}>
                <Users size={24} />
              </div>
              <span className="stat-label-workers">{stat.label}</span>
              {stat.sublabel && <span className="stat-sublabel">{stat.sublabel}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-row-workers animate-fade-in">
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
      </div>

      {/* Results Count */}
      <div className="results-count">
        <span>{filteredWorkers.length} İşçi göstərilir</span>
        <button className="btn-add-employee" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Employee
        </button>
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
                  style={{ backgroundColor: getAvatarColor(worker.team) }}
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
                {/* <div className="card-menu">
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
                </div> */}
              </div>
              <div className="card-body">
                <div className="info-row team">
                  <Users size={14} />
                  <span className={`team-badge-workers ${worker.team}`}>{worker.team}</span>
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
                <label>Ad</label>
                <input
                  type="text"
                  value={newWorker.firstName}
                  onChange={e => setNewWorker({ ...newWorker, firstName: e.target.value })}
                  placeholder="Ad"
                />
              </div>

              <div className="form-group">
                <label>Soyad</label>
                <input
                  type="text"
                  value={newWorker.lastName}
                  onChange={e => setNewWorker({ ...newWorker, lastName: e.target.value })}
                  placeholder="Soyad"
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={newWorker.email}
                  onChange={e => setNewWorker({ ...newWorker, email: e.target.value })}
                  placeholder="email@company.az"
                />
              </div>

              <div className="form-group">
                <label>Telefon nömrəsi</label>
                <div className="phone-input-container">
                  <div className="phone-prefix">+994</div>
                  <input
                    type="tel"
                    className="phone-input"
                    value={newWorker.phone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length > 9) val = val.slice(0, 9);
                      setNewWorker({ ...newWorker, phone: val });
                    }}
                    placeholder="501234567"
                    maxLength={9}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel-national"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Şifrə</label>
                <input
                  type="password"
                  value={newWorker.password}
                  onChange={e => setNewWorker({ ...newWorker, password: e.target.value })}
                  placeholder="********"
                />
              </div>

              <div className="form-group">
                <label>Komanda</label>
                <select
                  value={newWorker.teamId}
                  onChange={e => setNewWorker({ ...newWorker, teamId: e.target.value })}
                >
                  <option value="">Komanda seçin</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name.replace(' Team', '')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  value={newWorker.role}
                  onChange={e => setNewWorker({ ...newWorker, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleAddWorker}>
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
                  onChange={e => setSelectedWorker({ ...selectedWorker, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedWorker.email}
                  onChange={e => setSelectedWorker({ ...selectedWorker, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="text"
                  value={selectedWorker.phone}
                  onChange={e => setSelectedWorker({ ...selectedWorker, phone: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Komanda</label>
                  <select
                    value={selectedWorker.team}
                    onChange={e => setSelectedWorker({ ...selectedWorker, team: e.target.value })}
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
                    onChange={e => setSelectedWorker({ ...selectedWorker, status: e.target.value })}
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
