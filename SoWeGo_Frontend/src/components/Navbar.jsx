import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 
import { LogOut, ChevronDown, User, Settings } from 'lucide-react'
import logo from '../assets/logo.png' 

const Navbar = () => {
  const { currentUser, logout } = useAuth(); 
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-[100] px-6 py-2 pointer-events-none bg-black/50 backdrop-blur-2xl border-b border-white/10"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* 🛡️ LEFT WING: Logo Capsule */}
        <motion.div 
          className="pointer-events-auto backdrop-blur-2xl bg-black/40 border border-white/10 px-6 py-2 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          whileHover={{ scale: 1.02, border: '1px solid rgba(20,255,236,0.3)' }}
        >
          <Link to="/" className="flex items-center hover:opacity-100 transition-opacity">
            <img 
              src={logo} 
              alt="SoWeGo" 
              className="h-14 w-auto object-contain logo-glow" 
            />
          </Link>
        </motion.div>
        
        {/* 🛡️ RIGHT WING: Minimalist User Profile */}
        <div className="flex items-center gap-6 pointer-events-auto">
          {currentUser && (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 hover:opacity-100 transition-opacity"
              >
                <img
                  src={currentUser.photoURL}
                  referrerPolicy="no-referrer"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-[#14FFEC]/50 shadow-[0_0_20px_rgba(20,255,236,0.5)]"
                />
                <ChevronDown size={18} className={`text-[#14FFEC] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-6 w-72 glass-card border border-white/10 shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-white/5 bg-white/5">
                      <p className="text-sm font-black text-white truncate mb-1">{currentUser.displayName}</p>
                      <p className="text-[10px] text-[#14FFEC] truncate font-bold uppercase tracking-widest">{currentUser.email}</p>
                    </div>
                    <div className="p-3 space-y-1">
                      <button className="flex w-full items-center gap-4 px-4 py-4 text-[10px] font-black text-slate-300 hover:bg-[#14FFEC]/10 hover:text-[#14FFEC] rounded-xl transition-all uppercase tracking-widest">
                        <User size={16} /> Fiduciary Profile
                      </button>
                      <button className="flex w-full items-center gap-4 px-4 py-4 text-[10px] font-black text-slate-300 hover:bg-[#14FFEC]/10 hover:text-[#14FFEC] rounded-xl transition-all uppercase tracking-widest">
                        <Settings size={16} /> System Prefs
                      </button>
                      <div className="h-[1px] bg-white/5 my-2" />
                      <button
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="flex w-full items-center gap-4 px-4 py-4 text-[10px] font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar