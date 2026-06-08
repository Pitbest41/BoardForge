import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Home, RefreshCw } from 'lucide-react';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

interface Card {
    id: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryGame() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        initGame();
    }, []);

    const initGame = () => {
        const duplicated = [...EMOJIS, ...EMOJIS];
        const shuffled = duplicated.sort(() => Math.random() - 0.5).map((emoji, index) => ({
            id: index,
            emoji,
            isFlipped: false,
            isMatched: false
        }));
        setCards(shuffled);
        setFlippedIndices([]);
        setMoves(0);
        setIsChecking(false);
    };

    const handleFlip = (index: number) => {
        if (isChecking || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setIsChecking(true);
            setMoves(m => m + 1);
            
            const [firstIndex, secondIndex] = newFlippedIndices;
            if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setFlippedIndices([]);
                setIsChecking(false);
                
                checkWin(newCards);
            } else {
                setTimeout(() => {
                    const resetCards = [...newCards];
                    resetCards[firstIndex].isFlipped = false;
                    resetCards[secondIndex].isFlipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };

    const checkWin = (currentCards: Card[]) => {
        if (currentCards.every(c => c.isMatched)) {
            setTimeout(() => {
                alert(t('You Win!'));
            }, 500);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-8 bg-[#1a1a2e] text-white">
            <div className="w-full max-w-2xl flex justify-between items-center mb-8">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 hover:text-[#e94560] transition-colors">
                    <Home className="w-5 h-5" /> {t('Exit')}
                </button>
                <div className="text-2xl font-bold">{t('Memory Game')}</div>
                <div className="text-xl font-mono text-[#e94560]">{t('Score')}: {moves}</div>
            </div>

            <div className="grid grid-cols-4 gap-4 w-full max-w-lg mb-8 perspective-1000">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        onClick={() => handleFlip(i)}
                        className={`aspect-square relative cursor-pointer transform-style-3d transition-transform duration-500`}
                        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    >
                        <div className="absolute inset-0 w-full h-full bg-[#16213e] rounded-xl border-2 border-[#0f3460] shadow-xl backface-hidden" />
                        <div className="absolute inset-0 w-full h-full bg-[#e94560] rounded-xl flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(233,69,96,0.5)] backface-hidden [transform:rotateY(180deg)]">
                            {card.emoji}
                        </div>
                    </motion.div>
                ))}
            </div>

            <button 
                onClick={initGame}
                className="flex items-center gap-2 bg-[#0f3460] hover:bg-[#e94560] px-6 py-3 rounded-xl font-bold transition-all"
            >
                <RefreshCw className="w-5 h-5" /> {t('Start Game')}
            </button>
        </div>
    );
}
