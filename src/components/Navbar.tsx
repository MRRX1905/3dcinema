import React from 'react';
import { Wifi, WifiOff, HardDrive, Clapperboard } from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'recommendations' | 'offline';
  onSelectTab: (tab: 'catalog' | 'recommendations' | 'offline') => void;
  isOfflineSimulated: boolean;
  onToggleOfflineSimulation: () => void;
  offlineCount: number;
  usedStorageMb: number;
  onEnterQuickCinema: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isOfflineSimulated,
  onToggleOfflineSimulation,
  offlineCount,
  usedStorageMb,
  onEnterQuickCinema,
}) => {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0b0d13]/95 backdrop-blur-md px-6 flex items-center justify-between gap-8 z-30 sticky top-0">
      {/* Zone 1: Single text element Brand Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('catalog');
        }}
        className="font-cinzel text-xl font-bold tracking-widest text-white whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors"
      >
        LUMIÈRE 3D
      </a>

      {/* Zone 2: 4-5 single-line clean navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => onSelectTab('catalog')}
          className={`transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'catalog'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Catalog
        </button>

        <button
          onClick={() => onSelectTab('recommendations')}
          className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'recommendations'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Spatial 3D Picks</span>
        </button>

        <button
          onClick={onEnterQuickCinema}
          className="text-slate-400 hover:text-amber-300 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <Clapperboard className="w-3.5 h-3.5" />
          <span>3D Cinema</span>
        </button>

        <button
          onClick={() => onSelectTab('offline')}
          className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'offline'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Offline Vault</span>
          {offlineCount > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
              {offlineCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action area with Offline Simulation Toggle & Storage indicator */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Offline Mode Simulator Toggle */}
        <button
          onClick={onToggleOfflineSimulation}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isOfflineSimulated
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
              : 'bg-[#151a27] text-slate-300 border-white/10 hover:text-white hover:bg-[#1e2538]'
          }`}
          title={
            isOfflineSimulated
              ? 'Offline mode active: Playing strictly from IndexedDB cache'
              : 'Click to simulate Airplane Mode / disconnected network'
          }
        >
          {isOfflineSimulated ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Airplane Mode</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Online</span>
            </>
          )}
        </button>

        {/* Primary CTA: Launch 3D Cinema */}
        <button
          onClick={onEnterQuickCinema}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          Enter Cinema
        </button>
      </div>
    </header>
  );
};
