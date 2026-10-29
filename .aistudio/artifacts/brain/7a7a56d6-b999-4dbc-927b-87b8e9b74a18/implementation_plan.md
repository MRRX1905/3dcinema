# Lumière 3D — Cinematic Streaming & Virtual Grand Cinema

A premier film streaming platform featuring an interactive 3D Grand Luxury Cinema theater mode powered by Three.js, a spatial 3D personalized recommendation carousel with genre spotlighting, and robust offline viewing powered by client-side IndexedDB video caching and storage management.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive clarification session:

- **Virtual Cinema Environment**: Grand Luxury Cinema styling featuring tiered plush velvet seating rows, warm brass sconce lighting, polished mahogany acoustic paneling, and real-time screen radiance reflecting dynamically onto the audience seats.
- **3D Personalized Recommendations**: An interactive spatial 3D film carousel with dynamic genre spotlighting, smooth inertial drag/spin, and instant card inspection.
- **Offline Viewing Architecture**: True IndexedDB client-side video blob caching with an in-app offline simulator ("Airplane Mode" toggle), real-time download progress tracking, and storage meter analytics.

---

### 1. Overview & Core Concept

- **What It Does**: Lumière 3D re-imagines web film streaming by merging high-fidelity film browsing with a spatial 3D virtual theater. Users can browse curated films, explore personalized recommendations in a rotating 3D spatial cylinder/carousel, download films for seamless offline playback via IndexedDB, and switch instantly into an immersive 3D Grand Luxury Cinema with customizable viewing seats (Center VIP, Front Orchestra, Balcony Box) and ambient lighting dimmer controls.
- **Target Audience / Persona**: Cinephiles, home-theater enthusiasts, travelers requiring reliable offline streaming on planes/trains, and viewers seeking a spatial, distraction-free screening experience in the browser.
- **Key Value**: Delivers the communal grandeur of an opulent cinema palace directly in the browser while providing true offline resilience and algorithmic recommendation tuning.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Browse & Discover**: The user arrives on the editorial homepage showcasing featured premiere titles, genre shelves, and personalized taste profiles.
2. **3D Spatial Recommendation Carousel**: The user activates the "Spatial 3D Picks" view. A Three.js spatial carousel rotates multi-part 3D film pedestals. Hovering or clicking a film focuses the camera with smooth exponential damping, casting focused genre spotlights and revealing synopsis, match percentage, and cast details.
3. **Offline Caching & Download**: From any film card or detail view, the user clicks "Download for Offline". The app caches the video stream, artwork, and metadata into browser IndexedDB with simulated multi-megabyte progress bars, quota tracking, and an "Offline Library" tab.
4. **Network Offline Simulation**: The user toggles "Airplane Mode / Offline" in the header to simulate total network disconnection. The app instantly switches to offline mode, proving that cached films play flawlessly without external requests.
5. **3D Virtual Theater Screening**: Clicking "Enter 3D Cinema" launches the 3D Grand Luxury Cinema. The film plays on a curved theatrical silver screen in 3D space. Users can adjust seat vantage points (Center VIP, Orchestra, Balcony), toggle house lights/projector beam, and collapse the HUD for an unobstructed view.

#### Visual Identity & Theme
- **Aesthetic Direction**: Neo-classical Parisian cinema meets modern high-end streaming (warm obsidian, burnished brass accents, deep crimson velvet, and refined typography).
- **Color Palette (60-30-10 Rule)**:
  - `60% Neutral Canvas`: Deep Obsidian (`#0B0D13`) and Midnight Charcoal (`#12151F`).
  - `30% Structural Surfaces`: Dark Slate cards (`#1A1E2B`), hairline borders (`rgba(255,255,255,0.08)`), and warm acoustic wood tones (`#2A201A`).
  - `10% Accent Colors`: Burnished Warm Gold (`#E5A93C`) and Regal Velvet Crimson (`#C92A2A`) reserved strictly for CTAs, active seat markers, and playback highlights.
- **Typography & Hierarchy**:
  - *Display / Headlines*: `Playfair Display` or `Cinzel` for editorial cinematic grandeur.
  - *Interface & Body*: `Plus Jakarta Sans` for razor-sharp readability at all sizes.
  - *Telemetry & Storage*: `font-mono tabular-nums` for timestamps, file sizes, and download speeds.
- **Component Styling & Layout**:
  - Full-bleed 1440px desktop baseline with fluid responsive collapse.
  - Sleek top navigation conforming strictly to the 3-Zone contract (Brand Wordmark — Nav Links — Offline Status & Quick Actions).
  - Collapsible bottom control dock in the 3D theater (`<= 15%` viewport height) preserving 100% center line-of-sight.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Procedural 3D Cinema Geometry vs. External 3D Models**
  - *Chosen Approach*: Build the entire Grand Luxury Cinema procedurally in Three.js using grouped meshes (stepped tiered floor, curved rows of armrests/cushions, gilded stage arch, wall acoustic panels, warm brass sconce fixtures, and projector volumetric cone).
  - *Why*: Eliminates 404 network failures, avoids multi-megabyte GLTF downloads, guarantees instant initialization, and adheres to strict physical PBR guidelines.
  - *Alternatives Considered*: Loading an external `.gltf` asset (rejected due to 404 risks and sluggish load times in sandbox environments).

- **Decision 2: IndexedDB Blob Storage for Offline Viewing**
  - *Chosen Approach*: Use client-side IndexedDB with an IDB wrapper to store actual video blobs, posters, and playhead states, accompanied by a simulated realistic download pipeline (chunked progress, download speed telemetry, and storage quota gauges).
  - *Why*: Provides true offline playback capability where videos continue to play smoothly even when the network is completely disabled or toggled into offline mode.
  - *Alternatives Considered*: Simple `localStorage` (rejected due to 5MB storage limits that cannot store video data).

- **Decision 3: Three.js Screen Projection onto 3D Theater Seating**
  - *Chosen Approach*: Use an HTML5 `<video>` element feeding into a `THREE.VideoTexture` or synchronized canvas texture bound to the 3D screen mesh. A directional/spot light colored according to average screen luminance casts dynamic lighting onto front-row velvet seats.
  - *Why*: Creates an authentic movie theater atmosphere where bright movie scenes illuminate the dark auditorium.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Lumière 3D App                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Navigation Bar [Brand · Cinema · 3D Picks · Offline Vault · Sim Toggle]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────┐  ┌───────────────────────────────────────────┐  │
│  │   Active View State    │  │        Offline & Storage Subsystem        │  │
│  │  - Editorial Catalog   │  │  - IndexedDB Storage Engine (Blobs/Meta)  │  │
│  │  - 3D Recommendation   │  │  - Download Queue & Progress Tracker      │  │
│  │    Spatial Carousel    │  │  - Storage Quota & Capacity Gauge         │  │
│  │  - 3D Grand Cinema     │  │  - Offline Mode Simulator Toggle          │  │
│  │  - Standard 2D Player  │  └───────────────────────────────────────────┘  │
│  └───────────┬────────────┘                                                 │
│              │                                                              │
│              ▼                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                  Three.js 3D Viewport Subsystem                       │  │
│  │  ┌──────────────────────────────────┐ ┌─────────────────────────────┐ │  │
│  │  │   Grand Luxury Cinema Scene      │ │  Spatial Recommendation     │ │  │
│  │  │  - Tiered Velvet Rows (Instanced)│ │  - Revolving 3D Film Stands │ │  │
│  │  │  - Curved Silver Screen Mesh     │ │  - Interactive Raycaster    │ │  │
│  │  │  - Brass Sconces & Key/Fill Lights││  - Genre Spotlights & Damping│ │  │
│  │  │  - Camera Seat Presets (VIP/Balc)│ └─────────────────────────────┘ │  │
│  │  └──────────────────────────────────┘                                 │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │  Collapsible Bottom Cinema Dock (Camera Presets, Lights, Audio)  │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- **Film**: `id`, `title`, `year`, `runtime`, `genre`, `rating`, `synopsis`, `director`, `cast`, `videoUrl`, `posterUrl`, `backdropUrl`, `matchScore`, `recommendationFactors` (e.g., visual style, emotional tone, pace).
- **DownloadedFilm**: `filmId`, `downloadDate`, `blobSize`, `blobUrl`, `resolution`, `progress`, `status` (`'downloading' | 'completed' | 'queued'`).
- **TheaterPreferences**: `seatPreset` (`'center_vip' | 'front_orchestra' | 'balcony_box' | 'directors_chair'`), `ambientLighting` (0 to 1), `projectorDust` (boolean), `subtitles` (boolean).
- **TasteProfile**: Genre weights (Sci-Fi, Noir, Drama, Thriller, Art-House) and dimension sliders (Visual Splendor, Emotional Depth, Narrative Pace).

#### Interactive Component & State Mapping
- **View Transitions**: Seamless switching between Catalog, 3D Spatial Recommendations, 3D Cinema Theater, and Offline Vault without tearing down cached state.
- **Offline Download Action**: Clicking download updates state to `downloading`, streams/fetches chunks into IndexedDB, updates the device storage meter, and enables immediate playback with zero internet.
- **3D Theater Camera Rig**: Seamless damping lerp between seat viewpoints when the user clicks preset buttons or uses OrbitControls.
- **Controls & HUD**: Cinema controls dock auto-collapses or toggles with hotkey `H`, ensuring unobstructed viewing.
