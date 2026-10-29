import React, { useState, useEffect } from 'react';
import { Film, DownloadedFilm } from '../types';
import { generateFilmPosterCanvas } from '../data/films';
import { Play, Download, Check, Sparkles, Clapperboard, Info, Search, Filter } from 'lucide-react';

interface CatalogViewProps {
  films: Film[];
  offlineFilms: DownloadedFilm[];
  onSelectFilm: (film: Film) => void;
  onEnter3DTheater: (film: Film) => void;
  onDownloadFilm: (film: Film) => void;
  onGoToRecommendations: () => void;
  isOffline: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  films,
  offlineFilms,
  onSelectFilm,
  onEnter3DTheater,
  onDownloadFilm,
  onGoToRecommendations,
  isOffline,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [posterUrls, setPosterUrls] = useState<Record<string, string>>({});

  // Featured Hero Film
  const heroFilm = films[0];

  // Pre-generate crisp procedural canvas poster data URLs
  useEffect(() => {
    const urls: Record<string, string> = {};
    films.forEach((f) => {
      const canvas = generateFilmPosterCanvas(f, 480, 720);
      urls[f.id] = canvas.toDataURL('image/jpeg', 0.88);
    });
    setPosterUrls(urls);
  }, [films]);

  const genres = ['All', 'Sci-Fi', 'Drama', 'Noir', 'Animation', 'Thriller', 'Documentary'];

  const filteredFilms = films.filter((f) => {
    const matchesGenre = selectedGenre === 'All' || f.genre === selectedGenre;
    const matchesSearch =
      searchQuery.trim() === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const isDownloaded = (filmId: string) => {
    return offlineFilms.some((item) => item.filmId === filmId && item.status === 'completed');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-12">
      {/* Editorial Hero Feature Section */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#121622] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] items-stretch">
          {/* Left Editorial Info */}
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between z-10 bg-gradient-to-r from-[#0d101a] via-[#0d101a]/95 to-transparent">
            <div className="space-y-4">
              {/* Clean Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400 font-semibold uppercase tracking-wider">
                  Featured Premiere
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-emerald-400">{heroFilm.matchScore}% Match</span>
                <span aria-hidden="true">·</span>
                <span>{heroFilm.genre}</span>
                <span aria-hidden="true">·</span>
                <span>{heroFilm.year}</span>
                <span aria-hidden="true">·</span>
                <span>{heroFilm.runtime}</span>
              </div>

              {/* Title with Balanced Wrap */}
              <h1 className="font-cinzel text-3xl md:text-5xl font-extrabold text-white tracking-wide text-balance leading-tight">
                {heroFilm.title}
              </h1>

              {/* Tagline & Synopsis */}
              <p className="text-sm md:text-base italic text-amber-200/80 font-serif">
                "{heroFilm.tagline}"
              </p>

              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {heroFilm.synopsis}
              </p>

              {/* Director & Cast Metadata */}
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div>
                  <span className="text-slate-500">Director: </span>
                  <span className="text-slate-200">{heroFilm.director}</span>
                </div>
                <div>
                  <span className="text-slate-500">Cast: </span>
                  <span className="text-slate-200">{heroFilm.cast.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-6">
              <button
                onClick={() => onEnter3DTheater(heroFilm)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-400/20"
              >
                <Clapperboard className="w-4 h-4 fill-current" />
                <span>Watch in 3D Grand Cinema</span>
              </button>

              <button
                onClick={() => onDownloadFilm(heroFilm)}
                className={`px-4 py-2.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-2 ${
                  isDownloaded(heroFilm.id)
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-[#1a2030] text-slate-200 border-white/10 hover:bg-[#242c42] hover:text-white'
                }`}
              >
                {isDownloaded(heroFilm.id) ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Cached Offline</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download for Offline ({heroFilm.fileSizeMb} MB)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectFilm(heroFilm)}
                className="px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Film Details
              </button>
            </div>
          </div>

          {/* Right Hero Poster Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-8 bg-[#0b0e17]">
            {posterUrls[heroFilm.id] ? (
              <img
                src={posterUrls[heroFilm.id]}
                alt={heroFilm.title}
                referrerPolicy="no-referrer"
                className="w-full max-w-[320px] aspect-[2/3] object-cover rounded-xl shadow-2xl border border-white/10 transform lg:rotate-1 hover:rotate-0 transition-transform duration-300"
              />
            ) : (
              <div className="w-full max-w-[320px] aspect-[2/3] bg-slate-900 rounded-xl animate-pulse" />
            )}
          </div>
        </div>
      </section>

      {/* Spatial 3D Recommendations Teaser Banner */}
      <section className="p-6 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-[#151a27] to-[#11141e] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive 3D Carousel</span>
          </div>
          <h2 className="font-cinzel text-xl font-bold text-white">
            Explore Personalized 3D Recommendations
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Step into the spatial 3D orbit carousel where films respond dynamically to your
            calibrated taste for Visual Splendor, Emotional Depth, and Cerebral Mystery.
          </p>
        </div>

        <button
          onClick={onGoToRecommendations}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1a2133] hover:bg-[#252f48] border border-amber-500/30 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-md"
        >
          Launch 3D Picks Carousel
        </button>
      </section>

      {/* Catalog Filters & Search */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-cinzel text-2xl font-bold text-white tracking-wide">
              Curated Film Collection
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any film to view in the 3D Grand Cinema or save to your offline vault.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search films, directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121622] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400/50"
            />
          </div>
        </div>

        {/* Functional Genre Filter Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/5">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Film Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFilms.map((film) => {
            const downloaded = isDownloaded(film.id);
            return (
              <div
                key={film.id}
                className="group relative bg-[#121622] border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-lg flex flex-col"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelectFilm(film)}>
                  {posterUrls[film.id] ? (
                    <img
                      src={posterUrls[film.id]}
                      alt={film.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      Loading Poster...
                    </div>
                  )}

                  {/* Top Overlay Badge for Offline Cache Status */}
                  {downloaded && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono rounded">
                      Offline Ready
                    </div>
                  )}

                  {/* Scrim Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e121c] via-[#0e121c]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEnter3DTheater(film);
                      }}
                      className="p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full transition-transform transform hover:scale-110 shadow-xl cursor-pointer"
                      title="Watch in 3D Cinema"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Card Content (Zero-Pill Metadata Discipline) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-amber-400 font-mono">
                        {film.matchScore}% Match
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{film.genre}</span>
                      <span aria-hidden="true">·</span>
                      <span>{film.year}</span>
                    </div>

                    <h3
                      onClick={() => onSelectFilm(film)}
                      className="font-cinzel text-base font-bold text-white hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                    >
                      {film.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {film.synopsis}
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onEnter3DTheater(film)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Clapperboard className="w-3.5 h-3.5" />
                      <span>3D Cinema</span>
                    </button>

                    <button
                      onClick={() => onDownloadFilm(film)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        downloaded
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={downloaded ? 'Downloaded to IndexedDB' : `Download (${film.fileSizeMb} MB)`}
                    >
                      {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
