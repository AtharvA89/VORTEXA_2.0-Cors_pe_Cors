import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkAuthStatus } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        console.log('AuthCallback: URL params:', { token: token ? 'present' : 'missing', error }) // Debug log
        console.log('AuthCallback: Full URL:', window.location.href) // Debug log

        if (error) {
          console.error('AuthCallback: Error received:', error) // Debug log
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          setTimeout(() => {
            navigate('/login')
          }, 3000)
          return
        }

        if (token) {
          console.log('AuthCallback: Token received, storing and checking auth') // Debug log
          // Store token in localStorage
          localStorage.setItem('token', token)
          
          // Check auth status to get user data
          await checkAuthStatus()
          
          setStatus('success')
          setMessage('Authentication successful! Redirecting to dashboard...')
          
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          console.log('AuthCallback: No token received') // Debug log
          setStatus('error')
          setMessage('No authentication token received.')
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [searchParams, navigate, checkAuthStatus])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center py-6 sm:py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Vortexa</h1>
        </div>

        <div className="flex flex-col items-center gap-4">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <h2 className="text-xl font-semibold">Processing authentication...</h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we complete your sign-in
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-700">Success!</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-700">Authentication Failed</h2>
              <p className="text-muted-foreground text-sm">{message}</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}