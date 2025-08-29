'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (score: number) => void;
  health: number;
  setHealth: (health: number) => void;
  lives: number;
  setLives: (lives: number) => void;
  level: number;
  setLevel: (level: number) => void;
  enemiesKilled: number;
  setEnemiesKilled: (count: number) => void;
  powerUps: string[];
  setPowerUps: (powerUps: string[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [powerUps, setPowerUps] = useState<string[]>([]);

  const value: GameContextType = {
    gameState,
    setGameState,
    score,
    setScore,
    health,
    setHealth,
    lives,
    setLives,
    level,
    setLevel,
    enemiesKilled,
    setEnemiesKilled,
    powerUps,
    setPowerUps,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}