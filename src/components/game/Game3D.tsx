'use client';

import { useEffect, useRef } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { Player } from './Player';
import { EnemySpawner } from './enemies/EnemySpawner';
import { useGameContext } from './GameProvider';
import { GameHUD } from '../ui/game/GameHUD';

export function Game3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const playerRef = useRef<Player | null>(null);
  const enemySpawnerRef = useRef<EnemySpawner | null>(null);
  
  const { gameState, setGameState } = useGameContext();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Create player
    const player = new Player(engine);
    playerRef.current = player;

    // Create enemy spawner
    const enemySpawner = new EnemySpawner(engine);
    enemySpawnerRef.current = enemySpawner;

    // Add keyboard controls for pause
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        setGameState(gameState === 'playing' ? 'paused' : 'playing');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Add update loop for enemy spawner
    const updateLoop = () => {
      if (enemySpawnerRef.current && gameState === 'playing') {
        enemySpawnerRef.current.update(1/60); // Assuming 60fps
      }
      requestAnimationFrame(updateLoop);
    };
    updateLoop();

    // Start the game loop
    engine.start();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      engine.dispose();
      player.dispose();
      enemySpawner.dispose();
    };
  }, [gameState, setGameState]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    switch (gameState) {
      case 'playing':
        engine.resume();
        break;
      case 'paused':
        engine.pause();
        break;
      case 'gameOver':
        engine.stop();
        break;
    }
  }, [gameState]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' }}
      />
      <GameHUD />
    </div>
  );
}