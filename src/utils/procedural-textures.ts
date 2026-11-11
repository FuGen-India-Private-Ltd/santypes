// Santypes Procedural PBR Texture Generator
// Zero external network requests, zero bundle weight, in-memory Canvas textures
// Provides realistic surface detail for asphalt, carbon fiber, metal paneling, and city backdrops

import * as THREE from 'three';

/**
 * Procedural asphalt road texture with fine aggregate noise, wear, and wet specular mapping.
 */
export function createAsphaltTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base dark asphalt color
    ctx.fillStyle = '#141419';
    ctx.fillRect(0, 0, 512, 512);

    // Aggregate gravel noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 36;
      data[i] = Math.max(10, Math.min(45, 22 + noise));     // R
      data[i + 1] = Math.max(10, Math.min(45, 23 + noise)); // G
      data[i + 2] = Math.max(15, Math.min(55, 28 + noise)); // B
    }
    ctx.putImageData(imgData, 0, 0);

    // Subtle dark tire wear tracks
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.2, 'rgba(5,5,8,0.3)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(0.8, 'rgba(5,5,8,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  // Roughness map (darker in puddle spots for reflective wet road patches)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rCtx = roughCanvas.getContext('2d');
  if (rCtx) {
    rCtx.fillStyle = '#888888';
    rCtx.fillRect(0, 0, 256, 256);
    // Smooth reflective patches (wet puddles)
    for (let j = 0; j < 8; j++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      const rRad = 20 + Math.random() * 40;
      const rGrad = rCtx.createRadialGradient(rx, ry, 0, rx, ry, rRad);
      rGrad.addColorStop(0, 'rgba(35, 35, 35, 0.7)');
      rGrad.addColorStop(1, 'rgba(136, 136, 136, 0)');
      rCtx.fillStyle = rGrad;
      rCtx.beginPath();
      rCtx.arc(rx, ry, rRad, 0, Math.PI * 2);
      rCtx.fill();
    }
  }
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { map, roughnessMap };
}

/**
 * Procedural woven carbon fiber texture for supercar bodywork and mech exoskeletons.
 */
export function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#111116';
    ctx.fillRect(0, 0, 64, 64);

    // Diagonal twill weave
    ctx.fillStyle = '#22222a';
    for (let y = 0; y < 64; y += 8) {
      for (let x = 0; x < 64; x += 8) {
        if ((x + y) % 16 === 0) {
          ctx.fillRect(x, y, 8, 8);
        }
      }
    }

    ctx.fillStyle = '#1a1a22';
    for (let y = 0; y < 64; y += 4) {
      ctx.fillRect(0, y, 64, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Procedural cyberpunk metropolis skyline with glowing skyscraper windows and antennas.
 */
export function createCitySkylineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Night sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#04020a');
    skyGrad.addColorStop(0.65, '#0b061a');
    skyGrad.addColorStop(1, '#1b0d38');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Distant background skyscrapers (dark silhouettes)
    ctx.fillStyle = '#080512';
    for (let x = 0; x < 1024; x += 28) {
      const width = 18 + (x % 30);
      const height = 120 + ((x * 47) % 220);
      ctx.fillRect(x, 512 - height, width, height);
    }

    // Midground illuminated skyscrapers
    for (let x = 0; x < 1024; x += 36) {
      const width = 24 + ((x * 13) % 28);
      const height = 80 + ((x * 71) % 260);
      const bColor = x % 7 === 0 ? '#100b22' : '#0e081c';
      ctx.fillStyle = bColor;
      ctx.fillRect(x, 512 - height, width, height);

      // Skyscraper illuminated windows (Cyan, Amber, Rose, White)
      const winCols = Math.floor(width / 6);
      const winRows = Math.floor(height / 10);
      for (let r = 2; r < winRows - 1; r++) {
        for (let c = 1; c < winCols - 1; c++) {
          if (((x * 11 + r * 17 + c * 23) % 5) <= 2) {
            const pal = ((x + r + c) % 3);
            ctx.fillStyle = pal === 0 ? 'rgba(56, 189, 248, 0.75)' : pal === 1 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(244, 63, 94, 0.65)';
            ctx.fillRect(x + c * 6, 512 - height + r * 10, 3, 5);
          }
        }
      }

      // Rooftop beacon antennas
      if (x % 4 === 0) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, 512 - height);
        ctx.lineTo(x + width / 2, 512 - height - 20);
        ctx.stroke();

        ctx.fillStyle = '#ff2255';
        ctx.beginPath();
        ctx.arc(x + width / 2, 512 - height - 20, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Atmospheric neon horizon haze
    const haze = ctx.createLinearGradient(0, 380, 0, 512);
    haze.addColorStop(0, 'rgba(168, 85, 247, 0)');
    haze.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
    haze.addColorStop(1, 'rgba(244, 63, 94, 0.28)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 380, 1024, 132);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural metal plating texture with panel seams and rivets for heavy mech armor.
 */
export function createMetalPanelsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#1c1c24';
    ctx.fillRect(0, 0, 256, 256);

    // Panel grid borders
    ctx.strokeStyle = '#0e0e14';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 120, 120);
    ctx.strokeRect(128, 4, 124, 120);
    ctx.strokeRect(4, 128, 120, 124);
    ctx.strokeRect(128, 128, 124, 124);

    // Rivet dots
    ctx.fillStyle = '#3a3a48';
    const rivets = [
      [8, 8], [120, 8], [8, 120], [120, 120],
      [132, 8], [248, 8], [132, 120], [248, 120],
      [8, 132], [120, 132], [8, 248], [120, 248],
      [132, 132], [248, 132], [132, 248], [248, 248],
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hazard warning stripe on one plate
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(140, 140);
    ctx.lineTo(155, 140);
    ctx.lineTo(145, 170);
    ctx.lineTo(130, 170);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural corrugated shipping container texture with ribbed fluting, industrial stencils & wear.
 */
export function createCorrugatedContainerTexture(baseColor = '#d97706'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 256);

    // Corrugated vertical fluting shadows and highlights
    for (let x = 0; x < 512; x += 16) {
      // Dark fluting shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(x, 0, 5, 256);
      // Bright reflective lip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(x + 5, 0, 4, 256);
    }

    // Welded framing perimeter
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, 512, 10);
    ctx.fillRect(0, 246, 512, 10);
    ctx.fillRect(0, 0, 10, 256);
    ctx.fillRect(502, 0, 10, 256);

    // Industrial stencil markings
    ctx.font = '900 24px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('DROPZONE-07', 28, 48);

    ctx.font = '700 13px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText('MAX PAYLOAD: 32,500 KG', 28, 76);
    ctx.fillText('ISO TACTICAL // SECTOR 9', 28, 96);

    // Yellow hazard chevron stripe bar
    for (let hx = 28; hx < 480; hx += 32) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(hx, 220);
      ctx.lineTo(hx + 14, 220);
      ctx.lineTo(hx + 6, 240);
      ctx.lineTo(hx - 8, 240);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
