import React, { useState, useEffect, useCallback } from 'react';
import { Film, DownloadedFilm, TasteProfile } from './types';
import { INITIAL_FILMS } from './data/films';
import {
  getAllOfflineFilms,
  downloadFilmToIndexedDB,
  removeOfflineFilm,
  clearAllOfflineFilms,
  getStorageUsage,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { CatalogView } from './components/CatalogView';
import { ThreeRecommendations } from './components/ThreeRecommendations';
import { ThreeCinema } from './components/ThreeCinema';
import { OfflineVault } from './components/OfflineVault';
import { FilmModal } from './components/FilmModal';
import { StandardPlayerModal } from './components/StandardPlayerModal';
import { Download, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'recommendations' | 'offline'>('catalog');
  const [films, setFilms] = useState<Film[]>(INITIAL_FILMS);
  const [offlineFilms, setOfflineFilms] = useState<DownloadedFilm[]>([]);
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 0, quotaBytes: 15 * 1024 * 1024 * 1024 });
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);

  // Active screening & modals
  const [activeCinemaFilm, setActiveCinemaFilm] = useState<Film | null>(null);
  const [activeStandardPlayerFilm, setActiveStandardPlayerFilm] = useState<Film | null>(null);
  const [selectedFilmForModal, setSelectedFilmForModal] = useState<Film | null>(null);

  // Active download toast state
  const [downloadState, setDownloadState] = useState<{
    filmId: string;
    title: string;
    progress: number;
    speedMb: number;
    quality: string;
  } | null>(null);

  // Personalized Recommendation Taste Profile
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>({
    genres: { 'Sci-Fi': 0.9, Noir: 0.8, Drama: 0.85, Thriller: 0.75, Animation: 0.6, Documentary: 0.8 },
    dimensions: {
      visualSplendor: 90,
      emotionalDepth: 80,
      narrativePace: 75,
      cerebralPlot: 88,
    },
  });

  // Load offline data on initial mount
  const refreshStorage = useCallback(async () => {
    const offlineList = await getAllOfflineFilms();
    setOfflineFilms(offlineList);
    const usage = await getStorageUsage();
    setStorageUsage(usage);
  }, []);

  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  // Handle Download trigger
  const handleDownloadFilm = async (film: Film, quality: '720p' | '1080p' | '4K Cinema' = '1080p') => {
    // Check if already downloaded
    if (offlineFilms.some((item) => item.filmId === film.id && item.status === 'completed')) {
      return;
    }

    setDownloadState({
      filmId: film.id,
      title: film.title,
      progress: 0,
      speedMb: 18.5,
      quality,
    });

    try {
      const record = await downloadFilmToIndexedDB(film, quality, (progress, speedMb) => {
        setDownloadState((prev) => (prev ? { ...prev, progress, speedMb } : null));
      });

      await refreshStorage();
      setTimeout(() => {
        setDownloadState(null);
      }, 1500);
    } catch {
      setDownloadState(null);
    }
  };

  const handleDeleteOfflineFilm = async (filmId: string) => {
    await removeOfflineFilm(filmId);
    await refreshStorage();
  };

  const handleClearAllOffline = async () => {
    await clearAllOfflineFilms();
    await refreshStorage();
  };

  // Determine video playback source URL
  const resolveVideoSource = (film: Film) => {
    const offline = offlineFilms.find((item) => item.filmId === film.id && item.status === 'completed');
    if (offline && (offline.blobUrl || offline.blob)) {
      return offline.blobUrl || (offline.blob ? URL.createObjectURL(offline.blob) : film.videoUrl);
    }
    return film.videoUrl;
  };

  // Check if a film is available offline
  const isFilmAvailableOffline = (film: Film) => {
    return offlineFilms.some((item) => item.filmId === film.id && item.status === 'completed');
  };

  // Play in 3D Theater
  const handleEnter3DTheater = (film: Film) => {
    if (isOfflineSimulated && !isFilmAvailableOffline(film)) {
      // In simulated airplane mode, if not cached, prompt user to download or disable airplane mode
      setSelectedFilmForModal(film);
      return;
    }
    setSelectedFilmForModal(null);
    setActiveStandardPlayerFilm(null);
    setActiveCinemaFilm(film);
  };

  // Play in Standard 2D
  const handleEnterStandardPlayer = (film: Film) => {
    if (isOfflineSimulated && !isFilmAvailableOffline(film)) {
      setSelectedFilmForModal(film);
      return;
    }
    setSelectedFilmForModal(null);
    setActiveCinemaFilm(null);
    setActiveStandardPlayerFilm(film);
  };

  // If in 3D Grand Cinema, render full-bleed theater
  if (activeCinemaFilm) {
    return (
      <ThreeCinema
        film={activeCinemaFilm}
        videoSrc={resolveVideoSource(activeCinemaFilm)}
        isOffline={isOfflineSimulated || isFilmAvailableOffline(activeCinemaFilm)}
        onExit={() => setActiveCinemaFilm(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d13] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOfflineSimulated={isOfflineSimulated}
        onToggleOfflineSimulation={() => setIsOfflineSimulated(!isOfflineSimulated)}
        offlineCount={offlineFilms.length}
        usedStorageMb={Math.round(storageUsage.usedBytes / (1024 * 1024))}
        onEnterQuickCinema={() => handleEnter3DTheater(films[0])}
      />

      {/* Simulated Airplane Mode Banner */}
      {isOfflineSimulated && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Simulated Airplane Mode Active:</span>
            <span>
              Network isolated. You can screen {offlineFilms.length} cached films from your IndexedDB vault in full 3D.
            </span>
          </div>
          <button
            onClick={() => setIsOfflineSimulated(false)}
            className="text-amber-300 underline hover:text-white cursor-pointer"
          >
            Reconnect Network
          </button>
        </div>
      )}

      {/* Main Tab Views */}
      <main className="flex-1">
        {currentTab === 'catalog' && (
          <CatalogView
            films={films}
            offlineFilms={offlineFilms}
            onSelectFilm={setSelectedFilmForModal}
            onEnter3DTheater={handleEnter3DTheater}
            onDownloadFilm={(film) => handleDownloadFilm(film, '1080p')}
            onGoToRecommendations={() => setCurrentTab('recommendations')}
            isOffline={isOfflineSimulated}
          />
        )}

        {currentTab === 'recommendations' && (
          <ThreeRecommendations
            films={films}
            tasteProfile={tasteProfile}
            onTasteProfileChange={setTasteProfile}
            onSelectFilm={setSelectedFilmForModal}
            onEnter3DTheater={handleEnter3DTheater}
            onDownloadFilm={(film) => handleDownloadFilm(film, '1080p')}
          />
        )}

        {currentTab === 'offline' && (
          <OfflineVault
            offlineFilms={offlineFilms}
            films={films}
            storageUsage={storageUsage}
            isOfflineSimulated={isOfflineSimulated}
            onToggleOfflineSimulation={() => setIsOfflineSimulated(!isOfflineSimulated)}
            onPlayFilmIn3D={handleEnter3DTheater}
            onPlayFilmStandard={handleEnterStandardPlayer}
            onDeleteOfflineFilm={handleDeleteOfflineFilm}
            onClearAllOffline={handleClearAllOffline}
            onBrowseCatalog={() => setCurrentTab('catalog')}
          />
        )}
      </main>

      {/* Active Download Progress Toast */}
      {downloadState && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#121622] border border-amber-500/30 rounded-xl p-4 shadow-2xl space-y-2.5 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-white truncate max-w-[200px]">
              {downloadState.progress === 100 ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Download className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="truncate">{downloadState.title}</span>
            </div>
            <span className="font-mono tabular-nums text-amber-400 font-semibold">
              {downloadState.progress}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-150"
              style={{ width: `${downloadState.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Caching to IndexedDB ({downloadState.quality})</span>
            <span className="font-mono tabular-nums">{downloadState.speedMb} MB/s</span>
          </div>
        </div>
      )}

      {/* Detailed Film Modal */}
      {selectedFilmForModal && (
        <FilmModal
          film={selectedFilmForModal}
          offlineFilms={offlineFilms}
          onClose={() => setSelectedFilmForModal(null)}
          onEnter3DTheater={handleEnter3DTheater}
          onEnterStandardPlayer={handleEnterStandardPlayer}
          onDownloadFilm={handleDownloadFilm}
        />
      )}

      {/* Standard 2D Cinema Modal */}
      {activeStandardPlayerFilm && (
        <StandardPlayerModal
          film={activeStandardPlayerFilm}
          videoSrc={resolveVideoSource(activeStandardPlayerFilm)}
          isOffline={isOfflineSimulated || isFilmAvailableOffline(activeStandardPlayerFilm)}
          onClose={() => setActiveStandardPlayerFilm(null)}
          onSwitchTo3DCinema={handleEnter3DTheater}
        />
      )}
    </div>
  );
}
