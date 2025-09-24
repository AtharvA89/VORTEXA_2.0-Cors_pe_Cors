import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VerifyEmail() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const { verifyEmail, resendVerification, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get email from navigation state
  const email = location.state?.email || ""
  const message = location.state?.message || ""
  const devOtp = location.state?.otp || "" // For development

  // Redirect to signup if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup')
    }
  }, [email, navigate])

  // Clear error when OTP changes
  useEffect(() => {
    clearError()
    setResendMessage("")
  }, [otp, clearError])

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (devOtp && process.env.NODE_ENV === 'development') {
      setOtp(devOtp)
    }
  }, [devOtp])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyEmail(email, otp)
      if (result.success) {
        navigate(result.redirectUrl || '/dashboard')
      }
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Email verification failed:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    setResendMessage("")

    try {
      const result = await resendVerification(email)
      if (result.success) {
        setResendMessage("Verification code sent successfully!")
        // Auto-fill OTP in development mode
        if (result.otp && process.env.NODE_ENV === 'development') {
          setOtp(result.otp)
        }
      }
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Resend verification failed:', error.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center py-6 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Vortexa</h1>
          <p className="text-muted-foreground mt-2">Verify your email</p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a verification code to <span className="font-medium">{email}</span>
            </p>
          </div>

          {message && (
            <div className="p-3 text-sm bg-green-50 text-green-700 rounded-md border border-green-200">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm bg-destructive/15 text-destructive rounded-md">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="p-3 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              {resendMessage}
            </div>
          )}

          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !otp}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-sm"
              >
                {isResending ? "Resending..." : "Resend verification code"}
              </Button>
            </div>
          </div>

          <div className="text-center text-sm">
            Wrong email?{" "}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="underline underline-offset-4 hover:text-primary"
            >
              Go back to signup
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}