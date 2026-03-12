import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, User, Search, Filter, Download } from "lucide-react";
import * as XLSX from 'xlsx'
import "./AdminStatistics.css";

export default function AdminStatistics() {

  const token = localStorage.getItem('token') || ''
  const [dashboardData, setDashboardData] = useState(null)
  const [teams, setTeams] = useState([])
  const [shiftHistory, setShiftHistory] = useState([])
  const [upcomingShifts, setUpcomingShifts] = useState([])

  // Filter state
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedTeam, setSelectedTeam] = useState('Bütün Komandalar')
  const [historySearch, setHistorySearch] = useState('')
  const [historyTeamFilter, setHistoryTeamFilter] = useState('Bütün Komandalar')

  // Fetch dashboard + teams (once)
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return
      try {
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          setDashboardData(json.data || {})
        }
      } catch (err) {
        console.error('Dashboard fetch xətası:', err)
      }
    }

    const fetchTeams = async () => {
      if (!token) return
      try {
        const res = await fetch('https://dutydesk-g3ma.onrender.com/api/admin/teams', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          setTeams(json.data || [])
        }
      } catch (err) {
        console.error('Teams fetch xətası:', err)
      }
    }

    fetchDashboard()
    fetchTeams()
  }, [token])

  // Helper: get team short name and color from teamName
  const getTeamInfo = (teamName) => {
    const name = (teamName || '').toLowerCase()
    if (name.includes('noc')) return { short: 'NOC', color: 'noc' }
    if (name.includes('soc')) return { short: 'SOC', color: 'soc' }
    if (name.includes('apm')) return { short: 'APM', color: 'apm' }
    return { short: teamName?.replace(/ Team$/i, '') || 'N/A', color: 'apm' }
  }

  // Helper: find team UUID by short name
  const getTeamId = (shortName) => {
    const teamObj = teams.find(t => t.name.toLowerCase().includes(shortName.toLowerCase()))
    return teamObj?.id || null
  }

  // Fetch shift history (past shifts) with filters
  useEffect(() => {
    const fetchShifts = async () => {
      if (!token) return
      try {
        const params = new URLSearchParams({
          from: dateFrom,
          to: dateTo,
          page: '1',
          limit: '50'
        })

        if (selectedTeam !== 'Bütün Komandalar') {
          const teamId = getTeamId(selectedTeam)
          if (teamId) params.set('team', teamId)
        }

        const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/shifts?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          console.log('shifts response:', json)
          if (json.success && json.data) {
            const shifts = json.data.shifts || json.data.items || json.data || []
            setShiftHistory(Array.isArray(shifts) ? shifts : [])
          }
        }
      } catch (err) {
        console.error('Shifts fetch xətası:', err)
      }
    }
    if (teams.length > 0 || selectedTeam === 'Bütün Komandalar') {
      fetchShifts()
    }
  }, [token, dateFrom, dateTo, selectedTeam, teams])

  // Fetch upcoming shifts (scheduled, from today forward)
  useEffect(() => {
    const fetchUpcoming = async () => {
      if (!token) return
      try {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date()
        nextMonth.setDate(nextMonth.getDate() + 30)
        const toDate = nextMonth.toISOString().split('T')[0]

        const params = new URLSearchParams({
          status: 'scheduled',
          from: today,
          to: toDate,
          page: '1',
          limit: '20'
        })

        const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/shifts?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (res.ok) {
          const json = await res.json()
          console.log('upcoming shifts response:', json)
          if (json.success && json.data) {
            const shifts = json.data.shifts || json.data.items || json.data || []
            setUpcomingShifts(Array.isArray(shifts) ? shifts : [])
          }
        }
      } catch (err) {
        console.error('Upcoming shifts fetch xətası:', err)
      }
    }
    fetchUpcoming()
  }, [token])

  const overview = dashboardData?.overview || {}
  const totalEmployees = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0)

  const totalShifts = (overview.todayShifts || 0)
  const completedShifts = (overview.completedHandovers || 0)
  const incompleteShifts = (overview.pendingHandovers || 0) + (overview.emptyShifts || 0)

  // Filter shift history for display
  const filteredHistory = shiftHistory.filter(s => {
    const teamInfo = getTeamInfo(s.teamName)
    const teamMatch = historyTeamFilter === 'Bütün Komandalar' ||
      teamInfo.short === historyTeamFilter
    const searchMatch = !historySearch ||
      (s.userName?.toLowerCase().includes(historySearch.toLowerCase())) ||
      (s.teamName?.toLowerCase().includes(historySearch.toLowerCase()))
    return teamMatch && searchMatch
  })

  // Filter upcoming shifts by header team filter
  const filteredUpcoming = selectedTeam === 'Bütün Komandalar'
    ? upcomingShifts
    : upcomingShifts.filter(s => getTeamInfo(s.teamName).short === selectedTeam)

  const handleExportExcel = () => {
    const wsData = filteredHistory.map(shift => {
      const teamInfo = getTeamInfo(shift.teamName)
      return {
        'Tarix': shift.date || '',
        'Komanda': teamInfo.short,
        'İşçi': shift.userName || 'N/A',
        'Növbə': `${shift.startTime || ''} - ${shift.endTime || ''}`,
        'Status': shift.typeLabel || shift.status || '',
      }
    })

    const ws = XLSX.utils.json_to_sheet(wsData)
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 16 }, { wch: 14 }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Növbə Tarixçəsi')
    XLSX.writeFile(wb, `statistika-${new Date().toLocaleDateString('az-AZ')}.xlsx`)
  }

  const stats = [
    {
      title: "Ümumi Növbələr (Bu ay)",
      value: totalShifts,
      trend: "up",
      color: "blue",
      icon: <Calendar size={25} className="text-calendar" />,
    },
    {
      title: "Tamamlanmış Növbələr",
      value: completedShifts,
      trend: "up",
      color: "green",
      icon: <CheckCircle size={25} />,
    },
    {
      title: "Tamamlanmamış növbələr",
      value: incompleteShifts,
      trend: "down",
      color: "red",
      icon: <XCircle size={25} />,
    },
    {
      title: "Cari işçi sayı",
      value: totalEmployees,
      trend: "up",
      color: "purple",
      icon: <Users size={25} />,
    },
  ];

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="page-header">
        <h2>Ümumi statistika</h2>

        <div className="filters">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span>→</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />

          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option>Bütün Komandalar</option>
            <option>APM</option>
            <option>NOC</option>
            <option>SOC</option>
          </select>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        {stats.map((item, i) => (
          <div key={i} className={`stat-card ${item.color}`}>
            <div className="stat-top">
              <div className={`stat-icon ${item.color}`}>{item.icon}</div>
              <div className={`stat-change ${item.trend} ${item.color}`}>
                {item.trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
            </div>
            <p className="stat-title">{item.title}</p>
            <h3 className="stat-value">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* HISTORY */}
      <div className="card">
        <div className="card-header-stat">
          <div>
            <h3>Növbə Tarixçəsi və Hesabatlar</h3>
            <p>Təhvil-təslim qeydləri və növbə məlumatları</p>
          </div>
          <button className="btn-export-stat excel" onClick={handleExportExcel}>
            <Download size={16} />
            Excel Export
          </button>
        </div>

        <div className="filters-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              placeholder="İşçi və ya qeyd axtar..."
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
            />
          </div>
          <div className="team-filter-wrapper">
            <Filter size={18} className="filter-icon" />
            <select value={historyTeamFilter} onChange={e => setHistoryTeamFilter(e.target.value)}>
              <option>Bütün Komandalar</option>
              <option>APM</option>
              <option>NOC</option>
              <option>SOC</option>
            </select>
          </div>
        </div>

        {/* Shift history list */}
        {filteredHistory.length > 0 ? (
          <div className="shift-history-list">
            {filteredHistory.map((shift, i) => {
              const teamInfo = getTeamInfo(shift.teamName)
              return (
                <div key={shift.id || i} className="shift-item">
                  <div className="shift-header">
                    <div className={`badge ${teamInfo.color}`}>{teamInfo.short}</div>
                    <span className="shift-date-stat">
                      {shift.date} &nbsp; {shift.startTime || ''} - {shift.endTime || ''}
                    </span>
                  </div>
                  <div className="employee-info">
                    <User size={18} className="employee-icon" />
                    <strong className="employee-name">{shift.userName || 'N/A'}</strong>
                    {shift.status && (
                      <span className={`status-badge-stat ${shift.status.toLowerCase()}`}>
                        {shift.typeLabel || shift.status}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ padding: '16px', color: '#888' }}>Tarixçə tapılmadı</p>
        )}
      </div>

      {/* UPCOMING SHIFTS */}
      <div className="card-shifts">
        <h3>Gələcək Növbələr</h3>
        {filteredUpcoming.length > 0 ? (
          filteredUpcoming.map((shift, i) => {
            const teamInfo = getTeamInfo(shift.teamName)
            return (
              <div key={shift.id || i} className="shift-item">
                <div className="shift-header">
                  <div className={`badge ${teamInfo.color}`}>{teamInfo.short}</div>
                  <span className="shift-date-stat">
                    {shift.date} &nbsp; {shift.startTime || ''} - {shift.endTime || ''}
                  </span>
                </div>
                <div className="employee-info">
                  <User size={18} className="employee-icon" />
                  <strong className="employee-name">{shift.userName || 'N/A'}</strong>
                </div>
              </div>
            )
          })
        ) : (
          <p style={{ padding: '16px', color: '#888' }}>Gələcək növbə tapılmadı</p>
        )}
      </div>
    </div>
  );
}
