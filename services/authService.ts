
import { User, HistoryEntry } from '../types';

const STORAGE_KEY = 'atsbeaters_user';

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const login = (email: string, name: string): User => {
  const existing = getCurrentUser();
  if (existing && existing.email === email) return existing;
  
  // Added joinedAt to satisfy User interface requirements
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    tier: 'free',
    credits: 1,
    history: [],
    joinedAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveToHistory = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
  const user = getCurrentUser();
  if (!user) return;
  
  const fullEntry: HistoryEntry = {
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now()
  };
  
  user.history.unshift(fullEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return fullEntry;
};

export const upgradeTier = (tier: 'pro' | 'package') => {
  const user = getCurrentUser();
  if (!user) return;
  user.tier = tier;
  user.credits = tier === 'pro' ? 999 : 9999;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
};
