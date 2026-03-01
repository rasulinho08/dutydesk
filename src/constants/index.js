/**
 * Application Constants
 * 
 * Proyektdə istifadə edilən sabit dəyərlər
 */

// ============================================
// API Konfiqurasiyası
// ============================================
const raw = import.meta.env.VITE_API_URL || "https://dutydesk-g3ma.onrender.com";
export const BASE_URL = raw.replace(/\/$/, "");

// ============================================
// Növbə Tipləri
// ============================================
export const SHIFT_TYPES = {
  DAY: { id: 'day', label: 'Gündüz', time: '08:00 - 16:00', color: '#f59e0b' },
  EVENING: { id: 'evening', label: 'Axşam', time: '16:00 - 00:00', color: '#8b5cf6' },
  NIGHT: { id: 'night', label: 'Gecə', time: '00:00 - 08:00', color: '#1e5a8a' }
}

// ============================================
// Növbə Statusları
// ============================================
export const SHIFT_STATUS = {
  SCHEDULED: { id: 'scheduled', label: 'Planlanmış', color: '#6b7280' },
  ACTIVE: { id: 'active', label: 'Aktiv', color: '#22c55e' },
  COMPLETED: { id: 'completed', label: 'Tamamlandı', color: '#1e5a8a' },
  CANCELLED: { id: 'cancelled', label: 'Ləğv edildi', color: '#ef4444' }
}

// ============================================
// Check-in Statusları
// ============================================
export const CHECKIN_STATUS = {
  PENDING: { id: 'pending', label: 'Gözləyir', color: '#f59e0b' },
  CHECKED_IN: { id: 'checked_in', label: 'Check-in edildi', color: '#22c55e' },
  CHECKED_OUT: { id: 'checked_out', label: 'Check-out edildi', color: '#1e5a8a' },
  MISSED: { id: 'missed', label: 'Buraxıldı', color: '#ef4444' }
}

// ============================================
// Handover Statusları
// ============================================
export const HANDOVER_STATUS = {
  DRAFT: { id: 'draft', label: 'Qaralama', color: '#6b7280' },
  SUBMITTED: { id: 'submitted', label: 'Göndərildi', color: '#f59e0b' },
  APPROVED: { id: 'approved', label: 'Təsdiqləndi', color: '#22c55e' },
  REJECTED: { id: 'rejected', label: 'Rədd edildi', color: '#ef4444' }
}

// ============================================
// İstifadəçi Rolları
// ============================================
export const USER_ROLES = {
  ADMIN: { id: 'admin', label: 'Administrator' },
  SUPERVISOR: { id: 'supervisor', label: 'Supervisor' },
  EMPLOYEE: { id: 'employee', label: 'İşçi' }
}

// ============================================
// Sistem Statusları
// ============================================
export const SYSTEM_STATUS = {
  NORMAL: { id: 'normal', label: 'Normal', color: '#22c55e' },
  WARNING: { id: 'warning', label: 'Xəbərdarlıq', color: '#f59e0b' },
  CRITICAL: { id: 'critical', label: 'Kritik', color: '#ef4444' }
}

// ============================================
// Prioritet Səviyyələri
// ============================================
export const PRIORITY_LEVELS = {
  LOW: { id: 'low', label: 'Aşağı', color: '#6b7280' },
  MEDIUM: { id: 'medium', label: 'Orta', color: '#f59e0b' },
  HIGH: { id: 'high', label: 'Yüksək', color: '#ef4444' }
}

// ============================================
// Navigation Menyuları
// ============================================
export const USER_MENU_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/my-shifts', label: 'Mənim Növbələrim', icon: 'Calendar' },
  { path: '/handover-form', label: 'Təhvil-Təslim Formu', icon: 'FileText' },
  { path: '/handover-history', label: 'Təhvil-Təslim Tarixçəsi', icon: 'History' }
]

export const ADMIN_MENU_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/statistics', label: 'Statistika', icon: 'BarChart3' },
  { path: '/admin/history', label: 'Tarixçə', icon: 'History' },
  { path: '/admin/schedule', label: 'Cədvəl', icon: 'Calendar' },
  { path: '/admin/workers', label: 'İşçilər', icon: 'Users' }
]
