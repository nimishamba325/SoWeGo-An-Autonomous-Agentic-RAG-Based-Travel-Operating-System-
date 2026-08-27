import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Orb from './Orb';
import logo from '../assets/logoman.png';

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      // 🛡️ After login, go back to Hero (Image 2) as requested
      navigate('/');
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black pt-[68px]">
      <div className="fixed inset-0 z-0 opacity-40">
        <Orb hue={0} hoverIntensity={0.5} rotateOnHover={true} forceHoverState={false} />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-10 glass-card border border-white/10 text-center"
      >
        <img src={logo} alt="SoWeGo" className="w-32 mx-auto mb-8 logo-glow" />
        
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
          Authentication <br /> Required
        </h1>
        <p className="text-slate-500 mb-12 text-[10px] uppercase font-bold tracking-[0.4em]">
          Verify identity for Intent Execution
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full py-4 btn-intent rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
          <span className="font-bold tracking-tight">Sign in with Google</span>
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;