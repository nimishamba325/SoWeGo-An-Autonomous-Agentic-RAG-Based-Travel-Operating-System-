import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Tag, IndianRupee, Clock, Sparkles, Send, CheckCircle, ArrowLeft, Train, Accessibility, Link } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // 🔥 NEW: Import useAuth

const ContributeGem = () => {
  const { currentUser } = useAuth(); // 🔥 NEW: Get current user
  const [formData, setFormData] = useState({
    name: '',
    district: 'Mangaluru',
    category: 'Beach',
    vibe_tags: '',
    price_cap: '',
    duration_hrs: '',
    best_time: 'Morning',
    nearest_transit_hub: '', 
    accessibility: '',       
    google_maps_url: '',     
    description: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success
  const [points, setPoints] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('http://localhost:5000/api/submit-gem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price_cap: parseFloat(formData.price_cap) || 0,
          duration_hrs: parseFloat(formData.duration_hrs) || 1
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPoints(data.points_awarded);
        setStatus('success');

        // 🔥 NEW: Instantly award Voynts to the specific user's vault
        if (currentUser) {
          const currentVoynts = parseInt(localStorage.getItem(`sowego_voynts_${currentUser.uid}`) || '0');
          localStorage.setItem(`sowego_voynts_${currentUser.uid}`, currentVoynts + data.points_awarded);
        }

        // Reset form after a few seconds
        setTimeout(() => {
          setStatus('idle');
          setFormData({
            name: '', district: 'Mangaluru', category: 'Beach', vibe_tags: '', 
            price_cap: '', duration_hrs: '', best_time: 'Morning',
            nearest_transit_hub: '', accessibility: '', google_maps_url: '', 
            description: ''
          });
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting gem:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center overflow-y-auto">
      <motion.div 
        className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-2xl border border-white/10 p-8 relative my-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <RouterLink to="/assistant" className="inline-flex items-center gap-2 text-[#14FFEC] hover:text-white transition-colors text-sm font-bold mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Neural Link
        </RouterLink>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Sparkles className="text-[#14FFEC]" /> 
            Contribute a Local Gem
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Help SoWeGo learn the coast. Submissions are reviewed by our AI before hitting the public database. Earn rep for verified spots!
          </p>
        </div>

        {status === 'success' ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle className="w-20 h-20 text-[#14FFEC] mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Gem Quarantined!</h2>
            <p className="text-gray-300">Awaiting AI verification.</p>
            <div className="mt-6 px-6 py-3 bg-[#14FFEC]/10 border border-[#14FFEC]/30 rounded-full font-bold text-[#14FFEC]">
              + {points} Voynts Awarded
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Spot Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC] transition-colors" placeholder="e.g. Secret Cove" />
                </div>
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">District</label>
                <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#14FFEC] appearance-none">
                  <option>Mangaluru</option>
                  <option>Udupi</option>
                  <option>Uttara Kannada</option>
                  <option>North Goa</option>
                  <option>South Goa</option>
                </select>
              </div>

              {/* Price Cap */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Max Price (Est)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input required type="number" name="price_cap" value={formData.price_cap} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC]" placeholder="500" />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#14FFEC] appearance-none">
                  <option>Beach</option>
                  <option>Food & Cafe</option>
                  <option>Heritage</option>
                  <option>Nightlife</option>
                  <option>Chill & Nature</option>
                </select>
              </div>

              {/* Vibe Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Vibe Tags</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input required name="vibe_tags" value={formData.vibe_tags} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC]" placeholder="e.g. Chill, Sunset, Crowded" />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Time Needed (Hrs)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input required type="number" step="0.5" name="duration_hrs" value={formData.duration_hrs} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC]" placeholder="2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nearest Transit Hub */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Nearest Transit</label>
                <div className="relative">
                  <Train className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input required name="nearest_transit_hub" value={formData.nearest_transit_hub} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC]" placeholder="e.g. Udupi Railway Station (18km)" />
                </div>
              </div>

              {/* Accessibility */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Accessibility</label>
                <div className="relative">
                  <Accessibility className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input required name="accessibility" value={formData.accessibility} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC]" placeholder="e.g. 2km trek, steep stairs" />
                </div>
              </div>
            </div>

            {/* Google Maps URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Google Maps Link</label>
              <div className="relative">
                <Link className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input required type="url" name="google_maps_url" value={formData.google_maps_url} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#14FFEC]" placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14FFEC] uppercase tracking-wider">Why is this a gem?</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#14FFEC] resize-none" placeholder="Describe the spot..."></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="w-full bg-gradient-to-r from-[#14FFEC] to-teal-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {status === 'submitting' ? 'Transmitting Data...' : <><Send className="w-5 h-5" /> Submit to Quarantine Zone</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ContributeGem;