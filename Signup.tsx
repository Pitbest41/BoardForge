import { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router';
import { useStore } from '../store/useStore';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import Background3D from '../components/Background3D';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    // Simulate signup
    setUser({
      name,
      email,
      color: '#ff6b00',
      isGuest: false,
      isPremium: false,
    });
    
    navigate('/profile');
  };

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden py-20 px-6">
      <Background3D />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#121212]/90 border border-white/5 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#ff6b00] to-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,107,0,0.3)]">
              <ShieldCheck className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-display font-black mb-2">{t('Create Account')}</h1>
            <p className="text-gray-400 text-sm">Join the premium gaming network.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Display Name')}</label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-board-accent transition-colors"
                  placeholder="e.g. GrandMaster"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Email')}</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-board-accent transition-colors"
                  placeholder="player@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Password')}</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-board-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-board-accent text-black font-black py-4 rounded-xl mt-6 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
            >
              <span>{t('Sign Up')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account? <Link to="/lobby" className="text-board-accent font-bold hover:underline">Play as Guest for now</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
