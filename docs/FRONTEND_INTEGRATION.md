# 🔄 DutyDesk - Frontend-Backend İnteqrasiya Təlimatı

Bu sənəd frontend developer-ə backend API-ni necə inteqrasiya edəcəyini göstərir.

---

## 📁 API Service Yaratma

### 1. Axios instance yaradın

```javascript
// src/services/api.js

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Token əlavə etmə
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api
```

---

### 2. Auth Service

```javascript
// src/services/authService.js

import api from './api'

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Forgot Password
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email })
  },

  // Verify Code
  verifyCode: (email, code) => {
    return api.post('/auth/verify-code', { email, code })
  },

  // Reset Password
  resetPassword: (resetToken, newPassword, confirmPassword) => {
    return api.post('/auth/reset-password', { 
      resetToken, 
      newPassword, 
      confirmPassword 
    })
  },

  // Get current user
  getCurrentUser: () => {
    return api.get('/users/me')
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token')
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
```

---

### 3. Shifts Service

```javascript
// src/services/shiftsService.js

import api from './api'

export const shiftsService = {
  // Get all shifts
  getShifts: (params = {}) => {
    return api.get('/shifts', { params })
  },

  // Get current shift
  getCurrentShift: () => {
    return api.get('/shifts/current')
  },

  // Get shift by ID
  getShiftById: (id) => {
    return api.get(`/shifts/${id}`)
  },

  // Check-in
  checkIn: (shiftId, note = '') => {
    return api.post('/shifts/check-in', { shiftId, note })
  },

  // Check-out
  checkOut: (shiftId, note = '') => {
    return api.post('/shifts/check-out', { shiftId, note })
  },

  // Request shift change
  requestChange: (shiftId, reason, requestedDate) => {
    return api.post('/shifts/change-request', { 
      shiftId, 
      reason, 
      requestedDate 
    })
  },

  // Get shift notes
  getNotes: (shiftId) => {
    return api.get(`/shifts/${shiftId}/notes`)
  },

  // Add shift note
  addNote: (shiftId, content) => {
    return api.post(`/shifts/${shiftId}/notes`, { content })
  }
}
```

---

### 4. Handovers Service

```javascript
// src/services/handoversService.js

import api from './api'

export const handoversService = {
  // Get all handovers
  getHandovers: (params = {}) => {
    return api.get('/handovers', { params })
  },

  // Get handover by ID
  getHandoverById: (id) => {
    return api.get(`/handovers/${id}`)
  },

  // Create handover
  createHandover: (data) => {
    return api.post('/handovers', data)
  },

  // Update handover (draft)
  updateHandover: (id, data) => {
    return api.put(`/handovers/${id}`, data)
  },

  // Submit handover
  submitHandover: (id) => {
    return api.put(`/handovers/${id}`, { status: 'submitted' })
  }
}
```

---

### 5. Admin Service

```javascript
// src/services/adminService.js

import api from './api'

export const adminService = {
  // Dashboard stats
  getDashboard: () => {
    return api.get('/admin/dashboard')
  },

  // Users CRUD
  getUsers: (params = {}) => {
    return api.get('/admin/users', { params })
  },

  getUserById: (id) => {
    return api.get(`/admin/users/${id}`)
  },

  createUser: (data) => {
    return api.post('/admin/users', data)
  },

  updateUser: (id, data) => {
    return api.put(`/admin/users/${id}`, data)
  },

  deleteUser: (id) => {
    return api.delete(`/admin/users/${id}`)
  },

  // Schedules
  getSchedules: (params = {}) => {
    return api.get('/admin/schedules', { params })
  },

  createSchedule: (shifts) => {
    return api.post('/admin/schedules', { shifts })
  },

  // Handover approval
  approveHandover: (id) => {
    return api.put(`/admin/handovers/${id}/approve`)
  },

  rejectHandover: (id, reason) => {
    return api.put(`/admin/handovers/${id}/reject`, { reason })
  }
}
```

---

### 6. Services Barrel Export

```javascript
// src/services/index.js

export { default as api } from './api'
export { authService } from './authService'
export { shiftsService } from './shiftsService'
export { handoversService } from './handoversService'
export { adminService } from './adminService'
```

---

## 🔧 Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3000/api

# .env.production
VITE_API_URL=https://api.dutydesk.com/api
```

---

## 📝 Komponentdə İstifadə Nümunəsi

### Login.jsx
```jsx
import { useState } from 'react'
import { authService } from '../services'

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login(email, password)
      onLogin(response.data.user)
    } catch (err) {
      setError(err.error?.message || 'Giriş zamanı xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  // ...
}
```

### Dashboard.jsx
```jsx
import { useState, useEffect } from 'react'
import { shiftsService } from '../services'

function Dashboard() {
  const [currentShift, setCurrentShift] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCurrentShift()
  }, [])

  const loadCurrentShift = async () => {
    try {
      const response = await shiftsService.getCurrentShift()
      setCurrentShift(response.data)
    } catch (err) {
      console.error('Shift yüklənmədi:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      await shiftsService.checkIn(currentShift.id)
      loadCurrentShift() // Refresh
      showToast('Check-in uğurlu!', 'success')
    } catch (err) {
      showToast(err.error?.message || 'Xəta', 'error')
    }
  }

  // ...
}
```

---

## 🔄 State Management (Optional)

Böyük proyektlər üçün Zustand tövsiyə olunur:

```javascript
// src/store/useAuthStore.js

import { create } from 'zustand'
import { authService } from '../services'

export const useAuthStore = create((set) => ({
  user: authService.getUser(),
  isAuthenticated: authService.isLoggedIn(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await authService.login(email, password)
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        loading: false 
      })
      return response
    } catch (err) {
      set({ error: err.error?.message, loading: false })
      throw err
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  }
}))
```

---

## ✅ Checklist - Backend Hazır Olduqda

1. [ ] `.env` faylında `VITE_API_URL` təyin edin
2. [ ] `src/services/` qovluğunu yaradın
3. [ ] Bütün service fayllarını əlavə edin
4. [ ] Mock data-ları API çağırışları ilə əvəz edin
5. [ ] Error handling əlavə edin
6. [ ] Loading state-ləri düzgün idarə edin
7. [ ] Token refresh mexanizmi əlavə edin (optional)
8. [ ] WebSocket bağlantısı qurun (real-time üçün)

---

**Frontend artıq backend-ə hazırdır! 🚀**
