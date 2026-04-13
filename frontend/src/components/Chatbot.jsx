import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Mic, MicOff, Languages, Globe, Bot, VolumeX, Volume2 } from 'lucide-react'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Academic Assistant. Ask me about attendance, CGPA, backlogs, fees, or student details.",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('en')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const speakQueueRef = useRef([])
  const currentUtteranceRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const processNextInQueue = () => {
    if (speakQueueRef.current.length === 0) {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      return;
    }

    const chunk = speakQueueRef.current.shift();
    const utterance = new SpeechSynthesisUtterance(chunk);
    
    // Intelligent Voice Selection for Human-like Pronunciation
    const voices = window.speechSynthesis.getVoices();
    const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
    const targetLang = langMap[language] || 'en-IN';
    
    // Try to find the best available voice (Prefer Google or Microsoft voices for naturalness)
    let selectedVoice = voices.find(v => v.lang === targetLang && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang === targetLang);
    if (!selectedVoice && language === 'en') selectedVoice = voices.find(v => v.lang.includes('en'));
    if (!selectedVoice && language === 'hi') selectedVoice = voices.find(v => v.lang.includes('hi'));
    if (!selectedVoice && language === 'te') selectedVoice = voices.find(v => v.lang.includes('te'));
    if (!selectedVoice) selectedVoice = voices[0];
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = targetLang;
    }
    utterance.rate = 0.95; // Slightly faster but more natural rhythm
    utterance.pitch = 1.05; // Slightly higher pitch to sound less robotic

    utterance.onend = () => {
      processNextInQueue();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.error("TTS Error:", e);
      }
      processNextInQueue();
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    // Clear previous state
    window.speechSynthesis.cancel();
    speakQueueRef.current = [];
    currentUtteranceRef.current = null;

    // Humanize text for TTS (Remove artifacts that shouldn't be spoken)
    let spokenText = text;
    
    // 1. Remove Markdown Bold and other symbols
    spokenText = spokenText.replace(/\*\*/g, ''); 
    spokenText = spokenText.replace(/#/g, '');
    
    // 2. Remove Emojis and special pictorial symbols
    spokenText = spokenText.replace(/([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F093}])/gu, '');
    
    // 3. Humanize scale indicators (e.g., replace "/10" with nothing as it's redundant in speech)
    spokenText = spokenText.replace(/\/10/g, ''); 
    
    // 4. Remove Technical Placeholders with localized versions
    const naMap = {
      en: 'not available',
      hi: 'उपलब्ध नहीं है',
      te: 'అందుబాటులో లేదు'
    };
    spokenText = spokenText.replace(/\bN\/A\b/gi, naMap[language] || naMap.en);
    
    // 5. Expand Abbreviations for better flow
    spokenText = spokenText.replace(/\bSem\s*(\d)\b/gi, language === 'hi' ? 'सेमेस्टर $1' : (language === 'te' ? 'సెమిస్టర్ $1' : 'Semester $1'));
    spokenText = spokenText.replace(/\bCGPA\b/gi, language === 'hi' ? 'सी जी पी ए' : (language === 'te' ? 'సి జి పి ఏ' : 'C G P A'));

    const digitMaps = {
      en: { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', '.': ' point ' },
      hi: { 0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पांच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', '.': ' दशमलव ' },
      te: { 0: 'సున్నా', 1: 'ఒకటి', 2: 'రెండు', 3: 'మూడు', 4: 'నాలుగు', 5: 'ఐదు', 6: 'ఆరు', 7: 'ఏడు', 8: 'ఎనిమిది', 9: 'తొమ్మిది', '.': ' పాయింట్ ' }
    };

    const map = digitMaps[language] || digitMaps.en;

    // Specifically handle CGPA/decimal patterns (e.g., 7.28)
    spokenText = spokenText.replace(/(\d)\.(\d{1,2})/g, (match, d1, rest) => {
      const spelledRest = rest.split('').map(d => map[d]).join(' ');
      return `${map[d1]} ${map['.']} ${spelledRest}`;
    });

    // Handle any remaining single digits (like years or sem numbers)
    // We only replace if they are stand-alone digits to avoid corrupting phone numbers if any
    spokenText = spokenText.replace(/\b\d\b/g, (d) => map[d] || d);

    // Split text into chunks (sentences) safely
    const chunks = spokenText.match(/[^.!?]+[.!?]*/g) || [spokenText];
    speakQueueRef.current = chunks.map(c => c.trim()).filter(Boolean);

    if (speakQueueRef.current.length > 0) {
      setIsSpeaking(true);
      setTimeout(() => {
        processNextInQueue();
      }, 50);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    speakQueueRef.current = [];
    currentUtteranceRef.current = null;
    setIsSpeaking(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in your browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    
    const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }
    recognition.lang = langMap[language] || 'en-IN'
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log("[Voice] recognition started listening");
      setIsRecording(true);
      setInput('');
    }
    
    recognition.onaudiostart = () => console.log("[Voice] audio capturing started");
    recognition.onsoundstart = () => console.log("[Voice] sound detected");
    recognition.onspeechstart = () => console.log("[Voice] speech detected!");
    recognition.onspeechend = () => console.log("[Voice] speech stopped");
    
    recognition.onaudioend = () => {
       console.log("[Voice] audio capturing ended");
    };

    recognition.onresult = (event) => {
      const finalTranscript = event.results[event.results.length - 1][0].transcript;
      console.log("[Voice] final result:", finalTranscript);
      
      if (finalTranscript.trim()) {
         setInput('');
         recognition.stop();
         setIsRecording(false);
         handleSendVoice(finalTranscript);
      }
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
         console.error("Speech recognition error:", event.error)
      }
      setIsRecording(false)
      let errorMessage = "Microphone error. Check permissions.";
      if (event.error === 'not-allowed') errorMessage = "Microphone access denied. Please click the Lock icon in your URL bar.";
      else if (event.error === 'network') errorMessage = "Network error fetching Google Voice API.";
      else if (event.error === 'no-speech' || event.error === 'aborted') return; // Ignore silent timeouts
      
      setInput(errorMessage);
      setTimeout(() => setInput(''), 3000);
    }

    recognition.onend = () => setIsRecording(false)
    try {
      recognition.start()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendVoice = async (text) => {
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMessage])
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/v1/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text, language })
      })
      
      let botText = "I couldn't process that request right now."
      if (res.ok) {
        const data = await res.json()
        botText = data.response
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMessage])
      speak(botMessage.text)
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Error communicating with the server.", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMessage])
    const userText = input.trim()
    setInput('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/v1/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText, language })
      })
      
      let botText = "I couldn't process that request right now."
      if (res.ok) {
        const data = await res.json()
        botText = data.response
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMessage])
      speak(botMessage.text)
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Error communicating with the server.",
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        aria-label="Toggle chatbot"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[480px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 flex flex-col overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
               <Bot className="w-5 h-5" />
               <span className="font-semibold text-sm">Academic Assistant</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex bg-black/20 rounded-lg p-0.5">
                  {['en', 'hi', 'te'].map(l => (
                    <button 
                       key={l}
                       onClick={() => setLanguage(l)}
                       className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter transition-all ${language === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'}`}
                    >
                       {l}
                    </button>
                  ))}
               </div>
               <button
                 onClick={() => setIsOpen(false)}
                 className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                 aria-label="Close chat"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Message Area Wrap */}
          <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 dark:bg-gray-900 border-b border-slate-100 dark:border-gray-700">
            {/* Audio Control Overlay (Floating) */}
            {isSpeaking && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-[90%] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/50 shadow-lg rounded-xl px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 items-center">
                      <div className="w-1 h-2 bg-indigo-500 rounded-full animate-pulse" />
                      <div className="w-1 h-4 bg-indigo-600 rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Speaking...</span>
                  </div>
                  <button 
                    onClick={stopSpeaking}
                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-md active:scale-95"
                  >
                    <VolumeX className="w-3 h-3" />
                    Stop
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-gray-600 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 font-bold ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-800 flex flex-col shrink-0 relative">
            {isRecording && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-lg animate-bounce flex items-center gap-2 z-30">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LISTENING...
                </div>
            )}
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? "Listening..." : "Type message..."}
                  className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all pr-10 ${isRecording ? 'border-rose-400 ring-2 ring-rose-500/10' : ''}`}
                />
                <button 
                   onClick={toggleRecording}
                   className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-500'}`}
                >
                   {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={isRecording || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-50 active:scale-95"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
