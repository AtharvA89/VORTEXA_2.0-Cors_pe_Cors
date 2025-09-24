import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await api.get('/auth/user')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  // Email/Password Login
  const login = async (email, password) => {
    try {
      setError(null)
      console.log('AuthContext: Attempting login for:', email) // Debug log
      const response = await api.post('/auth/login', { email, password })
      console.log('AuthContext: Login response:', response.data) // Debug log
      
      if (response.data.success) {
        const { token, data } = response.data
        localStorage.setItem('token', token)
        setUser(data.user)
        console.log('AuthContext: Login successful, user set:', data.user) // Debug log
        return {
          success: true,
          redirectUrl: response.data.redirectUrl,
          user: data.user
        }
      } else {
        console.log('AuthContext: Login response not successful') // Debug log
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error) // Debug log
      console.error('AuthContext: Login error response:', error.response?.data) // Debug log
      const errorMessage = error.response?.data?.message || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Email/Password Registration
  const register = async (name, email, password) => {
    try {
      setError(null)
      console.log('AuthContext: Making registration request to:', '/auth/register') // Debug log
      console.log('AuthContext: Request data:', { name, email, password: '***' }) // Debug log
      
      const response = await api.post('/auth/register', { name, email, password })
      console.log('AuthContext: Registration response:', response.data) // Debug log
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          email: response.data.data.email
        }
      }
    } catch (error) {
      console.error('AuthContext: Registration error:', error) // Debug log
      console.error('AuthContext: Error response:', error.response?.data) // Debug log
      
      const errorMessage = error.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Email Verification with OTP
  const verifyEmail = async (email, otp) => {
    try {
      setError(null)
      const response = await api.post('/auth/verify-email', { email, otp })
      
      if (response.data.success) {
        const { token, data } = response.data
        localStorage.setItem('token', token)
        setUser(data.user)
        return {
          success: true,
          redirectUrl: response.data.redirectUrl,
          user: data.user
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Resend verification email
  const resendVerification = async (email) => {
    try {
      setError(null)
      const response = await api.post('/auth/resend-verification', { email })
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          email: response.data.data.email,
          otp: response.data.data.otp // For development
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Google OAuth Login
  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  // Logout
  const logout = async () => {
    try {
      await api.get('/auth/logout')
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    verifyEmail,
    resendVerification,
    loginWithGoogle,
    logout,
    clearError,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}