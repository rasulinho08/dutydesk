import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, User, Search, Filter, Download, Clock } from "lucide-react";
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import "./AdminStatistics.css";

export default function AdminStatistics() {

  const token = localStorage.getItem('token') || ''
  const [dashboardData, setDashboardData] = useState(null)
  const [teams, setTeams] = useState([])
  const [upcomingShifts, setUpcomingShifts] = useState([])
  const [shiftHistory, setShiftHistory] = useState([])

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
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

  // Fetch shift history with filters
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

        // Find team UUID if a specific team is selected
        if (selectedTeam !== 'Bütün Komandalar') {
          const teamObj = teams.find(t => {
            const n = t.name.toLowerCase()
            return n.includes(selectedTeam.toLowerCase())
          })
          if (teamObj) params.set('team', teamObj.id)
        }

        const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/shifts?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            setShiftHistory(json.data?.shifts || json.data?.items || [])
          }
        }
      } catch (err) {
        console.error('Shifts fetch xətası:', err)
      }
    }
    fetchShifts()
  }, [token, dateFrom, dateTo, selectedTeam, teams])

  // Fetch upcoming shifts from schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!token) return
      try {
        const now = new Date()
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
        const week = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`

        const res = await fetch(`https://dutydesk-g3ma.onrender.com/api/admin/schedules?week=${week}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data?.days) {
            const shifts = []
            const today = new Date().toISOString().split('T')[0]
            json.data.days.forEach(dayData => {
              if (dayData.date >= today) {
                const shiftTypes = { day: '08:00 - 16:00', evening: '16:00 - 00:00', night: '00:00 - 08:00' }
                Object.entries(shiftTypes).forEach(([type, time]) => {
                  const shiftList = dayData.shifts?.[type] || []
                  shiftList.forEach(s => {
                    const teamShort = s.teamName?.replace(/ Team$/i, '') || 'APM'
                    shifts.push({
                      date: dayData.date,
                      time,
                      team: teamShort,
                      teamColor: teamShort.toLowerCase() === 'noc' ? 'noc' :
                        teamShort.toLowerCase() === 'soc' ? 'soc' : 'apm',
                      worker: s.userName || 'N/A'
                    })
                  })
                })
              }
            })
            setUpcomingShifts(shifts)
          }
        }
      } catch (err) {
        console.error('Schedules fetch xətası:', err)
      }
    }
    fetchSchedules()
  }, [token])

  const overview = dashboardData?.overview || {}
  const totalEmployees = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0)

  const totalShifts = (overview.todayShifts || 0)
  const completedShifts = (overview.completedHandovers || 0)
  const incompleteShifts = (overview.pendingHandovers || 0) + (overview.emptyShifts || 0)

  // Filter shift history for display
  const filteredHistory = shiftHistory.filter(s => {
    const teamMatch = historyTeamFilter === 'Bütün Komandalar' ||
      (s.teamName?.toLowerCase().includes(historyTeamFilter.toLowerCase()))
    const searchMatch = !historySearch ||
      (s.userName?.toLowerCase().includes(historySearch.toLowerCase())) ||
      (s.teamName?.toLowerCase().includes(historySearch.toLowerCase()))
    return teamMatch && searchMatch
  })

  // Filter upcoming shifts by selected team
  const filteredUpcoming = selectedTeam === 'Bütün Komandalar'
    ? upcomingShifts
    : upcomingShifts.filter(s => s.team === selectedTeam)

  const handleExportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text('Umumi Statistika', 14, 20)

    doc.setFontSize(10)
    doc.text(`Tarix: ${new Date().toLocaleDateString('az-AZ')}`, 14, 28)

    doc.setFontSize(14)
    doc.text('Statistik Melumatlar', 14, 40)

    const statsData = stats.map(stat => [
      stat.title,
      stat.value.toString()
    ])

    doc.autoTable({
      startY: 45,
      head: [['Gostrici', 'Deyer']],
      body: statsData,
      styles: {
        font: 'helvetica',
        fontSize: 10
      },
      headStyles: {
        fillColor: [19, 128, 175],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    doc.save(`statistika-${new Date().toLocaleDateString('az-AZ')}.pdf`)
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
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <span>→</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />

          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option>Bütün Komandalar</option>
            <option>NOC</option>
            <option>APM</option>
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
                {item.trend === "up" ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
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
          <button className="btn-export-stat" onClick={handleExportPDF}>
            <Download size={16} />
            PDF Export
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
              const teamShort = shift.teamName?.replace(/ Team$/i, '') || 'N/A'
              const teamColor = teamShort.toLowerCase() === 'noc' ? 'noc' :
                teamShort.toLowerCase() === 'soc' ? 'soc' : 'apm'
              return (
                <div key={shift.id || i} className="shift-item">
                  <div className="shift-header">
                    <div className={`badge ${teamColor}`}>{teamShort}</div>
                    <span className="shift-date-stat">
                      {shift.date} &nbsp; {shift.startTime || ''} - {shift.endTime || ''}
                    </span>
                  </div>
                  <div className="employee-info">
                    <User size={18} className="employee-icon" />
                    <strong className="employee-name">{shift.userName || 'N/A'}</strong>
                    <span className={`status-badge-stat ${shift.status?.toLowerCase()}`}>
                      {shift.status || ''}
                    </span>
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
          filteredUpcoming.map((shift, i) => (
            <div key={i} className="shift-item">
              <div className="shift-header">
                <div className={`badge ${shift.teamColor}`}>{shift.team}</div>
                <span className="shift-date-stat">{shift.date} &nbsp; {shift.time}</span>
              </div>
              <div className="employee-info">
                <User size={18} className="employee-icon" />
                <strong className="employee-name">{shift.worker}</strong>
              </div>
            </div>
          ))
        ) : (
          <p style={{ padding: '16px', color: '#888' }}>Gələcək növbə tapılmadı</p>
        )}
      </div>
    </div>
  );
}
