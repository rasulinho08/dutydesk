import { Calendar, Users, CheckCircle, XCircle, TrendingUp, TrendingDown, User, Search, Filter } from "lucide-react";
import "./AdminStatistics.css";

export default function AdminStatistics() {
  const stats = [
    {
      title: "Ümumi Növbələr (Bu ay)",
      value: 666,
      change: "+12%",
      trend: "up",
      color: "blue",
      icon: <Calendar size={25} className="text-calendar" />,
    },
    {
      title: "Tamamlanmış Növbələr",
      value: 654,
      change: "+5%",
      trend: "up",
      color: "green",
      icon: <CheckCircle size={25} />,
    },
    {
      title: "Tamamlanmamış növbələr",
      value: 9,
      change: "-8%",
      trend: "down",
      color: "red",
      icon: <XCircle size={25} />,
    },
    {
      title: "Cari işçi sayı",
      value: 17,
      change: "+2%",
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
                {item.change}
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
          <div className="date-filter-wrapper">
            <Calendar size={18} className="calendar-icon" />
            <select>
              <option>Bu ay</option>
              <option>Bu həftə</option>
              <option>Bu il</option>
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
