import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, FileText, Save, Send, CheckCircle, Info, X, Check, AlertTriangle } from 'lucide-react'
import './HandoverForm.css'
import { formatDisplayDate, formatShiftTimeRange } from '../utils/dateUtils'
import { BASE_URL } from '../constants'

function HandoverForm() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token') || ''

  const [formData, setFormData] = useState({
    incidents: '',
    resolvedProblems: '',
    ongoingProblems: '',
    systemStatus: 'normal',
    monitoring: '',
    additionalNotes: '',
    nextShiftInfo: '',
  })
  const [currentShift, setCurrentShift] = useState(null)
  const [recentHandovers, setRecentHandovers] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedAt, setSubmittedAt] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      try {
        // Current shift
        const curRes = await fetch(`${BASE_URL}/api/shifts/current`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (curRes.ok) {
          const json = await curRes.json()
          const payload = json?.data?.currentShift || json?.data || json?.currentShift || null
          if (json.success !== false && payload) setCurrentShift(payload)
        }

        // Recent handovers
        const hvRes = await fetch(`${BASE_URL}/api/handovers?page=1&limit=3`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (hvRes.ok) {
          const json = await hvRes.json()
          if (json.success) {
            const items = json.data?.items || json.data?.handovers || (Array.isArray(json.data) ? json.data : [])
            setRecentHandovers(items.slice(0, 3))
          }
        }
      } catch (err) {
        console.error('HandoverForm fetch error:', err)
      }
    }
    fetchData()
  }, [token])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const displayToast = (message, type = 'success') => {
    setToastMessage(message); setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.incidents.trim()) newErrors.incidents = 'Bu sahə məcburidir'
    if (!formData.systemStatus) newErrors.systemStatus = 'Sistem statusunu seçin'
    if (!formData.nextShiftInfo.trim()) newErrors.nextShiftInfo = 'Növbəti növbə üçün məlumat daxil edin'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) { displayToast('Zəhmət olmasa bütün məcburi sahələri doldurun!', 'error'); return }
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirmModal(false)
    try {
      const body = {
        ...((currentShift?.id || currentShift?.shiftId || currentShift?.scheduleId) && {
          shiftId: currentShift.id || currentShift.shiftId || currentShift.scheduleId
        }),
        incidents: formData.incidents,
        resolvedProblems: formData.resolvedProblems,
        ongoingProblems: formData.ongoingProblems,
        systemStatus: formData.systemStatus,
        monitoring: formData.monitoring,
        additionalNotes: formData.additionalNotes,
        nextShiftInfo: formData.nextShiftInfo,
      }
      await fetch(`${BASE_URL}/api/handovers`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } catch (err) {
      console.error('Handover submit error:', err)
    } finally {
      setIsSubmitting(false)
      setSubmittedAt(new Date().toLocaleString('az-AZ'))
      setShowSuccessModal(true)
    }
  }

  const handleSaveDraft = () => displayToast('Qaralama yadda saxlanıldı!')

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
    navigate('/')
  }

  const shiftTime = currentShift ? formatShiftTimeRange(currentShift.startTime, currentShift.endTime) : '—'
  const shiftDate = currentShift ? formatDisplayDate(currentShift.date || currentShift.startTime) : '—'

  return (
    <div className="handover-form-page">
      <div className={`toast-notification ${showToast ? 'show' : ''} ${toastType}`}>
        {toastType === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
        <span>{toastMessage}</span>
      </div>

      {/* Header */}
      <div className="form-header animate-fade-in">
        <div className="header-left">
          <span className="header-label">Aktiv Növbə</span>
          <h1 className="header-time">{shiftTime}</h1>
          <span className="header-date">{shiftDate}</span>
        </div>
        <div className="header-status">
          <div className="status-icon"><Clock size={24} /></div>
          <span className="status-text">Növbə Sonu</span>
        </div>
      </div>

      {/* Form */}
      <div className="form-section">
        <div className="form-title">
          <FileText size={20} />
          <div>
            <h2>Təhvil-Təslim Formu</h2>
            <span className="form-subtitle">Növbə xülasəsini doldurun</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>1. İşlənən İncidentlər <span className="required">*</span></label>
            <textarea placeholder="Növbə ərzində işlənən incidentləri qeyd edin (ID, təsvir, status)..." value={formData.incidents} onChange={(e) => handleChange('incidents', e.target.value)} rows={3} className={errors.incidents ? 'error' : ''} />
            {errors.incidents && <span className="error-text">{errors.incidents}</span>}
          </div>

          <div className="form-group">
            <label>2. Həll Olunan Problemlər</label>
            <textarea placeholder="Tamamilə həll olunmuş problemləri qeyd edin..." value={formData.resolvedProblems} onChange={(e) => handleChange('resolvedProblems', e.target.value)} rows={2} />
          </div>

          <div className="form-group">
            <label>3. Davam Edən Problemlər / Gözləmədə Olan İşlər</label>
            <textarea placeholder="Növbəti növbəyə keçiriləcək işləri qeyd edin..." value={formData.ongoingProblems} onChange={(e) => handleChange('ongoingProblems', e.target.value)} rows={2} />
          </div>

          <div className="form-group">
            <label>4. Sistem Statusu <span className="required">*</span></label>
            <select value={formData.systemStatus} onChange={(e) => handleChange('systemStatus', e.target.value)} className={errors.systemStatus ? 'error' : ''}>
              <option value="">Seçin...</option>
              <option value="normal">✅ Normal - Bütün sistemlər işləyir</option>
              <option value="warning">⚠️ Xəbərdarlıq - Kiçik problemlər var</option>
              <option value="critical">🔴 Kritik - Ciddi problemlər var</option>
            </select>
            {errors.systemStatus && <span className="error-text">{errors.systemStatus}</span>}
          </div>

          <div className="form-group">
            <label>5. Monitoring və Yoxlamalar</label>
            <textarea placeholder="Aparılan monitorinq, yoxlamalar və nəticələr..." value={formData.monitoring} onChange={(e) => handleChange('monitoring', e.target.value)} rows={2} />
          </div>

          <div className="form-group">
            <label>6. Əlavə Qeydlər və Təkliflər</label>
            <textarea placeholder="Növbəti komanda üçün əlavə məlumat və tövsiyələr..." value={formData.additionalNotes} onChange={(e) => handleChange('additionalNotes', e.target.value)} rows={2} />
          </div>

          <div className="form-group">
            <label>7. Növbəti Növbəyə Məlumat <span className="required">*</span></label>
            <textarea placeholder="Növbəti növbənin diqqət etməli olduğu mühüm məlumatlar..." value={formData.nextShiftInfo} onChange={(e) => handleChange('nextShiftInfo', e.target.value)} rows={2} className={errors.nextShiftInfo ? 'error' : ''} />
            {errors.nextShiftInfo && <span className="error-text">{errors.nextShiftInfo}</span>}
          </div>

          <div className="instructions-box">
            <Info size={18} className="info-icon" />
            <div className="instructions-content">
              <strong>⚠️ Təhvil-Təslim Təlimatları:</strong>
              <ul>
                <li>Bütün incidentləri ID nömrəsi ilə qeyd edin</li>
                <li>Problemlərin həll statusunu aydın yazın (həll olunub / davam edir)</li>
                <li>Kritik və təcili məsələləri mütləq qeyd edin</li>
                <li>Növbəti komandaya lazım olan bütün məlumatı verin</li>
              </ul>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="draft-btn" onClick={handleSaveDraft} disabled={isSubmitting}>
              <Save size={18} /><span>Qaralama Kimi Saxla</span>
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (<><span className="spinner"></span><span>Göndərilir...</span></>) : (<><Send size={18} /><span>Təhvil-Təslimi Göndər</span></>)}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Handovers */}
      {recentHandovers.length > 0 && (
        <div className="recent-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="recent-title">Son Təhvil-Təslimlər</h3>
          <div className="recent-list">
            {recentHandovers.map((item, index) => (
              <div key={item.id || index} className="recent-item">
                <div className="recent-info">
                  <CheckCircle size={16} className="check-icon" />
                  <div>
                    <span className="recent-date">{formatDisplayDate(item.date || item.createdAt)}</span>
                    <span className="recent-status">Uğurla göndərildi</span>
                  </div>
                </div>
                <button className="view-link" onClick={() => navigate('/handover-history')}>Bax →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Təsdiq</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body center-content">
              <div className="confirm-icon"><Send size={32} /></div>
              <p className="confirm-text">Təhvil-təslim formu göndərilsin?</p>
              <span className="confirm-note">Bu əməliyyat geri alına bilməz</span>
            </div>
            <div className="modal-footer center">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Ləğv et</button>
              <button className="btn-confirm" onClick={handleConfirmSubmit}><Send size={16} />Göndər</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-body center-content success-content">
              <div className="success-icon"><CheckCircle size={48} /></div>
              <h3>Uğurla göndərildi!</h3>
              <p>Təhvil-təslim formu qeydə alındı.</p>
              <span className="success-time">{submittedAt}</span>
            </div>
            <div className="modal-footer center">
              <button className="btn-confirm" onClick={handleCloseSuccess}><Check size={16} />Tamam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HandoverForm
