import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Film, TasteProfile } from '../types';
import { generateFilmPosterCanvas } from '../data/films';
import {
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  Info,
  RotateCw,
  Compass,
} from 'lucide-react';

interface ThreeRecommendationsProps {
  films: Film[];
  tasteProfile: TasteProfile;
  onTasteProfileChange: (newProfile: TasteProfile) => void;
  onSelectFilm: (film: Film) => void;
  onEnter3DTheater: (film: Film) => void;
  onDownloadFilm: (film: Film) => void;
}

export const ThreeRecommendations: React.FC<ThreeRecommendationsProps> = ({
  films,
  tasteProfile,
  onTasteProfileChange,
  onSelectFilm,
  onEnter3DTheater,
  onDownloadFilm,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [showTuner, setShowTuner] = useState(false);

  // Three.js mutable state refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carouselGroupRef = useRef<THREE.Group | null>(null);
  const cardMeshesRef = useRef<THREE.Mesh[]>([]);
  const spotlightRef = useRef<THREE.SpotLight | null>(null);

  // Carousel angles & damping
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);
  const isDragging = useRef(false);
  const prevMouseX = useRef(0);
  const angularVelocity = useRef(0);

  // Recalculate match score based on taste profile
  const scoredFilms = React.useMemo(() => {
    return films.map((f) => {
      const vDiff = Math.abs(f.dimensions.visualSplendor - tasteProfile.dimensions.visualSplendor);
      const eDiff = Math.abs(f.dimensions.emotionalDepth - tasteProfile.dimensions.emotionalDepth);
      const pDiff = Math.abs(f.dimensions.narrativePace - tasteProfile.dimensions.narrativePace);
      const cDiff = Math.abs(f.dimensions.cerebralPlot - tasteProfile.dimensions.cerebralPlot);
      const avgDiff = (vDiff + eDiff + pDiff + cDiff) / 4;
      const score = Math.max(70, Math.min(99, Math.round(100 - avgDiff * 0.4)));
      return { ...f, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [films, tasteProfile]);

  const activeFilm = scoredFilms[selectedIndex] || scoredFilms[0];

  // Rotate carousel to index
  const selectFilmByIndex = useCallback((index: number) => {
    const total = scoredFilms.length;
    const normIndex = (index + total) % total;
    setSelectedIndex(normIndex);

    const stepAngle = (Math.PI * 2) / total;
    targetRotationY.current = -normIndex * stepAngle;
  }, [scoredFilms.length]);

  // Build Three.js 3D Spatial Carousel Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#080a10');
    scene.fog = new THREE.FogExp2('#080a10', 0.035);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 10.5);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lights
    const hemiLight = new THREE.HemisphereLight(0x2a3650, 0x10131d, 0.5);
    scene.add(hemiLight);

    const warmKey = new THREE.DirectionalLight(0xfff1dc, 1.2);
    warmKey.position.set(5, 8, 8);
    warmKey.castShadow = !isSoftwareGl;
    scene.add(warmKey);

    // Dynamic Genre Spotlight (focuses directly on front-facing film)
    const spotlight = new THREE.SpotLight(0x00d2ff, 3.5, 20, Math.PI / 6, 0.4, 1.2);
    spotlight.position.set(0, 7.5, 4.5);
    spotlight.target.position.set(0, 0.5, 5.0);
    scene.add(spotlight);
    scene.add(spotlight.target);
    spotlightRef.current = spotlight;

    // Contact Ground Floor with Soft Circular Grid
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f18,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Center Stage Plinth Ring
    const plinthGeo = new THREE.CylinderGeometry(5.8, 6.0, 0.25, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x161a26,
      roughness: 0.5,
      metalness: 0.6,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -1.68;
    scene.add(plinth);

    // Glowing Neon Ring on Floor
    const ringGeo = new THREE.TorusGeometry(5.2, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.55;
    scene.add(ring);

    // Build Rotating Carousel Group
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);
    carouselGroupRef.current = carouselGroup;

    const total = scoredFilms.length;
    const radius = 5.2;
    const cardMeshes: THREE.Mesh[] = [];

    // Create 3D Film Stand Cards
    scoredFilms.forEach((film, i) => {
      const angle = (i * Math.PI * 2) / total;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const standGroup = new THREE.Group();
      standGroup.position.set(x, 0.2, z);
      standGroup.rotation.y = angle;

      // 1. Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.2, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1a2030,
        roughness: 0.4,
        metalness: 0.7,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -1.6;
      standGroup.add(baseMesh);

      // 2. Poster Panel (CanvasTexture procedural zero-404)
      const posterCanvas = generateFilmPosterCanvas(film, 512, 768);
      const posterTexture = new THREE.CanvasTexture(posterCanvas);
      posterTexture.colorSpace = THREE.SRGBColorSpace;
      posterTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const cardWidth = 2.2;
      const cardHeight = 3.3;
      const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, 0.08);

      // Multi-material box: front face gets the poster texture, others dark metallic
      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x121620,
        roughness: 0.5,
        metalness: 0.8,
      });
      const frontMat = new THREE.MeshStandardMaterial({
        map: posterTexture,
        roughness: 0.35,
        metalness: 0.15,
        emissive: new THREE.Color(film.accentColor),
        emissiveIntensity: 0.08,
      });

      const materials = [
        sideMat, // right
        sideMat, // left
        sideMat, // top
        sideMat, // bottom
        frontMat, // front (+z)
        sideMat, // back
      ];

      const cardMesh = new THREE.Mesh(cardGeo, materials);
      cardMesh.position.y = 0.2;
      cardMesh.castShadow = !isSoftwareGl;
      (cardMesh as any).userData = { filmIndex: i, filmId: film.id };
      standGroup.add(cardMesh);
      cardMeshes.push(cardMesh);

      // 3. Beveled Gilded Frame Border
      const frameGeo = new THREE.BoxGeometry(cardWidth + 0.1, cardHeight + 0.1, 0.04);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x242d40,
        roughness: 0.3,
        metalness: 0.9,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, 0.2, -0.03);
      standGroup.add(frame);

      carouselGroup.add(standGroup);
    });

    cardMeshesRef.current = cardMeshes;

    // Raycasting for interactive card selection
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.recommendations-dock')) return;
      isDragging.current = true;
      prevMouseX.current = e.clientX;
      angularVelocity.current = 0;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - prevMouseX.current;
        prevMouseX.current = e.clientX;
        const deltaAngle = dx * 0.005;
        targetRotationY.current += deltaAngle;
        angularVelocity.current = deltaAngle;
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      // Snap to closest card
      const stepAngle = (Math.PI * 2) / total;
      // Current logical index at front (z = radius corresponds to angle = 0)
      const currentRot = targetRotationY.current;
      const nearestIdx = Math.round(-currentRot / stepAngle);
      const normalizedIdx = ((nearestIdx % total) + total) % total;

      targetRotationY.current = -nearestIdx * stepAngle;
      setSelectedIndex(normalizedIdx);
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.recommendations-dock')) return;
      if (Math.abs(angularVelocity.current) > 0.002) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(cardMeshesRef.current);
      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        if (hit.userData && typeof hit.userData.filmIndex === 'number') {
          selectFilmByIndex(hit.userData.filmIndex);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('click', onClick);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Silky Render Loop
    let frameId = 0;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Exponential damping on carousel rotation
      currentRotationY.current = THREE.MathUtils.damp(
        currentRotationY.current,
        targetRotationY.current,
        8,
        dt
      );

      if (carouselGroupRef.current) {
        carouselGroupRef.current.rotation.y = currentRotationY.current;
      }

      // Update spotlight color matching active film
      if (spotlightRef.current && scoredFilms[selectedIndex]) {
        const col = new THREE.Color(scoredFilms[selectedIndex].accentColor);
        spotlightRef.current.color.lerp(col, 0.08);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scoredFilms, selectFilmByIndex]);

  // Sync spotlight and camera when selected film changes
  useEffect(() => {
    if (spotlightRef.current && activeFilm) {
      spotlightRef.current.color.set(activeFilm.accentColor);
    }
  }, [activeFilm]);

  const handleDimensionChange = (key: keyof TasteProfile['dimensions'], val: number) => {
    onTasteProfileChange({
      ...tasteProfile,
      dimensions: {
        ...tasteProfile.dimensions,
        [key]: val,
      },
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#080a10] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Kicker / Spec Badge */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-none z-20">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Spatial 3D Constellation
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">Personalized Match Algorithm</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag horizontally to orbit · Click any pedestal to focus
          </p>
        </div>

        {/* Real-time Taste Profile Tuner Toggle Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowTuner(!showTuner)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showTuner
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                : 'bg-[#121622]/90 text-slate-300 border-white/10 hover:bg-[#1a2030] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Algorithm Weights</span>
          </button>
        </div>
      </div>

      {/* Interactive Algorithm Weight Tuner Drawer */}
      {showTuner && (
        <div className="recommendations-dock absolute top-16 right-6 w-80 bg-[#0e121c] border border-white/10 rounded-xl p-4 shadow-2xl z-30 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Taste Calibration
            </span>
            <button
              onClick={() => setShowTuner(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Visual Splendor</span>
                <span className="font-mono tabular-nums text-amber-400">
                  {tasteProfile.dimensions.visualSplendor}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={tasteProfile.dimensions.visualSplendor}
                onChange={(e) => handleDimensionChange('visualSplendor', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Emotional Depth</span>
                <span className="font-mono tabular-nums text-amber-400">
                  {tasteProfile.dimensions.emotionalDepth}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={tasteProfile.dimensions.emotionalDepth}
                onChange={(e) => handleDimensionChange('emotionalDepth', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Narrative Pace</span>
                <span className="font-mono tabular-nums text-amber-400">
                  {tasteProfile.dimensions.narrativePace}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={tasteProfile.dimensions.narrativePace}
                onChange={(e) => handleDimensionChange('narrativePace', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cerebral Mystery</span>
                <span className="font-mono tabular-nums text-amber-400">
                  {tasteProfile.dimensions.cerebralPlot}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={tasteProfile.dimensions.cerebralPlot}
                onChange={(e) => handleDimensionChange('cerebralPlot', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Unified Bottom Recommendation Dock (<= 15% Viewport footprint) */}
      <div
        className={`recommendations-dock absolute left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out z-20 ${
          isDockCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
        } bottom-4 w-[min(940px,94vw)]`}
      >
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1 px-4 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-[#0e121c] border-t border-x border-white/10 rounded-t-lg transition-colors cursor-pointer shadow-md"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Focused Film (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Focused Film Information & Direct Action Buttons */}
        <div className="bg-[#0e121c] border border-white/10 rounded-xl p-4 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Film Core Metadata (Zero-Pill Discipline) */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-amber-400 font-mono">
                  {activeFilm.matchScore}% MATCH
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300 font-medium">{activeFilm.genre}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{activeFilm.year}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{activeFilm.runtime}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Dir. {activeFilm.director}</span>
              </div>
              <h2 className="font-cinzel text-lg md:text-xl font-bold text-white tracking-wide">
                {activeFilm.title}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                {activeFilm.synopsis}
              </p>
            </div>

            {/* Actions: Watch in 3D Theater / Offline Download / Quick Modal */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                onClick={() => onSelectFilm(activeFilm)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#161c2b] hover:bg-[#1f273b] border border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Synopsis</span>
              </button>

              <button
                onClick={() => onDownloadFilm(activeFilm)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#161c2b] hover:bg-[#1f273b] border border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => onEnter3DTheater(activeFilm)}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-400/20 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch in 3D Cinema</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
