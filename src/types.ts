export interface Film {
  id: string;
  title: string;
  year: number;
  runtime: string;
  genre: 'Sci-Fi' | 'Noir' | 'Drama' | 'Thriller' | 'Animation' | 'Documentary';
  rating: string;
  matchScore: number;
  director: string;
  cast: string[];
  synopsis: string;
  tagline: string;
  videoUrl: string;
  accentColor: string;
  dimensions: {
    visualSplendor: number; // 0-100
    emotionalDepth: number; // 0-100
    narrativePace: number; // 0-100
    cerebralPlot: number; // 0-100
  };
  fileSizeMb: number;
  awards?: string;
  aspectRatio?: string;
}

export interface DownloadedFilm {
  filmId: string;
  title: string;
  downloadedAt: number;
  blobSize: number; // in bytes
  blob?: Blob;
  blobUrl?: string;
  quality: '720p' | '1080p' | '4K Cinema';
  status: 'queued' | 'downloading' | 'completed' | 'error';
  progress: number; // 0 - 100
  speedMb: number; // e.g. 14.2 MB/s
}

export type TheaterSeatPreset = 'center_vip' | 'front_orchestra' | 'balcony_box' | 'directors_chair';

export interface TheaterSettings {
  seatPreset: TheaterSeatPreset;
  ambientLighting: number; // 0.0 (pitch dark) to 1.0 (intermission)
  screenGlowIntensity: number; // 0.0 to 1.5
  projectorBeam: boolean;
  screenCurvature: number; // 0 (flat) to 1 (curved)
  audioReverb: boolean;
}

export interface TasteProfile {
  genres: Record<string, number>; // 0 to 1
  dimensions: {
    visualSplendor: number;
    emotionalDepth: number;
    narrativePace: number;
    cerebralPlot: number;
  };
}
