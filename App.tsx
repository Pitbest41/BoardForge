import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import TicTacToe from './pages/TicTacToe';
import ConnectFour from './pages/ConnectFour';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ChessGame from './pages/Chess';
import CardsGame from './pages/CardsGame';
import PremiumPurchase from './pages/PremiumPurchase';
import MafiaGame from './pages/MafiaGame';
import HokmGame from './pages/HokmGame';
import Ludo from './pages/Ludo';
import Snakes from './pages/Snakes';
import RockPaperScissors from './pages/RockPaperScissors';
import MemoryGame from './pages/MemoryGame';
import WhackAMole from './pages/WhackAMole';
import MonopolyGame from './pages/Monopoly';
import UnoGame from './pages/Uno';
import Spyfall from './pages/Spyfall';

import SimonSays from './pages/SimonSays';
import Hangman from './pages/Hangman';
import ReactionGame from './pages/ReactionGame';

export default function App() {
  const location = useLocation();
  const { language } = useStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
    document.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language, i18n]);

  return (
    <div className="min-h-screen bg-board-dark text-[#e0e0e0] flex flex-col font-sans">
      <Navigation />
      <main className="flex-grow flex flex-col relative z-10 pt-[72px]">
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/game/connect-four" element={<ConnectFour />} />
            <Route path="/game/chess" element={<ChessGame />} />
            <Route path="/game/cards" element={<CardsGame />} />
            <Route path="/game/hokm" element={<HokmGame />} />
            <Route path="/game/ludo" element={<Ludo />} />
            <Route path="/game/snakes" element={<Snakes />} />
            <Route path="/game/rps" element={<RockPaperScissors />} />
            <Route path="/game/memory" element={<MemoryGame />} />
            <Route path="/game/mole" element={<WhackAMole />} />
            <Route path="/game/monopoly" element={<MonopolyGame />} />
            <Route path="/game/uno" element={<UnoGame />} />
            <Route path="/game/spyfall" element={<Spyfall />} />
            <Route path="/game/hangman" element={<Hangman />} />
            <Route path="/game/simon" element={<SimonSays />} />
            <Route path="/game/reaction" element={<ReactionGame />} />
            <Route path="/premium" element={<PremiumPurchase />} />
            <Route path="/game/mafia" element={<MafiaGame />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
