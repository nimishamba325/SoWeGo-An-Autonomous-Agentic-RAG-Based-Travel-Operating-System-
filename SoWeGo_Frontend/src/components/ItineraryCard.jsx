import { motion } from 'framer-motion'
import { MapPin, Calendar, IndianRupee, Sun, Moon } from 'lucide-react'

// This component renders a high-tech, glass-themed structured itinerary
const ItineraryCard = ({ data }) => {
  return (
    <motion.div
      className="max-w-md md:max-w-lg lg:max-w-xl bg-white/5 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-2xl border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 🛡️ Header with Cyber Teal Gradient */}
      <div className="p-8 bg-gradient-to-br from-[#14FFEC]/20 via-[#14FFEC]/5 to-transparent border-b border-white/5">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-[#14FFEC]/10 rounded-xl border border-[#14FFEC]/30">
            <MapPin className="w-6 h-6 text-[#14FFEC]" />
          </div>
          <h2 className="text-2xl font-black text-white leading-tight tracking-tighter">
            {data.itinerary_title}
          </h2>
        </div>
        
        <div className="flex gap-5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Calendar className="w-3.5 h-3.5 text-[#14FFEC]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              {data.total_days} Days
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <IndianRupee className="w-3.5 h-3.5 text-[#14FFEC]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              {data.estimated_budget}
            </span>
          </div>
        </div>
      </div>

      {/* 🛡️ Scrollable Glass Body */}
      <div className="p-8 space-y-6 max-h-[450px] overflow-y-auto custom-scrollbar relative">
        {data.days.map((day, idx) => (
          <div key={day.day} className="relative pl-6 border-l border-[#14FFEC]/20 pb-2 last:pb-0">
            {/* Timeline Dot */}
            <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#14FFEC] shadow-[0_0_10px_#14FFEC]" />
            
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
              Day {day.day}: <span className="text-[#14FFEC]/80">{day.title}</span>
            </h3>
            
            <div className="space-y-4">
              {/* Morning Slot */}
              <div className="flex items-start gap-3 group">
                <Sun className="w-4 h-4 mt-1 flex-shrink-0 text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm leading-relaxed text-slate-400">
                  <span className="font-bold text-slate-200 block mb-0.5 text-[10px] uppercase tracking-wider">Morning Execution</span> 
                  {day.morning}
                </p>
              </div>

              {/* Evening Slot */}
              <div className="flex items-start gap-3 group">
                <Moon className="w-4 h-4 mt-1 flex-shrink-0 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                <p className="text-sm leading-relaxed text-slate-400">
                  <span className="font-bold text-slate-200 block mb-0.5 text-[10px] uppercase tracking-wider">Evening Execution</span> 
                  {day.evening}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Subtle bottom glow to indicate more content */}
        <div className="sticky bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  )
}

export default ItineraryCard