import { motion } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';

const DayCard = ({ dayData, index }) => {
  // Animation variants for the container
  const cardVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6, 
        delay: index * 0.1, 
        ease: [0.22, 1, 0.36, 1] 
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group relative pl-16 pr-6 py-7 bg-slate-900/40 backdrop-blur-2xl rounded-[28px] border border-white/10 overflow-hidden shadow-2xl hover:border-[#14FFEC]/30 transition-colors duration-500"
    >
      {/* 🛡️ CYBER TEAL DAY INDICATOR */}
      <div className="absolute left-0 top-0 h-full w-12 bg-[#14FFEC]/5 border-r border-[#14FFEC]/20 flex items-center justify-center overflow-hidden">
        {/* Animated background pulse for the sidebar */}
        <div className="absolute inset-0 bg-[#14FFEC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <span className="relative z-10 text-xl font-black text-[#14FFEC] transform -rotate-90 tracking-tighter whitespace-nowrap">
          DAY {dayData.day < 10 ? `0${dayData.day}` : dayData.day}
        </span>
      </div>

      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#14FFEC]/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#14FFEC]/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Title Header */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-[#14FFEC] opacity-50" />
          <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
            {dayData.title}
          </h3>
        </div>

        <div className="space-y-6">
          {/* Morning Section */}
          <div className="flex items-start gap-4 group/item">
            <div className="mt-1 p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover/item:border-amber-500/40 transition-colors">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-[#14FFEC] uppercase text-[10px] tracking-[0.2em] block mb-1 opacity-70">
                Morning Session
              </span>
              <p className="text-[14px] leading-relaxed text-slate-300 font-medium">
                {dayData.morning}
              </p>
            </div>
          </div>

          {/* Evening Section */}
          <div className="flex items-start gap-4 group/item">
            <div className="mt-1 p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover/item:border-indigo-500/40 transition-colors">
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="font-bold text-indigo-400 uppercase text-[10px] tracking-[0.2em] block mb-1 opacity-70">
                Evening Session
              </span>
              <p className="text-[14px] leading-relaxed text-slate-300 font-medium">
                {dayData.evening}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 right-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#14FFEC]/40 to-transparent" />
    </motion.div>
  );
};

export default DayCard;