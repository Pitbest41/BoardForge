import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows, Text, SpotLight, useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';

import { useStore } from '../store/useStore';
import { checkWinner, getBestMove, PlayerType, Difficulty } from '../game/TicTacToeAI';
import { ChevronDown, Trophy, RotateCcw, Home } from 'lucide-react';

let socket: Socket;
const initSocket = () => {
    if (!socket) socket = io({ path: '/socket.io' });
    return socket;
};

// --- 3D Components ---

function Cross({ position, isWinning }: { position: [number, number, number], isWinning: boolean }) {
    const ref = useRef<THREE.Group>(null);
    const scale = useState(0)[0];
    
    useEffect(() => {
        // Simple scale animation via ref if we had spring, using quick hack
        if(ref.current) {
            ref.current.scale.set(0.1, 0.1, 0.1);
        }
    }, []);

    useFrame((state, delta) => {
        if(ref.current && ref.current.scale.x < 1) {
            ref.current.scale.x += delta * 5;
            ref.current.scale.y += delta * 5;
            ref.current.scale.z += delta * 5;
        }
        if(isWinning && ref.current) {
             ref.current.rotation.y += delta;
             ref.current.rotation.z += delta * 0.5;
        }
    });

    const glowColor = isWinning ? new THREE.Color("#fff") : new THREE.Color("#ff6b00");

    return (
        <group ref={ref} position={position}>
             <mesh rotation={[0, 0, Math.PI / 4]}>
                 <boxGeometry args={[1.5, 0.3, 0.3]} />
                 <meshStandardMaterial color="#ff6b00" emissive={glowColor} emissiveIntensity={isWinning ? 4 : 2} toneMapped={false} />
             </mesh>
             <mesh rotation={[0, 0, -Math.PI / 4]}>
                 <boxGeometry args={[1.5, 0.3, 0.3]} />
                 <meshStandardMaterial color="#ff6b00" emissive={glowColor} emissiveIntensity={isWinning ? 4 : 2} toneMapped={false} />
             </mesh>
        </group>
    );
}

function Circle({ position, isWinning }: { position: [number, number, number], isWinning: boolean }) {
    const ref = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if(ref.current && ref.current.scale.x < 1) {
            ref.current.scale.x += delta * 5;
            ref.current.scale.y += delta * 5;
            ref.current.scale.z += delta * 5;
        }
        if(isWinning && ref.current) {
             ref.current.rotation.y += delta;
             ref.current.rotation.x += delta * 0.5;
        }
    });

    const glowColor = isWinning ? new THREE.Color("#fff") : new THREE.Color("#4f46e5");

    return (
        <group ref={ref} position={position} scale={[0.1, 0.1, 0.1]}>
             <mesh>
                 <torusGeometry args={[0.6, 0.15, 16, 64]} />
                 <meshStandardMaterial color="#4f46e5" emissive={glowColor} emissiveIntensity={isWinning ? 4 : 2} toneMapped={false} />
             </mesh>
        </group>
    );
}

function Board({ board, onPlay, winLine }: { board: PlayerType[], onPlay: (idx: number) => void, winLine: number[] | null }) {
    const gridPositions = [
        [-2, 2, 0], [0, 2, 0], [2, 2, 0],
        [-2, 0, 0], [0, 0, 0], [2, 0, 0],
        [-2, -2, 0], [0, -2, 0], [2, -2, 0]
    ];

    const Cell = ({ position, index }: { position: number[], index: number }) => {
        const [hovered, setHovered] = useState(false);
        const val = board[index];
        const isWinningCell = winLine?.includes(index) || false;

        return (
            <group position={position as [number, number, number]}>
                <mesh 
                    onClick={() => { if(!val && !winLine) onPlay(index); }}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    position={[0, 0, -0.2]}
                >
                    <boxGeometry args={[1.9, 1.9, 0.2]} />
                    <MeshTransmissionMaterial 
                       color={hovered && !val && !winLine ? "#333" : "#111"}
                       roughness={0.2}
                       transmission={0.9}
                       thickness={0.5}
                    />
                </mesh>
                
                {val === 'X' && <Cross position={[0, 0, 0.2]} isWinning={isWinningCell} />}
                {val === 'O' && <Circle position={[0, 0, 0.2]} isWinning={isWinningCell} />}
            </group>
        );
    }

    return (
        <group>
            {/* Grid lines */}
            <mesh position={[-1, 0, -0.1]}>
               <boxGeometry args={[0.05, 5.9, 0.1]} />
               <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[1, 0, -0.1]}>
               <boxGeometry args={[0.05, 5.9, 0.1]} />
               <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, -1, -0.1]} rotation={[0, 0, Math.PI / 2]}>
               <boxGeometry args={[0.05, 5.9, 0.1]} />
               <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[0, 1, -0.1]} rotation={[0, 0, Math.PI / 2]}>
               <boxGeometry args={[0.05, 5.9, 0.1]} />
               <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
            </mesh>

            {gridPositions.map((pos, i) => (
                <Cell key={i} index={i} position={pos} />
            ))}
        </group>
    );
}

// --- Main App Logic ---

export default function TicTacToe() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'solo';
    const initialDifficulty = (params.get('diff') as Difficulty) || 'medium';

    const { lobbyCode } = useStore();
    
    const [board, setBoard] = useState<PlayerType[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
    const [status, setStatus] = useState<'playing' | 'x_wins' | 'o_wins' | 'draw'>('playing');
    const [winLine, setWinLine] = useState<number[] | null>(null);
    const [playerSymbol, setPlayerSymbol] = useState<PlayerType>('X'); // In solo, player is always X for now

    // Multiplayer State
    const [isOpponentJoined, setIsOpponentJoined] = useState(mode === 'solo');

    useEffect(() => {
        if (mode === 'multi') {
            const sock = initSocket();
            if(!lobbyCode) {
                navigate('/lobby');
                return;
            }

            sock.on('player-joined', (data) => {
                if(data.players > 1) {
                    setIsOpponentJoined(true);
                }
            });

            sock.on('game-state-updated', (action) => {
                if (action.type === 'play') {
                   setBoard(action.board);
                   setXIsNext(action.xIsNext);
                } else if (action.type === 'restart') {
                   resetGame(false);
                }
            });

            // Clean up
            return () => {
                sock.off('player-joined');
                sock.off('game-state-updated');
            };
        }
    }, [mode, lobbyCode, navigate]);

    // Check Win Condition
    useEffect(() => {
        const result = checkWinner(board);
        if (result) {
            if (result.winner === 'X') setStatus('x_wins');
            else if (result.winner === 'O') setStatus('o_wins');
            else setStatus('draw');
            
            if (result.line) setWinLine(result.line);

            if(result.winner && result.winner !== 'draw') {
                 confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: result.winner === 'X' ? ['#ff6b00', '#ffffff'] : ['#4f46e5', '#ffffff']
                });
            }
        }
    }, [board]);

    // AI Turn
    useEffect(() => {
        let aiTimeout: any;
        if (mode === 'solo' && status === 'playing' && !xIsNext) {
            // Opponent's turn (O)
            aiTimeout = setTimeout(() => {
                const bestMove = getBestMove(board, 'O', difficulty);
                if (bestMove !== -1) {
                    handlePlay(bestMove, 'O');
                }
            }, 600); // slight delay for realism
        }
        return () => clearTimeout(aiTimeout);
    }, [xIsNext, board, status, mode, difficulty]);

    const handlePlay = (index: number, player: PlayerType = null) => {
        if (board[index] || status !== 'playing' || !isOpponentJoined) return;

        // In multiplayer, ensure it's actually the player's turn 
        // (Simplified: assuming Host is X, Guest is O for this demo)
        
        const currentSymbol = xIsNext ? 'X' : 'O';
        const actor = player || currentSymbol;

        // If in solo and it's not our turn, don't allow click
        if (mode === 'solo' && actor !== currentSymbol) return;

        const newBoard = [...board];
        newBoard[index] = currentSymbol;
        
        setBoard(newBoard);
        setXIsNext(!xIsNext);

        if (mode === 'multi') {
            socket.emit('game-action', { 
                lobbyCode, 
                action: { type: 'play', board: newBoard, xIsNext: !xIsNext } 
            });
        }
    };

    const resetGame = (emit = true) => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setStatus('playing');
        setWinLine(null);

        if (mode === 'multi' && emit && lobbyCode) {
            socket.emit('game-action', { lobbyCode, action: { type: 'restart' } });
        }
    };

    return (
        <div className="flex-1 flex flex-col xl:flex-row relative overflow-hidden bg-board-dark">
            {/* UI Overlay */}
            <div className="relative z-20 w-full xl:w-96 flex flex-col p-6 border-b xl:border-b-0 xl:border-r border-white/10 bg-board-dark/80 backdrop-blur-md">
                 <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                     <Home className="w-4 h-4" /> Exit Game
                 </button>

                 <div className="mb-8">
                     <h1 className="text-4xl font-display font-bold mb-2">Tic Tac Toe</h1>
                     <div className="flex items-center gap-2">
                         <span className="px-2.5 py-1 rounded-md bg-white/10 text-sm font-medium">
                             {mode === 'solo' ? t('Solo') : t('Multiplayer')}
                         </span>
                         {mode === 'solo' && (
                             <select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                                className="bg-transparent text-board-accent font-medium outline-none cursor-pointer"
                             >
                                 <option value="easy">{t('Easy')}</option>
                                 <option value="medium">{t('Medium')}</option>
                                 <option value="hard">{t('Hard')}</option>
                             </select>
                         )}
                         {mode === 'multi' && lobbyCode && (
                             <span className="px-2.5 py-1 rounded-md bg-board-accent/20 text-board-accent text-sm font-bold tracking-widest font-mono">
                                 {lobbyCode}
                             </span>
                         )}
                     </div>
                 </div>

                 {/* Status Display */}
                 <div className="bg-board-charcoal/50 border border-white/5 rounded-2xl p-6 mb-8 flex-1 xl:flex-none flex flex-col justify-center">
                     <div className="text-center">
                         {!isOpponentJoined ? (
                             <div className="animate-pulse text-board-accent font-medium">Waiting for opponent...</div>
                         ) : status === 'playing' ? (
                             <motion.div key={xIsNext ? 'X' : 'O'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                 <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">Current Turn</div>
                                 <div className={`text-4xl font-bold ${xIsNext ? 'text-board-accent' : 'text-board-purple'}`}>
                                     Player {xIsNext ? 'X' : 'O'}
                                 </div>
                             </motion.div>
                         ) : (
                             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                 <Trophy className={`w-12 h-12 mx-auto mb-4 ${status === 'draw' ? 'text-gray-400' : status === 'x_wins' ? 'text-board-accent' : 'text-board-purple'}`} />
                                 <div className="text-3xl font-display font-bold mb-2">
                                     {status === 'draw' ? 'Draw!' : `Player ${status === 'x_wins' ? 'X' : 'O'} Wins!`}
                                 </div>
                                 <button 
                                     onClick={() => resetGame()} 
                                     className="mt-4 px-8 py-3 rounded-xl bg-board-accent text-black font-black hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
                                 >
                                     <RotateCcw className="w-4 h-4" /> {t('Play Again')}
                                 </button>
                             </motion.div>
                         )}
                     </div>
                 </div>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 relative min-h-[60vh] xl:min-h-0 bg-gradient-to-t from-[#0a0a0a] to-[#050505]">
                 <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                    <color attach="background" args={['#050505']} />
                    <ambientLight intensity={0.5} />
                    <SpotLight
                        position={[0, 10, 5]}
                        angle={0.5}
                        penumbra={1}
                        intensity={2}
                        color="#ffffff"
                    />
                    <PresentationControls 
                        global 
                        rotation={[0, 0, 0]} 
                        polar={[-0.4, 0.2]} 
                        azimuth={[-0.4, 0.4]}
                        snap
                    >
                        <Float rotationIntensity={0.2} floatIntensity={0.5} speed={2}>
                            <Board board={board} onPlay={(idx) => handlePlay(idx)} winLine={winLine} />
                        </Float>
                    </PresentationControls>

                    <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
                    
                    <EffectComposer>
                         <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
                         <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                 </Canvas>

                 {/* Simple decorative HUD elements */}
                 <div className="absolute top-6 right-6 pointer-events-none opacity-30 font-mono text-xs text-board-accent">
                    SYS.RENDER_TGT: WEBGL<br/>
                    CORE.FPS: TGT_60
                 </div>
                 <div className="absolute bottom-6 right-6 pointer-events-none opacity-30 font-mono text-xs text-board-purple text-right">
                    PROTOCOL: SECURE_WS<br/>
                    LATENCY: 12ms
                 </div>
            </div>
        </div>
    );
}
