import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Gamepad2, Settings, Users, Monitor, ChevronRight } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

let socket: Socket;

// Try connecting to the current origin
const initSocket = () => {
    if (!socket) {
        socket = io({ path: '/socket.io' });
    }
    return socket;
};


export default function Lobby() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isSolo = new URLSearchParams(location.search).get('mode') === 'solo';
  
  const { setLobbyCode, user, language } = useStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(isSolo ? 'create' : 'join');
  const [joinCode, setJoinCode] = useState('');
  const [createdLobby, setCreatedLobby] = useState<{code: string, pass: string} | null>(null);

  useEffect(() => {
     if (!isSolo) {
         initSocket();
     }
  }, [isSolo]);

  const handleCreateLobby = (gameType: string) => {
    if (isSolo) {
        return;
    }

    socket.emit('create-lobby', null, (res: any) => {
        if(res.success) {
            setCreatedLobby({code: res.lobbyCode, pass: res.password});
            setLobbyCode(res.lobbyCode);
            // wait for others. For now, navigate immediately for demo
            setTimeout(() => {
                navigate(`/game/${gameType}?mode=multi`);
            }, 3000);
        }
    });
  };

  const handleJoinLobby = () => {
      socket.emit('join-lobby', { code: joinCode }, (res: any) => {
          if(res.success) {
              setLobbyCode(res.lobbyCode);
              navigate('/game/tic-tac-toe?mode=multi');
          } else {
              alert(res.error);
          }
      });
  };

  return (
    <div className="flex-1 flex flex-col items-center py-20 px-6 relative">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                    {isSolo ? t('Solo') : t('Multiplayer')}
                </h1>
                <p className="text-gray-400 text-lg">
                    {isSolo ? "Select a game to play against the AI." : "Create or join a session."}
                </p>
            </div>
            {isSolo && (
                 <button onClick={() => navigate('/lobby')} className="text-board-accent hover:underline flex items-center gap-2">
                     <Users className="w-4 h-4" /> Switch to Multiplayer
                 </button>
            )}
            {!isSolo && (
                 <button onClick={() => navigate('/lobby?mode=solo')} className="text-board-accent hover:underline flex items-center gap-2">
                     <Monitor className="w-4 h-4" /> Switch to Solo
                 </button>
            )}
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <div className="flex flex-col gap-2">
                {!isSolo && (
                    <>
                        <button 
                            onClick={() => setActiveTab('join')}
                            className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${activeTab === 'join' ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 opacity-60'}`}
                        >
                            <span className="font-semibold">{t('Join Lobby')}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setActiveTab('create')}
                            className={`p-4 rounded-xl text-left transition-all flex items-center justify-between ${activeTab === 'create' ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 opacity-60'}`}
                        >
                            <span className="font-semibold">{t('Create Lobby')}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
                {isSolo && (
                     <button 
                         className={`p-4 rounded-xl text-left transition-all flex items-center justify-between bg-white/10 border border-white/20`}
                     >
                         <span className="font-semibold">{t('Select Game')}</span>
                         <ChevronRight className="w-4 h-4" />
                     </button>
                )}
            </div>

            <div className="bg-[#121212]/80 border border-white/5 rounded-2xl p-8 backdrop-blur-sm min-h-[400px] flex flex-col justify-center shadow-2xl">
                {activeTab === 'join' && !isSolo && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 w-full max-w-sm mx-auto">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold mb-2">Enter Invite Code</h2>
                            <p className="text-gray-400 text-sm">Paste the code given by the lobby host.</p>
                        </div>
                        <input 
                            type="text" 
                            className="bg-black/50 border border-white/10 rounded-xl p-4 text-center text-3xl font-mono tracking-widest outline-none focus:border-board-accent uppercase"
                            maxLength={6}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="------"
                        />
                        <button 
                            onClick={handleJoinLobby}
                            disabled={joinCode.length < 6}
                            className="bg-board-accent text-black font-black py-4 rounded-xl disabled:opacity-50 hover:scale-[1.02] transition-transform shadow-[0_10px_20px_rgba(255,107,0,0.3)]"
                        >
                            {t('Join')}
                        </button>
                    </motion.div>
                )}

                {(activeTab === 'create' || isSolo) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                         {!createdLobby || isSolo ? (
                             <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                                <div className="mb-4">
                                    <h2 className="text-2xl font-bold mb-2 text-center">{t('Select Game')}</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Tic Tac Toe */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/tic-tac-toe?mode=solo');
                                             else handleCreateLobby('tic-tac-toe');
                                        }}
                                        className="bg-[#050505] border border-board-accent/30 hover:border-board-accent/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <Gamepad2 className="w-8 h-8 text-board-accent mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Tic Tac Toe')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Classic 3x3 strategy.</p>
                                    </div>
                                    {/* Connect Four */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/connect-four?mode=solo');
                                             else handleCreateLobby('connect-four');
                                        }}
                                        className="bg-[#050505] border border-[#4f46e5]/30 hover:border-[#4f46e5]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <Gamepad2 className="w-8 h-8 text-[#4f46e5] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Connect Four')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Line up 4 discs.</p>
                                    </div>
                                    {/* Chess */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/chess?mode=solo');
                                             else handleCreateLobby('chess');
                                        }}
                                        className="bg-[#050505] border border-[#10b981]/30 hover:border-[#10b981]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <svg className="w-8 h-8 text-[#10b981] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19,22H5V20H19V22M13,2H11V5H13V2M18,10C18,12.19 17.07,14.12 15.59,15.44L14.41,14.26C15.4,13.27 16,11.77 16,10C16,7.79 14.21,6 12,6C9.79,6 8,7.79 8,10C8,11.77 8.6,13.27 9.59,14.26L8.41,15.44C6.93,14.12 6,12.19 6,10A6,6 0 0,1 12,4A6,6 0 0,1 18,10M12,10.5A1.5,1.5 0 0,0 13.5,9A1.5,1.5 0 0,0 12,7.5A1.5,1.5 0 0,0 10.5,9A1.5,1.5 0 0,0 12,10.5M15,19V17H9V19H15Z" />
                                        </svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Chess')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Grandmaster 3D Engine.</p>
                                    </div>
                                    {/* Hokm */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/cards?type=hokm&mode=solo');
                                             else handleCreateLobby('hokm');
                                        }}
                                        className="bg-[#050505] border border-[#f43f5e]/30 hover:border-[#f43f5e]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <svg className="w-8 h-8 text-[#f43f5e] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2l4 7-4 13-4-13 4-7z"/>
                                        </svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Hokm')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Persian Card Classic.</p>
                                    </div>
                                    {/* Poker */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/cards?type=poker&mode=solo');
                                             else handleCreateLobby('poker');
                                        }}
                                        className="bg-[#050505] border border-[#eab308]/30 hover:border-[#eab308]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <svg className="w-8 h-8 text-[#eab308] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="12" cy="12" r="4" />
                                            <path d="M12 2v20 M2 12h20" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Poker')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Texas Hold'em 3D.</p>
                                    </div>
                                    {/* Ludo */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/ludo?mode=solo');
                                             else handleCreateLobby('ludo');
                                        }}
                                        className="bg-[#050505] border border-[#d946ef]/30 hover:border-[#d946ef]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <svg className="w-8 h-8 text-[#d946ef] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><circle cx="15.5" cy="8.5" r="1.5" /><circle cx="15.5" cy="15.5" r="1.5" /><circle cx="8.5" cy="15.5" r="1.5" /></svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Ludo')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Classic Board Game.</p>
                                    </div>
                                    {/* Snakes & Ladders */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/snakes?mode=solo');
                                             else handleCreateLobby('snakes');
                                        }}
                                        className="bg-[#050505] border border-[#0ea5e9]/30 hover:border-[#0ea5e9]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <svg className="w-8 h-8 text-[#0ea5e9] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 10h16 M4 14h16 M10 4v16 M14 4v16" />
                                        </svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">Snakes</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Roll the dice.</p>
                                    </div>
                                    {/* Monopoly */}
                                    <div 
                                        onClick={() => {
                                            if (!user?.isPremium) {
                                                navigate('/premium');
                                            } else {
                                                if (isSolo) navigate('/game/monopoly?mode=solo');
                                                else handleCreateLobby('monopoly');
                                            }
                                        }}
                                        className="bg-[#050505] border border-[#22c55e]/30 hover:border-[#22c55e]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 right-2 flex items-center justify-center p-1 bg-gradient-to-r from-board-accent to-yellow-500 rounded text-black text-[10px] font-black tracking-widest">PREMIUM</div>
                                        <svg className="w-8 h-8 text-[#22c55e] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                                            <line x1="12" y1="4" x2="12" y2="20"></line>
                                            <path d="M7 15s1-1 1-3-1-3-1-3"></path>
                                            <path d="M17 15s-1-1-1-3 1-3 1-3"></path>
                                        </svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Monopoly')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Real Estate Empire.</p>
                                    </div>
                                    {/* Uno */}
                                    <div 
                                        onClick={() => {
                                            if (!user?.isPremium) {
                                                navigate('/premium');
                                            } else {
                                                if (isSolo) navigate('/game/uno?mode=solo');
                                                else handleCreateLobby('uno');
                                            }
                                        }}
                                        className="bg-[#050505] border border-[#ef4444]/30 hover:border-[#ef4444]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 right-2 flex items-center justify-center p-1 bg-gradient-to-r from-board-accent to-yellow-500 rounded text-black text-[10px] font-black tracking-widest">PREMIUM</div>
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] filter">🃏</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">UNO</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Color Card Game.</p>
                                    </div>
                                    {/* Spyfall */}
                                    <div 
                                        onClick={() => {
                                            if (!user?.isPremium) {
                                                navigate('/premium');
                                            } else {
                                                if (isSolo) navigate('/game/spyfall?mode=solo');
                                                else handleCreateLobby('spyfall');
                                            }
                                        }}
                                        className="bg-[#050505] border border-[#3b82f6]/30 hover:border-[#3b82f6]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 right-2 flex items-center justify-center p-1 bg-gradient-to-r from-board-accent to-yellow-500 rounded text-black text-[10px] font-black tracking-widest">PREMIUM</div>
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] filter">🕵️‍♂️</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">Spyfall</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Find the Spy.</p>
                                    </div>
                                    {/* Mafia */}
                                    {!isSolo && (
                                        <div 
                                            onClick={() => {
                                                if (!user?.isPremium) {
                                                    navigate('/premium');
                                                } else {
                                                    handleCreateLobby('mafia');
                                                }
                                            }}
                                            className="bg-[#050505] border border-[#ff3333]/30 hover:border-[#ff3333]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                                        >
                                            <div className="absolute top-2 right-2 flex items-center justify-center p-1 bg-gradient-to-r from-board-accent to-yellow-500 rounded text-black text-[10px] font-black tracking-widest">PREMIUM</div>
                                            <svg className="w-8 h-8 text-[#ff3333] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,51,51,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2a5 5 0 0 0-5 5v2H5v12h14V9h-2V7a5 5 0 0 0-5-5zM9 7a3 3 0 0 1 6 0v2H9z" />
                                            </svg>
                                            <h3 className="font-bold text-lg mb-1 tracking-tight">Mafia</h3>
                                            <p className="text-xs text-white/40 uppercase tracking-widest">Ultimate Deception.</p>
                                        </div>
                                    )}
                                    {/* Rock Paper Scissors */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/rps?mode=solo');
                                             else handleCreateLobby('rps');
                                        }}
                                        className="bg-[#050505] border border-[#f9b17a]/30 hover:border-[#f9b17a]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(249,177,122,0.8)] filter">✊</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Rock Paper Scissors')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">A true classic.</p>
                                    </div>
                                    {/* Memory Game */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/memory?mode=solo');
                                             else handleCreateLobby('memory');
                                        }}
                                        className="bg-[#050505] border border-[#e94560]/30 hover:border-[#e94560]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <svg className="w-8 h-8 text-[#e94560] mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(233,69,96,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7" rx="1" ry="1"></rect>
                                            <rect x="14" y="3" width="7" height="7" rx="1" ry="1"></rect>
                                            <rect x="14" y="14" width="7" height="7" rx="1" ry="1"></rect>
                                            <rect x="3" y="14" width="7" height="7" rx="1" ry="1"></rect>
                                        </svg>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Memory Game')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Test your brain.</p>
                                    </div>
                                    {/* Whack A Mole */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/mole?mode=solo');
                                             else handleCreateLobby('mole');
                                        }}
                                        className="bg-[#050505] border border-[#65a30d]/30 hover:border-[#65a30d]/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(101,163,13,0.8)] filter">🐹</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">{t('Whack-a-Mole')}</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Fast reflexes.</p>
                                    </div>
                                    {/* Hangman */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/hangman?mode=solo');
                                             else handleCreateLobby('hangman');
                                        }}
                                        className="bg-[#050505] border border-cyan-500/30 hover:border-cyan-500/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] filter">🔤</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">Hangman</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Guess the word.</p>
                                    </div>
                                    {/* Simon Says */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/simon?mode=solo');
                                             else handleCreateLobby('simon');
                                        }}
                                        className="bg-[#050505] border border-green-500/30 hover:border-green-500/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] filter">🪀</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">Simon Says</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Memory sequence.</p>
                                    </div>
                                    {/* Reaction Game */}
                                    <div 
                                        onClick={() => {
                                             if (isSolo) navigate('/game/reaction?mode=solo');
                                             else handleCreateLobby('reaction');
                                        }}
                                        className="bg-[#050505] border border-yellow-500/30 hover:border-yellow-500/60 transition-colors rounded-xl p-6 cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    >
                                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] filter">⚡</div>
                                        <h3 className="font-bold text-lg mb-1 tracking-tight">Reaction Time</h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">Test your speed.</p>
                                    </div>
                                </div>
                            </div>
                         ) : (
                             <div className="flex flex-col items-center text-center gap-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-board-accent mb-2">Lobby Created</h2>
                                    <p className="text-gray-400">Share this code with your friends.</p>
                                </div>
                                <div className="bg-black/50 border border-white/10 rounded-2xl p-8 min-w-[300px]">
                                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Lobby Code</div>
                                    <div className="text-5xl font-mono tracking-widest font-bold">{createdLobby.code}</div>
                                </div>
                                <div className="flex items-center gap-3 text-board-accent animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-board-accent" />
                                    <span>Waiting for opponent...</span>
                                </div>
                             </div>
                         )}
                    </motion.div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
