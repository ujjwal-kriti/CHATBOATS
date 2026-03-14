import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, GraduationCap, User } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome! Please enter Student Registration Number.",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  
  const [input, setInput] = useState('')
  const [step, setStep] = useState('reg') // 'reg' | 'phone' | 'otp'
  const [authData, setAuthData] = useState({ regNumber: '', parentPhone: '' })
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const pushMessage = (text, sender) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        sender,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ])
  }

  const handleSend = async () => {
    const userText = input.trim()
    if (!userText || isLoading) return

    pushMessage(userText, 'user')
    setInput('')
    setIsLoading(true)

    try {
      if (step === 'reg') {
        const res = await fetch('/api/v1/auth/verify-reg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regNumber: userText })
        })
        const data = await res.json()
        
        if (res.ok) {
          setAuthData(prev => ({ ...prev, regNumber: userText }))
          setStep('phone')
          setTimeout(() => pushMessage("Enter Registered Mobile Number.", 'bot'), 300)
        } else {
          setTimeout(() => pushMessage(data.error || "Registration not found. Try again.", 'bot'), 300)
        }
      } 
      else if (step === 'phone') {
        const res = await fetch('/api/v1/auth/verify-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regNumber: authData.regNumber, parentPhone: userText })
        })
        const data = await res.json()

        if (res.ok) {
          setAuthData(prev => ({ ...prev, parentPhone: userText }))
          setStep('otp')
          setTimeout(() => pushMessage(data.message || "OTP sent. Please enter OTP.", 'bot'), 300)
        } else {
          setTimeout(() => pushMessage(data.error || "Number mismatch. Try again.", 'bot'), 300)
        }
      }
      else if (step === 'otp') {
        const res = await fetch('/api/v1/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            regNumber: authData.regNumber,
            parentPhone: authData.parentPhone,
            otp: userText
          })
        })
        const data = await res.json()

        if (res.ok) {
          setTimeout(() => {
            pushMessage("Login successful! Redirecting to Dashboard...", 'bot')
            
            // Store token and student info
            localStorage.setItem('token', data.token)
            localStorage.setItem('auth', JSON.stringify(data.student))
            
            setTimeout(() => {
              navigate('/dashboard', { replace: true })
            }, 1000)
          }, 300)
        } else {
          setTimeout(() => pushMessage(data.error || "Incorrect OTP. Try again.", 'bot'), 300)
        }
      }
    } catch (err) {
      setTimeout(() => pushMessage("Network error. Please try again.", 'bot'), 300)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 flex flex-col overflow-hidden h-[600px] max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Parent Verification Chatbot</h1>
            <p className="text-xs text-blue-100">Secure Academic Portal Access</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-gray-600 rounded-bl-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-70">
                   {msg.sender === 'user' ? <User className="w-3 h-3"/> : <GraduationCap className="w-3 h-3"/>}
                   <span className="text-[10px] uppercase font-bold tracking-wider">
                     {msg.sender === 'user' ? 'You' : 'Bot'}
                   </span>
                </div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400 dark:text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 flex gap-3 shrink-0">
          <input
            type={step === 'phone' ? 'tel' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              step === 'reg' ? "Enter registration number (e.g. 231fa04g25)..." :
              step === 'phone' ? "Enter registered phone..." :
              "Enter 6-digit OTP..."
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 disabled:hover:scale-100 active:scale-95"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
