import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Play, Banknote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BOARD_SPACES = [
    { id: 0, name: 'GO', type: 'go', color: 'bg-white', price: 0 },
    { id: 1, name: 'Taj Mahal', type: 'property', color: 'bg-red-500', price: 60 },
    { id: 2, name: 'Community Chest', type: 'chest', color: 'bg-blue-200', price: 0 },
    { id: 3, name: 'Colosseum', type: 'property', color: 'bg-red-500', price: 60 },
    { id: 4, name: 'Income Tax', type: 'tax', color: 'bg-gray-300', price: 200 },
    { id: 5, name: 'Reading Railroad', type: 'railroad', color: 'bg-gray-800', price: 200 },
    { id: 6, name: 'Petra', type: 'property', color: 'bg-blue-400', price: 100 },
    { id: 7, name: 'Chance', type: 'chance', color: 'bg-orange-200', price: 0 },
    { id: 8, name: 'Machu Picchu', type: 'property', color: 'bg-blue-400', price: 100 },
    { id: 9, name: 'Chichen Itza', type: 'property', color: 'bg-blue-400', price: 120 },
    { id: 10, name: 'JAIL', type: 'jail', color: 'bg-orange-500', price: 0 },
    { id: 11, name: 'Great Wall', type: 'property', color: 'bg-pink-500', price: 140 },
    { id: 12, name: 'Electric Co', type: 'utility', color: 'bg-yellow-200', price: 150 },
    { id: 13, name: 'Christ Redeemer', type: 'property', color: 'bg-pink-500', price: 140 },
    { id: 14, name: 'Eiffel Tower', type: 'property', color: 'bg-pink-500', price: 160 },
    { id: 15, name: 'B. & O. Railroad', type: 'railroad', color: 'bg-gray-800', price: 200 },
    { id: 16, name: 'Statue of Liberty', type: 'property', color: 'bg-orange-400', price: 180 },
    { id: 17, name: 'Community Chest', type: 'chest', color: 'bg-blue-200', price: 0 },
    { id: 18, name: 'Sydney Opera', type: 'property', color: 'bg-orange-400', price: 180 },
    { id: 19, name: 'Burj Khalifa', type: 'property', color: 'bg-orange-400', price: 200 },
];

export default function MonopolyGame() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    const [players, setPlayers] = useState([
        { id: 1, name: 'You', money: 1500, position: 0, color: '#ef4444' },
        { id: 2, name: 'Bot', money: 1500, position: 0, color: '#3b82f6' }
    ]);
    const [properties, setProperties] = useState<Record<number, number | null>>({});
    const [turn, setTurn] = useState<number>(1);
    const [dice, setDice] = useState([1, 1]);
    const [isRolling, setIsRolling] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    const rollDice = () => {
        if (isRolling || turn !== 1) return;
        setIsRolling(true);
        setActionMessage('');
        
        let rollCount = 0;
        const interval = setInterval(() => {
            setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
            rollCount++;
            if (rollCount > 10) {
                clearInterval(interval);
                const finalDice = [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
                setDice(finalDice);
                movePlayer(1, finalDice[0] + finalDice[1]);
            }
        }, 50);
    };

    const movePlayer = (playerId: number, steps: number) => {
        setPlayers(prev => {
            const numSpaces = BOARD_SPACES.length;
            const newPlayers = [...prev];
            const pIdx = newPlayers.findIndex(p => p.id === playerId);
            let nextPos = newPlayers[pIdx].position + steps;
            
            if (nextPos >= numSpaces) {
                nextPos = nextPos % numSpaces;
                newPlayers[pIdx].money += 200; // Passed GO
                if (playerId === 1) setActionMessage('You passed GO! Collected $200');
            }
            newPlayers[pIdx].position = nextPos;
            
            setTimeout(() => handleSpaceAction(playerId, nextPos), 500);
            return newPlayers;
        });
    };

    const handleSpaceAction = (playerId: number, pos: number) => {
        const space = BOARD_SPACES[pos];
        const owner = properties[pos];
        
        if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
            if (owner === undefined || owner === null) {
                // Buy property
                if (playerId === 1) {
                    if (confirm(`Buy ${space.name} for $${space.price}?`)) {
                        buyProperty(playerId, pos, space.price);
                    } else {
                        endTurn(playerId);
                    }
                } else {
                    // Bot logic
                    if (Math.random() > 0.5) {
                        buyProperty(playerId, pos, space.price);
                    } else {
                        endTurn(playerId);
                    }
                }
            } else if (owner !== playerId) {
                // Pay rent
                const rent = Math.floor(space.price * 0.2);
                payRent(playerId, owner, rent);
            } else {
                endTurn(playerId);
            }
        } else if (space.type === 'tax') {
             setPlayers(prev => {
                 const np = [...prev];
                 const pIdx = np.findIndex(p => p.id === playerId);
                 np[pIdx].money -= space.price;
                 return np;
             });
             setActionMessage(playerId === 1 ? `Paid $${space.price} Tax` : `Bot paid tax`);
             endTurn(playerId);
        } else {
            endTurn(playerId);
        }
    };

    const buyProperty = (playerId: number, pos: number, price: number) => {
        setPlayers(prev => {
            const np = [...prev];
            const pIdx = np.findIndex(p => p.id === playerId);
            np[pIdx].money -= price;
            return np;
        });
        setProperties(prev => ({ ...prev, [pos]: playerId }));
        setActionMessage(playerId === 1 ? `You bought ${BOARD_SPACES[pos].name}` : `Bot bought ${BOARD_SPACES[pos].name}`);
        endTurn(playerId);
    };

    const payRent = (fromId: number, toId: number, amount: number) => {
        setPlayers(prev => {
            const np = [...prev];
            const fromIdx = np.findIndex(p => p.id === fromId);
            const toIdx = np.findIndex(p => p.id === toId);
            np[fromIdx].money -= amount;
            np[toIdx].money += amount;
            return np;
        });
        setActionMessage(fromId === 1 ? `You paid $${amount} rent to Bot` : `Bot paid you $${amount} rent`);
        endTurn(fromId);
    };

    const endTurn = (currentPlayerId: number) => {
        setIsRolling(false);
        if (currentPlayerId === 1) {
            setTurn(2);
            setTimeout(botTurn, 1500);
        } else {
            setTurn(1);
        }
    };

    const botTurn = () => {
        setIsRolling(true);
        let rollCount = 0;
        const interval = setInterval(() => {
            setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
            rollCount++;
            if (rollCount > 10) {
                clearInterval(interval);
                const finalDice = [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
                setDice(finalDice);
                movePlayer(2, finalDice[0] + finalDice[1]);
            }
        }, 50);
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row bg-[#112211] text-white overflow-hidden font-sans">
            
            {/* Control Panel */}
            <div className="w-full md:w-80 p-6 flex flex-col border-r border-white/10 bg-black/20">
                <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit mb-8">
                    <Home className="w-5 h-5" /> Exit
                </button>

                <h1 className="text-3xl font-black mb-6 flex items-center gap-2 text-green-500">
                    <Banknote className="w-8 h-8" />
                    MONOPOLY
                </h1>

                <div className="space-y-4 mb-8">
                    {players.map(p => (
                        <div key={p.id} className={`p-4 rounded-xl border-2 ${turn === p.id ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-black/40'} transition-all`}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 font-bold">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                                    {p.name}
                                </div>
                                <div className="font-mono text-xl text-green-400">${p.money}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black/40 rounded-xl p-4 min-h-[100px] border border-white/10 mb-8 flex items-center justify-center text-center">
                    {actionMessage || (turn === 1 ? "Your Turn! Roll the dice." : "Bot is thinking...")}
                </div>

                <div className="flex gap-4 justify-center mb-8">
                    <div className="w-16 h-16 bg-white text-black text-3xl font-black flex items-center justify-center rounded-xl shadow-lg border-b-4 border-gray-300">
                        {dice[0]}
                    </div>
                    <div className="w-16 h-16 bg-white text-black text-3xl font-black flex items-center justify-center rounded-xl shadow-lg border-b-4 border-gray-300">
                        {dice[1]}
                    </div>
                </div>

                <button 
                    onClick={rollDice}
                    disabled={turn !== 1 || isRolling}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-[0_4px_0_#166534] disabled:shadow-none active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-lg"
                >
                    <Play className="w-5 h-5 fill-current" />
                    ROLL DICE
                </button>
            </div>

            {/* Board Area */}
            <div className="flex-1 p-4 md:p-8 flex items-center justify-center relative overflow-x-auto">
                <div className="grid grid-cols-6 grid-rows-6 gap-2 w-full max-w-3xl aspect-square min-w-[600px] bg-[#c3e6cb] p-4 rounded-xl border-4 border-[#1e5631] shadow-2xl relative">
                    {BOARD_SPACES.map((space, i) => {
                        let col = 1, row = 1;
                        if (i < 5) { row = 6; col = 6 - i; }
                        else if (i < 10) { col = 1; row = 6 - (i - 5); }
                        else if (i < 15) { row = 1; col = i - 9; }
                        else { col = 6; row = i - 13; }

                        return (
                            <div 
                                key={space.id} 
                                className={`relative border-2 border-black/20 bg-[#e3f2fd] flex flex-col items-center justify-center text-center p-1 font-bold text-black ${col===1||col===6 ? (row===1||row===6 ? 'row-span-1 col-span-1' : 'h-full') : 'w-full'}`}
                                style={{ gridColumn: col, gridRow: row }}
                            >
                                {space.type === 'property' && <div className={`absolute top-0 left-0 right-0 h-4 border-b-2 border-black/20 ${space.color}`} />}
                                
                                <span className={`text-[10px] leading-tight mt-2 ${space.type==='property' ? 'pt-2' : ''}`}>{space.name}</span>
                                {space.price > 0 && <span className="text-[10px] text-gray-600 mt-1">${space.price}</span>}
                                {properties[i] !== undefined && properties[i] !== null && (
                                    <div className="absolute w-full h-full border-4 pointer-events-none" style={{ borderColor: players.find(p=>p.id===properties[i])?.color }} />
                                )}

                                {/* Player Tokens */}
                                <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                                    {players.filter(p => p.position === i).map(p => (
                                        <motion.div 
                                            key={p.id}
                                            layoutId={`player-${p.id}`}
                                            className="w-4 h-4 rounded-full border-2 border-white shadow-md z-10"
                                            style={{ backgroundColor: p.color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    <div className="col-start-2 col-end-6 row-start-2 row-end-6 flex flex-col items-center justify-center opacity-20 transform-rotate-45 pointer-events-none">
                        <Banknote className="w-48 h-48 text-[#1e5631]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
