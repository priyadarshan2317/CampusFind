import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const expired =
      error.response?.status === 401 &&
      !url.includes('/api/auth/') &&
      localStorage.getItem('token')

    if (expired) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api