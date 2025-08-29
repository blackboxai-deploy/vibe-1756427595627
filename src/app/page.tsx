'use client';

import { Game3D } from '@/components/game/Game3D';
import { MainMenu } from '@/components/ui/game/MainMenu';
import { PauseMenu } from '@/components/ui/game/PauseMenu';
import { GameProvider } from '@/components/game/GameProvider';

export default function Home() {
  return (
    <GameProvider>
      <div className="w-full h-screen overflow-hidden bg-black">
        <Game3D />
        <MainMenu />
        <PauseMenu />
      </div>
    </GameProvider>
  );
}