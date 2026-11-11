// Santypes 3D Game Framework powered by Three.js & CSS2DRenderer
// Shared WebGLRenderer context reuse, distance-independent DOM labels, multi-lighting & particle FX
// 100% Framework-Free Pure TypeScript

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { escapeHTML } from '../utils/html.ts';

export interface Framework3DOptions {
  fov?: number;
  camX?: number;
  camY?: number;
  camZ?: number;
  camRotX?: number;
  camRotY?: number;
  backgroundColor?: number;
  fogColor?: number;
  fogDensity?: number;
  ambientColor?: number;
  ambientIntensity?: number;
  keyColor?: number | THREE.Color;
  keyIntensity?: number;
  fillColor?: number | THREE.Color;
  fillIntensity?: number;
  rimColor?: number | THREE.Color;
  rimIntensity?: number;
  enableStarfield?: boolean;
  starCount?: number;
  starColor?: number;
  starSize?: number;
  starSpeed?: number;
  manualCameraControl?: boolean;
  enableShadows?: boolean;
  maxPixelRatio?: number;
}

export interface Label2DHandle {
  labelObj: CSS2DObject;
  element: HTMLDivElement;
  setText: (newText: string) => void;
  setWordProgress: (fullWord: string, typedLength: number, isLocked?: boolean) => void;
  setHighlight: (isHl: boolean) => void;
  setError: (isErr: boolean) => void;
  dispose: () => void;
}

export interface Framework3DInstance {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  primaryColor: THREE.Color;
  secondaryColor: THREE.Color;
  shakeCamera: (intensity?: number) => void;
  create3DExplosion: (pos: THREE.Vector3, color?: THREE.Color, count?: number, size?: number) => void;
  fireLaserBeam: (fromPos: THREE.Vector3, toPos: THREE.Vector3, color?: THREE.Color) => void;
  create2DLabel: (text: string, options?: { offsetY?: number; highlight?: boolean; error?: boolean; className?: string }) => Label2DHandle;
  updateFX: (delta: number) => void;
  resize: () => void;
  dispose: () => void;
  isPaused: boolean;
}

// Module-level persistent singleton renderers shared across all 3D games
let sharedWebGLRenderer: THREE.WebGLRenderer | null = null;
let sharedCSS2DRenderer: CSS2DRenderer | null = null;
let sharedEnvRT: THREE.WebGLRenderTarget | null = null;
let sharedParticleTex: THREE.CanvasTexture | null = null;

function getSharedParticleTexture(): THREE.CanvasTexture {
  if (!sharedParticleTex) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    sharedParticleTex = new THREE.CanvasTexture(c);
  }
  return sharedParticleTex;
}

function getSharedRenderers(stageWidth: number, stageHeight: number): {
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  envTexture: THREE.Texture;
} {
  if (!sharedWebGLRenderer) {
    sharedWebGLRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'default',
    });
    sharedWebGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    sharedWebGLRenderer.shadowMap.enabled = false;
    sharedWebGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sharedWebGLRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    sharedWebGLRenderer.toneMappingExposure = 1.25;

    // Generate procedural PBR Image-Based Lighting (IBL) reflection environment
    const pmrem = new THREE.PMREMGenerator(sharedWebGLRenderer);
    pmrem.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    sharedEnvRT = pmrem.fromScene(roomEnv, 0.04);
    roomEnv.dispose();
    pmrem.dispose();

    sharedWebGLRenderer.domElement.style.position = 'absolute';
    sharedWebGLRenderer.domElement.style.top = '0px';
    sharedWebGLRenderer.domElement.style.left = '0px';
    sharedWebGLRenderer.domElement.style.width = '100%';
    sharedWebGLRenderer.domElement.style.height = '100%';
    sharedWebGLRenderer.domElement.style.borderRadius = '14px';

    sharedCSS2DRenderer = new CSS2DRenderer();
    sharedCSS2DRenderer.domElement.style.position = 'absolute';
    sharedCSS2DRenderer.domElement.style.top = '0px';
    sharedCSS2DRenderer.domElement.style.left = '0px';
    sharedCSS2DRenderer.domElement.style.width = '100%';
    sharedCSS2DRenderer.domElement.style.height = '100%';
    sharedCSS2DRenderer.domElement.style.pointerEvents = 'none';
    sharedCSS2DRenderer.domElement.style.zIndex = '10';
  }

  sharedWebGLRenderer.setSize(stageWidth, stageHeight);
  sharedCSS2DRenderer!.setSize(stageWidth, stageHeight);

  return {
    renderer: sharedWebGLRenderer,
    labelRenderer: sharedCSS2DRenderer!,
    envTexture: sharedEnvRT!.texture,
  };
}

export function create3DGameFramework(
  containerEl: HTMLElement,
  options: Framework3DOptions = {}
): Framework3DInstance {
  const stageWidth = Math.max(containerEl.clientWidth || 800, 320);
  const stageHeight = Math.max(containerEl.clientHeight || 460, 240);

  // 1. Theme Color Extraction
  const primaryHex = (
    typeof getComputedStyle === 'function'
      ? getComputedStyle(document.documentElement)?.getPropertyValue('--accent-cyan') || '#38bdf8'
      : '#38bdf8'
  ).trim();
  const secondaryHex = (
    typeof getComputedStyle === 'function'
      ? getComputedStyle(document.documentElement)?.getPropertyValue('--accent-purple') || '#a855f7'
      : '#a855f7'
  ).trim();

  const primaryColor = new THREE.Color(primaryHex);
  const secondaryColor = new THREE.Color(secondaryHex);

  // 2. Scene, Camera, & Shared Renderers
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(options.backgroundColor ?? 0x070913);

  if (options.fogColor !== undefined) {
    scene.fog = new THREE.FogExp2(options.fogColor, options.fogDensity ?? 0.008);
  }

  const camera = new THREE.PerspectiveCamera(
    options.fov ?? 60,
    stageWidth / stageHeight,
    0.1,
    1000
  );
  camera.position.set(options.camX ?? 0, options.camY ?? 2, options.camZ ?? 24);
  if (options.camRotX !== undefined) camera.rotation.x = options.camRotX;
  if (options.camRotY !== undefined) camera.rotation.y = options.camRotY;

  const { renderer, labelRenderer, envTexture } = getSharedRenderers(stageWidth, stageHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.maxPixelRatio ?? 1.25));
  renderer.shadowMap.enabled = Boolean(options.enableShadows);
  renderer.setSize(stageWidth, stageHeight);

  // Assign real PBR HDR Reflection Environment so metallic chassis & supercars catch crisp specular reflections!
  scene.environment = envTexture;
  scene.environmentIntensity = 0.9;

  containerEl.style.position = 'relative';
  containerEl.style.overflow = 'hidden';

  if (renderer.domElement.parentNode !== containerEl) {
    containerEl.appendChild(renderer.domElement);
  }
  if (labelRenderer.domElement.parentNode !== containerEl) {
    containerEl.appendChild(labelRenderer.domElement);
  }

  // 3. Multi-Light Setup (Key, Fill, Rim, Hemisphere + Foreground Fill)
  const ambientLight = new THREE.AmbientLight(
    options.ambientColor ?? 0xffffff,
    options.ambientIntensity ?? 1.1
  );
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 1.15);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(
    options.keyColor ?? primaryColor,
    options.keyIntensity ?? 2.2
  );
  keyLight.position.set(16, 28, 22);
  keyLight.castShadow = Boolean(options.enableShadows);
  if (keyLight.castShadow) {
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 150;
    keyLight.shadow.bias = -0.0005;
  }
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(
    options.fillColor ?? secondaryColor,
    options.fillIntensity ?? 1.4
  );
  fillLight.position.set(-18, 12, 16);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(
    options.rimColor ?? 0xffffff,
    options.rimIntensity ?? 2.2,
    160
  );
  rimLight.position.set(0, 15, -40);
  scene.add(rimLight);

  // 4. Parallax Ambient Particles / Soft Glowing Motes System (NO UGLY SQUARES)
  let starfield: THREE.Points | null = null;
  if (options.enableStarfield !== false) {
    const starCount = options.starCount ?? 160;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 220;
      starPos[i + 1] = 8 + Math.random() * 140;
      starPos[i + 2] = -Math.random() * 260;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: options.starColor ?? 0xffffff,
      size: (options.starSize ?? 0.85) * 1.4,
      map: getSharedParticleTexture(),
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);
  }

  // 5. Internal FX Tracker, Laser Beams & Camera Shake
  interface ParticleSystemItem {
    system: THREE.Points;
    geo: THREE.BufferGeometry;
    mat: THREE.PointsMaterial;
    vels: number[];
    life: number;
  }
  let particles: ParticleSystemItem[] = [];

  interface ActiveLaserBeam {
    line: THREE.Line;
    geo: THREE.BufferGeometry;
    mat: THREE.LineBasicMaterial;
    life: number;
  }
  let activeLasers: ActiveLaserBeam[] = [];

  let cameraShake = 0;
  let isPaused = false;
  let lastRenderTime = 0;

  function shakeCamera(intensity = 1.0): void {
    cameraShake = Math.max(cameraShake, intensity);
  }

  function fireLaserBeam(fromPos: THREE.Vector3, toPos: THREE.Vector3, color = primaryColor): void {
    const points = [fromPos.clone(), toPos.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color,
      linewidth: 3,
      transparent: true,
      opacity: 1,
    });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 40;
    scene.add(line);

    activeLasers.push({
      line,
      geo,
      mat,
      life: 0.18, // 180ms flash
    });
  }

  function create3DExplosion(pos: THREE.Vector3, color = secondaryColor, count = 36, size = 0.85): void {
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(count * 3);
    const pVels: number[] = [];

    for (let i = 0; i < count; i++) {
      pPos[i * 3] = pos.x;
      pPos[i * 3 + 1] = pos.y;
      pPos[i * 3 + 2] = pos.z;

      pVels.push(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color,
      size,
      map: getSharedParticleTexture(),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pSystem = new THREE.Points(pGeo, pMat);
    pSystem.renderOrder = 50;
    scene.add(pSystem);

    particles.push({
      system: pSystem,
      geo: pGeo,
      mat: pMat,
      vels: pVels,
      life: 1.0,
    });
  }

  // 6. CSS2D DOM Label Creator (Distance-Independent 100% Crisp Labels)
  function create2DLabel(
    text: string,
    opts: { offsetY?: number; highlight?: boolean; error?: boolean; className?: string } = {}
  ): Label2DHandle {
    const div = document.createElement('div');
    div.className = 'arcade-3d-label';
    if (opts.highlight) div.classList.add('highlight');
    if (opts.error) div.classList.add('error');
    if (opts.className) {
      opts.className.split(/\s+/).filter(Boolean).forEach((cls) => div.classList.add(cls));
    }

    div.textContent = text;

    const labelObj = new CSS2DObject(div);
    labelObj.position.set(0, opts.offsetY ?? 2.4, 0);

    return {
      labelObj,
      element: div,
      setText: (newText: string) => {
        div.textContent = newText;
      },
      setWordProgress: (fullWord: string, typedLength: number, isLocked = false) => {
        const clampedTyped = Math.max(0, Math.min(typedLength, fullWord.length));
        const matchedPart = fullWord.slice(0, clampedTyped);
        const nextChar = fullWord[clampedTyped] || '';
        const remainingPart = fullWord.slice(clampedTyped + 1);

        div.classList.toggle('matched', isLocked || clampedTyped > 0);
        div.classList.toggle('highlight', isLocked);

        div.innerHTML = `
          <span class="label-char-matched">${escapeHTML(matchedPart)}</span>${nextChar ? `<span class="label-char-next">${escapeHTML(nextChar)}</span>` : ''}<span class="label-char-remain">${escapeHTML(remainingPart)}</span>
        `;
      },
      setHighlight: (isHl: boolean) => {
        div.classList.toggle('highlight', isHl);
        div.classList.toggle('matched', isHl);
      },
      setError: (isErr: boolean) => {
        div.classList.toggle('error', isErr);
      },
      dispose: () => {
        if (div.parentNode) div.parentNode.removeChild(div);
      },
    };
  }

  // 7. Auto Resize Listener & ResizeObserver
  let isDisposed = false;
  let initialResizeRafId: number | null = null;

  function onResize(): void {
    if (isDisposed || !containerEl || !containerEl.isConnected) return;
    const w = Math.max(containerEl.clientWidth || 800, 320);
    const h = Math.max(containerEl.clientHeight || 460, 240);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(containerEl);
  }

  // Trigger initial frame sizing
  initialResizeRafId = requestAnimationFrame(() => {
    initialResizeRafId = null;
    onResize();
  });

  function onVisibilityChange(): void {
    isPaused = document.hidden;
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // 8. Framework Update Loop Helpers
  function updateFX(delta: number): void {
    if (starfield) {
      starfield.position.z += delta * (options.starSpeed ?? 16);
      if (starfield.position.z > 80) starfield.position.z = 0;
    }

    if (options.manualCameraControl) {
      if (cameraShake > 0) {
        camera.position.x += (Math.random() - 0.5) * cameraShake;
        camera.position.y += (Math.random() - 0.5) * cameraShake;
        cameraShake = Math.max(0, cameraShake - delta * 4);
      }
    } else {
      if (cameraShake > 0) {
        camera.position.x = (options.camX ?? 0) + (Math.random() - 0.5) * cameraShake;
        camera.position.y = (options.camY ?? 2) + (Math.random() - 0.5) * cameraShake;
        cameraShake = Math.max(0, cameraShake - delta * 4);
      } else {
        camera.position.set(options.camX ?? 0, options.camY ?? 2, options.camZ ?? 24);
        if (options.camRotX !== undefined) camera.rotation.x = options.camRotX;
        if (options.camRotY !== undefined) camera.rotation.y = options.camRotY;
      }
    }

    // Update Lasers
    for (let i = activeLasers.length - 1; i >= 0; i--) {
      const l = activeLasers[i];
      l.life -= delta;
      l.mat.opacity = Math.max(0, l.life / 0.18);
      if (l.life <= 0) {
        scene.remove(l.line);
        l.geo.dispose();
        l.mat.dispose();
        activeLasers.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= delta * 2.2;
      p.mat.opacity = Math.max(0, p.life);

      const posAttr = p.geo.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < p.vels.length / 3; k++) {
        posAttr.setXYZ(
          k,
          posAttr.getX(k) + p.vels[k * 3] * delta,
          posAttr.getY(k) + p.vels[k * 3 + 1] * delta,
          posAttr.getZ(k) + p.vels[k * 3 + 2] * delta
        );
      }
      posAttr.needsUpdate = true;

      if (p.life <= 0) {
        scene.remove(p.system);
        p.geo.dispose();
        p.mat.dispose();
        particles.splice(i, 1);
      }
    }

    // Pace WebGL + CSS2D compositing to ~60Hz max on 120/144/165Hz panels
    // to keep laptop GPU/CPU thermals cool without dropping frames on 60Hz displays.
    const now = performance.now();
    if (lastRenderTime === 0 || now - lastRenderTime >= 12.5) {
      lastRenderTime = now;
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }
  }

  // 9. Disposal / Cleanup
  function dispose(): void {
    isDisposed = true;
    if (initialResizeRafId !== null) {
      cancelAnimationFrame(initialResizeRafId);
      initialResizeRafId = null;
    }
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    particles.forEach((p) => {
      scene.remove(p.system);
      p.geo.dispose();
      p.mat.dispose();
    });
    particles = [];

    activeLasers.forEach((l) => {
      scene.remove(l.line);
      l.geo.dispose();
      l.mat.dispose();
    });
    activeLasers = [];

    if (starfield) {
      scene.remove(starfield);
      starfield.geometry.dispose();
      (starfield.material as THREE.Material).dispose();
    }

    ambientLight.dispose();
    hemiLight.dispose();
    keyLight.dispose();
    fillLight.dispose();
    rimLight.dispose();

    scene.clear();
    labelRenderer.domElement.innerHTML = '';
    renderer.clear();
  }

  return {
    scene,
    camera,
    renderer,
    labelRenderer,
    primaryColor,
    secondaryColor,
    shakeCamera,
    create3DExplosion,
    fireLaserBeam,
    create2DLabel,
    updateFX,
    resize: onResize,
    dispose,
    get isPaused() {
      return isPaused;
    },
  };
}
