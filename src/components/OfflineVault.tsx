import React from 'react';
import { Film, DownloadedFilm } from '../types';
import {
  HardDrive,
  Trash2,
  Play,
  Clapperboard,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface OfflineVaultProps {
  offlineFilms: DownloadedFilm[];
  films: Film[];
  storageUsage: { usedBytes: number; quotaBytes: number };
  isOfflineSimulated: boolean;
  onToggleOfflineSimulation: () => void;
  onPlayFilmIn3D: (film: Film) => void;
  onPlayFilmStandard: (film: Film) => void;
  onDeleteOfflineFilm: (filmId: string) => void;
  onClearAllOffline: () => void;
  onBrowseCatalog: () => void;
}

export const OfflineVault: React.FC<OfflineVaultProps> = ({
  offlineFilms,
  films,
  storageUsage,
  isOfflineSimulated,
  onToggleOfflineSimulation,
  onPlayFilmIn3D,
  onPlayFilmStandard,
  onDeleteOfflineFilm,
  onClearAllOffline,
  onBrowseCatalog,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const usedFormatted = formatBytes(storageUsage.usedBytes);
  const quotaFormatted = formatBytes(storageUsage.quotaBytes);
  const usagePercentage = Math.min(
    100,
    Math.max(1, (storageUsage.usedBytes / (storageUsage.quotaBytes || 1)) * 100)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Title & Offline Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <HardDrive className="w-4 h-4" />
            <span>Client Storage Engine</span>
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white tracking-wide mt-1">
            Offline Viewing Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Films saved to browser IndexedDB can be screened at full resolution in the 3D Grand Cinema without network connectivity.
          </p>
        </div>

        {/* Offline Mode Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleOfflineSimulation}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isOfflineSimulated
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#151a27] text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>Simulated Airplane Mode (Active)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Network Mode: Online</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Storage Meter Card */}
      <div className="p-6 bg-[#121622] border border-white/10 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Browser Storage Quota</h2>
            <p className="text-xs text-slate-400">
              Allocated via HTML5 IndexedDB Storage API for high-definition video chunks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-slate-300">
              <strong className="text-amber-400 font-semibold">{usedFormatted}</strong> of{' '}
              {quotaFormatted} used ({usagePercentage.toFixed(1)}%)
            </span>
            {offlineFilms.length > 0 && (
              <button
                onClick={onClearAllOffline}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Vault</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Storage Meter Bar */}
        <div className="w-full h-3 bg-[#0a0d15] rounded-full overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, usagePercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{offlineFilms.length} cached film titles</span>
          <span>Zero network latency during 3D playback</span>
        </div>
      </div>

      {/* Offline Films Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-xl font-bold text-white">
            Available Offline Films
          </h2>
          {offlineFilms.length === 0 && (
            <button
              onClick={onBrowseCatalog}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Catalog to Download</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {offlineFilms.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-white/10 bg-[#0f131f] space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Your Offline Vault is Empty</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Download films while connected to stream them anytime — on flights, trains, or in
                remote areas — with our full 3D Grand Cinema theater experience.
              </p>
            </div>
            <button
              onClick={onBrowseCatalog}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offlineFilms.map((item) => {
              const film = films.find((f) => f.id === item.filmId);
              if (!film) return null;

              return (
                <div
                  key={item.filmId}
                  className="bg-[#121622] border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-colors shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono text-emerald-400">Offline Ready</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.quality}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{formatBytes(item.blobSize)}</span>
                        </div>
                        <h3 className="font-cinzel text-lg font-bold text-white">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {film.genre} · {film.runtime} · Dir. {film.director}
                        </p>
                      </div>

                      <button
                        onClick={() => onDeleteOfflineFilm(item.filmId)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove from Offline Storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {film.synopsis}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => onPlayFilmIn3D(film)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20"
                    >
                      <Clapperboard className="w-3.5 h-3.5 fill-current" />
                      <span>3D Cinema</span>
                    </button>

                    <button
                      onClick={() => onPlayFilmStandard(film)}
                      className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1a2030] hover:bg-[#252e46] border border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>2D</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
