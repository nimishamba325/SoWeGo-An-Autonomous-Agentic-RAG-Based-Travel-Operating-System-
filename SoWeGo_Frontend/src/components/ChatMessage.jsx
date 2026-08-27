import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import DayCard from './DayCard'
import BudgetPieChart from './BudgetPieChart'
import PrepChecklistCard from './PrepChecklistCard'
import BlueBusModal from './BlueBusModal' // 🔥 NEW: Modal Import
import { MapPin, Calendar, IndianRupee, ArrowRight, Bus, CheckCircle2 } from 'lucide-react' // 🔥 UPDATED: Replaced ExternalLink

// Avatar component with updated colors
const Avatar = ({ role }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg ${
    role === 'user' ? 'bg-purple-600' : 'bg-[#14FFEC]/10 border border-[#14FFEC]/30'
  }`}>
    {role === 'user' ? 
      <span className="text-xs font-bold">U</span> : 
      <span className="text-[10px] font-bold text-[#14FFEC]">AI</span>
    }
  </div>
)

const LoadingDots = () => (
  <div className="flex space-x-1.5 py-2">
    {[0, 0.15, 0.3].map((delay, i) => (
      <motion.div 
        key={i}
        className="w-2 h-2 bg-[#14FFEC] rounded-full" 
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }} 
        transition={{ duration: 1, repeat: Infinity, delay }} 
      />
    ))}
  </div>
)

const ItineraryHeader = ({ data }) => {
  const destination = data.destination || data.itinerary_title?.split(' ').pop() || 'travel';
  const bgImageUrl = `https://source.unsplash.com/400x200/?${destination},city`;
  const showBudget = data.estimated_budget && !data.estimated_budget.toLowerCase().includes('not provided');

  return (
    <motion.div
      className="relative overflow-hidden mb-4 rounded-[24px] border border-white/10 shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImageUrl})` }} />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="relative z-10 p-6">
        <h2 className="text-xl font-bold text-white mb-3 tracking-tight">{data.itinerary_title}</h2>
        {data.start_location && (
          <div className="flex items-center gap-2 text-[#14FFEC] font-medium mb-4 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{data.start_location}</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-50" />
            <span className="truncate">{data.destination}</span>
          </div>
        )}
        <div className="flex gap-5 text-slate-300 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Calendar className="w-3.5 h-3.5 text-[#14FFEC]" />
            <span>{data.total_days} Days</span>
          </div>
          {showBudget && (
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <IndianRupee className="w-3.5 h-3.5 text-[#14FFEC]" />
              <span>{data.estimated_budget}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// NOTE: Added onOptionClick prop to handle Action Chip clicks
const ChatMessage = ({ role, content, isLoading = false, onOptionClick }) => {
  const isUser = role === 'user'
  
  // 🔥 PHASE 3 STATE
  const [showBlueBus, setShowBlueBus] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  
  let contentToShow;

  if (isLoading) {
    contentToShow = <LoadingDots />
  } else if (isUser) {
    contentToShow = (
      <div className="prose prose-invert max-w-none text-black font-semibold">
        <ReactMarkdown>{typeof content === 'string' ? content : content.reply}</ReactMarkdown>
      </div>
    )
  } else {
    // AI Message - Sequential Rendering (renders whatever data was passed in the JSON)
    contentToShow = (
      <div className="space-y-5">
        {/* 1. Chat Reply */}
        {content.reply && (
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed">
            <ReactMarkdown>{content.reply}</ReactMarkdown>
          </div>
        )}

        {/* 2. Itinerary Card */}
        {content.itinerary && (
          <div className="space-y-4 pt-2">
            <ItineraryHeader data={content.itinerary} />
            
            {/* 🔥 THE FINAL BOSS: BLUEBUS AUTOPAY BUTTON */}
            <motion.button
              onClick={() => !isBooked && setShowBlueBus(true)}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-[20px] transition-all font-bold text-xs uppercase tracking-wider ${
                isBooked
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400 cursor-default shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                  : 'bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isBooked ? (
                <><CheckCircle2 size={16} /> Booked via BlueBus Autopay</>
              ) : (
                <><Bus size={16} /> Book with BlueBus</>
              )}
            </motion.button>

            {/* 🔥 THE MODAL INJECTION */}
            <BlueBusModal
              isOpen={showBlueBus}
              onClose={() => setShowBlueBus(false)}
              onConfirm={() => {
                setIsBooked(true);
                setShowBlueBus(false);
              }}
              source={content.itinerary.start_location}
              destination={content.itinerary.destination}
            />

            <div className="space-y-3">
              {content.itinerary.days?.map((day, index) => (
                <DayCard key={day.day} dayData={day} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* 3. Budget Chart */}
        {content.budget && (
          <div className="pt-2">
            <BudgetPieChart data={content.budget} />
          </div>
        )}

        {/* 4. NEW: Prep Checklist Card */}
        {content.prep_checklist && (
          <div className="pt-2">
            <PrepChecklistCard checklist={content.prep_checklist} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-8 w-full flex flex-col">
      {/* Main Message Bubble */}
      <motion.div
        className={`flex gap-4 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {!isUser && <Avatar role={role} />}
        
        <div className={`relative px-6 py-4 max-w-[90%] md:max-w-[80%] transition-all duration-300 ${
          isUser 
            ? 'bg-[#14FFEC] text-black rounded-[24px] rounded-tr-none shadow-[0_0_25px_rgba(20,255,236,0.25)]' 
            : 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] rounded-tl-none shadow-2xl'
        }`}>
          {contentToShow}
        </div>
        
        {isUser && <Avatar role={role} />}
      </motion.div>

      {/* NEW: Action Chips rendered below AI messages */}
      {!isUser && !isLoading && content.suggested_options && content.suggested_options.length > 0 && (
        <motion.div 
          className="flex flex-wrap gap-2 mt-4 ml-[3.25rem]" // ml-[3.25rem] perfectly aligns chips with the text bubble edge, skipping the avatar
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }} // Slight delay so they pop in after the message
        >
          {content.suggested_options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onOptionClick && onOptionClick(option)}
              className="text-xs font-bold px-4 py-2 bg-slate-900 border border-[#14FFEC]/40 text-[#14FFEC] rounded-full hover:bg-[#14FFEC]/10 hover:border-[#14FFEC] transition-all shadow-lg active:scale-95"
            >
              {option}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default ChatMessage