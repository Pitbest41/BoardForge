import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Dices } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export default function Ludo() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Just a placeholder mock for Ludo to prove it's a real screen
    const [dice, setDice] = useState(1);
    const [turn, setTurn] = useState<PlayerColor>('red');
    const [rolling, setRolling] = useState(false);

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
                const next: Record<PlayerColor, PlayerColor> = { red: 'green', green: 'yellow', yellow: 'blue', blue: 'red' };
                setTurn(next[turn]);
            }
        }, 50);
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#fafafa]">
             <div className="relative z-10 p-6 flex justify-between items-center bg-black/5 border-b border-black/10">
                 <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold">
                     <Home className="w-4 h-4" /> Exit
                 </button>
                 <div className="text-center">
                     <h1 className="text-2xl font-display font-black tracking-widest uppercase text-black">LUDO (منچ)</h1>
                     <div className="text-xs text-gray-400 font-bold tracking-widest mt-1">OFFLINE SOLO</div>
                 </div>
                 <div className="w-20" />
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                 <div className="w-full max-w-lg aspect-square bg-white border-2 border-black/10 shadow-2xl rounded-3xl p-4 flex flex-col justify-between">
                     {/* Simplified Ludo Board Visual */}
                     <div className="flex-1 grid grid-cols-3 gap-2">
                         <div className="bg-red-500 rounded-xl p-4 flex items-center justify-center shadow-inner">
                             <div className="w-16 h-16 bg-white/20 rounded-full flex flex-wrap gap-2 p-2 relative">
                                 <div className="w-4 h-4 rounded-full bg-red-900 mx-auto" />
                                 <div className="w-4 h-4 rounded-full bg-red-900 mx-auto" />
                                 <div className="w-4 h-4 rounded-full bg-red-900 mx-auto" />
                                 <div className="w-4 h-4 rounded-full bg-red-900 mx-auto" />
                             </div>
                         </div>
                         <div className="grid grid-cols-3 grid-rows-6 gap-1 p-2">
                             {Array.from({length: 18}).map((_,i) => <div key={i} className="bg-green-100 rounded-sm border border-green-200" />)}
                         </div>
                         <div className="bg-green-500 rounded-xl p-4 flex items-center justify-center shadow-inner">
                             <div className="w-16 h-16 bg-white/20 rounded-full flex flex-wrap gap-2 p-2">
                                <div className="w-4 h-4 rounded-full bg-green-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-green-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-green-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-green-900 mx-auto" />
                             </div>
                         </div>
                         <div className="grid grid-cols-6 grid-rows-3 gap-1 p-2">
                             {Array.from({length: 18}).map((_,i) => <div key={i} className="bg-red-100 rounded-sm border border-red-200" />)}
                         </div>
                         <div className="bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-xl border border-black/10 flex items-center justify-center text-white font-black font-display text-xl uppercase shadow-inner">
                             Home
                         </div>
                         <div className="grid grid-cols-6 grid-rows-3 gap-1 p-2">
                             {Array.from({length: 18}).map((_,i) => <div key={i} className="bg-yellow-100 rounded-sm border border-yellow-200" />)}
                         </div>
                         <div className="bg-blue-500 rounded-xl p-4 flex items-center justify-center shadow-inner">
                             <div className="w-16 h-16 bg-white/20 rounded-full flex flex-wrap gap-2 p-2">
                                <div className="w-4 h-4 rounded-full bg-blue-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-blue-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-blue-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-blue-900 mx-auto" />
                             </div>
                         </div>
                         <div className="grid grid-cols-3 grid-rows-6 gap-1 p-2">
                             {Array.from({length: 18}).map((_,i) => <div key={i} className="bg-blue-100 rounded-sm border border-blue-200" />)}
                         </div>
                         <div className="bg-yellow-500 rounded-xl p-4 flex items-center justify-center shadow-inner">
                             <div className="w-16 h-16 bg-white/20 rounded-full flex flex-wrap gap-2 p-2">
                                <div className="w-4 h-4 rounded-full bg-yellow-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-yellow-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-yellow-900 mx-auto" />
                                <div className="w-4 h-4 rounded-full bg-yellow-900 mx-auto" />
                             </div>
                         </div>
                     </div>
                 </div>

                 <div className="flex gap-8 items-center bg-white p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100">
                     <div className="flex flex-col items-center gap-2 w-32">
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Turn</div>
                         <div className={`text-xl font-black capitalize text-${turn}-500`}>{turn} &apos;s Turn</div>
                     </div>

                     <motion.button 
                         whileTap={{ scale: 0.9 }}
                         onClick={rollDice}
                         disabled={rolling}
                         className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transition-colors border-4 ${rolling ? 'bg-gray-100 border-gray-200 text-gray-400' : `bg-${turn}-500 border-${turn}-600 text-white`}`}
                     >
                         <span className="text-4xl font-black">{dice}</span>
                     </motion.button>

                     <div className="w-32">
                        <button className="w-full bg-black text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg">
                            <Dices className="w-5 h-5"/> Auto
                        </button>
                     </div>
                 </div>
             </div>
        </div>
    );
}
