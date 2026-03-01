import { createContext, useContext, useState, useEffect } from 'react'
import { BASE_URL } from '../constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is admin or supervisor
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR'

  console.log('[AUTH] BASE_URL =', BASE_URL)

  // Validate token and fetch user data on app load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${BASE_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            setUser(json.data)
            setIsAuthenticated(true)
          } else {
            // Invalid token
            localStorage.removeItem('token')
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [])

  // Login function
  const login = async (email, password) => {
    const loginUrl = `${BASE_URL}/api/auth/login`
    console.log('[AUTH] login url:', loginUrl)
    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('Login response status:', res.status)
      const json = await res.json()
      console.log('Login response body:', json)

      if (json.success) {
        localStorage.setItem('token', json.data.token)

        // Fetch user data from /api/users/me
        try {
          const meRes = await fetch(`${BASE_URL}/api/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${json.data.token}`,
              'Content-Type': 'application/json'
            }
          })
          const meJson = await meRes.json()
          if (meJson.success) {
            setUser(meJson.data)
            setIsAuthenticated(true)
            return { success: true, user: meJson.data }
          }
        } catch (meErr) {
          console.error('/api/users/me error:', meErr)
        }

        // Fallback: use user data from login response if /me fails
        if (json.data.user) {
          setUser(json.data.user)
          setIsAuthenticated(true)
          return { success: true, user: json.data.user }
        }

        return { success: false, message: 'User data alına bilmədi' }
      } else {
        return { success: false, message: json.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Şəbəkə xətası. Zəhmət olmasa yenidən cəhd edin.' }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
