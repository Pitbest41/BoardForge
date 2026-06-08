import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';

type Choice = 'rock' | 'paper' | 'scissors' | null;

const CHOICES = [
    { id: 'rock', emoji: '✊' },
    { id: 'paper', emoji: '✋' },
    { id: 'scissors', emoji: '✌️' }
] as const;

export default function RockPaperScissors() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [myChoice, setMyChoice] = useState<Choice>(null);
    const [botChoice, setBotChoice] = useState<Choice>(null);
    const [result, setResult] = useState<string | null>(null);
    const [scores, setScores] = useState({ me: 0, bot: 0 });
    const [isAnimating, setIsAnimating] = useState(false);

    const playRound = (choice: Choice) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        setMyChoice(choice);
        setBotChoice(null);
        setResult(null);

        // Shake animation phase
        setTimeout(() => {
            const randomPick = CHOICES[Math.floor(Math.random() * CHOICES.length)].id as Choice;
            setBotChoice(randomPick);
            
            // Determine winner
            let res = '';
            if (choice === randomPick) {
                res = 'Draw!';
            } else if (
                (choice === 'rock' && randomPick === 'scissors') ||
                (choice === 'paper' && randomPick === 'rock') ||
                (choice === 'scissors' && randomPick === 'paper')
            ) {
                res = 'You Win!';
                setScores(s => ({ ...s, me: s.me + 1 }));
            } else {
                res = 'You Lose!';
                setScores(s => ({ ...s, bot: s.bot + 1 }));
            }
            setResult(res);
            setIsAnimating(false);
            
        }, 1500);
    };

    return (
        <div className="flex-1 flex flex-col p-8 bg-[#2d3250] text-white">
            <div className="flex justify-between items-center mb-12">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 hover:text-[#f9b17a] transition-colors">
                    <Home className="w-5 h-5" /> {t('Exit')}
                </button>
                <div className="flex bg-[#424769] rounded-xl overflow-hidden shadow-lg border border-[#676f9d]">
                    <div className="px-6 py-3 font-bold flex flex-col items-center">
                        <span className="text-xs text-gray-400 uppercase tracking-widest">{t('Score')}</span>
                        <span className="text-2xl text-[#f9b17a]">{scores.me}</span>
                    </div>
                    <div className="px-6 py-3 font-bold flex flex-col items-center bg-[#676f9d]/20 border-l border-[#676f9d]">
                        <span className="text-xs text-gray-400 uppercase tracking-widest">BOT</span>
                        <span className="text-2xl text-red-400">{scores.bot}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-12 max-w-4xl mx-auto w-full">
                
                {/* Battle Area */}
                <div className="flex items-center justify-between w-full h-64 relative bg-[#424769]/50 rounded-3xl border border-[#676f9d] p-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                    
                    {/* Player Side */}
                    <div className="flex-1 flex flex-col items-center gap-4">
                        <div className="text-gray-400 font-bold tracking-widest uppercase">{t('Score')}</div>
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={isAnimating ? 'shaking' : (myChoice || 'empty')}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    y: isAnimating ? [0, -20, 0, -20, 0] : 0
                                }}
                                transition={{ duration: isAnimating ? 1.5 : 0.3 }}
                                className="text-8xl filter drop-shadow-[0_0_20px_rgba(249,177,122,0.5)]"
                            >
                                {isAnimating ? '✊' : (myChoice ? CHOICES.find(c => c.id === myChoice)?.emoji : '❔')}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col items-center px-4 z-10 w-48">
                         <AnimatePresence mode="popLayout">
                             {result && (
                                 <motion.div 
                                     initial={{ scale: 0, opacity: 0 }}
                                     animate={{ scale: 1, opacity: 1 }}
                                     className={`text-3xl font-black uppercase whitespace-nowrap text-center ${result === 'You Win!' ? 'text-[#f9b17a]' : result === 'You Lose!' ? 'text-red-500' : 'text-white'}`}
                                 >
                                     {t(result)}
                                 </motion.div>
                             )}
                         </AnimatePresence>
                    </div>

                    {/* Bot Side */}
                    <div className="flex-1 flex flex-col items-center gap-4">
                        <div className="text-gray-400 font-bold tracking-widest uppercase">BOT</div>
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={isAnimating ? 'shaking' : (botChoice || 'empty')}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    y: isAnimating ? [0, -20, 0, -20, 0] : 0
                                }}
                                transition={{ duration: isAnimating ? 1.5 : 0.3 }}
                                className="text-8xl scale-x-[-1] filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                            >
                                {isAnimating ? '✊' : (botChoice ? CHOICES.find(c => c.id === botChoice)?.emoji : '❔')}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>

                {/* Controls Area */}
                <div className="flex gap-6">
                    {CHOICES.map(c => (
                        <button
                            key={c.id}
                            onClick={() => playRound(c.id)}
                            disabled={isAnimating}
                            className="w-24 h-24 md:w-32 md:h-32 text-4xl md:text-6xl bg-[#424769] hover:bg-[#676f9d] rounded-2xl shadow-xl flex items-center justify-center border-4 border-transparent hover:border-[#f9b17a] transition-all transform hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {c.emoji}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}
