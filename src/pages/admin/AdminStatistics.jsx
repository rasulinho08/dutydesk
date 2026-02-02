import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Calendar, Users, CheckCircle, 
  XCircle, Clock, ChevronDown, RefreshCw
} from 'lucide-react'
import './AdminStatistics.css'

function AdminStatistics() {
  const [dateRange, setDateRange] = useState({ start: '2025-11-27', end: '2025-12-03' })
  const [selectedTeam, setSelectedTeam] = useState('NOC')
  const [period, setPeriod] = useState('Həftəlik')
  const [isLoading, setIsLoading] = useState(true)
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0])
  const [hoveredStat, setHoveredStat] = useState(null)

  const stats = [
    { label: 'Ümumi Növbələr (Bu ay)', value: 666, change: '+12%', trend: 'up', color: '#1e5a8a' },
    { label: 'Tamamlanmış Növbələr', value: 654, change: '+5%', trend: 'up', color: '#22c55e' },
    { label: 'Tamamlanmamış növbələr', value: 9, change: '-8%', trend: 'down', color: '#ef4444' },
    { label: 'Cari işçi sayı', value: 17, change: '+2%', trend: 'up', color: '#a855f7' }
  ]

  const teamDistribution = [
    { team: 'NOC', count: 222, percentage: 33, color: '#1e5a8a' },
    { team: 'APM', count: 150, percentage: 20, color: '#22c55e' },
    { team: 'SOC', count: 216, percentage: 32, color: '#a855f7' }
  ]

  const [workerPerformance, setWorkerPerformance] = useState([
    { name: 'Leyla', total: 204, completed: 200 },
    { name: 'Murad', total: 204, completed: 200 },
    { name: 'Rəşad', total: 204, completed: 200 },
    { name: 'Aysel', total: 204, completed: 200 },
    { name: 'Sənan', total: 204, completed: 200 }
  ])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 600)
    
    // Animate numbers
    stats.forEach((stat, idx) => {
      let current = 0
      const increment = stat.value / 30
      const timer = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          current = stat.value
          clearInterval(timer)
        }
        setAnimatedStats(prev => {
          const newStats = [...prev]
          newStats[idx] = Math.floor(current)
          return newStats
        })
      }, 30)
    })
  }, [])

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Simulate data refresh
      setWorkerPerformance(prev => prev.map(w => ({
        ...w,
        completed: Math.floor(Math.random() * 10) + 195
      })))
    }, 800)
  }

  if (isLoading) {
    return (
      <div className="admin-statistics loading-state">
        <div className="loader">
          <RefreshCw size={32} className="spin" />
          <span>Statistika yüklənir...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-statistics">
      {/* Header */}
      <div className="stats-header animate-fade-in">
        <h1>Ümumi statistika</h1>
        <div className="header-filters">
          <div className="date-range">
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            <span>-</span>
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="team-select">
            <option value="NOC">NOC</option>
            <option value="APM">APM</option>
            <option value="SOC">SOC</option>
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="period-select">
            <option value="Həftəlik">Həftəlik</option>
            <option value="Aylıq">Aylıq</option>
            <option value="Günlük">Günlük</option>
          </select>
          <button className="refresh-btn" onClick={refreshData}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className={`stat-card animate-scale-in ${hoveredStat === idx ? 'hovered' : ''}`}
            style={{ backgroundColor: stat.color, animationDelay: `${idx * 0.1}s` }}
            onMouseEnter={() => setHoveredStat(idx)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="stat-icon">
              {idx === 0 && <Calendar size={20} />}
              {idx === 1 && <CheckCircle size={20} />}
              {idx === 2 && <XCircle size={20} />}
              {idx === 3 && <Users size={20} />}
            </div>
            <div className={`stat-change ${stat.trend}`}>
              {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {stat.change}
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{animatedStats[idx]}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Completion Chart */}
        <div className="chart-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3>Tamamlıq və natamamlıq göstəriciləri</h3>
          <div className="donut-chart">
            <div className="donut-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="12"
                  strokeDasharray="236.88 251.2"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="donut-progress"
                />
              </svg>
              <div className="donut-center">
                <span className="donut-percentage animated-number">94%</span>
              </div>
            </div>
            <div className="chart-tooltip">
              <div className="tooltip-item">
                <strong>Komanda: {selectedTeam}</strong>
                <p>Tamam: 360</p>
                <p>Natamam: 204</p>
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <span><span className="dot green"></span> Tamam</span>
            <span><span className="dot gray"></span> Natamam</span>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3>Komanda Növbə Bölgüsü</h3>
          <div className="pie-chart">
            <div className="pie-visual">
              <svg viewBox="0 0 100 100" className="pie-svg">
                <circle cx="50" cy="50" r="40" fill="#1e5a8a" className="pie-segment" />
                <path d="M50 50 L50 10 A40 40 0 0 1 84.64 70 Z" fill="#22c55e" className="pie-segment" />
                <path d="M50 50 L84.64 70 A40 40 0 0 1 15.36 70 Z" fill="#a855f7" className="pie-segment" />
              </svg>
            </div>
            <div className="pie-labels">
              {teamDistribution.map(team => (
                <div key={team.team} className={`pie-label ${team.team.toLowerCase()}`}>
                  {team.team}<br/>Say:{team.count} ({team.percentage}%)
                </div>
              ))}
            </div>
          </div>
          <div className="pie-legend">
            {teamDistribution.map(team => (
              <div key={team.team} className="legend-item">
                <span className="dot" style={{ backgroundColor: team.color }}></span>
                <span>{team.team}</span>
                <span className="legend-value">{team.count} ({team.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Performance */}
      <div className="performance-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="performance-header">
          <h3>İşçi Performansı</h3>
          <div className="performance-legend">
            <span><span className="dot blue"></span> Ümumi</span>
            <span><span className="dot green"></span> Tamam</span>
          </div>
        </div>
        <div className="performance-list">
          {workerPerformance.map((worker, idx) => (
            <div 
              key={idx} 
              className="performance-row animate-slide-in"
              style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
            >
              <span className="worker-name">{worker.name}</span>
              <div className="progress-bar">
                <div 
                  className="progress-total" 
                  style={{ width: '100%' }}
                ></div>
                <div 
                  className="progress-completed animated-progress" 
                  style={{ 
                    width: `${(worker.completed / worker.total) * 100}%`,
                    animationDelay: `${0.6 + idx * 0.1}s`
                  }}
                ></div>
              </div>
              <span className="worker-stats">{worker.total}|{worker.completed}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="bottom-cards">
        <div className="info-card blue animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="info-icon pulse">
            <TrendingUp size={20} />
          </div>
          <h4>Ən Yaxşı Performans</h4>
          <p><strong>NOC komandası</strong> bu ay ən yüksək növbə tamamlanma dərəcəsi (98.2%) nail olub.</p>
        </div>
        <div className="info-card orange animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="info-icon pulse">
            <Clock size={20} />
          </div>
          <h4>Diqqət Tələb Edir</h4>
          <p><strong>SOC komandası</strong> 4 boş növbə ilə digər komandalardan geridə qalır.</p>
        </div>
        <div className="info-card purple animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="info-icon pulse">
            <CheckCircle size={20} />
          </div>
          <h4>Ümumi Vəziyyət</h4>
          <p>Bütün komandalar üzrə <strong>98%+ tamamlanma</strong> nisbəti əla nəticə deməkdir.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminStatistics
