import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Users, Moon, Sun, Shield, Skull, Gavel, Mic, MicOff, Search, Crosshair, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

type Role = 'mafia' | 'doctor' | 'detective' | 'sniper' | 'citizen';
type Phase = 'lobby' | 'card_selection' | 'reveal' | 'night' | 'day_reveal' | 'discussion' | 'voting' | 'game_over';

interface Player {
    id: number;
    name: string;
    role?: Role;
    isAlive: boolean;
    isMe: boolean;
    votes: number;
    isSpeaking?: boolean;
}

const MOCK_NAMES = ['ShadowNinja', 'CryptoKing', 'DarkKnight', 'AgentAgent', 'GhostRider', 'SneakyFox', 'IronClad', 'SilentStep', 'Viper', 'Nova', 'Echo'];

export default function MafiaGame() {
    const navigate = useNavigate();
    const { user, lobbyCode } = useStore();
    
    const [phase, setPhase] = useState<Phase>('lobby');
    const [playerCount, setPlayerCount] = useState(7);
    const [players, setPlayers] = useState<Player[]>([]);
    const [myRole, setMyRole] = useState<Role | null>(null);
    const [dayCount, setDayCount] = useState(1);
    
    const [deadLastNight, setDeadLastNight] = useState<number[]>([]);
    const [speakingIndex, setSpeakingIndex] = useState(-1);
    const [hasVoted, setHasVoted] = useState(false);
    const [winner, setWinner] = useState<'mafia' | 'citizens' | null>(null);

    // Night Actions
    const [nightTarget, setNightTarget] = useState<number | null>(null);
    const [nightResult, setNightResult] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.isPremium) {
            navigate('/premium');
        }
    }, [user, navigate]);

    const initPlayers = (count: number) => {
        const newPlayers: Player[] = [{ id: 0, name: user?.name || 'Me', isAlive: true, isMe: true, votes: 0 }];
        for (let i = 1; i < count; i++) {
            newPlayers.push({
                id: i,
                name: MOCK_NAMES[i - 1] || `Player ${i}`,
                isAlive: true,
                isMe: false,
                votes: 0
            });
        }
        setPlayers(newPlayers);
    };

    useEffect(() => {
        if (phase === 'lobby') {
            initPlayers(playerCount);
        }
    }, [playerCount, phase]);

    const startGame = () => {
        setPhase('card_selection');
    };

    const pickCard = () => {
        // Assign roles
        let roles: Role[] = ['mafia', 'doctor', 'detective'];
        if (playerCount >= 7) roles.push('mafia', 'sniper');
        if (playerCount >= 9) roles.push('mafia');
        
        while (roles.length < playerCount) roles.push('citizen');
        roles = roles.sort(() => Math.random() - 0.5);

        const assignedPlayers = players.map((p, i) => ({ ...p, role: roles[i] }));
        setPlayers(assignedPlayers);
        setMyRole(assignedPlayers.find(p => p.isMe)?.role || 'citizen');
        setPhase('reveal');
        
        setTimeout(() => startNight(), 5000);
    };

    const startNight = () => {
        setPhase('night');
        setNightTarget(null);
        setNightResult(null);
    };

    const finishNight = () => {
        // Simulate bot actions
        const alivePlayers = players.filter(p => p.isAlive);
        let killedId: number | null = null;
        let healedId: number | null = null;

        // Mock mafia action if I'm not mafia
        if (myRole !== 'mafia') {
            const nonMafia = alivePlayers.filter(p => p.role !== 'mafia');
            if (nonMafia.length > 0) killedId = nonMafia[Math.floor(Math.random() * nonMafia.length)].id;
        } else {
            killedId = nightTarget;
        }

        // Mock doctor
        if (myRole !== 'doctor') {
            if (Math.random() > 0.5) healedId = alivePlayers[Math.floor(Math.random() * alivePlayers.length)].id;
        } else if (myRole === 'doctor' && nightTarget !== null) {
            healedId = nightTarget;
        }

        const newDead: number[] = [];
        if (killedId !== null && killedId !== healedId) {
            newDead.push(killedId);
        }

        setDeadLastNight(newDead);
        setPlayers(players.map(p => newDead.includes(p.id) ? { ...p, isAlive: false } : p));
        setPhase('day_reveal');

        setTimeout(() => startDiscussion(), 4000);
    };

    const handleNightAction = (targetId: number) => {
        setNightTarget(targetId);
        if (myRole === 'detective') {
            const tgt = players.find(p => p.id === targetId);
            setNightResult(tgt?.role === 'mafia' ? '🔴 Is Mafia!' : '🟢 Is Not Mafia');
        } else if (myRole === 'sniper') {
            setNightResult('Shot fired. Will resolve in morning.');
        } else {
            setNightResult('Target confirmed.');
        }
    };

    const startDiscussion = () => {
        setPhase('discussion');
        checkWinCondition();
        if (winner) return;
        
        setSpeakingIndex(0);
        simulateSpeakingCycle(0);
    };

    const simulateSpeakingCycle = (idx: number) => {
        setPlayers(prev => prev.map(p => ({ ...p, isSpeaking: p.id === idx })));
        
        const aliveCount = players.filter(p => p.isAlive).length;
        if (idx < players.length) {
            const player = players[idx];
            if (!player.isAlive) {
                simulateSpeakingCycle(idx + 1);
            } else {
                setTimeout(() => simulateSpeakingCycle(idx + 1), player.isMe ? 50000 : 10000);
            }
        } else {
            // End of speaking, start voting
            setPlayers(prev => prev.map(p => ({ ...p, isSpeaking: false })));
            setPhase('voting');
            setHasVoted(false);
            setPlayers(prev => prev.map(p => ({ ...p, votes: 0 })));
            
            // Auto finish voting after 10s
            setTimeout(resolveVoting, 10000);
        }
    };

    const castVote = (targetId: number) => {
        if (hasVoted) return;
        setHasVoted(true);
        setPlayers(prev => prev.map(p => p.id === targetId ? { ...p, votes: p.votes + 1 } : p));
    };

    const resolveVoting = () => {
        // Add random bot votes
        const alivePlayers = players.filter(p => p.isAlive);
        let updatedPlayers = [...players];
        
        alivePlayers.forEach(p => {
            if (!p.isMe) {
                const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                updatedPlayers = updatedPlayers.map(up => up.id === target.id ? { ...up, votes: up.votes + 1 } : up);
            }
        });

        setPlayers(updatedPlayers);

        // Find max
        const maxVotes = Math.max(...updatedPlayers.map(p => p.votes));
        const limitCount = Math.ceil(alivePlayers.length / 2); // Strict majority rule

        const eliminated = updatedPlayers.find(p => p.votes === maxVotes && maxVotes >= limitCount);
        
        if (eliminated) {
            setPlayers(prev => prev.map(p => p.id === eliminated.id ? { ...p, isAlive: false } : p));
            alert(`${eliminated.name} goes to the gallows!`);
        } else {
            alert(`No strict majority reached. No one is hanged.`);
        }

        setDayCount(d => d + 1);
        checkWinCondition();
        if (!winner) {
            setTimeout(startNight, 3000);
        }
    };

    const checkWinCondition = () => {
        const aliveMafias = players.filter(p => p.isAlive && p.role === 'mafia').length;
        const aliveCitizens = players.filter(p => p.isAlive && p.role !== 'mafia').length;

        if (aliveMafias === 0) {
            setWinner('citizens');
            setPhase('game_over');
        } else if (aliveMafias >= aliveCitizens) {
            setWinner('mafia');
            setPhase('game_over');
        }
    };

    const getRoleIcon = (r: Role | null) => {
        switch(r) {
            case 'mafia': return <Skull className="w-12 h-12 text-red-500" />;
            case 'doctor': return <Shield className="w-12 h-12 text-green-500" />;
            case 'detective': return <Search className="w-12 h-12 text-blue-500" />;
            case 'sniper': return <Crosshair className="w-12 h-12 text-orange-500" />;
            default: return <Users className="w-12 h-12 text-gray-400" />;
        }
    };

    return (
        <div className="flex-1 relative overflow-hidden bg-black text-white font-sans flex flex-col">
            <div className={`absolute inset-0 transition-colors duration-1000 ${phase === 'night' || phase === 'reveal' ? 'bg-[#050505]' : 'bg-[#1a1210]'}`}>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <div className="relative z-10 p-6 flex justify-between items-center bg-black/40 backdrop-blur-sm border-b border-white/5">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Home className="w-4 h-4" /> Exit
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-display font-black tracking-widest uppercase text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">Mafia</h1>
                    <div className="text-xs text-gray-500 font-mono tracking-widest mt-1">DAY {dayCount}</div>
                </div>
                <div className="w-20 text-right font-mono text-sm">
                    {players.filter(p => p.isAlive).length} ALIVE
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {phase === 'lobby' && (
                        <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center w-full max-w-2xl">
                            <div className="w-24 h-24 rounded-full bg-red-900/20 border border-red-500/50 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                                <Users className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Lobby Setup</h2>
                            
                            <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
                                <span className="font-bold text-gray-400">Players:</span>
                                <input type="range" min={5} max={12} value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))} className="accent-red-500 w-48" />
                                <span className="font-black text-xl w-8">{playerCount}</span>
                            </div>
                            
                            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-h-[300px] overflow-y-auto">
                                {players.map(p => (
                                    <div key={p.id} className={`p-3 rounded-lg border ${p.isMe ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5'} flex items-center gap-2`}>
                                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                            <Users className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="font-bold truncate text-xs">{p.name}</div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={startGame} className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-colors w-full md:w-auto">
                                START GAME
                            </button>
                        </motion.div>
                    )}

                    {phase === 'card_selection' && (
                        <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-8">Pick Your Role Card</h2>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                {Array.from({length: playerCount}).map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={pickCard}
                                        className="w-24 h-36 border-2 border-red-900 bg-black rounded-lg cursor-pointer flex items-center justify-center hover:border-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
                                    >
                                        <Shield className="text-red-900 w-8 h-8" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {phase === 'reveal' && (
                        <motion.div key="reveal" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center">
                            <div className="text-gray-400 font-bold tracking-widest text-sm mb-8 uppercase">Your Role Is...</div>
                            <div className="w-64 h-96 bg-gradient-to-br from-[#111] to-black border-2 border-red-500 rounded-2xl flex flex-col items-center justify-center p-6 shadow-[0_0_50px_rgba(220,38,38,0.6)] relative overflow-hidden">
                                {getRoleIcon(myRole)}
                                <h1 className="text-4xl font-display font-black text-white tracking-widest uppercase mb-2 mt-4">{myRole}</h1>
                                <p className="text-center text-gray-400 text-sm mt-4 font-medium uppercase tracking-widest">
                                    {myRole === 'mafia' && 'Eliminate everyone.'}
                                    {myRole === 'doctor' && 'Heal the innocent.'}
                                    {myRole === 'detective' && 'Find the mafia.'}
                                    {myRole === 'sniper' && 'Shoot the guilty.'}
                                    {myRole === 'citizen' && 'Survive.'}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'night' && (
                        <motion.div key="night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-4xl h-full pb-20 justify-center">
                            <div className="text-center mb-8">
                                <Moon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-display font-bold text-blue-300">Night Phase</h2>
                                <p className="text-blue-500/60 font-mono mt-2 uppercase tracking-widest">{myRole === 'citizen' ? 'Sleep tightly.' : 'Choose your target.'}</p>
                            </div>

                            {myRole !== 'citizen' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                    {players.filter(p => !p.isMe && p.isAlive).map(p => (
                                        <div key={p.id} onClick={() => handleNightAction(p.id)} className={`relative group cursor-pointer p-6 bg-[#111] border rounded-xl flex flex-col items-center gap-4 transition-transform ${nightTarget === p.id ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/30'}`}>
                                            <div className="w-16 h-16 rounded-full bg-black border border-white/20 flex items-center justify-center">
                                                <Users className="w-8 h-8 text-white/50" />
                                            </div>
                                            <div className="font-bold">{p.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {nightResult && <div className="mt-8 text-xl font-bold text-white bg-white/10 px-6 py-3 rounded-lg">{nightResult}</div>}
                            
                            <button onClick={finishNight} className="mt-12 px-8 py-3 border border-white/20 hover:bg-white/10 rounded-lg">Skip Night (Debug)</button>
                        </motion.div>
                    )}

                    {phase === 'day_reveal' && (
                        <motion.div key="day_reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                            <Sun className="w-16 h-16 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
                            <h2 className="text-4xl font-display font-black text-yellow-500 mb-4">Morning Break</h2>
                            {deadLastNight.length > 0 ? (
                                <div className="text-red-500 font-bold text-xl uppercase tracking-widest">
                                    {deadLastNight.map(id => players.find(p => p.id === id)?.name).join(' & ')} was killed.
                                </div>
                            ) : (
                                <div className="text-green-500 font-bold text-xl uppercase tracking-widest">Peaceful night. No one died.</div>
                            )}
                        </motion.div>
                    )}

                    {(phase === 'discussion' || phase === 'voting') && (
                        <motion.div key="day_cycle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full h-full">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-max overflow-y-auto pr-2 custom-scrollbar content-start">
                                {players.map(p => (
                                    <div key={p.id} className={`p-4 rounded-xl border relative flex flex-col items-center text-center transition-all ${!p.isAlive ? 'border-red-900/50 bg-red-950/20 grayscale' : p.isSpeaking ? 'border-green-500 bg-green-500/10 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-white/10 bg-[#111]'}`}>
                                        {!p.isAlive && <div className="absolute inset-0 flex items-center justify-center z-10"><Skull className="w-16 h-16 text-red-600/50" /></div>}
                                        
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border ${p.isSpeaking ? 'border-green-500 ring-4 ring-green-500/20' : 'border-white/20'}`}>
                                            <Users className={`w-8 h-8 ${p.isAlive ? 'text-white/80' : 'text-gray-600'}`} />
                                        </div>
                                        <div className="font-bold truncate w-full px-2">{p.name}</div>
                                        {p.isMe && <div className="text-[10px] text-gray-500 uppercase mt-1">({myRole})</div>}

                                        {/* Speaking Indicator */}
                                        {p.isAlive && phase === 'discussion' && (
                                            <div className="mt-3">
                                                {p.isSpeaking ? (
                                                    <div className="flex items-center gap-1 text-green-500 text-xs font-bold animate-pulse">
                                                        <Mic className="w-3 h-3" /> SPEAKING...
                                                    </div>
                                                ) : (
                                                    <MicOff className="w-4 h-4 text-gray-700" />
                                                )}
                                            </div>
                                        )}

                                        {/* Voting Action */}
                                        {p.isAlive && phase === 'voting' && (
                                            <div className="mt-3 w-full">
                                                <button onClick={() => castVote(p.id)} disabled={hasVoted || !p.isAlive} className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 rounded text-red-500 text-xs font-bold uppercase disabled:opacity-30">
                                                    Vote ({p.votes})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 mt-4 bg-white/5 border border-white/10 rounded-xl text-center flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{phase === 'discussion' ? 'Discussion Phase' : 'Voting Phase'}</div>
                                    <div className="text-lg font-bold text-yellow-500">
                                        {phase === 'discussion' 
                                            ? `${players.find(p => p.isSpeaking)?.name || '...'} has the floor`
                                            : 'Cast your vote to eliminate someone!'
                                        }
                                    </div>
                                </div>
                                {phase === 'discussion' && players.find(p => p.isMe && p.isSpeaking) && (
                                    <button onClick={() => simulateSpeakingCycle(speakingIndex + 1)} className="px-4 py-2 bg-green-500 text-black font-bold flex items-center gap-2 rounded">
                                        End Turn <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {phase === 'game_over' && (
                        <motion.div key="game_over" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-[#111] p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                            <h1 className={`text-6xl font-display font-black tracking-widest uppercase mb-4 ${winner === 'mafia' ? 'text-red-600' : 'text-blue-500'}`}>
                                {winner} WIN
                            </h1>
                            <p className="text-gray-400 mb-8 uppercase tracking-widest">Game Over.</p>
                            <button onClick={() => setPhase('lobby')} className="px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors">
                                PLAY AGAIN
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
