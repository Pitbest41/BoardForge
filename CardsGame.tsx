import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Home, HandCoins, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUITS = ['♥', '♦', '♣', '♠'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default function CardsGame() {
    const navigate = useNavigate();

    const [communityCards, setCommunityCards] = useState<any[]>([]);
    const [playerHand, setPlayerHand] = useState<any[]>([]);
    const [botHand, setBotHand] = useState<any[]>([]);
    const [phase, setPhase] = useState<'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown'>('pre-flop');
    const [pot, setPot] = useState(0);
    const [playerChips, setPlayerChips] = useState(1000);
    const [deck, setDeck] = useState<any[]>([]);
    
    // Very simplified poker flow
    useEffect(() => {
        startRound();
    }, []);

    const startRound = () => {
        let newDeck = [];
        for (let s of SUITS) {
            for (let v of VALUES) {
                newDeck.push({ suit: s, value: v, isRed: s === '♥' || s === '♦' });
            }
        }
        newDeck = newDeck.sort(() => Math.random() - 0.5);
        
        setPlayerHand([newDeck.pop(), newDeck.pop()]);
        setBotHand([newDeck.pop(), newDeck.pop()]);
        setDeck(newDeck);
        setCommunityCards([]);
        setPhase('pre-flop');
        setPot(0);
    };

    const handleAction = (type: 'fold' | 'call' | 'raise') => {
        if (phase === 'showdown') {
            startRound();
            return;
        }

        let bet = 0;
        if (type === 'call') bet = 50;
        if (type === 'raise') bet = 150;
        
        if (type !== 'fold') {
            setPlayerChips(c => c - bet);
            setPot(p => p + bet + bet); // Bot matches magically
        } else {
            alert('شما فولد دادید! ربات برنده شد.');
            startRound();
            return;
        }

        // Progress phase
        setTimeout(() => {
            if (phase === 'pre-flop') {
                setCommunityCards([deck.pop(), deck.pop(), deck.pop()]);
                setPhase('flop');
            } else if (phase === 'flop') {
                setCommunityCards(c => [...c, deck.pop()]);
                setPhase('turn');
            } else if (phase === 'turn') {
                setCommunityCards(c => [...c, deck.pop()]);
                setPhase('river');
            } else if (phase === 'river') {
                setPhase('showdown');
                // Mock win
                setTimeout(() => {
                    if (Math.random() > 0.5) {
                        alert('شما برنده شدید!');
                        setPlayerChips(c => c + pot);
                    } else {
                        alert('ربات برنده شد!');
                    }
                }, 1000);
            }
        }, 500);
    };

    const renderCard = (card: any, hidden = false, keyIndex?: number | string) => {
        if (hidden) {
            return (
                <motion.div key={keyIndex} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-24 md:w-20 md:h-28 rounded-xl bg-blue-900 border-2 border-white/20 shadow-xl bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex items-center justify-center">
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/20 font-serif">P</div>
                </motion.div>
            );
        }
        return (
            <motion.div key={keyIndex} initial={{ scale: 0, rotateY: 90 }} animate={{ scale: 1, rotateY: 0 }} className="w-16 h-24 md:w-20 md:h-28 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center font-bold border border-gray-200 relative overflow-hidden text-lg md:text-2xl" style={{ color: card.isRed ? '#dc2626' : '#111827' }}>
                <span className="absolute top-1 left-2 text-sm">{card.value}</span>
                <span>{card.suit}</span>
            </motion.div>
        );
    };

    return (
        <div className="flex-1 relative bg-[#073822] flex flex-col font-sans overflow-hidden">
             {/* Poker Table Texture */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0f5e3e_0%,#073822_100%)] opacity-90 pointer-events-none" />
             
             <div className="relative z-10 p-4 md:p-6 flex justify-between items-center w-full">
                 <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                     <Home className="w-5 h-5" /> خروج
                 </button>
                 <div className="flex gap-4">
                     <div className="bg-black/40 backdrop-blur px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                         <HandCoins className="w-5 h-5 text-yellow-500" />
                         <span className="text-white font-bold font-mono">{playerChips}$</span>
                     </div>
                 </div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-8 relative z-10">
                 
                 {/* BOT */}
                 <div className="flex flex-col items-center gap-4">
                     <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 text-white/80 text-sm">
                         <User className="w-4 h-4" /> BOT (Dealer)
                     </div>
                     <div className="flex gap-2">
                         {botHand.map((c, i) => renderCard(c, phase !== 'showdown', `bot-${i}`))}
                     </div>
                 </div>

                 {/* TABLE */}
                 <div className="w-full max-w-3xl h-64 border-4 border-emerald-800 bg-[#0f5e3e]/40 rounded-[100px] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative">
                     <div className="absolute top-4 text-emerald-200/50 font-bold tracking-widest text-sm uppercase">Pot: ${pot}</div>
                     <div className="flex gap-2">
                         {communityCards.map((c, i) => renderCard(c, false, `comm-${i}`))}
                         {/* Ghost slots */}
                         {Array.from({length: 5 - communityCards.length}).map((_, i) => (
                             <div key={`ghost-${i}`} className="w-16 h-24 md:w-20 md:h-28 border-2 border-dashed border-emerald-700/50 rounded-xl" />
                         ))}
                     </div>
                 </div>

                 {/* PLAYER */}
                 <div className="flex flex-col items-center gap-6">
                     <div className="flex gap-2">
                         {playerHand.map((c, i) => renderCard(c, false, `player-${i}`))}
                     </div>
                     
                     <div className="flex gap-3">
                         {phase === 'showdown' ? (
                             <button onClick={() => handleAction('fold')} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-colors">
                                 دست بعدی
                             </button>
                         ) : (
                             <>
                                 <button onClick={() => handleAction('fold')} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-colors min-w-[100px]">فولد</button>
                                 <button onClick={() => handleAction('call')} className="px-6 py-3 bg-[#10b981] hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg transition-colors min-w-[100px]">کال ($50)</button>
                                 <button onClick={() => handleAction('raise')} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg transition-colors min-w-[100px]">رِیز ($150)</button>
                             </>
                         )}
                     </div>
                 </div>

             </div>
        </div>
    );
}
