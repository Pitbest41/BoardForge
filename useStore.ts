import { create } from 'zustand';

interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  isGuest: boolean;
  isPremium: boolean;
}

interface GameState {
  language: 'en' | 'fa';
  setLanguage: (lang: 'en' | 'fa') => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  lobbyCode: string | null;
  setLobbyCode: (code: string | null) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

export const useStore = create<GameState>((set) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  user: { name: 'Guest_' + Math.floor(Math.random() * 1000), color: '#ff6b00', isGuest: true, isPremium: false },
  setUser: (user) => set({ user }),
  updateUserProfile: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  lobbyCode: null,
  setLobbyCode: (lobbyCode) => set({ lobbyCode }),
  audioEnabled: true,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
}));
