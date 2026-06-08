import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, ContactShadows, SpotLight, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';

import { useStore } from '../store/useStore';
import { checkCFWinner, getCFBestMove, applyMove, CFPlayer, ROWS, COLS } from '../game/ConnectFourAI';
import { Trophy, RotateCcw, Home } from 'lucide-react';

let socket: Socket;
const initSocket = () => {
    if (!socket) socket = io({ path: '/socket.io' });
    return socket;
};

// --- 3D Components ---

function Piece({ position, color, isWinning }: { position: [number, number, number], color: 'R' | 'Y', isWinning: boolean }) {
    const ref = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (isWinning && ref.current) {
             ref.current.rotation.z += delta * 2;
        }
    });

    const baseColor = color === 'R' ? '#f43f5e' : '#eab308';
    const glowColor = isWinning ? new THREE.Color("#fff") : new THREE.Color(baseColor);

    return (
        <group ref={ref} position={position}>
             <mesh rotation={[Math.PI / 2, 0, 0]}>
                 <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
                 <meshStandardMaterial color={baseColor} emissive={glowColor} emissiveIntensity={isWinning ? 4 : 1} />
             </mesh>
        </group>
    );
}

function CFBoard({ board, onPlay, winLine }: { board: CFPlayer[], onPlay: (col: number) => void, winLine: number[] | null }) {
    // Origin is center
    const boardWidth = COLS;
    const boardHeight = ROWS;
    const cellSpacing = 1;

    const Cell = ({ row, col }: { row: number, col: number }) => {
        const [hovered, setHovered] = useState(false);
        const idx = row * COLS + col;
        const val = board[idx];
        const isWinningCell = winLine?.includes(idx) || false;

        const posX = (col - COLS / 2 + 0.5) * cellSpacing;
        const posY = ((ROWS - 1 - row) - ROWS / 2 + 0.5) * cellSpacing;

        return (
            <group position={[posX, posY, 0]}>
                <mesh 
                    onClick={() => onPlay(col)}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    position={[0, 0, -0.2]}
                >
                    <boxGeometry args={[0.95, 0.95, 0.2]} />
                    <MeshTransmissionMaterial 
                       color="#222"
                       roughness={0.1}
                       transmission={0.9}
                       thickness={1}
                    />
                     {/* Hole */}
                     <mesh position={[0,0,0]} rotation={[Math.PI/2,0,0]}>
                         <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
                         <meshBasicMaterial color="#050505" />
                     </mesh>
                </mesh>
                
                {val && <Piece position={[0, 0, -0.2]} color={val} isWinning={isWinningCell} />}
            </group>
        );
    }

    return (
        <group>
            {/* Base Support */}
            <mesh position={[-COLS/2 - 0.2, -ROWS/2, -0.2]}>
               <boxGeometry args={[0.5, ROWS+1, 0.5]} />
               <meshStandardMaterial color="#4f46e5" />
            </mesh>
            <mesh position={[COLS/2 + 0.2, -ROWS/2, -0.2]}>
               <boxGeometry args={[0.5, ROWS+1, 0.5]} />
               <meshStandardMaterial color="#4f46e5" />
            </mesh>

            {Array.from({ length: ROWS }).map((_, r) => 
                Array.from({ length: COLS }).map((_, c) => (
                    <Cell key={`${r}-${c}`} row={r} col={c} />
                ))
            )}
        </group>
    );
}

// --- Main Logic ---

export default function ConnectFour() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'solo';
    const difficulty = (params.get('diff') as 'easy'|'medium'|'hard') || 'medium';

    const { lobbyCode, user } = useStore();
    
    const [board, setBoard] = useState<CFPlayer[]>(Array(ROWS * COLS).fill(null));
    const [rIsNext, setRIsNext] = useState(true);
    const [status, setStatus] = useState<'playing' | 'r_wins' | 'y_wins' | 'draw'>('playing');
    const [winLine, setWinLine] = useState<number[] | null>(null);

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
                   setRIsNext(action.rIsNext);
                } else if (action.type === 'restart') {
                   resetGame(false);
                }
            });

            return () => {
                sock.off('player-joined');
                sock.off('game-state-updated');
            };
        }
    }, [mode, lobbyCode, navigate]);

    useEffect(() => {
        const result = checkCFWinner(board);
        if (result) {
            if (result.winner === 'R') setStatus('r_wins');
            else if (result.winner === 'Y') setStatus('y_wins');
            else setStatus('draw');
            
            if (result.line) setWinLine(result.line);

            if(result.winner && result.winner !== 'draw') {
                 confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: result.winner === 'R' ? ['#f43f5e'] : ['#eab308']
                });
            }
        }
    }, [board]);

    useEffect(() => {
        let aiTimeout: any;
        if (mode === 'solo' && status === 'playing' && !rIsNext) {
            aiTimeout = setTimeout(() => {
                const bestMove = getCFBestMove(board, 'Y', difficulty);
                if (bestMove !== -1) {
                    handlePlay(bestMove, 'Y');
                }
            }, 600);
        }
        return () => clearTimeout(aiTimeout);
    }, [rIsNext, board, status, mode, difficulty]);

    const handlePlay = (col: number, player: CFPlayer = null) => {
        if (board[col] !== null) return; // Column full
        if (status !== 'playing' || !isOpponentJoined) return;
        
        const currentSymbol = rIsNext ? 'R' : 'Y';
        const actor = player || currentSymbol;

        if (mode === 'solo' && actor !== currentSymbol) return;

        const { board: newBoard } = applyMove(board, col, currentSymbol);
        
        setBoard(newBoard);
        setRIsNext(!rIsNext);

        if (mode === 'multi') {
            socket.emit('game-action', { 
                lobbyCode, 
                action: { type: 'play', board: newBoard, rIsNext: !rIsNext } 
            });
        }
    };

    const resetGame = (emit = true) => {
        setBoard(Array(ROWS * COLS).fill(null));
        setRIsNext(true);
        setStatus('playing');
        setWinLine(null);

        if (mode === 'multi' && emit && lobbyCode) {
            socket.emit('game-action', { lobbyCode, action: { type: 'restart' } });
        }
    };

    return (
        <div className="flex-1 flex flex-col xl:flex-row relative overflow-hidden bg-[#050505]">
            <div className="relative z-20 w-full xl:w-96 flex flex-col p-6 border-b xl:border-b-0 xl:border-r border-white/5 bg-[#121212]/80 backdrop-blur-md">
                 <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                     <Home className="w-4 h-4" /> Exit Game
                 </button>

                 <div className="mb-8">
                     <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Connect Four</h1>
                     <div className="flex items-center gap-2">
                         <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-sm font-medium">
                             {mode === 'solo' ? t('Solo') : t('Multiplayer')}
                         </span>
                         {mode === 'multi' && lobbyCode && (
                             <span className="px-2.5 py-1 rounded-md bg-board-accent/20 text-board-accent text-sm font-bold tracking-widest font-mono">
                                 {lobbyCode}
                             </span>
                         )}
                     </div>
                 </div>

                 <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 mb-8 flex-1 xl:flex-none flex flex-col justify-center shadow-lg">
                     <div className="text-center">
                         {!isOpponentJoined ? (
                             <div className="animate-pulse text-board-accent font-medium">Waiting for opponent...</div>
                         ) : status === 'playing' ? (
                             <motion.div key={rIsNext ? 'R' : 'Y'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                 <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">Current Turn</div>
                                 <div className={`text-4xl font-bold ${rIsNext ? 'text-rose-500' : 'text-yellow-500'}`}>
                                     Player {rIsNext ? 'Red' : 'Yellow'}
                                 </div>
                             </motion.div>
                         ) : (
                             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                 <Trophy className={`w-12 h-12 mx-auto mb-4 ${status === 'draw' ? 'text-gray-400' : status === 'r_wins' ? 'text-rose-500' : 'text-yellow-500'}`} />
                                 <div className="text-3xl font-display font-bold mb-2">
                                     {status === 'draw' ? 'Draw!' : `Player ${status === 'r_wins' ? 'Red' : 'Yellow'} Wins!`}
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
                 
                 <div className="mt-auto px-4 py-3 bg-[#050505] rounded-xl border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10" style={{ background: user?.color }}>
                        {user?.avatar && <img src={user.avatar} alt="P1" />}
                     </div>
                     <span className="font-bold text-sm tracking-widest">{user?.name} (You)</span>
                 </div>
            </div>

            <div className="flex-1 relative min-h-[60vh] xl:min-h-0 bg-gradient-to-t from-[#0a0a0a] to-[#050505]">
                 <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
                    <color attach="background" args={['#050505']} />
                    <ambientLight intensity={0.5} />
                    <SpotLight
                        position={[0, 10, 5]}
                        angle={0.8}
                        penumbra={1}
                        intensity={2}
                        color="#ffffff"
                    />
                    <PresentationControls 
                        global 
                        rotation={[0, 0, 0]} 
                        polar={[-0.2, 0.2]} 
                        azimuth={[-0.4, 0.4]}
                        snap
                    >
                        <Float rotationIntensity={0.1} floatIntensity={0.5} speed={2}>
                            <CFBoard board={board} onPlay={(idx) => handlePlay(idx)} winLine={winLine} />
                        </Float>
                    </PresentationControls>

                    <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
                    
                    <EffectComposer>
                         <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
                         <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                 </Canvas>
            </div>
        </div>
    );
}
