import React, { useState } from 'react';
import { Film, DownloadedFilm } from '../types';
import {
  X,
  Play,
  Download,
  Check,
  Clapperboard,
  Award,
  Sparkles,
  Users,
  Film as FilmIcon,
} from 'lucide-react';

interface FilmModalProps {
  film: Film;
  offlineFilms: DownloadedFilm[];
  onClose: () => void;
  onEnter3DTheater: (film: Film) => void;
  onEnterStandardPlayer: (film: Film) => void;
  onDownloadFilm: (film: Film, quality: '720p' | '1080p' | '4K Cinema') => void;
}

export const FilmModal: React.FC<FilmModalProps> = ({
  film,
  offlineFilms,
  onClose,
  onEnter3DTheater,
  onEnterStandardPlayer,
  onDownloadFilm,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<'720p' | '1080p' | '4K Cinema'>('1080p');

  const isDownloaded = offlineFilms.some(
    (item) => item.filmId === film.id && item.status === 'completed'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f131f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-6">
        {/* Modal Header with Accent Backdrop */}
        <div className="relative p-6 md:p-8 bg-gradient-to-b from-[#182033] to-[#0f131f] border-b border-white/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-black/40 border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-2 pr-8">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-amber-400 font-mono">
                {film.matchScore}% Match
              </span>
              <span aria-hidden="true">·</span>
              <span>{film.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{film.year}</span>
              <span aria-hidden="true">·</span>
              <span>{film.runtime}</span>
              <span aria-hidden="true">·</span>
              <span>{film.rating}</span>
            </div>

            <h2 className="font-cinzel text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              {film.title}
            </h2>

            <p className="text-xs md:text-sm italic text-amber-300/80 font-serif">
              "{film.tagline}"
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 pt-0 space-y-6 text-xs text-slate-300">
          {/* Synopsis */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Synopsis
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">{film.synopsis}</p>
          </div>

          {/* Credits & Accolades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#141926] border border-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Cast & Crew</span>
              </div>
              <p className="text-slate-200">
                <strong>Director:</strong> {film.director}
              </p>
              <p className="text-slate-400 text-[11px]">
                <strong>Cast:</strong> {film.cast.join(', ')}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Accolades</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                {film.awards || 'Curated Lumière 3D Archival Showcase'}
              </p>
              <p className="text-slate-500 text-[11px]">Aspect Ratio: {film.aspectRatio}</p>
            </div>
          </div>

          {/* Algorithmic Dimension Analysis */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Taste Vectors</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Visual Splendor</span>
                  <span className="font-mono tabular-nums">{film.dimensions.visualSplendor}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${film.dimensions.visualSplendor}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Emotional Depth</span>
                  <span className="font-mono tabular-nums">{film.dimensions.emotionalDepth}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${film.dimensions.emotionalDepth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Narrative Pace</span>
                  <span className="font-mono tabular-nums">{film.dimensions.narrativePace}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${film.dimensions.narrativePace}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Cerebral Mystery</span>
                  <span className="font-mono tabular-nums">{film.dimensions.cerebralPlot}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${film.dimensions.cerebralPlot}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Offline Quality Preset Options */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#141926] border border-white/5 text-xs">
            <span className="text-slate-400">Offline Download Quality:</span>
            <div className="flex items-center gap-1.5">
              {(['720p', '1080p', '4K Cinema'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuality(q)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    selectedQuality === q
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-800'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => onEnterStandardPlayer(film)}
              className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-[#161c2b] hover:bg-[#20273a] border border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Standard 2D</span>
            </button>

            <button
              onClick={() => onDownloadFilm(film, selectedQuality)}
              className={`px-4 py-2.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-2 ${
                isDownloaded
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-[#161c2b] text-slate-200 border-white/10 hover:bg-[#20273a] hover:text-white'
              }`}
            >
              {isDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Cached in Vault</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ({film.fileSizeMb} MB)</span>
                </>
              )}
            </button>

            <button
              onClick={() => onEnter3DTheater(film)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <Clapperboard className="w-4 h-4 fill-current" />
              <span>Watch in 3D Grand Cinema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
