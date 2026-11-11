// Speed Racer GP — AAA Realistic 3D Midnight Street Racer (GTA & Cyberpunk Quality)
// 100% Framework-Free Pure TypeScript with Three.js & CSS2DRenderer
// Features: Procedural Asphalt & Carbon Fiber PBR Textures, 3D Supercars with Spinning Wheels,
// Dynamic Headlight Cones, Slipstream Drafting, Nitro Hyperdrive & 360 Victory Orbit

import * as THREE from 'three';
import { create3DGameFramework, Framework3DInstance } from '../../core/arcade-3d-framework.ts';
import {
  playTactileClick,
  playFinishFanfare,
  playNitroBoost,
  playOvertakeChime,
  playDriftScreech,
  playExhaustBackfire,
  playCarHorn,
  playPoliceSiren,
  speakMechVoice,
  playArcadeExplosion,
} from '../../utils/sound.ts';
import {
  createAsphaltTexture,
  createCarbonFiberTexture,
  createCitySkylineTexture,
} from '../../utils/procedural-textures.ts';
import { randomOf } from '../../core/corpora.ts';
import {
  GameInstanceHandle,
  ArcadeDifficulty,
  unlockArcadeTrophy,
  getActiveWeaponSkin,
} from './arcade-types.ts';
import { escapeHTML, finiteNumber } from '../../utils/html.ts';

export function startSpeedRacerGame(
  stageEl: HTMLElement,
  hudEl: HTMLElement,
  onEnd: (stats: { score: number; words: number; accuracy: number; maxCombo: number }) => void,
  difficulty: ArcadeDifficulty = 'elite'
): GameInstanceHandle {
  const RACING_PROMPTS = [
    'Accelerate beyond limits through muscle memory and synchronized mental clarity.',
    'Precision is the cornerstone of mastery, turning conscious effort into pure mechanical instinct.',
    'The asphalt blurs beneath twin thrusters as aerodynamic momentum defies the boundary of sound.',
    'Flow state unlocks absolute reaction time, where every keystroke flows directly into maximum velocity.',
    'Speed without accuracy is mere noise, but discipline transforms every keystroke into kinetic art.',
    'In the neon corridor of the speedway, each rhythmic tap propels the chassis past the threshold of light.',
    'Seamless coordination between eye and fingertip shatters every lap record in the cyber championship.',
    'Night city awakens under roaring turbochargers and blistering tire smoke as rivals duel for the cup.',
  ];

  const promptText = randomOf(RACING_PROMPTS);
  let charIndex = 0;
  let isRacing = false;
  let startTime = 0;
  let totalKeystrokes = 0;
  let correctKeystrokes = 0;
  let currentStreak = 0;
  let maxStreak = 0;

  let currentWpm = 0;
  let nitroEnergy = 0; // 0 to 100
  let isNitroActive = false;
  let isDrafting = false;
  let currentPlacement = 4;
  let isRaceFinished = false;

  // --- HUD INITIALIZATION ---
  hudEl.innerHTML = `
    <div class="arcade-hud-pills">
      <span class="arcade-pill">Position: <strong id="racer-hud-place" class="hud-accent" style="color:#4ade80;">4th / 4</strong></span>
      <span class="arcade-pill">Speed: <strong id="racer-hud-wpm" class="hud-accent">0 KM/H</strong></span>
      <span class="arcade-pill">Course: <strong id="racer-hud-progress" class="hud-accent">0%</strong></span>
      <span class="arcade-pill">Streak: <strong id="racer-hud-streak" class="hud-combo">x0</strong></span>
      <button class="arcade-pill" id="btn-toggle-weather" style="cursor:pointer;border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);" title="Cycle Environmental Weather (Tokyo Rain / Cyber Sunset / Neon Synth)">
        <span id="weather-label">🌧️ Tokyo Rain</span>
      </button>
      <span class="arcade-pill hud-game-tag">Speed Racer GP</span>
    </div>
  `;

  // --- 3D RACING FRAMEWORK SETUP ---
  const fw: Framework3DInstance = create3DGameFramework(stageEl, {
    fov: 65,
    camX: 0,
    camY: 3.2,
    camZ: 9.8,
    camRotX: -0.14,
    manualCameraControl: true,
    backgroundColor: 0x060310,
    fogColor: 0x060310,
    fogDensity: 0.007,
    ambientColor: 0x160a28,
    ambientIntensity: 0.85,
    keyColor: 0x38bdf8,
    keyIntensity: 2.8,
    fillColor: 0x4ade80,
    fillIntensity: 1.8,
    rimColor: 0xa855f7,
    rimIntensity: 3.2,
    starColor: 0x38bdf8,
    starSize: 0.85,
    starSpeed: 28,
  });

  const { scene, camera, shakeCamera, create3DExplosion, updateFX, dispose } = fw;

  // --- PROCEDURAL TEXTURES INITIALIZATION ---
  const { map: asphaltMap, roughnessMap: asphaltRoughness } = createAsphaltTexture();
  asphaltMap.repeat.set(4, 32);
  asphaltRoughness.repeat.set(4, 32);

  const carbonFiberTexture = createCarbonFiberTexture();
  const citySkylineTexture = createCitySkylineTexture();

  // --- 3D CITY ENVIRONMENT & DISTANT SKYLINE ---
  // Panoramic Cylinder Backdrop (City Skyline with glowing skyscrapers)
  const skylineGeo = new THREE.CylinderGeometry(140, 140, 60, 32, 1, true);
  const skylineMat = new THREE.MeshBasicMaterial({
    map: citySkylineTexture,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.95,
  });
  const skylineMesh = new THREE.Mesh(skylineGeo, skylineMat);
  skylineMesh.position.set(0, 18, -40);
  scene.add(skylineMesh);

  // --- 3D CYBER HIGHWAY TRACK ---
  const TRACK_LANES = [-4.5, -1.5, 1.5, 4.5]; // 4 distinct racing lanes
  const TRACK_LENGTH = 340;

  // Realistic PBR Asphalt Road
  const roadGeo = new THREE.PlaneGeometry(16, TRACK_LENGTH, 1, 64);
  roadGeo.rotateX(-Math.PI / 2);
  const roadMat = new THREE.MeshStandardMaterial({
    map: asphaltMap,
    roughnessMap: asphaltRoughness,
    roughness: 0.35,
    metalness: 0.45,
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.receiveShadow = true;
  roadMesh.position.set(0, -0.05, -TRACK_LENGTH / 2 + 10);
  scene.add(roadMesh);

  // Realistic Steel & Concrete Highway Guardrails with Thin Neon Guide Strips
  function createGuardrail(isLeft: boolean): THREE.Group {
    const railGrp = new THREE.Group();
    const rx = isLeft ? -8.2 : 8.2;
    const baseGeo = new THREE.BoxGeometry(0.55, 0.85, TRACK_LENGTH);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.75,
      roughness: 0.35,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(rx, 0.42, -TRACK_LENGTH / 2 + 10);
    railGrp.add(baseMesh);

    const stripGeo = new THREE.BoxGeometry(0.14, 0.1, TRACK_LENGTH);
    const stripMat = new THREE.MeshBasicMaterial({ color: isLeft ? 0x38bdf8 : 0x4ade80 });
    const stripMesh = new THREE.Mesh(stripGeo, stripMat);
    stripMesh.position.set(rx + (isLeft ? 0.24 : -0.24), 0.78, -TRACK_LENGTH / 2 + 10);
    railGrp.add(stripMesh);

    return railGrp;
  }
  const leftRail = createGuardrail(true);
  const rightRail = createGuardrail(false);
  scene.add(leftRail);
  scene.add(rightRail);

  // Neon Lane Dashes (Segmented streaming markers)
  const laneDashesGroup = new THREE.Group();
  const dashGeo = new THREE.BoxGeometry(0.14, 0.05, 3.8);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });

  for (let z = 10; z > -TRACK_LENGTH; z -= 7.5) {
    [-3.0, 0, 3.0].forEach((x) => {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(x, 0.02, z);
      laneDashesGroup.add(dash);
    });
  }
  scene.add(laneDashesGroup);

  // Overhead Cyber Gantries with Holographic Chevrons
  const gantriesGroup = new THREE.Group();
  for (let z = -20; z > -TRACK_LENGTH + 30; z -= 55) {
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, z);

    const postGeo = new THREE.CylinderGeometry(0.25, 0.25, 8.2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.2 });
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-8.2, 4.1, 0);
    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(8.2, 4.1, 0);
    archGroup.add(leftPost);
    archGroup.add(rightPost);

    const crossbarGeo = new THREE.BoxGeometry(17.2, 0.45, 0.7);
    const crossbarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
    const crossbar = new THREE.Mesh(crossbarGeo, crossbarMat);
    crossbar.position.set(0, 8.2, 0);
    archGroup.add(crossbar);

    const trimGeo = new THREE.BoxGeometry(16.8, 0.12, 0.75);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, 7.95, 0);
    archGroup.add(trimMesh);

    gantriesGroup.add(archGroup);
  }
  scene.add(gantriesGroup);

  // 3D Holographic Finish Line Gate
  const finishGateGroup = new THREE.Group();
  finishGateGroup.position.set(0, 0, -TRACK_LENGTH + 12);

  const finishArchGeo = new THREE.BoxGeometry(18, 1.0, 1.4);
  const finishArchMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
  const finishArch = new THREE.Mesh(finishArchGeo, finishArchMat);
  finishArch.position.set(0, 6.8, 0);
  finishGateGroup.add(finishArch);

  // Procedural Checkered Flag Canvas Texture
  const checkCanvas = document.createElement('canvas');
  checkCanvas.width = 256;
  checkCanvas.height = 64;
  const cCtx = checkCanvas.getContext('2d');
  if (cCtx) {
    const sq = 16;
    for (let y = 0; y < 64; y += sq) {
      for (let x = 0; x < 256; x += sq) {
        cCtx.fillStyle = ((x / sq + y / sq) % 2 === 0) ? '#ffffff' : '#090910';
        cCtx.fillRect(x, y, sq, sq);
      }
    }
  }
  const checkeredTex = new THREE.CanvasTexture(checkCanvas);
  checkeredTex.wrapS = THREE.RepeatWrapping;
  checkeredTex.wrapT = THREE.RepeatWrapping;

  // Checkered banner
  const bannerGeo = new THREE.PlaneGeometry(16, 2.4);
  const bannerMat = new THREE.MeshStandardMaterial({
    map: checkeredTex,
    side: THREE.DoubleSide,
    roughness: 0.3,
    metalness: 0.4,
  });
  const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
  bannerMesh.position.set(0, 5.2, 0);
  finishGateGroup.add(bannerMesh);

  // Chequered ground line
  const finishLineGroundGeo = new THREE.PlaneGeometry(16, 2.5);
  finishLineGroundGeo.rotateX(-Math.PI / 2);
  const finishLineGroundMat = new THREE.MeshStandardMaterial({
    map: checkeredTex,
    roughness: 0.4,
    metalness: 0.2,
  });
  const finishLineGround = new THREE.Mesh(finishLineGroundGeo, finishLineGroundMat);
  finishLineGround.position.set(0, 0.05, 0);
  finishGateGroup.add(finishLineGround);

  scene.add(finishGateGroup);

  // --- PROCEDURAL 3D SUPERCAR BUILDER (PBR Materials, Detailed Wheels & Calipers) ---
  interface SupercarHandle {
    group: THREE.Group;
    bodyMesh: THREE.Mesh;
    wingBlade: THREE.Mesh;
    wheelMeshes: THREE.Group[];
    caliperMeshes: THREE.Mesh[];
    thrusterFlames: THREE.Mesh[];
    headlights: THREE.SpotLight[];
    underglowLight: THREE.PointLight;
    laneX: number;
    currentZ: number;
    targetZ: number;
    name: string;
    targetWpm: number;
    hasBeenOvertaken: boolean;
  }

  function createDetailedSupercar(
    name: string,
    primaryColorHex: number,
    laneIndex: number,
    targetWpm: number,
    isPlayer = false
  ): SupercarHandle {
    const group = new THREE.Group();
    const laneX = TRACK_LANES[laneIndex];
    group.position.set(laneX, 0.5, isPlayer ? 0 : -8);

    // 1. Aerodynamic Supercar Main Monocoque Body
    const bodyGroup = new THREE.Group();

    // Lower Wedge Splitter / Floor
    const splitterGeo = new THREE.BoxGeometry(2.1, 0.15, 4.4);
    const carbonMat = new THREE.MeshStandardMaterial({
      map: carbonFiberTexture,
      roughness: 0.35,
      metalness: 0.85,
    });
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.08, 0);
    bodyGroup.add(splitter);

    // Sleek Upper Bodywork (Glossy PBR Car Paint)
    const hoodGeo = new THREE.BoxGeometry(1.9, 0.45, 2.2);
    const paintMat = new THREE.MeshStandardMaterial({
      color: primaryColorHex,
      metalness: 0.9,
      roughness: 0.18,
    });
    const hood = new THREE.Mesh(hoodGeo, paintMat);
    hood.position.set(0, 0.32, -0.9);
    hood.rotation.x = 0.08;
    bodyGroup.add(hood);

    const rearCabinGeo = new THREE.BoxGeometry(1.9, 0.55, 1.8);
    const rearCabin = new THREE.Mesh(rearCabinGeo, paintMat);
    rearCabin.position.set(0, 0.42, 0.9);
    bodyGroup.add(rearCabin);

    // 2. Tinted Glass Cockpit Canopy
    const canopyGeo = new THREE.SphereGeometry(0.75, 16, 16);
    canopyGeo.scale(1.1, 0.55, 1.6);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x06060c,
      metalness: 0.95,
      roughness: 0.08,
    });
    const canopy = new THREE.Mesh(canopyGeo, glassMat);
    canopy.position.set(0, 0.62, 0.1);
    bodyGroup.add(canopy);

    // 3. High-Downforce Carbon Rear Wing / Spoiler
    const wingBladeGeo = new THREE.BoxGeometry(2.3, 0.08, 0.55);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMat);
    wingBlade.position.set(0, 0.98, 1.95);
    bodyGroup.add(wingBlade);

    // Spoiler Struts
    [-0.65, 0.65].forEach((sx) => {
      const strutGeo = new THREE.BoxGeometry(0.06, 0.45, 0.15);
      const strut = new THREE.Mesh(strutGeo, carbonMat);
      strut.position.set(sx, 0.75, 1.95);
      bodyGroup.add(strut);
    });

    group.add(bodyGroup);

    // 4. Detailed 3D Alloy Wheels with Glowing Brake Calipers
    const wheelMeshes: THREE.Group[] = [];
    const caliperMeshes: THREE.Mesh[] = [];

    const wheelPositions = [
      [-1.05, 0.28, -1.25], // Front Left
      [1.05, 0.28, -1.25],  // Front Right
      [-1.08, 0.32, 1.25],  // Rear Left
      [1.08, 0.32, 1.25],   // Rear Right
    ];

    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.7, metalness: 0.2 });

    const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.32, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xc0c4cc, metalness: 0.95, roughness: 0.1 });

    const discGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 12);
    discGeo.rotateZ(Math.PI / 2);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x444448, metalness: 0.95, roughness: 0.2 });

    // Glowing Red-Hot Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
    const caliperMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(wx, wy, wz);

      const tire = new THREE.Mesh(tireGeo, tireMat);
      wheelAssembly.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelAssembly.add(rim);

      const disc = new THREE.Mesh(discGeo, discMat);
      wheelAssembly.add(disc);

      group.add(wheelAssembly);
      wheelMeshes.push(wheelAssembly);

      // Caliper stays fixed in orientation
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(wx > 0 ? wx - 0.06 : wx + 0.06, wy + 0.12, wz);
      group.add(caliper);
      caliperMeshes.push(caliper);
    });

    // 5. Dual Jet Thrusters, Tapered Afterburners & Crimson Supercar LED Taillight Bar
    const tailBarGeo = new THREE.BoxGeometry(1.75, 0.1, 0.08);
    const tailBarMat = new THREE.MeshBasicMaterial({ color: 0xff1144 });
    const tailBar = new THREE.Mesh(tailBarGeo, tailBarMat);
    tailBar.position.set(0, 0.48, 1.82);
    bodyGroup.add(tailBar);

    const thrusterFlames: THREE.Mesh[] = [];
    [-0.5, 0.5].forEach((tx) => {
      // Titanium Exhaust Nozzle
      const nozzleGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.45, 12);
      nozzleGeo.rotateX(Math.PI / 2);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.15 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.set(tx, 0.22, 2.08);
      group.add(nozzle);

      // Glowing Plasma Flame Cone (tapers OUTWARDS backwards from nozzle!)
      const flameGeo = new THREE.ConeGeometry(0.14, 1.15, 10);
      flameGeo.rotateX(Math.PI / 2);
      const flameMat = new THREE.MeshBasicMaterial({
        color: isPlayer ? 0x38bdf8 : primaryColorHex,
        transparent: true,
        opacity: 0.78,
      });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(tx, 0.22, 2.75);
      group.add(flame);
      thrusterFlames.push(flame);
    });

    // 6. Dynamic Headlights & Proper Forward Volumetric Beam Projections
    const headlights: THREE.SpotLight[] = [];
    if (isPlayer) {
      [-0.7, 0.7].forEach((hx) => {
        const spot = new THREE.SpotLight(0xffffff, 4.0, 45, 0.45, 0.4, 1.5);
        spot.position.set(hx, 0.35, -2.1);
        spot.target.position.set(hx, 0, -35);
        group.add(spot);
        group.add(spot.target);
        headlights.push(spot);

        // Volumetric light beam cone (Apex at headlight z=-2.1, widening FORWARD into darkness!)
        const coneGeo = new THREE.ConeGeometry(1.5, 22, 12, 1, true);
        coneGeo.rotateX(Math.PI / 2);
        const coneMat = new THREE.MeshBasicMaterial({
          color: 0x93c5fd,
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const coneMesh = new THREE.Mesh(coneGeo, coneMat);
        coneMesh.position.set(hx, 0.28, -13.1);
        group.add(coneMesh);
      });
    }

    // 7. Neon Underglow Light
    const underglowLight = new THREE.PointLight(primaryColorHex, 2.5, 9);
    underglowLight.position.set(0, -0.1, 0);
    group.add(underglowLight);

    scene.add(group);

    return {
      group,
      bodyMesh: hood,
      wingBlade,
      wheelMeshes,
      caliperMeshes,
      thrusterFlames,
      headlights,
      underglowLight,
      laneX,
      currentZ: group.position.z,
      targetZ: group.position.z,
      name,
      targetWpm,
      hasBeenOvertaken: false,
    };
  }

  // Spawn Player & 3 High-Performance AI Rivals
  const activeSkin = getActiveWeaponSkin();
  const playerCar = createDetailedSupercar('APEX-GT', activeSkin.accentColor || 0x10b981, 1, 0, true);
  const rivalTargets =
    difficulty === 'nightmare'
      ? [68, 88, 108]
      : difficulty === 'cadet'
      ? [46, 62, 76]
      : [52, 70, 86];

  const rivals: SupercarHandle[] = [
    createDetailedSupercar('VIPER-GTR', 0xf59e0b, 0, rivalTargets[0]),
    createDetailedSupercar('CRIMSON-FURY', 0xf43f5e, 2, rivalTargets[1]),
    createDetailedSupercar('PHANTOM-X', 0xa855f7, 3, rivalTargets[2]),
  ];

  // --- ATMOSPHERIC CYBER RAIN SYSTEM (Midnight Neon Weather) ---
  const RAIN_COUNT = 750;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(RAIN_COUNT * 3);
  const rainVelocities: number[] = [];

  for (let i = 0; i < RAIN_COUNT; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 36;
    rainPositions[i * 3 + 1] = Math.random() * 24;
    rainPositions[i * 3 + 2] = 15 - Math.random() * 180;
    rainVelocities.push(28 + Math.random() * 16);
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

  const rainMat = new THREE.PointsMaterial({
    color: 0xa5f3fc,
    size: 0.28,
    transparent: true,
    opacity: 0.65,
  });
  const rainParticles = new THREE.Points(rainGeo, rainMat);
  scene.add(rainParticles);

  // Dynamic Weather & Atmospheric Lighting Switcher
  type WeatherPreset = 'rain' | 'sunset' | 'synthwave';
  let currentWeather: WeatherPreset = 'rain';

  function applyWeather(preset: WeatherPreset): void {
    currentWeather = preset;
    const weatherLabel = hudEl.querySelector('#weather-label');
    if (preset === 'rain') {
      rainParticles.visible = true;
      scene.fog = new THREE.FogExp2(0x06060c, 0.012);
      (skylineMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      if (weatherLabel) weatherLabel.innerHTML = '🌧️ Tokyo Rain';
    } else if (preset === 'sunset') {
      rainParticles.visible = false;
      scene.fog = new THREE.FogExp2(0x1a0720, 0.009);
      (skylineMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff9966);
      if (weatherLabel) weatherLabel.innerHTML = '🌅 Cyber Sunset';
    } else {
      rainParticles.visible = false;
      scene.fog = new THREE.FogExp2(0x0a001a, 0.011);
      (skylineMesh.material as THREE.MeshBasicMaterial).color.setHex(0xcc66ff);
      if (weatherLabel) weatherLabel.innerHTML = '🌌 Neon Synth';
    }
  }

  hudEl.querySelector('#btn-toggle-weather')?.addEventListener('click', () => {
    playTactileClick('button');
    const nextPreset: WeatherPreset =
      currentWeather === 'rain' ? 'sunset' : currentWeather === 'sunset' ? 'synthwave' : 'rain';
    applyWeather(nextPreset);
  });

  // --- VOLUMETRIC TIRE SMOKE PARTICLES ---
  const SMOKE_COUNT = 64;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePositions = new Float32Array(SMOKE_COUNT * 3);
  const smokeVelocities: THREE.Vector3[] = [];
  const smokeLifes = new Float32Array(SMOKE_COUNT);

  for (let i = 0; i < SMOKE_COUNT; i++) {
    smokePositions[i * 3] = 0;
    smokePositions[i * 3 + 1] = -100;
    smokePositions[i * 3 + 2] = 0;
    smokeVelocities.push(new THREE.Vector3());
    smokeLifes[i] = 0;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));

  const smokeMat = new THREE.PointsMaterial({
    color: 0xe2e8f0,
    size: 1.8,
    transparent: true,
    opacity: 0.55,
  });
  const smokePoints = new THREE.Points(smokeGeo, smokeMat);
  scene.add(smokePoints);

  let nextSmokeIdx = 0;
  function emitTireSmoke(isDrift = false): void {
    const rearOffsets = [-1.08, 1.08];
    const posAttr = smokeGeo.attributes.position as THREE.BufferAttribute;
    rearOffsets.forEach((ox) => {
      const idx = nextSmokeIdx % SMOKE_COUNT;
      nextSmokeIdx++;
      posAttr.setXYZ(
        idx,
        playerCar.group.position.x + ox + (Math.random() - 0.5) * 0.15,
        0.35 + Math.random() * 0.15,
        playerCar.group.position.z + 1.35
      );
      smokeVelocities[idx].set(
        (Math.random() - 0.5) * (isDrift ? 2.5 : 1.0),
        1.2 + Math.random() * 1.4,
        (currentWpm * 0.4) + Math.random() * 2
      );
      smokeLifes[idx] = 1.0;
    });
    posAttr.needsUpdate = true;
  }

  // --- ROADSIDE HOLOGRAPHIC CYBER BILLBOARDS ---
  const billboardGroup = new THREE.Group();
  const BILLBOARD_CONFIGS = [
    { text: 'SANTYPES RACING GP', z: -25, isLeft: true, color: 0x38bdf8 },
    { text: 'OCTANE OVERDRIVE', z: -80, isLeft: false, color: 0x4ade80 },
    { text: 'HYPERDRIVE NITRO', z: -140, isLeft: true, color: 0xa855f7 },
    { text: 'CYBER HIGHWAY 2077', z: -200, isLeft: false, color: 0xf59e0b },
    { text: 'APEX GT // WINNER', z: -260, isLeft: true, color: 0xf43f5e },
  ];

  BILLBOARD_CONFIGS.forEach((cfg) => {
    const boardGroup = new THREE.Group();
    const bx = cfg.isLeft ? -11.5 : 11.5;
    boardGroup.position.set(bx, 5.2, cfg.z);

    const pylonGeo = new THREE.CylinderGeometry(0.3, 0.4, 6.5, 8);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.set(0, -2.2, -0.35);
    boardGroup.add(pylon);

    // Procedural Neon LED Billboard Ad Canvas Texture
    const bbCanvas = document.createElement('canvas');
    bbCanvas.width = 512;
    bbCanvas.height = 192;
    const bbCtx = bbCanvas.getContext('2d');
    const hexStr = '#' + cfg.color.toString(16).padStart(6, '0');
    if (bbCtx) {
      bbCtx.fillStyle = '#070914';
      bbCtx.fillRect(0, 0, 512, 192);
      bbCtx.strokeStyle = hexStr;
      bbCtx.lineWidth = 8;
      bbCtx.strokeRect(8, 8, 496, 176);
      bbCtx.fillStyle = hexStr;
      bbCtx.font = 'bold 38px "JetBrains Mono", monospace';
      bbCtx.textAlign = 'center';
      bbCtx.textBaseline = 'middle';
      bbCtx.shadowColor = hexStr;
      bbCtx.shadowBlur = 14;
      bbCtx.fillText(cfg.text, 256, 96);
    }
    const bbTex = new THREE.CanvasTexture(bbCanvas);

    const boardGeo = new THREE.BoxGeometry(6.5, 2.4, 0.4);
    const boardMat = new THREE.MeshStandardMaterial({
      map: bbTex,
      emissiveMap: bbTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.85,
      roughness: 0.25,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardGroup.add(boardMesh);

    // Solid Neon Frame Backing (NO WIREFRAME)
    const borderGeo = new THREE.BoxGeometry(6.7, 2.6, 0.2);
    const borderMat = new THREE.MeshBasicMaterial({ color: cfg.color });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.z = -0.12;
    boardGroup.add(borderMesh);

    billboardGroup.add(boardGroup);
  });
  scene.add(billboardGroup);

  // --- SLIPSTREAM AERODYNAMIC WIND STREAKS ---
  const streamGeo = new THREE.BufferGeometry();
  const streamPositions = new Float32Array([
    -1.2, 0.4, -1.8, -1.4, 0.5, 3.5,
    1.2, 0.4, -1.8, 1.4, 0.5, 3.5,
    -1.0, 0.8, -1.2, -1.2, 0.9, 3.2,
    1.0, 0.8, -1.2, 1.2, 0.9, 3.2,
  ]);
  streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
  const streamMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
  });
  const streamLines = new THREE.LineSegments(streamGeo, streamMat);
  playerCar.group.add(streamLines);

  // --- HOLOGRAPHIC RACING DASHBOARD OVERLAY ---
  const overlayEl = document.createElement('div');
  overlayEl.className = 'racer-3d-overlay';
  overlayEl.innerHTML = `
    <!-- Top Speedo & Placement Bar -->
    <div class="racer-dash-top">
      <div class="racer-position-badge">
        <span class="racer-position-val" id="dash-position">4TH</span>
        <span class="racer-position-total">/ 4</span>
      </div>

      <div class="racer-speedometer-box">
        <span class="racer-speedo-val" id="dash-wpm">0 <small style="font-size:12px;color:var(--text-muted);">KM/H</small></span>
        <div class="racer-nitro-meter" title="Type clean streaks to unleash Nitro Hyperdrive!">
          <div class="racer-nitro-fill" id="dash-nitro-fill"></div>
        </div>
      </div>
    </div>

    <!-- Center Holographic Cockpit Prompt HUD -->
    <div class="racer-hologram-card" id="racer-hologram-card">
      <div class="racer-hologram-text" id="racer-text-display"></div>
    </div>
  `;
  stageEl.appendChild(overlayEl);

  const textDisplay = overlayEl.querySelector('#racer-text-display') as HTMLElement;
  const cardEl = overlayEl.querySelector('#racer-hologram-card') as HTMLElement;
  const dashPosEl = overlayEl.querySelector('#dash-position') as HTMLElement;
  const dashWpmEl = overlayEl.querySelector('#dash-wpm') as HTMLElement;
  const dashNitroEl = overlayEl.querySelector('#dash-nitro-fill') as HTMLElement;

  function renderPrompt(): void {
    const typed = promptText.slice(0, charIndex);
    const current = promptText[charIndex] || '';
    const remaining = promptText.slice(charIndex + 1);

    textDisplay.innerHTML = `
      <span class="char-typed">${escapeHTML(typed)}</span><span class="char-current">${current === ' ' ? '&nbsp;' : escapeHTML(current || ' ')}</span><span>${escapeHTML(remaining)}</span>
    `;
  }

  renderPrompt();

  function spawnOvertakeBanner(text: string): void {
    const el = document.createElement('div');
    el.className = 'combat-dmg-float parry';
    el.style.left = '50%';
    el.style.top = '28%';
    el.textContent = text;
    stageEl.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  // --- GTA POLICE PURSUIT HEAT LEVEL SYSTEM ---
  let isPoliceDroneActive = false;
  let policeDroneGroup: THREE.Group | null = null;
  let policeRedLight: THREE.PointLight | null = null;
  let policeBlueLight: THREE.PointLight | null = null;
  let policeSirenTimer = 0;
  let pursuitHudEl: HTMLElement | null = null;

  function showPursuitHud(show: boolean): void {
    if (show) {
      if (!pursuitHudEl) {
        pursuitHudEl = document.createElement('div');
        pursuitHudEl.className = 'racer-pursuit-hud';
        pursuitHudEl.innerHTML = `
          <span style="font-size:22px;">🚨</span>
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#ef4444;font-weight:900;letter-spacing:1px;">HEAT LEVEL 3 // PURSUIT</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#ffffff;font-weight:800;">HIT HYPERDRIVE TO EVADE!</div>
          </div>
        `;
        stageEl.appendChild(pursuitHudEl);
      }
    } else {
      if (pursuitHudEl) {
        pursuitHudEl.remove();
        pursuitHudEl = null;
      }
    }
  }

  function spawnPoliceInterceptor(): void {
    if (isPoliceDroneActive || isRaceFinished) return;
    isPoliceDroneActive = true;
    playPoliceSiren();
    speakMechVoice('Warning: Cyber police interceptor locked on! Shake the pursuit!');

    policeDroneGroup = new THREE.Group();

    // Sleek aerodynamic quad-rotor interceptor body
    const droneBodyGeo = new THREE.BoxGeometry(1.6, 0.4, 2.2);
    const droneMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const droneBody = new THREE.Mesh(droneBodyGeo, droneMat);
    policeDroneGroup.add(droneBody);

    // Strobe lights on roof
    policeRedLight = new THREE.PointLight(0xff0044, 4, 15);
    policeRedLight.position.set(-0.6, 0.4, 0);
    policeDroneGroup.add(policeRedLight);

    policeBlueLight = new THREE.PointLight(0x0088ff, 4, 15);
    policeBlueLight.position.set(0.6, 0.4, 0);
    policeDroneGroup.add(policeBlueLight);

    // Emergency Roof Strobe Bar mesh
    const barGeo = new THREE.BoxGeometry(1.4, 0.15, 0.3);
    const barMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const barMesh = new THREE.Mesh(barGeo, barMat);
    barMesh.position.set(0, 0.28, 0);
    policeDroneGroup.add(barMesh);

    // Searchlight facing forward-down
    const searchLight = new THREE.SpotLight(0xffffff, 3.5, 30, Math.PI / 6, 0.4);
    searchLight.position.set(0, -0.2, -0.5);
    searchLight.target.position.set(0, -3, -10);
    policeDroneGroup.add(searchLight);
    policeDroneGroup.add(searchLight.target);

    policeDroneGroup.position.set(-5.8, 4.4, -14);
    policeDroneGroup.scale.set(0.75, 0.75, 0.75);
    scene.add(policeDroneGroup);

    showPursuitHud(true);
  }

  function disablePoliceInterceptor(): void {
    if (!isPoliceDroneActive || !policeDroneGroup) return;
    isPoliceDroneActive = false;
    showPursuitHud(false);

    // Detonate drone with EMP burst
    create3DExplosion(policeDroneGroup.position.clone(), new THREE.Color(0x38bdf8), 28);
    create3DExplosion(policeDroneGroup.position.clone(), new THREE.Color(0xffeedd), 16);
    playArcadeExplosion();
    speakMechVoice('Police pursuit lost! Clean getaway confirmed!');
    spawnOvertakeBanner('⚡ PURSUIT EVADED! +500 PTS');

    scene.remove(policeDroneGroup);
    policeDroneGroup = null;
    policeRedLight = null;
    policeBlueLight = null;
  }

  // --- KEYBOARD INPUT ENGINE ---
  function onKeyDown(e: KeyboardEvent): void {
    if (isRaceFinished || charIndex >= promptText.length) return;

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      totalKeystrokes++;

      if (!isRacing) {
        isRacing = true;
        startTime = performance.now();
        playNitroBoost();
      }

      if (e.key === promptText[charIndex]) {
        charIndex++;
        correctKeystrokes++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;

        playTactileClick('key');
        nitroEnergy = Math.min(100, nitroEnergy + 7.5);

        // High-speed exhaust backfire pop & tire smoke puff
        if (currentStreak % 2 === 0 && (currentWpm >= 45 || isNitroActive)) {
          playExhaustBackfire();
          emitTireSmoke(false);
          const leftNozzle = new THREE.Vector3(playerCar.group.position.x - 0.5, 0.65, playerCar.group.position.z + 2.3);
          const rightNozzle = new THREE.Vector3(playerCar.group.position.x + 0.5, 0.65, playerCar.group.position.z + 2.3);
          create3DExplosion(leftNozzle, new THREE.Color(isNitroActive ? 0x38bdf8 : 0xf97316), 5, 0.24);
          create3DExplosion(rightNozzle, new THREE.Color(isNitroActive ? 0x38bdf8 : 0xf97316), 5, 0.24);
        }

        // Nitro Hyperdrive Activation (on 15+ streak)
        if (currentStreak >= 15 && !isNitroActive) {
          isNitroActive = true;
          playNitroBoost();
          shakeCamera(0.65);
          cardEl.classList.add('nitro-glow');
          spawnOvertakeBanner('HYPERDRIVE ENGAGED!');
          if (isPoliceDroneActive) {
            disablePoliceInterceptor();
          }
        }

        renderPrompt();
        updateRaceMetrics();

        // Finish Line Crossing Check
        if (charIndex >= promptText.length) {
          finishRace();
        }
      } else {
        // Keystroke Error
        currentStreak = 0;
        nitroEnergy = Math.max(0, nitroEnergy - 20);
        isNitroActive = false;
        cardEl.classList.remove('nitro-glow');
        playTactileClick('error');
        playDriftScreech();
        shakeCamera(0.4);
        emitTireSmoke(true);
        playerCar.wingBlade.rotation.x = 0.32; // Airbrake pop!

        if (isPoliceDroneActive && policeDroneGroup) {
          policeDroneGroup.position.z = Math.max(playerCar.group.position.z + 4.5, policeDroneGroup.position.z - 1.2);
          playPoliceSiren();
        }

        renderPrompt();
        updateRaceMetrics();
      }
    }
  }

  function updateRaceMetrics(): void {
    if (!startTime) return;
    const elapsedSec = (performance.now() - startTime) / 1000;
    const elapsedMin = elapsedSec / 60;
    const words = charIndex / 5;
    currentWpm = elapsedMin > 0 ? Math.round(words / elapsedMin) : 0;
    const progress = Math.min(1, charIndex / promptText.length);
    const speedKmh = Math.round(currentWpm * 2.2);

    // Update Top HUD
    const hudWpmEl = document.getElementById('racer-hud-wpm');
    const hudProgEl = document.getElementById('racer-hud-progress');
    const hudStreakEl = document.getElementById('racer-hud-streak');

    if (hudWpmEl) hudWpmEl.textContent = `${speedKmh} KM/H (${currentWpm} WPM)`;
    if (hudProgEl) hudProgEl.textContent = `${Math.round(progress * 100)}%`;
    if (hudStreakEl) hudStreakEl.textContent = `x${currentStreak}`;

    // Update Cockpit Dash
    if (dashWpmEl) {
      dashWpmEl.innerHTML = `${finiteNumber(speedKmh, 0, 0)} <small style="font-size:12px;color:var(--text-muted);">KM/H</small>`;
    }
    if (dashNitroEl) {
      dashNitroEl.style.width = `${nitroEnergy}%`;
      dashNitroEl.classList.toggle('overdrive', isNitroActive);
    }

    const speedoBox = overlayEl.querySelector('.racer-speedometer-box');
    if (speedoBox) {
      speedoBox.classList.toggle('speedo-redline', speedKmh >= 130);
    }

    // Trigger GTA Police Interceptor when exceeding speed threshold
    if ((speedKmh >= 70 || currentStreak >= 10) && !isPoliceDroneActive && !isRaceFinished && progress < 0.88) {
      spawnPoliceInterceptor();
    }
  }

  function finishRace(): void {
    if (isRaceFinished) return;
    isRaceFinished = true;

    playFinishFanfare();
    shakeCamera(1.2);

    // Launch 3D laser fireworks from finish gate
    const gatePos = finishGateGroup.position;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (isStopped) return;
        const fireworkPos = new THREE.Vector3(
          gatePos.x + (Math.random() - 0.5) * 16,
          gatePos.y + 2 + Math.random() * 6,
          gatePos.z + (Math.random() - 0.5) * 6
        );
        create3DExplosion(fireworkPos, new THREE.Color(i % 2 === 0 ? 0x4ade80 : 0x38bdf8), 35);
      }, i * 160);
    }

    const elapsedMin = Math.max(1 / 60000, (performance.now() - startTime) / 60000);
    const diffMultiplier = difficulty === 'nightmare' ? 1.5 : difficulty === 'cadet' ? 0.85 : 1.0;
    const finalWpm = Math.max(1, Math.round(((charIndex / 5) / elapsedMin) * diffMultiplier));
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

    if (finalWpm >= 100) {
      unlockArcadeTrophy('hyperdriveAce');
    }
    if (accuracy >= 98) {
      unlockArcadeTrophy('deadeyeSniper');
    }

    setTimeout(() => {
      if (isStopped) return;
      onEnd({
        score: finalWpm,
        words: promptText.split(' ').length,
        accuracy: Math.min(100, accuracy),
        maxCombo: maxStreak,
      });
    }, 1400);
  }

  window.addEventListener('keydown', onKeyDown);

  // --- ANIMATION & 3D SIMULATION LOOP ---
  let lastFrameTime = performance.now();
  let animationId: number | null = null;
  let isStopped = false;
  let totalDistanceDriven = 0;
  let victoryOrbitAngle = 0;

  function animate(now: number): void {
    if (!fw) return;
    const rawDelta = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (!fw.isPaused) {
      const delta = rawDelta;

      // Calculate driving speed proportional to current typing WPM
      const baseVelocity = isRacing ? Math.max(14, currentWpm * 0.78) : 8;
      const nitroMultiplier = isNitroActive ? 1.5 : isDrafting ? 1.15 : 1.0;
      const effectiveSpeed = baseVelocity * nitroMultiplier;

      totalDistanceDriven += effectiveSpeed * delta;

      // 1. Scroll Road Surface Texture (Seamless asphalt motion)
      asphaltMap.offset.y -= (effectiveSpeed * delta * 0.04);
      asphaltRoughness.offset.y -= (effectiveSpeed * delta * 0.04);

      // 2. Scroll Lane Dashes & Overhead Gantries
      laneDashesGroup.children.forEach((dash) => {
        dash.position.z += effectiveSpeed * delta;
        if (dash.position.z > 14) {
          dash.position.z -= TRACK_LENGTH * 0.8;
        }
      });

      gantriesGroup.children.forEach((gantry) => {
        gantry.position.z += effectiveSpeed * delta;
        if (gantry.position.z > 14) {
          gantry.position.z -= TRACK_LENGTH * 0.75;
        }
      });

      // Move Finish Gate into view as race nears completion
      const progress = Math.min(1, charIndex / promptText.length);
      const remainingDistance = (1 - progress) * 85;
      finishGateGroup.position.z = -remainingDistance;

      // 3. Realistic 3D Wheel Rotation Physics
      const wheelAngularVelocity = effectiveSpeed * 2.8;
      playerCar.wheelMeshes.forEach((w) => {
        w.children.forEach((mesh) => {
          mesh.rotation.x += wheelAngularVelocity * delta;
        });
      });

      rivals.forEach((rival) => {
        rival.wheelMeshes.forEach((w) => {
          w.children.forEach((mesh) => {
            mesh.rotation.x += (rival.targetWpm * 0.78 * 2.8) * delta;
          });
        });
      });

      // 4. Animate Supercar Suspension & Afterburner Flares
      playerCar.group.position.y = 0.42 + Math.sin(now * 0.007) * 0.04;
      playerCar.group.rotation.z = Math.sin(now * 0.003) * 0.02; // Subtle banking
      playerCar.group.rotation.x = isNitroActive ? -0.07 : 0;     // Nose lift on nitro

      // Stretch exhaust flame cones dynamically
      const flameScale = 1.0 + (effectiveSpeed / 36);
      playerCar.thrusterFlames.forEach((flame) => {
        flame.scale.set(1.0, flameScale, 1.0);
        (flame.material as THREE.MeshBasicMaterial).color.setHex(isNitroActive ? 0x38bdf8 : 0x4ade80);
      });

      // 5. AI Rivals Physics & Realistic Overtakes
      if (isRacing && !isRaceFinished) {
        let betterCarsCount = 0;
        let detectedDraft = false;

        rivals.forEach((rival, idx) => {
          // Rival speed curve with realistic human-like pacing micro-variations
          const rivalSpeed = (rival.targetWpm * 0.78) * (0.95 + Math.sin(now * 0.0012 + idx) * 0.07);
          const relativeVelocity = rivalSpeed - effectiveSpeed;

          // Relative Z position relative to player's viewpoint
          rival.targetZ += relativeVelocity * delta;
          rival.group.position.z = THREE.MathUtils.lerp(rival.group.position.z, rival.targetZ, 0.1);

          // Suspension hover vibration for rivals
          rival.group.position.y = 0.42 + Math.sin(now * 0.006 + idx) * 0.04;

          // Slipstream drafting detection (in front of player within 18m and in adjacent lane)
          const zDistance = -rival.group.position.z;
          const xDistance = Math.abs(rival.group.position.x - playerCar.group.position.x);
          if (zDistance > 2 && zDistance < 18 && xDistance < 2.5) {
            detectedDraft = true;
          }

          // Check if rival is ahead or behind player
          if (rival.group.position.z < -0.6) {
            betterCarsCount++; // Rival is leading
          } else if (!rival.hasBeenOvertaken && rival.group.position.z >= 0.6) {
            // Overtake executed!
            rival.hasBeenOvertaken = true;
            playOvertakeChime();
            playCarHorn();
            shakeCamera(0.4);
            spawnOvertakeBanner(`OVERTAKE! PASSED ${rival.name}`);
          }

          // Check sideswipe grinding collision sparks
          const distZ = Math.abs(rival.group.position.z - playerCar.group.position.z);
          const distX = Math.abs(rival.group.position.x - playerCar.group.position.x);
          if (distZ < 2.8 && distX < 2.4 && !rival.hasBeenOvertaken) {
            const sparkX = (rival.group.position.x + playerCar.group.position.x) / 2;
            create3DExplosion(new THREE.Vector3(sparkX, 0.45, rival.group.position.z), new THREE.Color(0xfacc15), 5);
          }
        });

        // Animate Police Pursuit Interceptor Drone hovering ahead on highway flank
        if (isPoliceDroneActive && policeDroneGroup) {
          policeSirenTimer += delta * 12;
          const strobe = Math.sin(policeSirenTimer) > 0;
          if (policeRedLight) policeRedLight.intensity = strobe ? 5 : 0.3;
          if (policeBlueLight) policeBlueLight.intensity = strobe ? 0.3 : 5;

          const targetSideX = Math.sin(now * 0.0018) * 5.2;
          policeDroneGroup.position.x = THREE.MathUtils.lerp(policeDroneGroup.position.x, targetSideX, 0.06);
          policeDroneGroup.position.y = 4.2 + Math.sin(now * 0.004) * 0.35;
          policeDroneGroup.position.z = THREE.MathUtils.lerp(policeDroneGroup.position.z, playerCar.group.position.z - 14.0, 0.06);
          policeDroneGroup.rotation.z = (targetSideX - policeDroneGroup.position.x) * -0.05;
        }

        // Camera Dynamic FOV Warp Surge (65 -> 74 -> 84)
        const targetFov = isNitroActive ? 84 : currentWpm > 45 ? 74 : 65;
        if (Math.abs(camera.fov - targetFov) > 0.1) {
          camera.fov += (targetFov - camera.fov) * Math.min(1, delta * 8);
          camera.updateProjectionMatrix();
        }

        // Active Aero Rear Spoiler Dynamics
        const targetSpoilerAngle = isNitroActive ? -0.06 : 0.08;
        playerCar.wingBlade.rotation.x = THREE.MathUtils.lerp(playerCar.wingBlade.rotation.x, targetSpoilerAngle, 0.12);

        // Update Cyber Rain Streaks
        const rainPosAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < RAIN_COUNT; i++) {
          let y = rainPosAttr.getY(i) - (rainVelocities[i] * delta);
          let z = rainPosAttr.getZ(i) + ((effectiveSpeed * 0.85 + 24) * delta);
          if (y < 0 || z > 16) {
            y = 22 + Math.random() * 4;
            z = -140 + Math.random() * 30;
            rainPosAttr.setX(i, (Math.random() - 0.5) * 36);
          }
          rainPosAttr.setY(i, y);
          rainPosAttr.setZ(i, z);
        }
        rainPosAttr.needsUpdate = true;

        // Update Volumetric Tire Smoke
        const smokePosAttr = smokeGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < SMOKE_COUNT; i++) {
          if (smokeLifes[i] > 0) {
            smokeLifes[i] -= delta * 1.8;
            smokePosAttr.setXYZ(
              i,
              smokePosAttr.getX(i) + smokeVelocities[i].x * delta,
              smokePosAttr.getY(i) + smokeVelocities[i].y * delta,
              smokePosAttr.getZ(i) + smokeVelocities[i].z * delta
            );
          } else {
            smokePosAttr.setY(i, -100);
          }
        }
        smokePosAttr.needsUpdate = true;

        // Update Roadside Holographic Billboards
        billboardGroup.children.forEach((board) => {
          board.position.z += effectiveSpeed * delta;
          if (board.position.z > 16) {
            board.position.z -= 280;
          }
        });

        // Update Slipstream Streamline Lines Opacity
        streamMat.opacity = THREE.MathUtils.lerp(streamMat.opacity, isDrafting ? 0.85 : 0, 0.15);

        isDrafting = detectedDraft;

        // Update Placement (1st, 2nd, 3rd, 4th)
        const placement = betterCarsCount + 1;
        if (placement !== currentPlacement) {
          currentPlacement = placement;
          const ordinal = placement === 1 ? '1ST' : placement === 2 ? '2ND' : placement === 3 ? '3RD' : '4TH';
          if (dashPosEl) {
            dashPosEl.textContent = ordinal;
            dashPosEl.style.color = placement === 1 ? '#4ade80' : placement === 2 ? '#38bdf8' : '#f59e0b';
          }
          const hudPlaceEl = document.getElementById('racer-hud-place');
          if (hudPlaceEl) {
            hudPlaceEl.textContent = `${ordinal} / 4`;
            hudPlaceEl.style.color = placement === 1 ? '#4ade80' : placement === 2 ? '#38bdf8' : '#f59e0b';
          }
        }
      }

      // 6. Camera Dynamics (G-Force Chase Cam / Speed Warp FOV / Victory Orbit)
      if (isRaceFinished) {
        // Cinematic Slow-Motion Victory 360 Orbit Camera
        victoryOrbitAngle += delta * 1.2;
        const orbitRadius = 8.5;
        camera.position.x = Math.sin(victoryOrbitAngle) * orbitRadius;
        camera.position.z = Math.cos(victoryOrbitAngle) * orbitRadius;
        camera.position.y = 2.8;
        camera.lookAt(playerCar.group.position.x, playerCar.group.position.y + 0.4, playerCar.group.position.z);
      } else {
        const gForceLagZ = 9.8 + (effectiveSpeed / 40) * 1.6;
        const cameraHeight = 3.2 - (isNitroActive ? 0.35 : 0);
        const engineRumble = isRacing ? (effectiveSpeed / 50) * 0.025 : 0;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerCar.group.position.x * 0.45 + (Math.sin(now * 0.04) * engineRumble), 0.1);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraHeight + (Math.cos(now * 0.03) * engineRumble), 0.1);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, gForceLagZ, 0.1);

        const targetFov = isNitroActive ? 76 : isRacing ? 69 : 65;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
        camera.updateProjectionMatrix();

        camera.lookAt(playerCar.group.position.x * 0.65, 1.1, -15);
      }

      updateFX(delta);
    }

    animationId = requestAnimationFrame(animate);
  }

  animationId = requestAnimationFrame(animate);

  // --- CLEAN TEARDOWN ---
  function stop(): void {
    isStopped = true;
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('keydown', onKeyDown);

    showPursuitHud(false);
    if (policeDroneGroup) {
      scene.remove(policeDroneGroup);
      policeDroneGroup = null;
    }

    if (overlayEl && overlayEl.parentNode) {
      overlayEl.remove();
    }

    // Clean up Three.js scenes, meshes, materials, textures
    scene.remove(roadMesh);
    scene.remove(leftRail);
    scene.remove(rightRail);
    scene.remove(laneDashesGroup);
    scene.remove(gantriesGroup);
    scene.remove(finishGateGroup);
    scene.remove(billboardGroup);
    scene.remove(rainParticles);
    scene.remove(smokePoints);
    scene.remove(skylineMesh);
    scene.remove(playerCar.group);
    rivals.forEach((r) => scene.remove(r.group));

    rainGeo.dispose();
    rainMat.dispose();
    smokeGeo.dispose();
    smokeMat.dispose();
    streamGeo.dispose();
    streamMat.dispose();

    roadGeo.dispose();
    roadMat.dispose();
    asphaltMap.dispose();
    asphaltRoughness.dispose();
    carbonFiberTexture.dispose();
    citySkylineTexture.dispose();
    checkeredTex.dispose();
    skylineGeo.dispose();
    skylineMat.dispose();

    dispose();
  }

  return { stop, id: 'speedRacer' };
}
