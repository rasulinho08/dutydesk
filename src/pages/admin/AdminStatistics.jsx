import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, User, Search, Filter, Download } from "lucide-react";
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import "./AdminStatistics.css";

export default function AdminStatistics() {

  const token = localStorage.getItem('token') || ''
  const [dashboardData, setDashboardData] = useState(null)
  const [teams, setTeams] = useState([])

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

  const overview = dashboardData?.overview || {}
  const totalEmployees = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0)

  const totalShifts = (overview.todayShifts || 0)
  const completedShifts = (overview.completedHandovers || 0)
  const incompleteShifts = (overview.pendingHandovers || 0) + (overview.emptyShifts || 0)
  
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Umumi Statistika', 14, 20)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Tarix: ${new Date().toLocaleDateString('az-AZ')}`, 14, 28)
    
    // Add stats
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
    
    // Save PDF
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
          <input type="date" defaultValue="2025-11-27" />
          <span>→</span>
          <input type="date" defaultValue="2025-12-03" />

          <select>
            <option>Bütün Komandalar</option>
            <option>NOC</option>
            <option>APM</option>
            <option>SOC</option>
          </select>

          <select>
            <option>Həftəlik</option>
            <option>Günlük</option>
            <option>Aylıq</option>
            <option>Custom</option>
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
            <input placeholder="İşçi və ya qeyd axtar..." />
          </div>
          <div className="team-filter-wrapper">
            <Filter size={18} className="filter-icon" />
            <select>
              <option>Bütün Komandalar</option>
              <option>APM</option>
              <option>NOC</option>
              <option>SOC</option>
            </select>
          </div>
        </div>
      </div>

      {/* UPCOMING SHIFTS */}
      <div className="card-shifts">
        <h3>Gələcək Növbələr</h3>
        {[
          { team: "APM", color: "apm" },
          { team: "NOC", color: "noc" },
          { team: "SOC", color: "soc" },
        ].map((item, i) => (
          <div key={i} className="shift-item">
            <div className="shift-header">
              <div className={`badge ${item.color}`}>{item.team}</div>
              <span className="shift-date-stat">2026-02-03 &nbsp; 09:00 - 17:00</span>
            </div>
            <div className="employee-info">
              <User size={18} className="employee-icon" />
              <strong className="employee-name">Leyla Məmmədova</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
