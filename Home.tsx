import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Background3D from '../components/Background3D';
import { Gamepad2, Users, Bot } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      <Background3D />
      
      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-board-accent/10 text-board-accent border border-board-accent/20"
        >
          <span className="w-2 h-2 rounded-full bg-board-accent animate-pulse" />
          <span className="text-sm font-medium tracking-wide uppercase">Next Gen Browser Gaming</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-tight"
        >
          Welcome to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-board-accent to-board-purple">
            BoardForge
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-16 font-light leading-relaxed"
        >
          The premium cloud gaming platform. Experience AAA quality board and strategy games directly in your browser. No sign-up required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-6 w-full max-w-xl justify-center"
        >
          <button
            onClick={() => navigate('/lobby')}
            className="group relative px-10 py-5 rounded-lg bg-board-accent text-black font-black text-lg overflow-hidden flex-1 hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
          >
            <div className="relative flex items-center justify-center gap-3">
              <Users className="w-6 h-6 text-black" />
              <span>{t('Multiplayer')}</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/lobby?mode=solo')}
            className="group relative px-8 py-5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md text-white font-bold text-lg overflow-hidden flex-1 hover:bg-white/20 transition-all hover:scale-105"
          >
             <div className="relative flex items-center justify-center gap-3">
              <Bot className="w-6 h-6 text-white" />
              <span>{t('Solo')}</span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
