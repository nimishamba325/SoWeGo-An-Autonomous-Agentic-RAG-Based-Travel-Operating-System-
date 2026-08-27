import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, ArrowRight, Fingerprint, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { useProfile } from '../hooks/useProfile'; // 🔥 IMPORTED HOOK

const BlueBusModal = ({ isOpen, onClose, onConfirm, source, destination }) => {
  const [step, setStep] = useState(1); 
  const [useVoynts, setUseVoynts] = useState(false);
  
  // 🔥 FETCH THE REAL VOYNT VAULT
  const { profile, updateProfile } = useProfile();
  
  // Safely check Voynts (default to 500 if missing from old accounts)
  const currentVoynts = profile?.voynts !== undefined ? profile.voynts : 500;
  const voyntsRequired = 150;
  const canAfford = currentVoynts >= voyntsRequired;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => setStep(3), 2000); 
      return () => clearTimeout(timer);
    }
    if (step === 3) {
      const timer = setTimeout(() => {
        // 🔥 THE ACTUAL DEDUCTION TRANSACTION
        if (useVoynts) {
           updateProfile({
             ...profile,
             voynts: currentVoynts - voyntsRequired
           });
        }
        onConfirm(); 
      }, 1500); 
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]); 

  if (!isOpen) return null;

  const basePrice = 850;
  const discount = useVoynts ? voyntsRequired : 0;
  const finalPrice = basePrice - discount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={step === 1 ? onClose : null} 
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-sm bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bus size={18} />
                <span className="font-bold text-sm tracking-wide">BlueBus Booking</span>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={18}/></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Route Display */}
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">From</span>
                  <span className="text-white text-sm font-semibold truncate max-w-[90px]">{source || 'Current Location'}</span>
                </div>
                <ArrowRight className="text-blue-500 w-4 h-4" />
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">To</span>
                  <span className="text-white text-sm font-semibold truncate max-w-[90px]">{destination || 'Destination'}</span>
                </div>
              </div>

              {/* 🔥 UPDATED: Dynamic Gamification Engine UI */}
              <div className="bg-gradient-to-r from-[#14FFEC]/10 to-transparent p-3 rounded-2xl border border-[#14FFEC]/20 flex items-center justify-between">
                <div>
                  <div className="text-[#14FFEC] font-bold text-xs">⭐ {currentVoynts} Voynts Available</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    {canAfford ? `Apply for ₹${voyntsRequired} off this trip` : `Need ${voyntsRequired} Voynts for discount`}
                  </div>
                </div>
                <button 
                  onClick={() => canAfford && setUseVoynts(!useVoynts)}
                  disabled={!canAfford}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${useVoynts ? 'bg-[#14FFEC]' : 'bg-slate-700'} ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <motion.div 
                    className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px]"
                    animate={{ left: useVoynts ? '22px' : '3px' }}
                  />
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 border-t border-white/10 pt-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Base Fare</span><span>₹{basePrice}</span>
                </div>
                {useVoynts && (
                  <div className="flex justify-between text-xs text-[#14FFEC]">
                    <span>Voynts Discount</span><span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base text-white font-bold pt-1.5">
                  <span>Total Amount</span><span>₹{finalPrice}</span>
                </div>
              </div>

              {/* Book Button */}
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-[0.98] flex justify-center items-center gap-2 text-sm"
              >
                <ShieldCheck size={16} /> Proceed to Autopay
              </button>
            </div>
          </motion.div>
        )}

        {/* --- STEP 2 & 3: THE GPAY OVERLAY ILLUSION --- */}
        {(step === 2 || step === 3) && (
          <motion.div 
            key="auth"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 w-full max-w-sm mx-auto bg-black rounded-t-3xl border-t border-white/10 p-6 flex flex-col items-center justify-center h-[280px] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
          >
            {step === 2 ? (
              <div className="flex flex-col items-center text-center space-y-5">
                <span className="text-white font-bold text-lg">Confirm ₹{finalPrice} via UPI</span>
                <span className="text-slate-400 text-xs">Waiting for biometric authentication...</span>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/50"
                >
                  <Fingerprint size={32} className="text-blue-500" />
                </motion.div>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                className="flex flex-col items-center text-center space-y-3"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <span className="text-white font-bold text-xl">Payment Successful!</span>
                <span className="text-green-400 text-xs font-medium">Tickets sent to WhatsApp</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlueBusModal;