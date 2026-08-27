import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getChatResponse } from '../services/apiService'
import ChatMessage from './ChatMessage'
import { SendHorizontal, Settings, Mic, MapPin, Languages, ChevronDown, Loader2 } from 'lucide-react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import SurveyModal from './SurveyModal'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../context/AuthContext' 
import logo from '../assets/logoman.png'

const AssistantPage = () => {
  const { profile, updateProfile, clearProfile } = useProfile()
  const { currentUser } = useAuth() 
  const { chatId } = useParams() 
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  const { chats, setChats } = useOutletContext();

  const [isListening, setIsListening] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [showLangPicker, setShowLangPicker] = useState(false)
  
  const [locationName, setLocationName] = useState('LOCATING...') 
  const [userLocationCoords, setUserLocationCoords] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [showSurvey, setShowSurvey] = useState(() => {
    if (!currentUser) return false;
    const hasCompletedDNA = localStorage.getItem(`sowego_dna_${currentUser.uid}`);
    return !hasCompletedDNA; 
  });

  const currentChat = chats.find(c => c.id === chatId);
  const displayMessages = currentChat ? currentChat.messages : [];

  // 🔥 UX TWEAK 1: Auto-Scroll Fix (100ms delay allows Framer Motion to render first)
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [displayMessages, isLoading]);

  useEffect(() => {
    if (!isLocating && locationName === 'LOCATING...') {
      handleUpdateLocation();
    }
  }, []); 

  const languages = [
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', label: 'KN' },
    { code: 'hi', name: 'हिन्दी (Hindi)', label: 'HI' }
  ]

  // 🔥 UX TWEAK 2: Quick Start Demo Chips
  const quickStartPrompts = [
    "Plan a 2-day trip to Goa",
    "What are some budget stays in Udupi?",
    "Show me hidden gems near Mangaluru"
  ];

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support speech recognition.");
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setLocationName('UNSUPPORTED');
      return;
    }

    setIsLocating(true);
    setLocationName('LOCATING...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserLocationCoords(`${latitude}, ${longitude}`);
          
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();

          const city = data.address.city || data.address.town || data.address.village || data.address.county || "Current Location";
          const state = data.address.state || "";

          setLocationName(`${city}, ${state}`);
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationName('LOCATION ERROR');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationName('LOCATION DENIED');
        setIsLocating(false);
      }
    );
  };

  const handleSend = async (e, customText = null) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return

    const userMsg = { role: 'user', content: textToSend };
    let activeId = chatId;

    if (!chatId) {
      activeId = crypto.randomUUID();
      const newChat = {
        id: activeId,
        title: textToSend.length > 25 ? textToSend.substring(0, 25) + "..." : textToSend,
        timestamp: new Date().toISOString(),
        messages: [userMsg]
      };
      setChats(prev => [newChat, ...prev]);
      navigate(`/assistant/${activeId}`);
    } else {
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, userMsg] } : c
      ));
    }

    const currentHistory = [...displayMessages, userMsg];
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const locationContext = userLocationCoords || locationName;
      const aiResponse = await getChatResponse(currentHistory, currentLanguage, locationContext, profile);
      const aiMsg = { role: 'ai', content: aiResponse };
      
      setChats(prev => prev.map(c => 
        c.id === activeId ? { ...c, messages: [...c.messages, aiMsg] } : c
      ));
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveDNA = (data) => {
    // 🔥 INJECT STARTING VOYNT BALANCE UPON CREATION
    const profileData = { ...data, voynts: 500 }; 
    
    updateProfile(profileData);
    localStorage.setItem(`sowego_dna_${currentUser.uid}`, 'true');
    setShowSurvey(false);
  };

  return (
    <>
      {showSurvey && <SurveyModal onSave={handleSaveDNA} onClose={() => setShowSurvey(false)} />}
      
      <div className="flex-1 flex flex-col relative bg-black h-full overflow-hidden border-l border-white/5">
        <div className="flex-1 overflow-y-auto p-6 md:p-12 relative scroll-smooth custom-scrollbar">
          <AnimatePresence>
            {displayMessages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8 pointer-events-none">
                  <div className="absolute inset-0 bg-[#14FFEC]/20 blur-3xl rounded-full" />
                  <img src={logo} alt="SoWeGo" className="w-36 h-36 relative z-10 opacity-40 drop-shadow-[0_0_30px_rgba(20,255,236,0.6)]" />
                </div>
                <h2 className="text-4xl font-bold text-white/20 tracking-tighter mb-8 pointer-events-none">What can I help you with?</h2>
                
                {/* 🔥 UX TWEAK 3: The Empty State Quick Start Chips */}
                <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto relative z-20">
                  {quickStartPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                      onClick={() => handleSend(null, prompt)}
                      disabled={isLoading}
                      className="text-xs sm:text-sm font-bold px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-[#14FFEC]/10 hover:border-[#14FFEC]/50 hover:text-[#14FFEC] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-3xl mx-auto w-full z-10 relative">
            {displayMessages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                role={msg.role} 
                content={msg.content} 
                onOptionClick={(selectedOptionText) => handleSend(null, selectedOptionText)}
              />
            ))}
            {isLoading && <ChatMessage role="ai" content={{}} isLoading={true} />}
            <div ref={messagesEndRef} className="h-4" /> {/* Added h-4 for extra scroll padding */}
          </div>
        </div>

        <div className="p-8 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            
            <div className="flex justify-between items-center px-2 relative">
                
              <div className="flex gap-6">
                
                <div className="relative">
                  <button onClick={() => setShowLangPicker(!showLangPicker)} className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 uppercase font-bold tracking-widest transition-all">
                    <Languages size={12} /> {languages.find(l => l.code === currentLanguage).label} <ChevronDown size={10} />
                  </button>
                  <AnimatePresence>
                    {showLangPicker && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 w-32">
                        {languages.map((lang) => (
                          <button key={lang.code} onClick={() => { setCurrentLanguage(lang.code); setShowLangPicker(false); }} className={`w-full text-left px-3 py-2 text-[10px] uppercase font-bold transition-colors hover:bg-[#14FFEC]/10 ${currentLanguage === lang.code ? 'text-[#14FFEC] bg-[#14FFEC]/5' : 'text-slate-400'}`}>
                            {lang.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <button 
                  onClick={handleUpdateLocation} 
                  disabled={isLocating}
                  className={`text-[10px] flex items-center gap-1 uppercase font-bold tracking-widest transition-all group ${isLocating ? 'text-[#14FFEC]' : 'text-slate-500 hover:text-white'}`}
                >
                  {isLocating ? (
                    <Loader2 size={12} className="animate-spin text-[#14FFEC]" />
                  ) : (
                    <MapPin size={12} className="group-hover:animate-bounce" />
                  )}
                  <span className="max-w-[150px] truncate">{locationName}</span>
                </button>

              </div>

              <button 
                onClick={() => { 
                  clearProfile(); 
                  localStorage.removeItem(`sowego_dna_${currentUser.uid}`);
                  setShowSurvey(true); 
                }} 
                className="text-[9px] sm:text-[10px] text-slate-600 hover:text-[#14FFEC] flex items-center gap-2 uppercase font-bold tracking-[0.2em] transition-all group"
              >
                <Settings size={12} className="group-hover:rotate-90 transition-transform duration-500" />
                Edit Fiduciary Profile
              </button>
            </div>

            <form onSubmit={(e) => handleSend(e, null)} className="relative group">
              <button type="button" onClick={startSpeechRecognition} disabled={isLoading} className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-20 disabled:opacity-50 ${isListening ? 'bg-[#14FFEC] text-black' : 'text-slate-500 hover:text-[#14FFEC]'}`}>
                <Mic size={20} className={isListening ? "animate-pulse" : ""} />
              </button>
              {/* 🔥 UX TWEAK 4: Input disables and dims safely when loading */}
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={isListening ? "Listening clearly..." : "Message SoWeGo..."} 
                className={`w-full bg-[#0A0A0A] border rounded-2xl py-5 pl-14 pr-16 text-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'border-[#14FFEC] ring-1' : 'border-white/10 hover:border-white/20 focus:border-[#14FFEC]/50'}`} 
                disabled={isLoading} 
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#14FFEC] rounded-xl text-black disabled:opacity-50 disabled:bg-slate-700 transition-all" disabled={isLoading || !input.trim()}>
                <SendHorizontal size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AssistantPage;