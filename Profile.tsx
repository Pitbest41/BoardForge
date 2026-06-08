import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useStore } from '../store/useStore';
import { Camera, Save, LogOut } from 'lucide-react';

const COLORS = [
  '#ff6b00', // Default Orange
  '#4f46e5', // Indigo
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#0ea5e9', // Sky
  '#eab308'  // Yellow
];

const AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Snickers',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Pepper',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam',
];

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUserProfile, setUser } = useStore();

  const [name, setName] = useState(user?.name || '');
  const [color, setColor] = useState(user?.color || '#ff6b00');
  const [avatar, setAvatar] = useState(user?.avatar || AVATARS[0]);

  if (!user) {
    navigate('/signup');
    return null;
  }

  const handleSave = () => {
    updateUserProfile({ name, color, avatar });
    navigate('/');
  };

  const handleLogout = () => {
    setUser({ name: 'Guest_' + Math.floor(Math.random() * 1000), color: '#ff6b00', isGuest: true, isPremium: false });
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col items-center py-20 px-6 relative">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-end justify-between mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t('Profile')}</h1>
                <p className="text-gray-400 text-lg">Customize your gaming identity.</p>
            </div>
            {!user.isGuest && (
                 <button onClick={handleLogout} className="text-red-500 hover:text-red-400 hover:underline flex items-center gap-2 font-bold mb-4">
                     <LogOut className="w-4 h-4" /> {t('Logout')}
                 </button>
            )}
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div className="bg-[#121212]/80 border border-white/5 rounded-2xl p-8 backdrop-blur-sm shadow-2xl flex flex-col items-center">
                 <div 
                    className="w-32 h-32 rounded-full mb-6 p-1 relative group cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${color}, transparent)` }}
                 >
                    <div className="w-full h-full bg-[#050505] rounded-full overflow-hidden p-2">
                        <img src={avatar} alt="Avatar" className="w-full h-full object-contain" />
                    </div>
                 </div>
                 
                 <div className="text-center w-full">
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Status</div>
                    <div className="font-display font-bold text-xl truncate px-2" style={{ color }}>{name}</div>
                    <div className="text-sm text-gray-400 mt-1">{user.isGuest ? t('Guest') : user.email}</div>
                 </div>
                 
                 {user.isGuest && (
                    <button 
                        onClick={() => navigate('/signup')} 
                        className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors mt-8 font-bold text-sm text-white"
                    >
                        Create Account
                    </button>
                 )}
            </div>

            <div className="bg-[#121212]/80 border border-white/5 rounded-2xl p-8 backdrop-blur-sm shadow-2xl flex flex-col gap-8">
                
                {/* Display Name */}
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('Display Name')}</label>
                   <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl py-4 px-4 outline-none transition-colors"
                      style={{ borderColor: name ? color : undefined }} 
                   />
                </div>

                {/* Theme Color */}
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('Profile Color')}</label>
                   <div className="flex flex-wrap gap-3">
                      {COLORS.map(c => (
                         <div 
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-offset-[#121212]' : ''}`}
                            style={{ backgroundColor: c, '--tw-ring-color': c } as any}
                         >
                            {color === c && <div className="w-2 h-2 bg-black rounded-full" />}
                         </div>
                      ))}
                   </div>
                </div>

                {/* Avatar Selection */}
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('Avatar')}</label>
                   <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {AVATARS.map(av => (
                         <div 
                            key={av}
                            onClick={() => setAvatar(av)}
                            className={`aspect-square rounded-xl bg-[#050505] p-2 cursor-pointer border hover:border-white/30 transition-all ${avatar === av ? 'border-2 border-opacity-100' : 'border-white/10'}`}
                            style={avatar === av ? { borderColor: color } : {}}
                         >
                            <img src={av} alt="Avatar opt" className="w-full h-full object-contain" />
                         </div>
                      ))}
                   </div>
                </div>

                <div className="pt-4 mt-auto">
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 rounded-xl font-black text-black transition-transform hover:scale-[1.02] shadow-lg"
                        style={{ backgroundColor: color, boxShadow: `0 10px 25px ${color}40` }}
                    >
                        {t('Save Changes')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
