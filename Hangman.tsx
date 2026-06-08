import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Home, RefreshCw } from 'lucide-react';

const WORDS = ['REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'FRONTEND', 'BACKEND', 'COMPONENT', 'HOOK', 'STATE', 'PROPS', 'TAILWIND'];

export default function Hangman() {
    const navigate = useNavigate();
    const [word, setWord] = useState('');
    const [guessed, setGuessed] = useState<Set<string>>(new Set());
    const [mistakes, setMistakes] = useState(0);
    const maxMistakes = 6;
    
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
        setGuessed(new Set());
        setMistakes(0);
    };

    const handleGuess = (letter: string) => {
        if (guessed.has(letter) || mistakes >= maxMistakes || isWon) return;
        
        const newGuessed = new Set(guessed);
        newGuessed.add(letter);
        setGuessed(newGuessed);

        if (!word.includes(letter)) {
            setMistakes(m => m + 1);
        }
    };

    const isWon = word && word.split('').every(l => guessed.has(l));
    const isLost = mistakes >= maxMistakes;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#050505] text-white">
            <button onClick={() => navigate('/lobby')} className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-50">
                <Home className="w-5 h-5" /> Exit
            </button>
            <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-widest uppercase">Hangman</h1>
            
            <div className="mb-8 font-mono text-2xl">
                Mistakes: <span className={mistakes >= maxMistakes - 1 ? 'text-red-500' : 'text-white'}>{mistakes} / {maxMistakes}</span>
            </div>

            <div className="flex gap-4 mb-12">
                {word.split('').map((letter, i) => (
                    <div key={i} className="w-12 h-16 border-b-4 border-white/40 flex items-center justify-center text-4xl font-bold">
                        {guessed.has(letter) || isLost ? letter : ''}
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mb-12">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                    const isGuessed = guessed.has(letter);
                    const isCorrect = isGuessed && word.includes(letter);
                    const isWrong = isGuessed && !word.includes(letter);
                    
                    return (
                        <button
                            key={letter}
                            onClick={() => handleGuess(letter)}
                            disabled={isGuessed || isLost || isWon}
                            className={`w-12 h-12 rounded-lg font-bold text-lg transition-colors ${
                                isCorrect ? 'bg-emerald-500 text-white border-none' :
                                isWrong ? 'bg-red-500/50 text-white/50 border-none' :
                                'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            }`}
                        >
                            {letter}
                        </button>
                    )
                })}
            </div>

            {(isWon || isLost) && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div className={`text-4xl font-bold mb-6 ${isWon ? 'text-emerald-400' : 'text-red-500'}`}>
                        {isWon ? 'You Won!' : 'Game Over!'}
                    </div>
                    <button 
                        onClick={startNewGame}
                        className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                    >
                        <RefreshCw className="w-5 h-5" /> Play Again
                    </button>
                </motion.div>
            )}
        </div>
    );
}
