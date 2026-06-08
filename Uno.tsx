import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

interface Card {
    id: string;
    color: string;
    value: string;
}

export default function UnoGame() {
    const navigate = useNavigate();
    
    const [deck, setDeck] = useState<Card[]>([]);
    const [discardPile, setDiscardPile] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [botHand, setBotHand] = useState<Card[]>([]);
    const [turn, setTurn] = useState<number>(0); // 0 = Player, 1 = Bot
    const [currentColor, setCurrentColor] = useState<string>('');

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        let newDeck: Card[] = [];
        COLORS.forEach(c => {
            VALUES.forEach(v => {
                newDeck.push({ id: Math.random().toString(), color: c, value: v });
                if (v !== '0') newDeck.push({ id: Math.random().toString(), color: c, value: v }); // Two of each except 0
            });
        });
        newDeck = newDeck.sort(() => Math.random() - 0.5);

        const initialDiscard = newDeck.pop()!;
        setDiscardPile([initialDiscard]);
        setCurrentColor(initialDiscard.color);
        
        setPlayerHand(newDeck.splice(0, 7));
        setBotHand(newDeck.splice(0, 7));
        setDeck(newDeck);
        setTurn(0);
    };

    const isCardPlayable = (card: Card) => {
        const topCard = discardPile[discardPile.length - 1];
        return card.color === currentColor || card.color === topCard.color || card.value === topCard.value;
    };

    const drawCard = (isPlayer: boolean) => {
        if (deck.length === 0) return; // Simple out of cards handling
        const card = deck[deck.length - 1];
        const newDeck = deck.slice(0, -1);
        setDeck(newDeck);
        
        if (isPlayer) {
            setPlayerHand(prev => [...prev, card]);
            setTurn(1);
            setTimeout(botTurn, 1000);
        } else {
            setBotHand(prev => [...prev, card]);
            setTurn(0);
        }
    };

    const playCard = (card: Card, index: number, isPlayer: boolean) => {
        if (isPlayer && turn !== 0) return;
        if (!isCardPlayable(card)) return;

        setDiscardPile(prev => [...prev, card]);
        setCurrentColor(card.color);

        if (isPlayer) {
            const newHand = [...playerHand];
            newHand.splice(index, 1);
            setPlayerHand(newHand);
            if (newHand.length === 0) {
                alert("You Win!");
                return;
            }
            setTurn(1);
            setTimeout(() => botTurn(newHand, card), 1000);
        } else {
            const newHand = [...botHand];
            newHand.splice(index, 1);
            setBotHand(newHand);
            if (newHand.length === 0) {
                alert("Bot Wins!");
                return;
            }
            setTurn(0);
        }
    };

    const botTurn = (currentPlayerHand?: Card[], lastPlayedCard?: Card) => {
        setBotHand(currentBotHand => {
            const playableIndex = currentBotHand.findIndex(c => isCardPlayable(c));
            if (playableIndex !== -1) {
                const cardToPlay = currentBotHand[playableIndex];
                setTimeout(() => playCard(cardToPlay, playableIndex, false), 500);
            } else {
                setTimeout(() => drawCard(false), 500);
            }
            return currentBotHand;
        });
    };

    const getColorHex = (colorString: string) => {
        switch(colorString) {
            case 'red': return '#ef4444';
            case 'blue': return '#3b82f6';
            case 'green': return '#22c55e';
            case 'yellow': return '#eab308';
            default: return '#1f2937';
        }
    };

    const renderCard = (card: Card | null, hidden = false, onClick?: () => void, isPlayable = false) => {
        if (!card && hidden) {
            return (
                <div onClick={onClick} className="w-16 h-24 md:w-24 md:h-36 bg-gray-900 rounded-xl border-4 border-gray-700 shadow-xl flex items-center justify-center transform hover:-translate-y-2 cursor-pointer transition-transform">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-red-600 border-4 border-white transform -rotate-45 flex items-center justify-center font-black text-white text-xl">
                        UNO
                    </div>
                </div>
            );
        }
        if (!card) return null;

        const hex = getColorHex(card.color);
        return (
            <motion.div 
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={onClick}
                className={`w-16 h-24 md:w-24 md:h-36 rounded-xl border-4 border-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${isPlayable ? 'cursor-pointer hover:-translate-y-4 hover:shadow-2xl z-10' : 'opacity-80 pointer-events-none'}`}
                style={{ backgroundColor: hex }}
            >
                <div className="absolute top-1 left-2 text-white font-bold text-sm md:text-lg">{card.value}</div>
                <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center transform -rotate-15 shadow-inner">
                    <span className="text-xl md:text-3xl font-black" style={{ color: hex }}>{card.value}</span>
                </div>
                <div className="absolute bottom-1 right-2 text-white font-bold text-sm md:text-lg rotate-180">{card.value}</div>
            </motion.div>
        );
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-red-900 via-gray-900 to-blue-900 flex flex-col font-sans text-white p-4 overflow-hidden relative">
            <button onClick={() => navigate('/lobby')} className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                <Home className="w-5 h-5" /> Exit
            </button>

            {/* Current Color Indicator */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur">
                <span className="text-sm font-bold text-gray-400">Current Color:</span>
                <div className="w-6 h-6 rounded-full shadow-inner border-2 border-white" style={{ backgroundColor: getColorHex(currentColor) }} />
            </div>

            {/* Bot Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="text-gray-400 font-bold mb-4">BOT ({botHand.length} cards)</div>
                <div className="flex justify-center -space-x-8 md:-space-x-12">
                    {botHand.map((_, i) => (
                        <div key={`bot-${i}`} className="w-16 h-24 md:w-24 md:h-36 bg-gray-900 rounded-xl border-2 border-gray-700 shadow-xl flex items-center justify-center rotate-180 transform -translate-y-4">
                            <span className="text-gray-700 font-black rotate-45 text-sm">UNO</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Play Area */}
            <div className="flex justify-center items-center gap-8 md:gap-16 my-8">
                {/* Deck */}
                <div className="relative">
                    <span className="absolute -top-8 left-1/2 min-w-max -translate-x-1/2 text-gray-400 font-bold text-sm">Deck</span>
                    {renderCard(null, true, () => turn === 0 && drawCard(true))}
                </div>

                {/* Discard Pile */}
                <div className="relative">
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-gray-400 font-bold text-sm">Discard</span>
                    {discardPile.length > 0 && renderCard(discardPile[discardPile.length - 1], false, undefined, false)}
                </div>
            </div>

            {/* Player Area */}
            <div className="flex-1 flex flex-col items-center justify-end p-4 pb-8">
                <div className={`text-xl font-black mb-8 ${turn === 0 ? 'text-white' : 'text-gray-500'}`}>
                    {turn === 0 ? 'YOUR TURN' : "WAITING FOR BOT..."}
                </div>
                <div className="flex justify-center w-full max-w-4xl flex-wrap gap-2 md:-space-x-4">
                    <AnimatePresence>
                        {playerHand.map((card, i) => (
                            <motion.div key={card.id}>
                                {renderCard(card, false, () => playCard(card, i, true), turn === 0 && isCardPlayable(card))}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
