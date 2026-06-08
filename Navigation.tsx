import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { Globe, Gamepad2, Users, Trophy, Settings, Volume2, VolumeX } from 'lucide-react';

export default function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const { language, setLanguage, audioEnabled, setAudioEnabled, user } = useStore();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Globe },
    { name: 'Play', path: '/lobby', icon: Gamepad2 },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 bg-gradient-to-tr from-[#ff6b00] to-[#f59e0b] rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,107,0,0.3)]">
            <motion.div 
              className="absolute inset-0 bg-white/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative font-black text-white text-lg z-10">BF</span>
          </div>
          <div className="text-sm tracking-[0.2em] text-white/40 uppercase font-bold hidden sm:block">
            BOARD FORGE / <span className="text-board-accent uppercase">{location.pathname === '/' ? 'HOME' : location.pathname.split('/')[1]}</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                    isActive ? 'text-board-accent' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(link.name)}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 border-l border-white/5 pl-4 rtl:border-r rtl:border-l-0 rtl:pr-4 rtl:pl-0">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
               <span 
                 onClick={() => setLanguage('en')}
                 className={`text-xs font-medium cursor-pointer transition-colors ${language === 'en' ? 'text-white' : 'text-white/40 hover:text-white'}`}
               >
                 EN
               </span>
               <div className="w-[1px] h-3 bg-white/20"></div>
               <span 
                 onClick={() => setLanguage('fa')}
                 className={`text-xs font-medium cursor-pointer transition-colors ${language === 'fa' ? 'text-white' : 'text-white/40 hover:text-white'}`}
               >
                 FA
               </span>
               <span className="text-[10px] text-white/40 ml-1">فارسی</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right">
                <div className="text-xs font-bold text-white/90">{user?.name}</div>
                <div className="text-[10px] text-green-500 flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> ONLINE
                </div>
              </div>
              <Link 
                to="/profile"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform p-1 cursor-pointer"
                style={{ background: `linear-gradient(to right, ${user?.color || '#ff6b00'}, transparent)` }}
              >
                 <div className="w-full h-full bg-[#050505] rounded-full overflow-hidden border border-white/10 p-0.5">
                    {user?.avatar ? (
                       <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                       <Users className="w-4 h-4 text-white/40 m-auto mt-1" />
                    )}
                 </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
