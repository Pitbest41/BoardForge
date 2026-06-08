import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Users, Map, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LOCATIONS = [
    'Airplane', 'Bank', 'Beach', 'Casino', 'Hospital', 
    'Hotel', 'Military Base', 'Pirate Ship', 'Restaurant', 
    'Space Station', 'Submarine', 'Supermarket', 'Theater'
];

export default function Spyfall() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [players, setPlayers] = useState([
        { id: 1, name: 'You', role: '', isSpy: false },
        { id: 2, name: 'Bot 1', role: '', isSpy: false },
        { id: 3, name: 'Bot 2', role: '', isSpy: false },
        { id: 4, name: 'Bot 3', role: '', isSpy: false },
    ]);
    const [gameState, setGameState] = useState<'lobby' | 'playing' | 'voting' | 'end'>('lobby');
    const [location, setLocation] = useState('');
    const [myRole, setMyRole] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins
    const [winner, setWinner] = useState('');

    const startGame = () => {
        const randLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        setLocation(randLoc);

        const spyIdx = Math.floor(Math.random() * players.length);
        const newPlayers = players.map((p, i) => ({
            ...p,
            isSpy: i === spyIdx,
            role: i === spyIdx ? 'Spy' : 'Civilian'
        }));

        setPlayers(newPlayers);
        setMyRole(newPlayers[0].role);
        setGameState('playing');
        setTimeLeft(300);
    };

    useEffect(() => {
        let timer: any;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (gameState === 'playing' && timeLeft === 0) {
            setGameState('voting');
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const handleVote = (targetId: number) => {
        const target = players.find(p => p.id === targetId);
        if (target?.isSpy) {
            setWinner('Civilians Win! The Spy was caught.');
        } else {
            setWinner('Spy Wins! The wrong person was voted.');
        }
        setGameState('end');
    };

    return (
        <div className="flex-1 flex flex-col items-center bg-[#1a1a2e] text-white p-6 font-sans">
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Home className="w-5 h-5" /> Exit
                </button>
                <div className="text-3xl font-black tracking-widest text-red-500 flex items-center gap-2">
                    <AlertTriangle />
                    SPYFALL
                </div>
            </div>

            {gameState === 'lobby' && (
                <div className="max-w-md w-full bg-[#16213e] p-8 rounded-2xl border border-white/10 shadow-xl text-center">
                    <Users className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Are you the Spy?</h2>
                    <p className="text-gray-400 mb-8">Ask questions, find the spy among you, or guess the location if you are the spy!</p>
                    <button 
                        onClick={startGame}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                    >
                        Start Game ({players.length} Players)
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Identity Card */}
                    <div className="md:col-span-1">
                        <div className={`p-8 rounded-2xl border-4 ${myRole === 'Spy' ? 'border-red-500 bg-red-500/10' : 'border-blue-500 bg-blue-500/10'} text-center shadow-2xl`}>
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-2">Your Identity</h3>
                            <div className={`text-4xl font-black mb-6 ${myRole === 'Spy' ? 'text-red-500' : 'text-blue-500'}`}>
                                {myRole}
                            </div>
                            
                            {!players[0].isSpy && (
                                <>
                                    <div className="w-full h-px bg-white/10 my-4" />
                                    <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-2">Location</h3>
                                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                        <Map className="w-6 h-6 text-blue-400" />
                                        {location}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-6 bg-[#16213e] p-6 rounded-2xl border border-white/10 text-center">
                            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <div className="text-3xl font-mono font-bold text-white">
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                            <button 
                                onClick={() => setGameState('voting')}
                                className="mt-4 w-full py-3 bg-red-600/80 hover:bg-red-500 rounded-lg font-bold transition-colors"
                            >
                                Call Vote Now
                            </button>
                        </div>
                    </div>

                    {/* Location Reference & Players */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#16213e] p-6 rounded-2xl border border-white/10">
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-4">Location Reference</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {LOCATIONS.map(loc => (
                                    <div key={loc} className={`p-2 text-sm text-center rounded border ${loc === location && !players[0].isSpy ? 'border-blue-500 bg-blue-500/20 text-white font-bold' : 'border-white/5 bg-black/20 text-gray-400 strike-through hover:text-white transition-colors cursor-pointer'}`}>
                                        {loc}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#16213e] p-6 rounded-2xl border border-white/10">
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-4">Players (Chat phase)</h3>
                            <div className="space-y-3">
                                {players.map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                                        <span className="font-bold">{p.name} {p.id === 1 && '(You)'}</span>
                                        {p.id !== 1 && <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">Ask Question</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'voting' && (
                <div className="max-w-2xl w-full bg-[#16213e] p-8 rounded-2xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center">
                    <h2 className="text-3xl font-black mb-4 text-red-500">VOTING PHASE</h2>
                    <p className="text-gray-400 mb-8">Who is the Spy? Vote carefully!</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map(p => p.id !== 1 && (
                            <button 
                                key={p.id}
                                onClick={() => handleVote(p.id)}
                                className="p-4 border-2 border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all font-bold text-xl"
                            >
                                Vote {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'end' && (
                <div className="max-w-md w-full bg-[#16213e] p-8 rounded-2xl border border-white/10 shadow-xl text-center">
                    <h2 className="text-3xl font-black mb-6">{winner}</h2>
                    <div className="p-4 bg-black/40 rounded-xl mb-8 text-left space-y-2">
                        <p><span className="text-gray-400">Spy:</span> <span className="font-bold text-red-400">{players.find(p => p.isSpy)?.name}</span></p>
                        <p><span className="text-gray-400">Location:</span> <span className="font-bold text-blue-400">{location}</span></p>
                    </div>
                    <button 
                        onClick={() => setGameState('lobby')}
                        className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-lg transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
}
