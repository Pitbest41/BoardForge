import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Trophy } from 'lucide-react';

const SUITS = ['♥', '♦', '♣', '♠'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default function HokmGame() {
    const navigate = useNavigate();
    
    const [myHand, setMyHand] = useState<any[]>([]);
    const [board, setBoard] = useState<any[]>([]);
    const [hokm, setHokm] = useState<string>('♠');
    const [turn, setTurn] = useState<number>(0); // 0 is me, 1-3 are bots
    const [scores, setScores] = useState({ us: 0, them: 0 });

    useEffect(() => {
        dealCards();
    }, []);

    const dealCards = () => {
        let newDeck = [];
        for (let s of SUITS) {
            for (let v of VALUES) {
                newDeck.push({ suit: s, value: v, isRed: s === '♥' || s === '♦' });
            }
        }
        newDeck = newDeck.sort(() => Math.random() - 0.5);
        
        // Mock hand
        setMyHand(newDeck.slice(0, 13).sort((a,b) => SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)));
        setHokm('♠');
        setBoard([]);
    };

    const playCard = (index: number) => {
        if (turn !== 0) return;
        const played = myHand[index];
        setMyHand(myHand.filter((_, i) => i !== index));
        setBoard([{ ...played, player: 0 }]);
        setTurn(1);
        
        // Mock bot plays
        setTimeout(() => botPlay(1, [{...played, player:0}]), 800);
    };

    const botPlay = (botIdx: number, currentBoard: any[]) => {
        const randomCard = { suit: SUITS[Math.floor(Math.random()*4)], value: '7', isRed: false, player: botIdx };
        const newBoard = [...currentBoard, randomCard];
        setBoard(newBoard);
        
        if (newBoard.length < 4) {
            setTurn(botIdx + 1);
            setTimeout(() => botPlay(botIdx + 1, newBoard), 800);
        } else {
            // Trick over
            setTimeout(() => {
                if (Math.random() > 0.5) setScores(s => ({ ...s, us: s.us + 1 }));
                else setScores(s => ({ ...s, them: s.them + 1 }));
                setBoard([]);
                setTurn(0); // My turn again
            }, 1000);
        }
    };

    return (
        <div className="flex-1 relative overflow-hidden bg-[#0f3b21] flex flex-col font-sans">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
             
             <div className="relative z-10 p-6 flex justify-between items-center text-white">
                 <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 hover:text-red-400 transition-colors bg-black/40 px-4 py-2 rounded-xl backdrop-blur">
                     <Home className="w-4 h-4" /> خروج
                 </button>
                 
                 <div className="text-center bg-black/40 px-6 py-2 rounded-xl backdrop-blur border border-white/10 flex items-center justify-center gap-3">
                     <div className="text-sm font-bold text-gray-400 tracking-widest uppercase">حکم:</div>
                     <div className={`text-2xl ${hokm === '♥' || hokm === '♦' ? 'text-red-500' : 'text-white'}`}>{hokm}</div>
                 </div>

                 <div className="bg-black/60 px-6 py-2 rounded-xl backdrop-blur flex gap-6 text-center border border-white/10 shadow-xl">
                     <div>
                         <div className="text-xs text-gray-400 font-bold uppercase mb-1">ما</div>
                         <div className="text-2xl font-black text-green-400">{scores.us}</div>
                     </div>
                     <div className="w-[1px] bg-white/20" />
                     <div>
                         <div className="text-xs text-gray-400 font-bold uppercase mb-1">آنها</div>
                         <div className="text-2xl font-black text-red-400">{scores.them}</div>
                     </div>
                 </div>
             </div>

             <div className="flex-1 relative flex items-center justify-center p-4">
                 
                 {/* Table Center (Board) */}
                 <div className="w-80 h-80 rounded-full border-4 border-white/10 flex items-center justify-center relative bg-black/20 backdrop-blur-sm shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                     <AnimatePresence>
                         {board.map((card, i) => {
                             let rotation = 0;
                             let x = 0;
                             let y = 0;
                             
                             if (card.player === 0) { y = 40; } // Bottom
                             if (card.player === 1) { x = -40; rotation = 90; } // Left
                             if (card.player === 2) { y = -40; } // Top
                             if (card.player === 3) { x = 40; rotation = -90; } // Right

                             return (
                                 <motion.div 
                                     key={i}
                                     initial={{ opacity: 0, scale: 0.5 }}
                                     animate={{ opacity: 1, scale: 1, x, y, rotate: rotation }}
                                     exit={{ opacity: 0, scale: 0.5 }}
                                     className="absolute w-16 h-24 bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center text-xl font-bold border border-gray-200"
                                     style={{ color: card.isRed ? '#dc2626' : '#111827' }}
                                 >
                                     <div className="absolute top-1 left-2 text-sm">{card.value}</div>
                                     <span className="text-2xl">{card.suit}</span>
                                 </motion.div>
                             );
                         })}
                     </AnimatePresence>
                 </div>

                 {/* Bot Placeholders */}
                 <div className="absolute top-10 flex flex-col items-center">
                     <div className="w-12 h-12 bg-black/40 rounded-full border-2 border-white/20 mb-2"></div>
                     <div className="text-white/50 text-xs font-bold bg-black/50 px-3 py-1 rounded-full">یار (ربات)</div>
                 </div>
                 <div className="absolute left-10 flex flex-col items-center">
                     <div className="w-12 h-12 bg-black/40 rounded-full border-2 border-white/20 mb-2"></div>
                     <div className="text-white/50 text-xs font-bold bg-black/50 px-3 py-1 rounded-full">حریف ۲</div>
                 </div>
                 <div className="absolute right-10 flex flex-col items-center">
                     <div className="w-12 h-12 bg-black/40 rounded-full border-2 border-white/20 mb-2"></div>
                     <div className="text-white/50 text-xs font-bold bg-black/50 px-3 py-1 rounded-full">حریف ۱</div>
                 </div>

             </div>

             {/* Player Hand */}
             <div className="w-full flex justify-center pb-8 pt-4 px-4 h-48 overflow-visible relative z-20">
                 <div className="flex justify-center relative w-full max-w-4xl">
                     <AnimatePresence>
                         {myHand.map((card, i) => {
                             const centerOffset = i - Math.floor(myHand.length / 2);
                             const rotateStr = `${centerOffset * 3}deg`;
                             const translateYStr = `${Math.abs(centerOffset) * 4}px`;
                             
                             return (
                                 <motion.div
                                     key={`${card.value}${card.suit}`}
                                     initial={{ opacity: 0, y: 100 }}
                                     animate={{ opacity: 1, y: 0 }}
                                     exit={{ opacity: 0, y: -100 }}
                                     whileHover={{ y: -30, zIndex: 50, scale: 1.1 }}
                                     onClick={() => playCard(i)}
                                     className={`absolute w-20 h-32 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center cursor-pointer border-2 border-gray-100 transition-colors ${turn !== 0 ? 'opacity-80 pointer-events-none' : ''}`}
                                     style={{ 
                                         color: card.isRed ? '#dc2626' : '#111827',
                                         transformOrigin: 'bottom center',
                                         left: `calc(50% + ${centerOffset * 25}px - 40px)`,
                                         transform: `translateY(${translateYStr}) rotate(${rotateStr})`
                                     }}
                                 >
                                     <div className="absolute top-1 left-2 text-sm font-bold flex flex-col items-center leading-none">
                                         <span>{card.value}</span>
                                     </div>
                                     <span className="text-3xl">{card.suit}</span>
                                     <div className="absolute bottom-1 right-2 text-sm font-bold rotate-180 flex flex-col items-center leading-none">
                                         <span>{card.value}</span>
                                     </div>
                                 </motion.div>
                             );
                         })}
                     </AnimatePresence>
                 </div>
             </div>
        </div>
    );
}
