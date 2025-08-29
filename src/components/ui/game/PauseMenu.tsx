'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameContext } from '@/components/game/GameProvider';

export function PauseMenu() {
  const { gameState, setGameState } = useGameContext();

  if (gameState !== 'paused') return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="p-6 bg-slate-900/95 border-cyan-500/30 max-w-sm w-full mx-4">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
            PAUSED
          </h2>

          <div className="space-y-3">
            <Button 
              onClick={() => setGameState('playing')}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold"
              size="lg"
            >
              RESUME
            </Button>
            
            <Button 
              onClick={() => setGameState('menu')}
              variant="outline" 
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              size="lg"
            >
              MAIN MENU
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              Press ESC to resume
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}