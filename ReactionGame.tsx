import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Home, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export default function ReactionGame() {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState>('idle');
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleClick = () => {
        if (gameState === 'idle' || gameState === 'result' || gameState === 'early') {
            // Start game
            setGameState('waiting');
            setReactionTime(null);
            
            const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2s to 5s
            timeoutRef.current = setTimeout(() => {
                setGameState('ready');
                startTimeRef.current = Date.now();
            }, randomDelay);
        } else if (gameState === 'waiting') {
            // Clicked too early
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setGameState('early');
        } else if (gameState === 'ready') {
            // Clicked in time
            const time = Date.now() - startTimeRef.current;
            setReactionTime(time);
            if (!bestTime || time < bestTime) {
                setBestTime(time);
            }
            setGameState('result');
        }
    };

    let bgClass = "bg-[#050505]";
    let text = "Click to Start";
    let subtext = "Wait for the green screen";
    
    if (gameState === 'waiting') {
        bgClass = "bg-rose-900";
        text = "Wait for Green...";
        subtext = "Don't click yet!";
    } else if (gameState === 'ready') {
        bgClass = "bg-emerald-500 cursor-pointer";
        text = "CLICK NOW!";
        subtext = "As fast as you can!";
    } else if (gameState === 'early') {
        bgClass = "bg-[#050505]";
        text = "Too Early!";
        subtext = "Click to try again.";
    } else if (gameState === 'result') {
        bgClass = "bg-[#050505]";
        text = `${reactionTime} ms`;
        subtext = "Click to try again.";
    }

    return (
        <div className="flex-1 flex flex-col relative bg-[#050505] text-white font-sans">
            <button onClick={() => navigate('/lobby')} className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-50">
                <Home className="w-5 h-5" /> Exit
            </button>
            
            <div className="absolute top-6 right-6 text-gray-400 font-mono flex items-center gap-2 z-50">
                <Zap className="w-5 h-5 text-yellow-500" />
                Best: {bestTime ? `${bestTime} ms` : '---'}
            </div>

            <div 
                onClick={handleClick}
                className={`flex-1 flex flex-col items-center justify-center transition-colors duration-100 ${bgClass} select-none`}
            >
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-xl">{text}</h1>
                    <p className={`text-xl font-medium ${gameState === 'ready' ? 'text-black/60' : 'text-gray-400'}`}>{subtext}</p>
                </div>
                
                {gameState === 'result' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-12 text-center text-gray-500 text-sm">
                        {"< 200ms is excellent | ~250ms is average | > 300ms is slow"}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
