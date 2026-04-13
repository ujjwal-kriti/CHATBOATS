import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, GraduationCap, TrendingUp, AlertCircle, Loader2, BookOpen, Mic, MicOff, Languages, Globe, VolumeX } from 'lucide-react';

export default function ChatbotAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your AI Academic Assistant. I can help you with attendance, CGPA, backlogs, fees, or exam details. How can I assist you today?", sender: "bot", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [student, setStudent] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speakQueueRef = useRef([]);
  const currentUtteranceRef = useRef(null);

  const quickQuestions = [
    "What is my child's attendance?",
    "What is the current CGPA?",
    "Are there any backlogs?",
    "Is there any pending fee?",
    "When is the next exam?"
  ];

  // Pre-load voices for better human-like pronunciation
  useEffect(() => {
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Student Info & Insights
        const [dashRes, insRes] = await Promise.all([
          fetch('/api/v1/student/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/student/insights', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setStudent(dashData.student);
        }
        
        if (insRes.ok) {
          const insData = await insRes.json();
          setInsights(insData.insights);
        }
      } catch (err) {
        console.error("Error fetching context:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
    recognition.lang = langMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
       setIsRecording(true);
       setInput('');
    };
    
    recognition.onresult = (event) => {
      const finalTranscript = event.results[event.results.length - 1][0].transcript;
      
      if (finalTranscript.trim()) {
         setInput('');
         recognition.stop();
         setIsRecording(false);
         handleSend(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
         console.error("Speech recognition error:", event.error);
      }
      setIsRecording(false);
      let errorMessage = "Microphone error. Check permissions.";
      if (event.error === 'not-allowed') errorMessage = "Microphone access denied. Please click the Lock icon in your URL bar.";
      else if (event.error === 'network') errorMessage = "Network error fetching Google Voice API.";
      else if (event.error === 'no-speech' || event.error === 'aborted') return; // ignore silent timeouts
      
      setInput(errorMessage);
      setTimeout(() => setInput(''), 3000);
    };

    recognition.onend = () => setIsRecording(false);
    
    try {
      recognition.start();
    } catch(e) {
      console.error(e);
    }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), text, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text, language })
      });

      const data = await response.json();
      
      const botMsg = { 
        id: Date.now() + 1, 
        text: data.response || data.error || data || "I'm sorry, I couldn't process that request.", 
        sender: "bot", 
        timestamp: new Date() 
      };
      // Sometimes the backend responds directly with just string text, handle both.
      if(typeof data === 'string') botMsg.text = data;

      setMessages(prev => [...prev, botMsg]);
      speak(botMsg.text);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Connection error. Please try again later.", sender: "bot", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
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
    
    // Prioritize high-quality local voices (Google/Microsoft usually have much better Hindi/Telugu)
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
    utterance.rate = 0.95; // More natural talking speed
    utterance.pitch = 1.05; // Slightly warmer tone

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

    // Split text into chunks (sentences) safely
    const chunks = text.match(/[^.!?]+[.!?]*/g) || [text];
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Initializing AI Assistant...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-120px)] flex flex-col pb-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            AI <span className="text-indigo-600">Assistant</span>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Instant answers regarding academic progress</p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm">
           <div className="flex items-center gap-2 px-3 py-1.5 text-indigo-500">
              <Languages className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Language</span>
           </div>
           <div className="flex gap-1">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'te', label: 'తెలుగు' }
              ].map(lang => (
                <button
                   key={lang.id}
                   onClick={() => setLanguage(lang.id)}
                   className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      language === lang.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700'
                   }`}
                >
                   {lang.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Main Chat Interface (Left) */}
        <div className="flex-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden relative">
           
           {/* Chat Header Background Accent */}
           <div className="absolute top-0 left-0 right-0 h-32 bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/20" />
           
           {/* Audio Control Overlay (Floating) */}
           {isSpeaking && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[60%] min-w-[300px] animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-indigo-100 dark:border-indigo-900/50 shadow-2xl rounded-[2rem] px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 items-end h-6">
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDuration: '0.8s' }} />
                      <div className="w-1.5 h-6 bg-indigo-600 rounded-full animate-bounce" style={{ animationDuration: '1.2s' }} />
                      <div className="w-1.5 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDuration: '1s' }} />
                      <div className="w-1.5 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '1.5s' }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block leading-none mb-1">AI Vocalizing</span>
                      <span className="text-[10px] font-bold text-slate-400 leading-none">High Fidelity Audio</span>
                    </div>
                  </div>
                  <button 
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/30 active:scale-95 group"
                  >
                    <VolumeX className="w-4 h-4 border-2 border-white/20 rounded-full p-0.5 group-hover:scale-110 transition-transform" />
                    Stop Speech
                  </button>
                </div>
              </div>
           )}

           {/* Quick Questions Banner */}
           <div className="relative z-10 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 ml-2 flex items-center gap-2">
                 <Sparkles className="w-3 h-3" /> Quick Inquiries
              </p>
              <div className="flex flex-wrap gap-2">
                 {quickQuestions.map((q, idx) => (
                    <button 
                       key={idx}
                       onClick={() => handleSend(q)}
                       className="px-4 py-2 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full shadow-sm hover:shadow transition-all"
                    >
                       {q}
                    </button>
                 ))}
              </div>
           </div>

           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scroll-smooth">
             {messages.map((msg) => (
               <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                 
                 {/* Avatar */}
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600'
                 }`}>
                    {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                 </div>

                 {/* Message Bubble */}
                 <div className={`max-w-[75%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-6 py-4 rounded-2xl ${
                       msg.sender === 'user'
                         ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                         : 'bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-200 border border-slate-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
                    }`}>
                       <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 px-2">
                       {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
               </div>
             ))}
             
             {/* Typing Indicator */}
             {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 flex items-center justify-center shrink-0 shadow-sm">
                     <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
             )}
             <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white dark:bg-gray-800 border-t border-slate-100 dark:border-gray-700 relative z-10">
              {isRecording && (
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-rose-600 text-white text-xs font-black rounded-full shadow-lg animate-bounce flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LISTENING IN {language.toUpperCase()}...
                 </div>
              )}
              <div className="relative flex items-center gap-3 group">
                 <div className="relative flex-1">
                    <input 
                       type="text"
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyPress={handleKeyPress}
                       placeholder={isRecording ? "Listening..." : "Ask about attendance, CGPA, backlogs..."}
                       className={`w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl py-4 pl-6 pr-12 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner ${isRecording ? 'border-rose-400 ring-2 ring-rose-500/20' : ''}`}
                    />
                    <button 
                       onClick={toggleRecording}
                       className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                          isRecording 
                            ? 'bg-rose-500 text-white animate-pulse' 
                            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 hover:bg-indigo-100'
                       }`}
                       title="Voice Search"
                    >
                       {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                 </div>

                 <button 
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isTyping || isRecording}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-90"
                 >
                    <Send className="w-5 h-5 ml-1" />
                 </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">AI generated responses. Verify critical data with respective departments.</p>
           </div>
        </div>

        {/* Sidebar Context (Right) */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 flex flex-col">
           
           {/* Student Overview Panel */}
           <div className="bg-[#0F172A] rounded-[2rem] p-6 shadow-xl relative overflow-hidden text-white border border-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-[40px] -mr-10 -mt-10" />
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-400/30 flex items-center justify-center bg-white/5">
                       <User className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Active Profile</p>
                       <h3 className="text-base font-bold text-white">{student?.name || 'Student Name'}</h3>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                       <span className="text-xs font-bold text-slate-400">Reg No.</span>
                       <span className="text-sm font-black text-white px-2 py-1 bg-white/10 rounded-lg font-mono">{student?.regNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                       <span className="text-xs font-bold text-slate-400">Dept.</span>
                       <span className="text-sm font-bold text-slate-200">{student?.branch?.split(' ').map(w => w[0]).join('') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-400">Semester</span>
                       <span className="text-sm font-black text-indigo-300">Sem {student?.semester || 'N/A'}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* AI Insights Panel */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] p-6 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
                 <Bot className="w-5 h-5" />
                 <h3 className="text-sm font-black uppercase tracking-tight">System Insights</h3>
              </div>

              {insights ? (
                 <div className="space-y-5 flex-1 flex flex-col">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                       <div className="flex gap-3">
                          <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <div>
                             <p className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-500 mb-1">Strong Subject</p>
                             <p className="text-sm font-bold text-slate-800 dark:text-gray-200">{insights.strongSubjects?.[0] || 'N/A'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30">
                       <div className="flex gap-3">
                          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                          <div>
                             <p className="text-[10px] font-black tracking-widest uppercase text-rose-600 dark:text-rose-500 mb-1">Needs Improvement</p>
                             <p className="text-sm font-bold text-slate-800 dark:text-gray-200">{insights.weakSubjects?.[0] || 'No weak areas tracked'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 mt-auto">
                       <div className="flex gap-3">
                          <BookOpen className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                          <div>
                             <p className="text-[10px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-500 mb-1">AI Recommendation</p>
                             <p className="text-xs font-medium text-slate-700 dark:text-gray-300 leading-relaxed">{insights.improvementSuggestions?.[0] || 'Keep up the current trajectory.'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="flex-1 flex items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-2xl">
                    <p className="text-xs text-slate-400 font-medium">Insights data is currently unavailable.</p>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
}
