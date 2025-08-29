'use client';

import { useGameContext } from '@/components/game/GameProvider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export function GameHUD() {
  const { 
    gameState, 
    setGameState, 
    score, 
    health, 
    lives, 
    level, 
    enemiesKilled,
    powerUps 
  } = useGameContext();

  if (gameState !== 'playing') return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Left Side - Player Stats */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30">
          <div className="space-y-2">
            {/* Health Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-cyan-400 text-sm font-semibold">HULL</span>
                <span className="text-white text-sm">{health}%</span>
              </div>
              <Progress 
                value={health} 
                className="w-32 h-2 bg-slate-800"
                style={{
                  background: 'rgb(30, 41, 59)'
                }}
              />
            </div>

            {/* Lives */}
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 text-sm font-semibold">LIVES</span>
              <div className="flex space-x-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < lives ? 'bg-purple-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center - Score and Level */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
            <div className="text-xs text-cyan-400">SCORE</div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-lg font-semibold text-purple-400">LVL {level}</div>
            <div className="text-xs text-slate-400">{enemiesKilled} KILLS</div>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/30">
          <div className="space-y-2">
            <Button
              onClick={() => setGameState('paused')}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              PAUSE
            </Button>
            <div className="text-xs text-slate-400 text-center">ESC</div>
          </div>
        </div>
      </div>

      {/* Bottom HUD - Power-ups and Weapon Info */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Left Side - Power-ups */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
          <div className="text-xs text-cyan-400 font-semibold mb-2">POWER-UPS</div>
          <div className="flex space-x-2">
            {powerUps.length === 0 ? (
              <div className="text-xs text-slate-500">None Active</div>
            ) : (
              powerUps.map((powerUp, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded"
                >
                  {powerUp}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center - Crosshair Area */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-8 h-8 border-2 border-cyan-400/50 rounded-full relative">
            <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Right Side - Weapon Status */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
          <div className="text-xs text-cyan-400 font-semibold mb-2">WEAPONS</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white">LASER</span>
              <div className="w-16 h-1 bg-slate-700 rounded overflow-hidden">
                <div className="w-full h-full bg-green-500"></div>
              </div>
            </div>
            <div className="text-xs text-slate-400">READY</div>
          </div>
        </div>
      </div>

      {/* Mini-map (Top Right Corner) */}
      <div className="absolute top-20 right-4 w-32 h-32 bg-black/70 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-2">
        <div className="text-xs text-cyan-400 font-semibold mb-1">RADAR</div>
        <div className="relative w-full h-24 bg-slate-900 rounded border border-slate-700">
          {/* Player dot (center) */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Radar sweep animation */}
          <div className="absolute inset-0 rounded overflow-hidden">
            <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent transform -translate-y-1/2 origin-left rotate-0 animate-spin opacity-30"></div>
          </div>
          
          {/* Example enemy dots */}
          <div className="absolute top-2 left-8 w-1 h-1 bg-red-500 rounded-full"></div>
          <div className="absolute bottom-3 right-6 w-1 h-1 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}