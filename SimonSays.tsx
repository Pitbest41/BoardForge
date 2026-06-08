import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Play, RotateCcw } from 'lucide-react';

const COLORS = ['green', 'red', 'yellow', 'blue'];
const TONES: Record<string, number> = {
    'green': 329.6,
    'red': 261.6,
    'yellow': 392.0,
    'blue': 440.0
};

export default function SimonSays() {
    const navigate = useNavigate();
    const [sequence, setSequence] = useState<string[]>([]);
    const [playingSequence, setPlayingSequence] = useState(false);
    const [playerTurn, setPlayerTurn] = useState(false);
    const [playerStep, setPlayerStep] = useState(0);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState(false);
    
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            if (audioCtx.current) {
                audioCtx.current.close();
            }
        };
    }, []);

    const playTone = (color: string) => {
        if (!audioCtx.current) return;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.frequency.value = TONES[color];
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.current.currentTime + 0.5);
        osc.stop(audioCtx.current.currentTime + 0.5);
    };

    const startGame = () => {
        if (audioCtx.current?.state === 'suspended') {
            audioCtx.current.resume();
        }
        setSequence([COLORS[Math.floor(Math.random() * 4)]]);
        setGameOver(false);
        setPlayerStep(0);
        setPlayerTurn(false);
    };

    useEffect(() => {
        if (sequence.length > 0 && !playerTurn && !gameOver) {
            playSequence();
        }
    }, [sequence, playerTurn, gameOver]);

    const playSequence = async () => {
        setPlayingSequence(true);
        await new Promise(r => setTimeout(r, 600)); // wait before starting
        for (let i = 0; i < sequence.length; i++) {
            setActiveColor(sequence[i]);
            playTone(sequence[i]);
            await new Promise(r => setTimeout(r, 400));
            setActiveColor(null);
            await new Promise(r => setTimeout(r, 200));
        }
        setPlayingSequence(false);
        setPlayerTurn(true);
        setPlayerStep(0);
    };

    const handleColorClick = (color: string) => {
        if (!playerTurn || playingSequence || gameOver) return;
        
        setActiveColor(color);
        playTone(color);
        setTimeout(() => setActiveColor(null), 200);

        if (color === sequence[playerStep]) {
            if (playerStep === sequence.length - 1) {
                setPlayerTurn(false);
                setTimeout(() => {
                    setSequence([...sequence, COLORS[Math.floor(Math.random() * 4)]]);
                }, 1000);
            } else {
                setPlayerStep(playerStep + 1);
            }
        } else {
            setGameOver(true);
            setPlayerTurn(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#050505] text-white">
            <button onClick={() => navigate('/lobby')} className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-50">
                <Home className="w-5 h-5" /> Exit
            </button>
            
            <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Simon Says</h1>
            
            <div className="text-2xl font-mono mb-12">
                Score: <span className="text-yellow-400">{sequence.length > 0 ? sequence.length - 1 : 0}</span>
            </div>

            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#111] border-8 border-gray-800 grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] p-2">
                <div 
                    onClick={() => handleColorClick('green')}
                    className={`rounded-tl-full cursor-pointer transition-all duration-150 ${activeColor === 'green' ? 'bg-[#4ade80] shadow-[0_0_30px_#4ade80]' : 'bg-[#166534] hover:bg-[#15803df0]'}`}
                />
                <div 
                    onClick={() => handleColorClick('red')}
                    className={`rounded-tr-full cursor-pointer transition-all duration-150 ${activeColor === 'red' ? 'bg-[#f87171] shadow-[0_0_30px_#f87171]' : 'bg-[#991b1b] hover:bg-[#b91c1cf0]'}`}
                />
                <div 
                    onClick={() => handleColorClick('yellow')}
                    className={`rounded-bl-full cursor-pointer transition-all duration-150 ${activeColor === 'yellow' ? 'bg-[#facc15] shadow-[0_0_30px_#facc15]' : 'bg-[#854d0e] hover:bg-[#a16207f0]'}`}
                />
                <div 
                    onClick={() => handleColorClick('blue')}
                    className={`rounded-br-full cursor-pointer transition-all duration-150 ${activeColor === 'blue' ? 'bg-[#60a5fa] shadow-[0_0_30px_#60a5fa]' : 'bg-[#1e3a8a] hover:bg-[#1d4ed8f0]'}`}
                />
                
                <div className="absolute inset-0 m-auto w-24 h-24 md:w-32 md:h-32 bg-[#050505] rounded-full flex items-center justify-center border-8 border-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                    {!sequence.length || gameOver ? (
                        <button onClick={startGame} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white transition-colors">
                            {gameOver ? <RotateCcw className="w-8 h-8 md:w-10 md:h-10 text-red-500" /> : <Play className="w-8 h-8 md:w-10 md:h-10 text-green-500" />}
                        </button>
                    ) : (
                        <div className="text-xl md:text-2xl font-bold font-mono text-gray-400 animate-pulse">
                            {playingSequence ? 'WAIT' : 'GO!'}
                        </div>
                    )}
                </div>
            </div>
            
            {gameOver && (
                <div className="mt-12 text-2xl font-bold text-red-500">Game Over!</div>
            )}
        </div>
    );
}
