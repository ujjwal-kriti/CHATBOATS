import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Phone,
  CheckCircle2,
  Loader2,
  ChevronLeft
} from 'lucide-react'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Reg, 2: Phone, 3: OTP
  const [regNumber, setRegNumber] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerifyReg = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/v1/auth/verify-reg', { regNumber })
      if (res.data.success) setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration number not found')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhone = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/v1/auth/verify-phone', { regNumber, parentPhone })
      if (res.data.success) setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Phone number mismatch')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/v1/auth/verify-otp', { regNumber, parentPhone, otp })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('auth', JSON.stringify(res.data.student))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect OTP')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background YouTube Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute inset-0 bg-black/20 z-10"></div> {/* Very Light Overlay for video clarity */}

        {/* Video Frame */}
        <iframe
          className="absolute top-1/2 left-1/2 w-[120vw] h-[67.5vw] min-h-[120vh] min-w-[213.33vh] -translate-x-1/2 -translate-y-1/2 object-cover"
          src="https://www.youtube.com/embed/eGPi6TNNgU8?autoplay=1&mute=1&loop=1&playlist=eGPi6TNNgU8&controls=0&showinfo=0&rel=0&modestbranding=1&vq=hd1080&end=79"
          title="Vignan University Background Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="w-full max-w-[440px] relative z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src="https://vignan.ac.in/vignanmall/img/core-img/Logo%20with%20Deemed.svg"
              alt="Vignan University Logo"
              className="h-20 w-auto transition-transform hover:scale-105 drop-shadow-[0_4px_10px_rgba(255,255,255,0.2)]"
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Parent Portal</h1>
          <p className="text-white/90 mt-2 font-medium drop-shadow-sm">Verify your student to access metrics</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/20 backdrop-blur-2xl dark:bg-slate-900/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/30 dark:border-slate-700/50 p-10 relative overflow-hidden">

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-10 justify-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-4 bg-white/30'
                  }`}
              ></div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-100 text-sm font-bold flex items-center gap-3 animate-shake drop-shadow-lg">
              <span className="shrink-0 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
              {error}
            </div>
          )}

          {/* STEP 1: Registration */}
          {step === 1 && (
            <form onSubmit={handleVerifyReg} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-xs font-black text-white/90 drop-shadow-md uppercase tracking-[0.2em] ml-1">Registration Number</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60"><ShieldCheck size={20} /></span>
                  <input
                    type="text"
                    required
                    placeholder="Enter Registration Number"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/30 focus:border-white/50 outline-none transition-all text-white placeholder:text-white/50 font-medium shadow-inner"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 border border-indigo-500/50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Next Step <ArrowRight size={20} /></>}
              </button>
            </form>
          )}

          {/* STEP 2: Phone */}
          {step === 2 && (
            <form onSubmit={handleVerifyPhone} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <button onClick={reset} type="button" className="text-white/70 hover:text-white flex items-center gap-1 text-xs font-bold mb-2 transition-colors drop-shadow">
                <ChevronLeft size={14} /> Back to Registration
              </button>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/90 drop-shadow-md uppercase tracking-[0.2em] ml-1">Guardian Phone</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60"><Phone size={20} /></span>
                  <input
                    type="tel"
                    required
                    placeholder="Registered Mobile Number"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/30 focus:border-white/50 outline-none transition-all text-white placeholder:text-white/50 font-medium shadow-inner"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Send Secure OTP <ArrowRight size={20} /></>}
              </button>
            </form>
          )}

          {/* STEP 3: OTP */}
          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-4 border border-emerald-400/30">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm text-white/80 font-medium drop-shadow">Verification code sent to email</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/90 drop-shadow-md uppercase tracking-[0.2em] ml-1">Enter 6-Digit OTP</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60"><KeyRound size={20} /></span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter Code"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/30 focus:border-white/50 outline-none transition-all text-white placeholder:text-white/50 font-black tracking-[0.5em] text-center shadow-inner"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 border border-indigo-500/50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Secure Dashboard Access</>}
              </button>
              <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-widest mt-6">
                Authentication provided by Institutional Gateway
              </p>
            </form>
          )}
        </div>

        {/* Admin Link at the very bottom */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs font-black text-white/70 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center gap-2 mx-auto drop-shadow"
          >
            <ShieldCheck size={14} /> Administrator Access
          </button>
        </div>
      </div>
    </div>
  )
}
