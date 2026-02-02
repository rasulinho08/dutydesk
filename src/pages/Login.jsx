import { useState, useEffect, useRef } from 'react'
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Key, Shield, CheckCircle } from 'lucide-react'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Forgot Password States
  const [step, setStep] = useState('login') // login, forgot, verify, newPassword, success
  const [forgotEmail, setForgotEmail] = useState('')
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const codeInputRefs = useRef([])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(email, password)
  }

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    
    if (strength <= 2) return { level: 'weak', text: 'Zəif', color: '#ef4444' }
    if (strength <= 3) return { level: 'good', text: 'Yaxşı', color: '#f59e0b' }
    return { level: 'strong', text: 'Güclü', color: '#22c55e' }
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword

  // Handle forgot password email submit
  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!forgotEmail) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('verify')
      setResendTimer(120) // 2 minutes
    }, 1500)
  }

  // Handle verification code input
  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return
    
    const newCode = [...verifyCode]
    newCode[index] = value
    setVerifyCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verifyCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle verify submit
  const handleVerifySubmit = (e) => {
    e.preventDefault()
    if (verifyCode.some(c => !c)) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('newPassword')
    }, 1500)
  }

  // Handle new password submit
  const handleNewPasswordSubmit = (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep('success')
    }, 1500)
  }

  // Handle resend code
  const handleResendCode = () => {
    if (resendTimer > 0) return
    setResendTimer(120)
    // Simulate sending new code
  }

  // Go back handler
  const handleBack = () => {
    if (step === 'forgot') setStep('login')
    else if (step === 'verify') setStep('forgot')
    else if (step === 'newPassword') setStep('verify')
  }

  // Format timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Render Login Form
  if (step === 'login') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <Lock size={32} color="#4a6fa5" />
          </div>
          
          <h1 className="login-title">Xoş Gəlmisiniz</h1>
          <p className="login-subtitle">Hesabınıza daxil olun</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Şifrə</label>
                <button type="button" className="forgot-link" onClick={() => setStep('forgot')}>
                  Şifrəni unutmusunuz?
                </button>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button">
              Daxil ol
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Render Forgot Password Form
  if (step === 'forgot') {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
            <span>Geri</span>
          </button>

          <div className="login-icon">
            <Key size={32} color="#4a6fa5" />
          </div>
          
          <h1 className="login-title">Şifrəni Unutmusunuz?</h1>
          <p className="login-subtitle">Email ünvanınızı daxil edin və biz sizə təsdiq kodu göndərəcəyik</p>

          <form onSubmit={handleForgotSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="email@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? <span className="btn-spinner"></span> : 'Kod Göndər'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Render Verify Email Form
  if (step === 'verify') {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
            <span>Geri</span>
          </button>

          <div className="login-icon verify-icon">
            <Shield size={32} color="#4a6fa5" />
          </div>
          
          <h1 className="login-title">Email Təsdiqi</h1>
          <p className="login-subtitle">
            6 rəqəmli təsdiq kodunu göndərdik<br />
            <span className="email-highlight">{forgotEmail}</span>
          </p>

          <form onSubmit={handleVerifySubmit} className="login-form">
            <div className="code-inputs">
              {verifyCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className="code-input"
                />
              ))}
            </div>

            <div className="resend-section">
              <span>Kodu yenidən göndər: </span>
              {resendTimer > 0 ? (
                <span className="timer">{formatTimer(resendTimer)}</span>
              ) : (
                <button type="button" className="resend-btn" onClick={handleResendCode}>
                  Yenidən göndər
                </button>
              )}
            </div>

            <button type="submit" className="login-button" disabled={isLoading || verifyCode.some(c => !c)}>
              {isLoading ? <span className="btn-spinner"></span> : 'Təsdiqlə'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Render New Password Form
  if (step === 'newPassword') {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
            <span>Geri</span>
          </button>

          <div className="login-icon">
            <Lock size={32} color="#4a6fa5" />
          </div>
          
          <h1 className="login-title">Yeni Şifrə Yaradın</h1>
          <p className="login-subtitle">Yeni şifrəniz əvvəlki şifrələrdən fərqli olmalıdır</p>

          <form onSubmit={handleNewPasswordSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="new-password">Yeni Şifrə</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new-password"
                  placeholder="Yeni şifrənizi daxil edin"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill ${passwordStrength.level}`}
                      style={{ width: passwordStrength.level === 'weak' ? '33%' : passwordStrength.level === 'good' ? '66%' : '100%' }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: passwordStrength.color }}>
                    Şifrə gücü: {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Şifrəni Təsdiqlə</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  placeholder="Şifrəni yenidən daxil edin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && (
                <div className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
                  {passwordsMatch ? (
                    <>✓ Şifrələr uyğundur</>
                  ) : (
                    <>✗ Şifrələr uyğun deyil</>
                  )}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="login-button" 
              disabled={isLoading || !passwordsMatch}
            >
              {isLoading ? <span className="btn-spinner"></span> : 'Şifrəni Yenilə'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Render Success Screen
  if (step === 'success') {
    return (
      <div className="login-container">
        <div className="login-card success-card">
          <div className="success-icon">
            <CheckCircle size={48} color="white" />
          </div>
          
          <h1 className="login-title success-title">Uğurlu!</h1>
          <p className="login-subtitle">Şifrəniz uğurla yeniləndi</p>

          <button className="login-button" onClick={() => setStep('login')}>
            Giriş Səhifəsinə Keç
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default Login
