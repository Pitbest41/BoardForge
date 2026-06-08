import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Play } from 'lucide-react';

export default function WhackAMole() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [activeMole, setActiveMole] = useState<number | null>(null);
    const [hitMole, setHitMole] = useState<number | null>(null);

    const timerRef = useRef<any>(null);
    const moleRef = useRef<any>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        setHitMole(null);
        spawnMole();

        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    endGame();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
    };

    const spawnMole = () => {
        const nextId = Math.floor(Math.random() * 9);
        setActiveMole(nextId);
        
        const duration = Math.random() * 800 + 400; // 400ms - 1200ms
        
        moleRef.current = setTimeout(() => {
            if (isPlaying) spawnMole();
        }, duration);
    };

    const endGame = () => {
        setIsPlaying(false);
        setActiveMole(null);
        clearInterval(timerRef.current);
        clearTimeout(moleRef.current);
        alert(`Game Over! Score: ${score}`);
    };

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(moleRef.current);
        };
    }, []);

    const handleHit = (index: number) => {
        if (!isPlaying) return;
        if (index === activeMole) {
            setScore(s => s + 10);
            setHitMole(index);
            setActiveMole(null);
            clearTimeout(moleRef.current);
            setTimeout(() => {
                setHitMole(null);
                if (isPlaying) spawnMole();
            }, 300);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center bg-[#4d7c0f] p-8 text-white font-sans overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

            <div className="w-full max-w-2xl flex justify-between items-center mb-12 relative z-10">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-xl">
                    <Home className="w-5 h-5" /> {t('Exit')}
                </button>
                <div className="bg-black/40 px-6 py-3 rounded-2xl flex gap-8 shadow-xl border border-white/10">
                    <div className="text-center">
                        <div className="text-xs text-lime-300 font-bold uppercase tracking-widest">{t('Score')}</div>
                        <div className="text-3xl font-black">{score}</div>
                    </div>
                    <div className="w-px bg-white/20" />
                    <div className="text-center">
                        <div className="text-xs text-orange-300 font-bold uppercase tracking-widest">Time</div>
                        <div className="text-3xl font-black">{timeLeft}s</div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 bg-[#3f6212] p-8 rounded-[3rem] shadow-[0_20px_0_#27400b] border-4 border-[#65a30d]">
                <div className="grid grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="w-24 h-24 md:w-32 md:h-32 bg-[#27400b] rounded-full shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] relative overflow-hidden flex justify-center items-end pb-2 cursor-[url('https://cdn-icons-png.flaticon.com/32/3855/3855073.png'),_pointer]">
                            <AnimatePresence>
                                {activeMole === i && (
                                    <motion.div
                                        initial={{ y: 50 }}
                                        animate={{ y: 0 }}
                                        exit={{ y: 50 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        onMouseDown={() => handleHit(i)}
                                        className="text-6xl md:text-7xl absolute filter drop-shadow-xl"
                                    >
                                        🐹
                                    </motion.div>
                                )}
                                {hitMole === i && (
                                    <motion.div
                                        initial={{ scale: 1, opacity: 1 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-6xl md:text-7xl absolute filter drop-shadow-xl"
                                    >
                                        💥
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {!isPlaying && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <button 
                        onClick={startGame}
                        className="bg-lime-500 hover:bg-lime-400 text-[#1a2e05] font-black text-2xl px-12 py-6 rounded-3xl shadow-[0_10px_0_#3f6212] transition-transform active:translate-y-2 active:shadow-[0_2px_0_#3f6212] flex items-center gap-4"
                    >
                        <Play className="w-8 h-8" fill="currentColor" />
                        {score > 0 ? 'PLAY AGAIN' : t('Start Game')}
                    </button>
                </div>
            )}
        </div>
    );
}
