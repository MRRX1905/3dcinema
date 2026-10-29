import React, { useRef, useState, useEffect } from 'react';
import { Film } from '../types';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Clapperboard,
  RotateCcw,
} from 'lucide-react';

interface StandardPlayerModalProps {
  film: Film;
  videoSrc: string;
  isOffline: boolean;
  onClose: () => void;
  onSwitchTo3DCinema: (film: Film) => void;
}

export const StandardPlayerModal: React.FC<StandardPlayerModalProps> = ({
  film,
  videoSrc,
  isOffline,
  onClose,
  onSwitchTo3DCinema,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#090b10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0e121c]">
          <div className="flex items-center gap-3">
            <h3 className="font-cinzel text-base font-bold text-white">{film.title}</h3>
            {isOffline && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded">
                Offline Stream
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchTo3DCinema(film)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Clapperboard className="w-3.5 h-3.5 fill-current" />
              <span>Switch to 3D Cinema</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
          />
        </div>

        {/* Player Controls */}
        <div className="p-4 bg-[#0e121c] border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-slate-400 min-w-[36px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-xs font-mono tabular-nums text-slate-400 min-w-[36px]">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg transition-colors cursor-pointer font-bold"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="flex items-center gap-2 text-slate-300">
                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (videoRef.current) videoRef.current.muted = next;
                  }}
                  className="cursor-pointer hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setIsMuted(v === 0);
                    if (videoRef.current) videoRef.current.volume = v;
                  }}
                  className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            <button
              onClick={() => onSwitchTo3DCinema(film)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <Clapperboard className="w-4 h-4" />
              <span>Step into 3D Grand Cinema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
