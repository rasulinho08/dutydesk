/**
 * API Utility
 * 
 * Backend API ilə əlaqə üçün utility funksiyalar
 * JWT token ilə authentication
 */

import { BASE_URL } from '../constants'

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/users/me')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response body
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  const url = `${BASE_URL}${endpoint}`

  console.log(`[API] ${options.method || 'GET'} ${url}`)

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  const response = await fetch(url, config)

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Authentication required')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned ${response.status} with non-JSON body`)
  }

  if (!response.ok) {
    const msg = data?.message || data?.error || `Request failed (${response.status})`
    console.error(`[API] Error ${response.status}:`, msg)
    throw new Error(msg)
  }

  return data
}

/**
 * GET request
 */
export const get = (endpoint) => {
  return apiRequest(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export const post = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * PUT request
 */
export const put = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

/**
 * PATCH request
 */
export const patch = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

/**
 * DELETE request
 */
export const del = (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' })
}

export { BASE_URL }

export default {
  request: apiRequest,
  get,
  post,
  put,
  patch,
  delete: del
}
