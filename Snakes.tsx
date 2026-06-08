import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Home, Dices } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Snakes() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [dice, setDice] = useState(1);
    const [rolling, setRolling] = useState(false);
    
    // Very simplified board mock
    const [playerPos, setPlayerPos] = useState(0);
    const [botPos, setBotPos] = useState(0);

    const rollDice = () => {
        if (rolling) return;
        setRolling(true);
        let count = 0;
        const interval = setInterval(() => {
            setDice(Math.floor(Math.random() * 6) + 1);
            count++;
            if (count > 10) {
                clearInterval(interval);
                setRolling(false);
                const finalDice = Math.floor(Math.random() * 6) + 1;
                setDice(finalDice);
                
                // Move player
                setPlayerPos(p => Math.min(99, p + finalDice));

                // Fake bot turn after delay
                setTimeout(() => {
                    setBotPos(p => Math.min(99, p + Math.floor(Math.random() * 6) + 1));
                }, 1000);
            }
        }, 50);
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#e0f2fe]">
             <div className="relative z-10 p-6 flex justify-between items-center bg-white/50 backdrop-blur border-b border-black/5">
                 <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-sky-800 hover:text-black transition-colors font-bold">
                     <Home className="w-4 h-4" /> Exit
                 </button>
                 <div className="text-center">
                     <h1 className="text-2xl font-display font-black tracking-widest uppercase text-sky-900 drop-shadow-sm">Snakes & Ladders</h1>
                     <div className="text-xs text-sky-700 font-bold tracking-widest mt-1">VS BOT</div>
                 </div>
                 <div className="w-20" />
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                 <div className="w-full max-w-lg aspect-square bg-white border-4 border-sky-200 shadow-[0_20px_50px_rgba(14,165,233,0.2)] rounded-3xl p-2 relative overflow-hidden flex flex-col-reverse">
                     {/* 10x10 Grid */}
                     <div className="grid grid-cols-10 grid-rows-10 w-full h-full gap-1">
                        {Array.from({length: 100}).map((_, i) => {
                            const isPlayerHere = playerPos === 99 - i;
                            const isBotHere = botPos === 99 - i;
                            
                            return (
                                <div key={i} className={`rounded-sm flex items-center justify-center text-[10px] font-bold text-black/20 ${(i%2===0) ? 'bg-sky-50' : 'bg-emerald-50'} relative`}>
                                    {isPlayerHere && <motion.div layoutId="player" className="absolute z-10 w-4 h-4 rounded-full bg-blue-600 shadow-md border-2 border-white" />}
                                    {isBotHere && <motion.div layoutId="bot" className="absolute z-10 w-4 h-4 rounded-full bg-red-600 shadow-md border-2 border-white" />}
                                    {99 - i + 1}
                                </div>
                            )
                        })}
                     </div>
                     {/* Decorative overlays for Snakes and Ladders could go here via SVG */}
                 </div>

                 <div className="flex gap-8 items-center bg-white p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-sky-100">
                     <div className="flex flex-col items-center gap-2 w-32">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">You</div>
                         <div className="text-xl font-black text-sky-600">Tile {playerPos + 1}</div>
                     </div>

                     <motion.button 
                         whileTap={{ scale: 0.9 }}
                         onClick={rollDice}
                         disabled={rolling}
                         className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transition-colors border-4 ${rolling ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-sky-500 border-sky-600 text-white hover:bg-sky-400'}`}
                     >
                         <span className="text-4xl font-black">{dice}</span>
                     </motion.button>

                     <div className="flex flex-col items-center gap-2 w-32">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bot</div>
                         <div className="text-xl font-black text-red-500">Tile {botPos + 1}</div>
                     </div>
                 </div>
             </div>
        </div>
    );
}
