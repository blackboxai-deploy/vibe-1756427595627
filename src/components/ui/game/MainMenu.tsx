'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameContext } from '@/components/game/GameProvider';

export function MainMenu() {
  const { gameState, setGameState } = useGameContext();

  if (gameState !== 'menu') return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="p-8 bg-slate-900/90 border-cyan-500/30 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Game Title */}
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
              SPACE
            </h1>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text">
              DEFENDER
            </h2>
            <p className="text-slate-400 text-sm">
              3D Space Combat Experience
            </p>
          </div>

          {/* Game Description */}
          <div className="space-y-2 text-slate-300 text-sm">
            <p>Pilot your ship through the depths of space</p>
            <p>Defend against alien invaders</p>
            <p>Survive as long as you can</p>
          </div>

          {/* Controls Info */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <h3 className="text-cyan-400 font-semibold text-sm">CONTROLS</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div>WASD / Arrows: Move</div>
              <div>Mouse: Aim</div>
              <div>Space / Click: Shoot</div>
              <div>ESC: Pause</div>
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setGameState('playing')}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              START MISSION
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300"
              size="lg"
            >
              HIGH SCORES
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-300"
              size="sm"
            >
              SETTINGS
            </Button>
          </div>

          {/* Version Info */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Space Defender v1.0 | Built with Three.js
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}