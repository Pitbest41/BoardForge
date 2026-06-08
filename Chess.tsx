import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Home, RefreshCw, Trophy, Skull } from 'lucide-react';

export default function ChessGame() {
    const navigate = useNavigate();
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [isGameOver, setIsGameOver] = useState(false);
    const [status, setStatus] = useState('شروع بازی - نوبت سفید');

    useEffect(() => {
        updateStatus();
    }, [game.fen()]);

    const updateStatus = () => {
        let statusText = '';
        const moveColor = game.turn() === 'w' ? 'سفید' : 'سیاه';

        if (game.isCheckmate()) {
            statusText = `کیش و مات! ${moveColor === 'سفید' ? 'سیاه' : 'سفید'} برنده شد.`;
            setIsGameOver(true);
        } else if (game.isDraw()) {
            statusText = 'بازی مساوی شد.';
            setIsGameOver(true);
        } else {
            statusText = `نوبت ${moveColor} است`;
            if (game.inCheck()) {
                statusText += ' - کیش!';
            }
            setIsGameOver(false);
        }
        setStatus(statusText);
    };

    function makeRandomMove() {
        if (game.isGameOver()) return;
        const possibleMoves = game.moves();
        if (possibleMoves.length === 0) return;
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        game.move(possibleMoves[randomIndex]);
        setFen(game.fen());
        setGame(new Chess(game.fen()));
    }

    function onDrop({ sourceSquare, targetSquare }: { sourceSquare: string, targetSquare: string | null }) {
        if (!targetSquare || isGameOver || game.turn() !== 'w') return false;

        try {
            const move = game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q', // always promote to a queen for simple UI
            });

            if (move === null) return false;

            setFen(game.fen());
            setGame(new Chess(game.fen()));

            // Bot plays randomly after 500ms
            setTimeout(() => {
                makeRandomMove();
            }, 500);

            return true;
        } catch (e) {
            return false;
        }
    }

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setIsGameOver(false);
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row relative bg-[#0b0c10] text-gray-200 p-4 md:p-8 overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-full md:w-80 flex flex-col gap-6 mb-6 md:mb-0 md:mr-8 z-10">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
                    <Home className="w-5 h-5" /> بازگشت به لابی
                </button>
                
                <div>
                     <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
                         <Trophy className="w-8 h-8 text-yellow-500" />
                         شطرنج
                     </h1>
                     <div className="text-sm text-gray-400 mt-2 font-bold tracking-widest">VS. COMPUTER (EASY)</div>
                </div>

                <div className="bg-[#1f2833] rounded-2xl p-6 border border-white/5 shadow-xl">
                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">وضعیت بازی</div>
                    <div className={`text-lg font-bold ${game.inCheck() ? 'text-red-400' : 'text-white'}`}>
                        {status}
                    </div>

                    {isGameOver && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <Skull className="w-5 h-5" /> 
                            پایان بازی
                        </div>
                    )}
                </div>

                <button 
                    onClick={resetGame}
                    className="w-full py-4 text-white font-bold bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" /> بازی جدید
                </button>

                {/* History */}
                <div className="flex-1 bg-[#1f2833] rounded-2xl p-6 border border-white/5 shadow-xl flex flex-col min-h-[200px]">
                     <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">تاریخچه حرکات</div>
                     <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                          {game.history().reduce((result: any[], item: string, index: number) => {
                              const chunkIndex = Math.floor(index / 2);
                              if (!result[chunkIndex]) result[chunkIndex] = [];
                              result[chunkIndex].push(item);
                              return result;
                          }, []).map((movePair, i) => (
                              <div key={i} className="flex text-sm font-mono text-gray-400 border-b border-white/5 py-1">
                                  <div className="w-8 text-gray-600 font-bold">{i + 1}.</div>
                                  <div className="flex-1 text-white">{movePair[0]}</div>
                                  <div className="flex-1 text-gray-500">{movePair[1] || ''}</div>
                              </div>
                          ))}
                     </div>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full max-w-2xl mx-auto">
                <div className="w-full aspect-square bg-[#1f2833] p-4 rounded-xl shadow-2xl border border-white/5">
                    <Chessboard 
                        options={{
                            position: fen, 
                            onPieceDrop: onDrop,
                            boardStyle: {
                                borderRadius: '4px',
                                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                            },
                            darkSquareStyle: { backgroundColor: '#45a29e' },
                            lightSquareStyle: { backgroundColor: '#c5c6c7' }
                        }}
                    />
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#45a29e] rounded-full mix-blend-screen filter blur-[150px] opacity-20" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10" />
            </div>
        </div>
    );
}
