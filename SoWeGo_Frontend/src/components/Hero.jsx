import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile' 
import Orb from './Orb'
import CityBackground from './CityBackground'
import logoMan from '../assets/logoman.png' 
import SurveyModal from './SurveyModal' 

const Hero = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { hasProfile, updateProfile, isProfileLoaded } = useProfile() 
  const [isHovered, setIsHovered] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false) 

  const handleCTAClick = () => {
    if (!currentUser) {
      // Step 1: Not logged in? Go to login.
      navigate('/login');
    } else if (isProfileLoaded && !hasProfile) {
      // Step 2: Logged in but NO Traveler DNA? Show Survey.
      setShowSurvey(true);
    } else {
      // Step 3: Logged in AND has profile? Execute Intent!
      navigate('/assistant');
    }
  }

  const handleSurveyComplete = (profileData) => {
    updateProfile(profileData); 
    setShowSurvey(false);       
    navigate('/assistant');     
  }

  // 🔥 DYNAMIC BUTTON CONFIGURATION BASED ON AUTH STATE
  const buttonConfig = currentUser 
    ? {
        text: "Plan with AI",
        icon: "✦", // AI spark icon
        iconColor: "text-[#14FFEC]",
        theme: "bg-gradient-to-r from-[#14FFEC]/10 to-[#00D4D4]/10 border-[#14FFEC]/50",
        shadowPulse: ["0px 0px 15px rgba(20,255,236,0.2)", "0px 0px 30px rgba(20,255,236,0.4)", "0px 0px 15px rgba(20,255,236,0.2)"],
        glowBg: "bg-[#14FFEC]/20"
      }
    : {
        text: "Activate SoWeGo",
        icon: "→", // Forward momentum icon
        iconColor: "text-purple-400",
        theme: "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/50",
        shadowPulse: ["0px 0px 15px rgba(168,85,247,0.2)", "0px 0px 30px rgba(168,85,247,0.4)", "0px 0px 15px rgba(168,85,247,0.2)"],
        glowBg: "bg-purple-500/20"
      };

  return (
    <section id="home" className="relative w-full h-full bg-black flex items-center justify-center pt-16">
      
      {/* 🛡️ CITY BACKGROUND LAYER */}
      <CityBackground />
      
      {/* 🛡️ THE ORB LAYER */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <Orb 
          hue={0} 
          hoverIntensity={0.6} 
          rotateOnHover={true} 
          forceHoverState={isHovered} 
        />
      </div>

      {/* 🛡️ THE CONTENT LAYER */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <img 
            src={logoMan} 
            alt="SoWeGo Icon" 
            className="w-28 h-auto opacity-100 drop-shadow-[0_0_30px_rgba(20,255,236,0.5)] contrast-125"
            style={{ 
              filter: 'contrast(1.25) saturate(1.1)',
              WebkitFontSmoothing: 'antialiased',
              backfaceVisibility: 'hidden'
            }}
          />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-2xl md:text-[28px] text-slate-300 mb-12 font-light italic tracking-[0.06em] opacity-80"
        >
          Booking, without the busywork
        </motion.p>

        {/* Wrapper for entrance animation so it doesn't conflict with continuous pulse */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.button
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleCTAClick}
            animate={{ boxShadow: buttonConfig.shadowPulse }}
            transition={{ boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-12 py-5 backdrop-blur-3xl border-2 rounded-full text-white font-black text-lg pointer-events-auto transition-colors duration-500 group ${buttonConfig.theme}`}
          >
            <span className="relative z-10 flex items-center gap-3">
              {buttonConfig.text} 
              <motion.span 
                animate={isHovered ? { x: 5 } : { x: 0 }} 
                className={`${buttonConfig.iconColor} font-black text-xl`}
              >
                {buttonConfig.icon}
              </motion.span>
            </span>
            <div className={`absolute inset-0 ${buttonConfig.glowBg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          </motion.button>
        </motion.div>
      </div>

      {/* 🛡️ GATEKEEPER MODAL: Only renders when triggered */}
      <AnimatePresence>
        {showSurvey && (
          <SurveyModal 
            onSave={handleSurveyComplete} 
            onClose={() => setShowSurvey(false)} 
          />
        )}
      </AnimatePresence>

    </section>
  )
}

export default Hero