import { Film } from '../types';

export const INITIAL_FILMS: Film[] = [
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    year: 2024,
    runtime: '12 min',
    genre: 'Sci-Fi',
    rating: 'PG-13',
    matchScore: 98,
    director: 'Ian Hubert',
    cast: ['Derek de Lint', 'Sergio Hasselbaink', 'Rogier Schippers'],
    tagline: 'A dystopian future where memories echo through cybernetic remnants.',
    synopsis: 'In a dystopian future set in the ruins of Amsterdam, a group of rebel warriors and scientists attempt to avert a global robotic apocalypse by using a neurological memory bridge.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    accentColor: '#00d2ff',
    dimensions: {
      visualSplendor: 96,
      emotionalDepth: 82,
      narrativePace: 78,
      cerebralPlot: 91,
    },
    fileSizeMb: 148,
    awards: 'Official Selection - SIGGRAPH Computer Animation Festival',
    aspectRatio: '2.39:1',
  },
  {
    id: 'sintel',
    title: 'Sintel: The Dragon Quest',
    year: 2023,
    runtime: '15 min',
    genre: 'Drama',
    rating: 'PG',
    matchScore: 95,
    director: 'Colin Levy',
    cast: ['Halina Reijn', 'Thom Hoffman'],
    tagline: 'The lonely journey to rescue a lost companion.',
    synopsis: 'A lonely young woman searches the rugged mountains and barren wastes of a desolate fantasy realm to rescue a baby dragon she nurtured back to life.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    accentColor: '#f59e0b',
    dimensions: {
      visualSplendor: 92,
      emotionalDepth: 97,
      narrativePace: 65,
      cerebralPlot: 84,
    },
    fileSizeMb: 182,
    awards: 'Best Animated Short - Strasbourg European Fantastic Film Festival',
    aspectRatio: '2.35:1',
  },
  {
    id: 'big-buck-bunny',
    title: 'The Great Meadow',
    year: 2022,
    runtime: '10 min',
    genre: 'Animation',
    rating: 'G',
    matchScore: 91,
    director: 'Sacha Goedegebure',
    cast: ['Jan Morgenstern', 'Ton Roosendaal'],
    tagline: 'Nature takes a whimsical, vengeful turn.',
    synopsis: 'A gentle giant woodland creature is pushed past his limit by mischievous forest bullies, orchestrating an intricate series of inventive Rube Goldberg traps.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    accentColor: '#10b981',
    dimensions: {
      visualSplendor: 88,
      emotionalDepth: 62,
      narrativePace: 90,
      cerebralPlot: 55,
    },
    fileSizeMb: 125,
    awards: 'Special Jury Prize - Animago Awards',
    aspectRatio: '16:9',
  },
  {
    id: 'elephants-dream',
    title: 'The Infinite Machine',
    year: 2025,
    runtime: '11 min',
    genre: 'Noir',
    rating: 'PG-13',
    matchScore: 94,
    director: 'Bassam Kurdali',
    cast: ['Tygo Gernandt', 'Cas Jansen'],
    tagline: 'When the labyrinth dreams of its creators.',
    synopsis: 'Two subterranean explorers traverse the vast, unfathomable clockwork innards of a colossal biomechanical organism whose rules mutate with their psychological fears.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    accentColor: '#8b5cf6',
    dimensions: {
      visualSplendor: 94,
      emotionalDepth: 79,
      narrativePace: 72,
      cerebralPlot: 96,
    },
    fileSizeMb: 160,
    awards: 'Winner - HDFEST Best Experimental Film',
    aspectRatio: '1.85:1',
  },
  {
    id: 'subterranean-echoes',
    title: 'Subterranean Echoes',
    year: 2024,
    runtime: '14 min',
    genre: 'Thriller',
    rating: 'R',
    matchScore: 89,
    director: 'Elena Rostova',
    cast: ['Klaus Werner', 'Astrid Lind'],
    tagline: 'The deepest frequencies reveal what silence conceals.',
    synopsis: 'An acoustic seismologist stationed in a decommissioned Scandinavian salt cavern detects rhythmic sonar pulses beneath the tectonic crust that mimic human speech patterns.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    accentColor: '#ef4444',
    dimensions: {
      visualSplendor: 86,
      emotionalDepth: 84,
      narrativePace: 85,
      cerebralPlot: 92,
    },
    fileSizeMb: 138,
    awards: 'Nominee - Nordic Visionary Cinema Prize',
    aspectRatio: '2.39:1',
  },
  {
    id: 'stellar-odyssey',
    title: 'Chronicles of the Event Horizon',
    year: 2025,
    runtime: '16 min',
    genre: 'Documentary',
    rating: 'PG',
    matchScore: 93,
    director: 'Dr. Arthur Vance',
    cast: ['Narrated by Julianne Hayes'],
    tagline: 'Where physics breaks down and light becomes timeless.',
    synopsis: 'A mesmerizing visual journey through the optical distortions of supermassive black holes, compiled from gravitational lensing telescopes and astrophysical supercomputer simulations.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    accentColor: '#ec4899',
    dimensions: {
      visualSplendor: 99,
      emotionalDepth: 88,
      narrativePace: 58,
      cerebralPlot: 98,
    },
    fileSizeMb: 195,
    awards: 'Grand Prix - International Science Media Awards',
    aspectRatio: '16:9',
  },
  {
    id: 'neon-velocity',
    title: 'Neon Velocity: Midnight Run',
    year: 2026,
    runtime: '13 min',
    genre: 'Sci-Fi',
    rating: 'PG-13',
    matchScore: 96,
    director: 'Kenji Takahashi',
    cast: ['Ren Morita', 'Sarah Connor'],
    tagline: 'Speed is the only shield in an electrified city.',
    synopsis: 'Under perpetual rain and holographic billboards, an outlaw cyber-courier must deliver a decrypted neural core across three megacity sectors before dawn.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    accentColor: '#06b6d4',
    dimensions: {
      visualSplendor: 95,
      emotionalDepth: 74,
      narrativePace: 98,
      cerebralPlot: 80,
    },
    fileSizeMb: 154,
    awards: 'Best Cinematography - Tokyo Cyber Film Expo',
    aspectRatio: '2.39:1',
  },
  {
    id: 'solitary-peaks',
    title: 'Solitary Peaks: The Silent Ascent',
    year: 2023,
    runtime: '18 min',
    genre: 'Documentary',
    rating: 'G',
    matchScore: 88,
    director: 'Markus Thorne',
    cast: ['Solo Mountaineer Eric Valen'],
    tagline: 'Above the cloud ceiling, only your breath remains.',
    synopsis: 'An unprecedented solo climb of the legendary Karakoram ridges during mid-winter without oxygen tanks or radio contact, capturing the sacred silence of extreme altitudes.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    accentColor: '#14b8a6',
    dimensions: {
      visualSplendor: 97,
      emotionalDepth: 91,
      narrativePace: 54,
      cerebralPlot: 76,
    },
    fileSizeMb: 170,
    awards: 'Audience Award - Banff Mountain Film Festival',
    aspectRatio: '16:9',
  }
];

/**
 * Procedural Cinema Poster Generator (Zero-404 Asset Guarantee)
 * Generates an ultra high-resolution canvas texture for any film with cinematic lighting,
 * stylized title typography, vignette, film grain, and genre-specific geometry.
 */
export function generateFilmPosterCanvas(film: Film, width = 600, height = 900): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background deep gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (film.genre === 'Sci-Fi') {
    bgGrad.addColorStop(0, '#050b14');
    bgGrad.addColorStop(0.5, '#0d1f36');
    bgGrad.addColorStop(1, '#050810');
  } else if (film.genre === 'Noir') {
    bgGrad.addColorStop(0, '#100c14');
    bgGrad.addColorStop(0.5, '#201626');
    bgGrad.addColorStop(1, '#08060a');
  } else if (film.genre === 'Drama') {
    bgGrad.addColorStop(0, '#160c04');
    bgGrad.addColorStop(0.5, '#2a1a08');
    bgGrad.addColorStop(1, '#0d0702');
  } else if (film.genre === 'Thriller') {
    bgGrad.addColorStop(0, '#140505');
    bgGrad.addColorStop(0.5, '#2b0c0c');
    bgGrad.addColorStop(1, '#0a0303');
  } else if (film.genre === 'Animation') {
    bgGrad.addColorStop(0, '#03140e');
    bgGrad.addColorStop(0.5, '#0a2b1f');
    bgGrad.addColorStop(1, '#020d09');
  } else {
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.5, '#192644');
    bgGrad.addColorStop(1, '#070b14');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Artistic background geometry/light shafts
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const lightGrad = ctx.createRadialGradient(width * 0.5, height * 0.35, 20, width * 0.5, height * 0.35, width * 0.7);
  lightGrad.addColorStop(0, `${film.accentColor}77`);
  lightGrad.addColorStop(0.4, `${film.accentColor}22`);
  lightGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, width, height);

  // Geometric cinematic elements based on genre
  ctx.strokeStyle = `${film.accentColor}44`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.35, width * 0.32, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.35, width * 0.22, 0, Math.PI * 2);
  ctx.setLineDash([4, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Diagonal spotlight flare
  ctx.fillStyle = `${film.accentColor}18`;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, 0);
  ctx.lineTo(width * 0.9, height);
  ctx.lineTo(width * 0.1, height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Subtle film grain
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 16) {
    const grain = (Math.random() - 0.5) * 18;
    data[i] = Math.max(0, Math.min(255, data[i] + grain));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Vignette overlay
  const vigGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.3, width * 0.5, height * 0.5, width * 0.75);
  vigGrad.addColorStop(0, 'transparent');
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, width, height);

  // Dark bottom scrim for typography
  const scrimGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
  scrimGrad.addColorStop(0, 'transparent');
  scrimGrad.addColorStop(0.35, 'rgba(11, 13, 19, 0.7)');
  scrimGrad.addColorStop(1, 'rgba(11, 13, 19, 0.98)');
  ctx.fillStyle = scrimGrad;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  // Border frame line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.strokeStyle = `${film.accentColor}55`;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // Header kicker
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText(`LUMIÈRE CINÉMATHÈQUE · ${film.genre.toUpperCase()}`, width * 0.5, 60);

  // Match score ring badge
  ctx.fillStyle = film.accentColor;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`${film.matchScore}% MATCH`, width * 0.5, 92);

  // Central Icon / Emblem
  ctx.save();
  ctx.translate(width * 0.5, height * 0.35);
  ctx.fillStyle = film.accentColor;
  ctx.beginPath();
  // Cinema aperture shape
  for (let a = 0; a < 6; a++) {
    const angle = (a * Math.PI) / 3;
    const x1 = Math.cos(angle) * 45;
    const y1 = Math.sin(angle) * 45;
    const x2 = Math.cos(angle + 0.4) * 80;
    const y2 = Math.sin(angle + 0.4) * 80;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.strokeStyle = `${film.accentColor}cc`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Movie Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Cinzel", Georgia, serif';
  ctx.letterSpacing = '1px';
  ctx.textAlign = 'center';
  
  // Title wrap
  const words = film.title.split(' ');
  if (words.length > 2 && film.title.length > 18) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    ctx.fillText(line1, width * 0.5, height - 190);
    ctx.fillText(line2, width * 0.5, height - 150);
  } else {
    ctx.fillText(film.title, width * 0.5, height - 165);
  }

  // Tagline
  ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText(`"${film.tagline.slice(0, 48)}${film.tagline.length > 48 ? '...' : ''}"`, width * 0.5, height - 115);

  // Metadata footer
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(`${film.year}  ·  ${film.runtime}  ·  DIR. ${film.director.toUpperCase()}`, width * 0.5, height - 75);

  return canvas;
}
