import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Film, TheaterSeatPreset, TheaterSettings } from '../types';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sun,
  Eye,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface ThreeCinemaProps {
  film: Film;
  videoSrc: string; // can be online URL or offline cached blobUrl
  isOffline: boolean;
  onExit: () => void;
}

export const ThreeCinema: React.FC<ThreeCinemaProps> = ({
  film,
  videoSrc,
  isOffline,
  onExit,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // UI state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePreset, setActivePreset] = useState<TheaterSeatPreset>('center_vip');
  const [houseLights, setHouseLights] = useState(0.12); // subtle ambient when movie runs
  const [projectorOn, setProjectorOn] = useState(true);

  // Three.js mutable state refs (to avoid canvas re-creation)
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const screenLightRef = useRef<THREE.SpotLight | null>(null);
  const houseLightsRef = useRef<THREE.PointLight[]>([]);
  const projectorBeamRef = useRef<THREE.Mesh | null>(null);

  // Target camera position & lookAt for smooth damping
  const targetCamPos = useRef(new THREE.Vector3(0, 1.8, 8.5));
  const targetCamLook = useRef(new THREE.Vector3(0, 2.5, 0));
  const currentLook = useRef(new THREE.Vector3(0, 2.5, 0));

  // Seat coordinate presets
  const seatPresets: Record<TheaterSeatPreset, { pos: [number, number, number]; look: [number, number, number]; label: string; desc: string }> = {
    center_vip: {
      pos: [0, 1.8, 8.5],
      look: [0, 2.6, 0],
      label: 'Center VIP (Row 4)',
      desc: 'Balanced eye-level acoustics and perfect viewing angle',
    },
    front_orchestra: {
      pos: [0, 1.2, 5.0],
      look: [0, 2.7, 0],
      label: 'Front Orchestra (Row 1)',
      desc: 'Immersive giant-screen field of view',
    },
    balcony_box: {
      pos: [4.2, 4.2, 11.5],
      look: [-0.5, 2.3, 0],
      label: 'Royal Balcony Box',
      desc: 'Opulent elevated perspective overlooking the hall',
    },
    directors_chair: {
      pos: [0, 2.6, 12.0],
      look: [0, 2.5, 0],
      label: "Director's Loge",
      desc: 'Wide panoramic view of screen and architectural stage',
    },
  };

  const handleSeatChange = useCallback((preset: TheaterSeatPreset) => {
    setActivePreset(preset);
    const config = seatPresets[preset];
    targetCamPos.current.set(...config.pos);
    targetCamLook.current.set(...config.look);
  }, []);

  // Initialize Three.js Cinema Room
  useEffect(() => {
    const container = mountRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

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

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#07090e');
    scene.fog = new THREE.FogExp2('#07090e', 0.04);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 8.5);
    cameraRef.current = camera;

    // Renderer
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

    // Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Video Texture for Cinema Screen
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTextureRef.current = videoTexture;

    // Build Procedural Grand Cinema Components (3-12 parts per structure)

    // 1. Curved Cinema Screen
    const screenWidth = 10.5;
    const screenHeight = 4.8;
    const screenSegments = 32;
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight, screenSegments, 1);
    
    // Add subtle cinematic curvature to the screen
    const posAttr = screenGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const curveZ = -Math.pow(x / (screenWidth * 0.5), 2) * 0.55;
      posAttr.setZ(i, curveZ);
    }
    screenGeo.computeVertexNormals();

    const screenMat = new THREE.MeshStandardMaterial({
      map: videoTexture,
      roughness: 0.9,
      metalness: 0.05,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: videoTexture,
      emissiveIntensity: 0.85,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 3.2, 0);
    scene.add(screenMesh);
    screenMeshRef.current = screenMesh;

    // Screen Bezel & Gold Frame
    const frameGeo = new THREE.BoxGeometry(screenWidth + 0.4, screenHeight + 0.4, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.6,
      metalness: 0.8,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 3.2, -0.1);
    scene.add(frameMesh);

    // Gilded Proscenium Arch details
    const archGroup = new THREE.Group();
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // burnished gold
      metalness: 0.85,
      roughness: 0.25,
    });
    
    // Top arch pediment
    const pedimentGeo = new THREE.BoxGeometry(screenWidth + 1.2, 0.35, 0.4);
    const pediment = new THREE.Mesh(pedimentGeo, goldTrimMat);
    pediment.position.set(0, 3.2 + screenHeight * 0.5 + 0.25, 0);
    archGroup.add(pediment);

    // Side classical pillars
    [-1, 1].forEach((side) => {
      const pillarGeo = new THREE.CylinderGeometry(0.28, 0.32, screenHeight + 1.2, 16);
      const pillar = new THREE.Mesh(pillarGeo, goldTrimMat);
      pillar.position.set(side * (screenWidth * 0.5 + 0.5), 3.0, 0);
      archGroup.add(pillar);
    });
    scene.add(archGroup);

    // 2. Stage Floor & Tiered Auditorium Seating
    const stageGeo = new THREE.BoxGeometry(screenWidth + 4, 0.6, 3.5);
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1c140e,
      roughness: 0.7,
      metalness: 0.1,
    });
    const stage = new THREE.Mesh(stageGeo, darkWoodMat);
    stage.position.set(0, 0.3, 0.8);
    scene.add(stage);

    // Tiered Theater Floor
    const theaterFloorGeo = new THREE.BoxGeometry(18, 0.4, 20);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x180d12, // deep burgundy carpet
      roughness: 0.95,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(theaterFloorGeo, carpetMat);
    floor.position.set(0, -0.2, 10);
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Plush Velvet Cinema Seats (Built as composite multi-part models)
    const seatsGroup = new THREE.Group();
    const velvetMat = new THREE.MeshStandardMaterial({
      color: 0x8a131b, // rich theater velvet
      roughness: 0.85,
      metalness: 0.1,
    });
    const woodArmrestMat = new THREE.MeshStandardMaterial({
      color: 0x2e1b10, // dark polished walnut
      roughness: 0.4,
      metalness: 0.2,
    });
    const metalStanchionMat = new THREE.MeshStandardMaterial({
      color: 0x111115,
      roughness: 0.5,
      metalness: 0.8,
    });

    // 5 Rows of Curved Seating
    const rowCounts = [7, 9, 11, 11, 9];
    const rowZPositions = [4.8, 6.6, 8.5, 10.4, 12.3];
    const rowYElevations = [0.2, 0.6, 1.0, 1.4, 1.8];

    rowZPositions.forEach((rowZ, rowIndex) => {
      const count = rowCounts[rowIndex];
      const rowY = rowYElevations[rowIndex];
      const spacing = 1.05;
      const startX = -((count - 1) * spacing) * 0.5;

      // Tier riser step
      const stepGeo = new THREE.BoxGeometry(count * spacing + 1.2, 0.4, 1.8);
      const stepMesh = new THREE.Mesh(stepGeo, carpetMat);
      stepMesh.position.set(0, rowY - 0.2, rowZ);
      stepMesh.receiveShadow = !isSoftwareGl;
      seatsGroup.add(stepMesh);

      for (let s = 0; s < count; s++) {
        const chairX = startX + s * spacing;
        // Subtle curve towards center
        const curveOffsetZ = Math.pow(chairX / 7, 2) * 0.4;
        const chairAngle = -chairX * 0.04;

        const chair = new THREE.Group();
        chair.position.set(chairX, rowY, rowZ + curveOffsetZ);
        chair.rotation.y = chairAngle;

        // Seat cushion
        const cushionGeo = new THREE.BoxGeometry(0.65, 0.15, 0.55);
        const cushion = new THREE.Mesh(cushionGeo, velvetMat);
        cushion.position.set(0, 0.4, 0);
        cushion.castShadow = !isSoftwareGl;
        chair.add(cushion);

        // Seat backrest (with ergonomic tilt)
        const backGeo = new THREE.BoxGeometry(0.65, 0.65, 0.14);
        const back = new THREE.Mesh(backGeo, velvetMat);
        back.position.set(0, 0.72, -0.22);
        back.rotation.x = 0.08;
        chair.add(back);

        // Armrests
        [-0.36, 0.36].forEach((sideX) => {
          const armGeo = new THREE.BoxGeometry(0.09, 0.08, 0.45);
          const arm = new THREE.Mesh(armGeo, woodArmrestMat);
          arm.position.set(sideX, 0.55, -0.05);
          chair.add(arm);

          // Armrest metal support
          const supportGeo = new THREE.BoxGeometry(0.04, 0.45, 0.04);
          const support = new THREE.Mesh(supportGeo, metalStanchionMat);
          support.position.set(sideX, 0.28, -0.05);
          chair.add(support);
        });

        // Center leg
        const legGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8);
        const leg = new THREE.Mesh(legGeo, metalStanchionMat);
        leg.position.set(0, 0.2, 0);
        chair.add(leg);

        seatsGroup.add(chair);
      }
    });
    scene.add(seatsGroup);

    // 3. Auditorium Walls with Acoustic Wood Slats & Classical Sconces
    const wallsGroup = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x141720,
      roughness: 0.9,
    });

    // Left & Right Walls
    [-1, 1].forEach((side) => {
      const wallGeo = new THREE.BoxGeometry(0.3, 8, 24);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(side * 8.5, 3.6, 9);
      wallsGroup.add(wall);

      // Acoustic wood panels along the side
      for (let p = 0; p < 7; p++) {
        const panelGeo = new THREE.BoxGeometry(0.12, 5.5, 1.4);
        const panel = new THREE.Mesh(panelGeo, darkWoodMat);
        panel.position.set(side * 8.32, 3.4, 3 + p * 2.5);
        wallsGroup.add(panel);

        // Brass Art-Deco Wall Sconces
        const sconceGroup = new THREE.Group();
        sconceGroup.position.set(side * 8.2, 4.2, 3 + p * 2.5);
        
        const sconceGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.35, 8);
        const sconceFixture = new THREE.Mesh(sconceGeo, goldTrimMat);
        sconceGroup.add(sconceFixture);

        // Warm Sconce Light
        const sconceLight = new THREE.PointLight(0xffb366, 0.2, 7);
        sconceLight.position.set(side * -0.2, 0.1, 0);
        sconceGroup.add(sconceLight);
        houseLightsRef.current.push(sconceLight);

        wallsGroup.add(sconceGroup);
      }
    });

    // Rear wall
    const backWallGeo = new THREE.BoxGeometry(18, 8, 0.3);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 3.6, 20);
    wallsGroup.add(backWall);

    // Ceiling with coffered acoustic beams
    const ceilingGeo = new THREE.BoxGeometry(18, 0.4, 24);
    const ceiling = new THREE.Mesh(ceilingGeo, wallMat);
    ceiling.position.set(0, 7.6, 9);
    wallsGroup.add(ceiling);

    scene.add(wallsGroup);

    // 4. Dynamic Screen Projection Lighting
    // Casts dynamic movie color/light onto front rows
    const screenLight = new THREE.SpotLight(0xffffff, 1.4, 18, Math.PI / 3, 0.6, 1.2);
    screenLight.position.set(0, 3.2, 0.2);
    screenLight.target.position.set(0, 0.8, 7.0);
    scene.add(screenLight);
    scene.add(screenLight.target);
    screenLightRef.current = screenLight;

    // Subtle overhead house light
    const overheadFill = new THREE.HemisphereLight(0x243048, 0x140e0a, 0.25);
    scene.add(overheadFill);

    // 5. Volumetric Projector Beam from Rear Booth
    const beamGeo = new THREE.ConeGeometry(3.6, 17, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xbed8ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const projectorBeam = new THREE.Mesh(beamGeo, beamMat);
    projectorBeam.position.set(0, 5.0, 9.5);
    projectorBeam.rotation.x = Math.PI / 2 + 0.14;
    scene.add(projectorBeam);
    projectorBeamRef.current = projectorBeam;

    // Mouse interactive gentle look-around / orbit
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const lookEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.cinema-dock')) return;
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      // Adjust camera look target smoothly
      targetCamLook.current.x -= dx * 0.006;
      targetCamLook.current.y = Math.max(0.5, Math.min(5.5, targetCamLook.current.y + dy * 0.006));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

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

    // Render Loop with Silky Exponential Damping
    let frameId = 0;
    let lastTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth camera position damping
      camera.position.lerp(targetCamPos.current, 1 - Math.exp(-6 * dt));

      // Smooth camera lookAt damping
      currentLook.current.lerp(targetCamLook.current, 1 - Math.exp(-7 * dt));
      camera.lookAt(currentLook.current);

      // Subtle projector flicker animation
      if (projectorBeamRef.current && projectorOn) {
        projectorBeamRef.current.visible = true;
        beamMat.opacity = 0.06 + Math.sin(now * 0.015) * 0.015;
      } else if (projectorBeamRef.current) {
        projectorBeamRef.current.visible = false;
      }

      // Update video texture if playing
      if (video && !video.paused) {
        videoTexture.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // Auto-play the video
    video.play().catch(() => {
      setIsPlaying(false);
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);

      // Cleanup WebGL resources
      renderer.dispose();
      videoTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update house lights based on state slider
  useEffect(() => {
    houseLightsRef.current.forEach((light) => {
      light.intensity = houseLights * 0.45;
    });
  }, [houseLights]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 1);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      videoRef.current.muted = next;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mountRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full h-screen bg-[#07090e] overflow-hidden select-none">
      {/* Hidden HTML5 Video element feeding the Three.js 3D screen texture */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        crossOrigin="anonymous"
        loop
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Full-bleed 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Header: Minimal Title & Exit Action */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#121622]/90 hover:bg-[#1a2030] hover:text-white border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Theater</span>
          </button>
          <div className="px-3 py-1 text-xs text-amber-300/90 bg-amber-950/40 border border-amber-500/20 rounded-md font-medium">
            Virtual Grand Cinema
          </div>
          {isOffline && (
            <div className="px-2.5 py-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 rounded-md font-mono">
              Offline Cache Active
            </div>
          )}
        </div>

        <div className="pointer-events-auto text-right">
          <h1 className="font-cinzel text-base md:text-lg font-bold text-white tracking-wide">
            {film.title}
          </h1>
          <p className="text-xs text-slate-400">
            {film.year} · {film.genre} · {seatPresets[activePreset].label}
          </p>
        </div>
      </div>

      {/* Unified Bottom Cinema Dock (<= 15% Viewport footprint, no backdrop-filter) */}
      <div
        className={`cinema-dock absolute left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out z-20 ${
          isDockCollapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
        } bottom-4 w-[min(960px,94vw)]`}
      >
        {/* Dock Collapse / Expand Toggle Button */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1 px-4 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-[#0e121c] border-t border-x border-white/10 rounded-t-lg transition-colors cursor-pointer shadow-md"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container: Solid rgba surfaces */}
        <div className="bg-[#0e121c] border border-white/10 rounded-xl p-3 md:p-4 shadow-2xl space-y-3">
          {/* Progress Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tabular-nums text-slate-400 min-w-[36px]">
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
            <span className="text-[11px] font-mono tabular-nums text-slate-400 min-w-[36px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
            {/* Playback & Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="flex items-center gap-1.5 text-slate-300">
                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Seat Vantage Point Switcher */}
            <div className="flex items-center gap-1 bg-[#161c2b] p-1 rounded-lg border border-white/5">
              {(Object.keys(seatPresets) as TheaterSeatPreset[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleSeatChange(key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activePreset === key
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={seatPresets[key].desc}
                >
                  {key === 'center_vip'
                    ? 'Center VIP'
                    : key === 'front_orchestra'
                    ? 'Orchestra'
                    : key === 'balcony_box'
                    ? 'Balcony'
                    : "Director's"}
                </button>
              ))}
            </div>

            {/* Environmental Adjustments */}
            <div className="flex items-center gap-4 text-xs text-slate-300">
              {/* House Lights Dimmer */}
              <div className="flex items-center gap-1.5" title="Auditorium House Lights Dimmer">
                <Sun className="w-3.5 h-3.5 text-amber-400/80" />
                <span className="text-[11px] text-slate-400">Lights</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={houseLights}
                  onChange={(e) => setHouseLights(parseFloat(e.target.value))}
                  className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Projector Beam Toggle */}
              <button
                onClick={() => setProjectorOn(!projectorOn)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                  projectorOn
                    ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                    : 'text-slate-500 border-white/5'
                }`}
                title="Toggle Projector Volumetric Cone"
              >
                <Sparkles className="w-3 h-3" />
                <span>Projector</span>
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
