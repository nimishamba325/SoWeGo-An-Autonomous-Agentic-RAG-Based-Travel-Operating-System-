import { useState } from 'react'
import { motion } from 'framer-motion'
import { Utensils, Brush, BarChart, Trees, Landmark, PartyPopper } from 'lucide-react'

const interestOptions = [
  { name: 'Food', icon: <Utensils size={24} /> },
  { name: 'Art', icon: <Brush size={24} /> },
  { name: 'Budget', icon: <BarChart size={24} /> },
  { name: 'Nature', icon: <Trees size={24} /> },
  { name: 'History', icon: <Landmark size={24} /> },
  { name: 'Nightlife', icon: <PartyPopper size={24} /> },
]

const SurveyModal = ({ onSave, onClose }) => {
  const [ageRange, setAgeRange] = useState('');
  const [interests, setInterests] = useState([]);

  const toggleInterest = (interestName) => {
    setInterests((prev) =>
      prev.includes(interestName)
        ? prev.filter((i) => i !== interestName) 
        : [...prev, interestName] 
    );
  };

  const handleSave = () => {
    if (!ageRange) {
      alert("Please select an age range.");
      return;
    }
    
    // 🛡️ Pass data to parent instead of hardcoding LocalStorage here
    const userProfile = { ageRange, interests };
    onSave(userProfile);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-8 shadow-2xl relative"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: "easeOut" }}
      >
        {/* Optional Close Button if they want to back out */}
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
            ✕
          </button>
        )}

        <h2 className="text-3xl font-bold text-white mb-2">Traveler DNA</h2>
        <p className="text-slate-400 mb-6 text-sm">
          Initialize your Fiduciary Profile. This data is encrypted locally and used to orchestrate your hyper-personalized itineraries.
        </p>

        {/* Age Range */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Life Stage</h3>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#14FFEC]/50 appearance-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-900">Select an age range...</option>
            <option value="18-24" className="bg-slate-900">18-24</option>
            <option value="25-34" className="bg-slate-900">25-34</option>
            <option value="35-49" className="bg-slate-900">35-49</option>
            <option value="50+" className="bg-slate-900">50+</option>
          </select>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Core Vectors</h3>
          <div className="grid grid-cols-3 gap-3">
            {interestOptions.map((item) => {
              const isActive = interests.includes(item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => toggleInterest(item.name)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all duration-300
                    ${isActive
                      ? 'bg-[#14FFEC]/20 text-[#14FFEC] border border-[#14FFEC]/50 shadow-[0_0_15px_rgba(20,255,236,0.2)]'
                      : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  {item.icon}
                  <span className="text-[10px] uppercase tracking-wider font-bold">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="w-full rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#14FFEC]/50 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] shadow-xl group overflow-hidden relative"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Establish Profile <span className="text-[#14FFEC] group-hover:translate-x-1 transition-transform">→</span>
          </span>
          <div className="absolute inset-0 bg-[#14FFEC]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default SurveyModal;