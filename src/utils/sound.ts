// Procedural Web Audio synthesizer for tactile click, thock, clack & keystroke feedback
// Zero external audio files, zero latency, ultra-lightweight
// 100% Framework-Free Pure TypeScript

import { SoundType, getSettings, updateSetting } from '../stubs/settings-stub.ts';

let audioCtx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  return getSettings().soundEnabled;
}

export function toggleSound(): boolean {
  const current = getSettings().soundEnabled;
  const next = !current;
  updateSetting('soundEnabled', next);
  return next;
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function playTactileClick(type: 'key' | 'button' | 'error' = 'key', overrideSoundType?: SoundType): void {
  const settings = getSettings();
  if (!settings.soundEnabled) return;

  const volumeFactor = Math.max(0, Math.min(1, (settings.soundVolume || 80) / 100));
  if (volumeFactor === 0) return;

  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const soundStyle = overrideSoundType || settings.soundType || 'click';

    if (type === 'button') {
      // Deeper tactile button switch click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.02);

      gain.gain.setValueAtTime(0.18 * volumeFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } else if (type === 'error') {
      // Muted error clack
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.03);

      gain.gain.setValueAtTime(0.16 * volumeFactor, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } else {
      // Keypress variation based on selected sound type
      const pitchVariance = 0.95 + Math.random() * 0.1;

      if (soundStyle === 'thock') {
        // Deep linear thock
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 * pitchVariance, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.025);

        gain.gain.setValueAtTime(0.24 * volumeFactor, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.035);
      } else if (soundStyle === 'clack') {
        // High-pitched crisp clack
        osc.type = 'square';
        osc.frequency.setValueAtTime(600 * pitchVariance, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.012);

        gain.gain.setValueAtTime(0.08 * volumeFactor, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.018);
      } else if (soundStyle === 'beep') {
        // 8-bit retro soft beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 * pitchVariance, t);

        gain.gain.setValueAtTime(0.09 * volumeFactor, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.025);
      } else {
        // Default mechanical tactile click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 * pitchVariance, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.015);

        gain.gain.setValueAtTime(0.14 * volumeFactor, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.02);
      }
    }
  } catch {
    // Graceful fallback if audio is blocked by browser policy
  }
}

export function playArcadeLaser(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.09);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } catch {}
}

export function playArcadeExplosion(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;

    // Sub-bass thump
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
    oscGain.gain.setValueAtTime(0.28, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.35);

    // Noise burst
    const bufferSize = audioCtx.sampleRate * 0.25;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.25);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    whiteNoise.start(t);
  } catch {}
}

export function playArcadePowerup(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const t = audioCtx!.currentTime + idx * 0.055;
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  } catch {}
}

export function playArcadeDamage(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  } catch {}
}

export function playArcadeCombo(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046, t);
    osc.frequency.exponentialRampToValueAtTime(1567, t + 0.12);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  } catch {}
}

export function playParryClash(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;

    // Metallic ping oscillator
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1860, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.23);

    // Harmonic clash shimmer
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2400, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.15);

    gain2.gain.setValueAtTime(0.18, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(t);
    osc2.stop(t + 0.18);
  } catch {}
}

export function playBossStagger(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.45);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  } catch {}
}

export function playNitroBoost(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  } catch {}
}

export function playDriftScreech(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Synthesize friction squeal via two detuned FM oscillators
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.linearRampToValueAtTime(640, t + 0.22);
    osc2.frequency.setValueAtTime(892, t);
    osc2.frequency.linearRampToValueAtTime(648, t + 0.22);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  } catch {}
}

export function playOvertakeChime(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    [523.25, 783.99].forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      const noteTime = t + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  } catch {}
}

export function playWarningAlarm(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    [660, 880].forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      const noteTime = t + idx * 0.08;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.16, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.14);
    });
  } catch {}
}

export function playCriticalImpact(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;

    // Sub-bass heavy impact
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(160, t);
    osc1.frequency.exponentialRampToValueAtTime(35, t + 0.28);
    gain1.gain.setValueAtTime(0.35, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.35);

    // High crystalline ring
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, t);
    osc2.frequency.exponentialRampToValueAtTime(800, t + 0.25);
    gain2.gain.setValueAtTime(0.25, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(t);
    osc2.stop(t + 0.3);
  } catch {}
}

export function playFinishFanfare(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      const noteTime = t + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });
  } catch {}
}

export function playCarHorn(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    [380, 475].forEach((freq) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {}
}

export function playExhaustBackfire(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Rapid pop noise/burst
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.04);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  } catch {}
}

export function playRailgunFire(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // High-energy railgun punch
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    gain1.gain.setValueAtTime(0.26, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);
  } catch {}
}

export function playShieldParryDome(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Resonant forcefield sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(1150, t + 0.22);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  } catch {}
}

export function speakMechVoice(text: string): void {
  if (!isSoundEnabled()) return;
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.45;
      utterance.rate = 0.92;
      utterance.volume = 0.75;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

export function playMinigunBurst(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    [0, 0.03, 0.06].forEach((offset) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, t + offset);
      osc.frequency.exponentialRampToValueAtTime(70, t + offset + 0.025);
      gain.gain.setValueAtTime(0.2, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.035);
    });
  } catch {}
}

export function playArtilleryShell(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Shell incoming whistle
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1400, t);
    osc1.frequency.exponentialRampToValueAtTime(250, t + 0.2);
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.25);

    // Heavy crater explosion
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(120, t + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.55);
    gain2.gain.setValueAtTime(0.4, t + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(t + 0.18);
    osc2.stop(t + 0.65);
  } catch {}
}

export function playNukeDetonation(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Sub-bass EMP shockwave
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(18, t + 0.9);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  } catch {}
}

export function playSniperRifle(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;

    // Supersonic bullet crack transient
    const oscCrack = audioCtx.createOscillator();
    const gainCrack = audioCtx.createGain();
    oscCrack.type = 'triangle';
    oscCrack.frequency.setValueAtTime(3200, t);
    oscCrack.frequency.exponentialRampToValueAtTime(380, t + 0.04);
    gainCrack.gain.setValueAtTime(0.4, t);
    gainCrack.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    oscCrack.connect(gainCrack);
    gainCrack.connect(audioCtx.destination);
    oscCrack.start(t);
    oscCrack.stop(t + 0.06);

    // Deep sub-bass chest thump
    const oscBass = audioCtx.createOscillator();
    const gainBass = audioCtx.createGain();
    oscBass.type = 'sine';
    oscBass.frequency.setValueAtTime(160, t);
    oscBass.frequency.exponentialRampToValueAtTime(32, t + 0.22);
    gainBass.gain.setValueAtTime(0.5, t);
    gainBass.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    oscBass.connect(gainBass);
    gainBass.connect(audioCtx.destination);
    oscBass.start(t);
    oscBass.stop(t + 0.4);

    // Distant echoing canyon reverb tail
    const oscEcho = audioCtx.createOscillator();
    const gainEcho = audioCtx.createGain();
    oscEcho.type = 'sawtooth';
    oscEcho.frequency.setValueAtTime(88, t + 0.08);
    oscEcho.frequency.exponentialRampToValueAtTime(40, t + 0.6);
    gainEcho.gain.setValueAtTime(0.12, t + 0.08);
    gainEcho.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    oscEcho.connect(gainEcho);
    gainEcho.connect(audioCtx.destination);
    oscEcho.start(t + 0.08);
    oscEcho.stop(t + 0.7);
  } catch {}
}

export function playAssaultRifleBurst(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.035);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  } catch {}
}

export function playSafeZoneSiren(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(740, t + 0.5);
    osc.frequency.linearRampToValueAtTime(420, t + 1.0);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.8);
    gain.gain.linearRampToValueAtTime(0.001, t + 1.1);

    // Mild low-pass filter to give warning horn character
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.15);
  } catch {}
}

export function playAirdropLanding(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;

    // Heavy crate impact thud
    const oscThud = audioCtx.createOscillator();
    const gainThud = audioCtx.createGain();
    oscThud.type = 'triangle';
    oscThud.frequency.setValueAtTime(95, t);
    oscThud.frequency.exponentialRampToValueAtTime(25, t + 0.25);
    gainThud.gain.setValueAtTime(0.42, t);
    gainThud.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    oscThud.connect(gainThud);
    gainThud.connect(audioCtx.destination);
    oscThud.start(t);
    oscThud.stop(t + 0.35);

    // Flare ignition hiss / whistle
    const oscHiss = audioCtx.createOscillator();
    const gainHiss = audioCtx.createGain();
    oscHiss.type = 'sine';
    oscHiss.frequency.setValueAtTime(1200, t + 0.05);
    oscHiss.frequency.exponentialRampToValueAtTime(400, t + 0.4);
    gainHiss.gain.setValueAtTime(0.15, t + 0.05);
    gainHiss.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    oscHiss.connect(gainHiss);
    gainHiss.connect(audioCtx.destination);
    oscHiss.start(t + 0.05);
    oscHiss.stop(t + 0.5);
  } catch {}
}

export function playBooyahFanfare(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Triumphant brass-synth chords: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [
      { f: 523.25, offset: 0, dur: 0.14 },
      { f: 659.25, offset: 0.12, dur: 0.14 },
      { f: 783.99, offset: 0.24, dur: 0.18 },
      { f: 1046.5, offset: 0.42, dur: 0.8 },
      { f: 1318.51, offset: 0.42, dur: 0.8 }, // harmony
    ];

    notes.forEach((n) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t + n.offset);

      gain.gain.setValueAtTime(0.001, t + n.offset);
      gain.gain.linearRampToValueAtTime(0.24, t + n.offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.offset + n.dur);

      const filter = audioCtx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, t + n.offset);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(t + n.offset);
      osc.stop(t + n.offset + n.dur + 0.05);
    });
  } catch {}
}

export function playRadarPing(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch {}
}

export function playBossOverdriveAlarm(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    for (let i = 0; i < 2; i++) {
      const offset = i * 0.22;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t + offset);
      osc.frequency.linearRampToValueAtTime(780, t + offset + 0.18);

      gain.gain.setValueAtTime(0.01, t + offset);
      gain.gain.linearRampToValueAtTime(0.25, t + offset + 0.04);
      gain.gain.linearRampToValueAtTime(0.001, t + offset + 0.2);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, t + offset);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.22);
    }
  } catch {}
}

export function playAchievementUnlock(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const notes = [698.46, 880.0, 1046.5, 1318.51, 1567.98];
    notes.forEach((f, idx) => {
      const offset = idx * 0.06;
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + offset);

      gain.gain.setValueAtTime(0.18, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.45);
    });
  } catch {}
}

export function playWindRush(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Procedural buffer noise for atmospheric freefall wind
    const bufferSize = audioCtx.sampleRate * 1.5;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 1.4);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 1.5);
  } catch {}
}

export function playParachuteSnap(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Sharp parachute fabric snap transient
    const oscSnap = audioCtx.createOscillator();
    const gainSnap = audioCtx.createGain();
    oscSnap.type = 'triangle';
    oscSnap.frequency.setValueAtTime(850, t);
    oscSnap.frequency.exponentialRampToValueAtTime(140, t + 0.04);
    gainSnap.gain.setValueAtTime(0.35, t);
    gainSnap.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    oscSnap.connect(gainSnap);
    gainSnap.connect(audioCtx.destination);
    oscSnap.start(t);
    oscSnap.stop(t + 0.06);

    // Deep canopy tension fluttering thud
    const oscFlutter = audioCtx.createOscillator();
    const gainFlutter = audioCtx.createGain();
    oscFlutter.type = 'sine';
    oscFlutter.frequency.setValueAtTime(95, t + 0.03);
    oscFlutter.frequency.exponentialRampToValueAtTime(32, t + 0.25);
    gainFlutter.gain.setValueAtTime(0.4, t + 0.03);
    gainFlutter.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    oscFlutter.connect(gainFlutter);
    gainFlutter.connect(audioCtx.destination);
    oscFlutter.start(t + 0.03);
    oscFlutter.stop(t + 0.35);
  } catch {}
}

let bgmInterval: number | null = null;
let bgmGainNode: GainNode | null = null;
let bgmStep = 0;
let isBgmActive = false;

export function isArcadeBgmPlaying(): boolean {
  return isBgmActive;
}

export function startArcadeBgm(): void {
  if (isBgmActive) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    isBgmActive = true;
    bgmStep = 0;

    bgmGainNode = audioCtx.createGain();
    bgmGainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    bgmGainNode.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.0);
    bgmGainNode.connect(audioCtx.destination);

    // 124 BPM driving synthwave sequencer (~120ms per 16th note)
    const stepDurationMs = 120;
    const bassNotes = [
      55.0, 55.0, 65.41, 55.0, 73.42, 55.0, 65.41, 82.41,
      55.0, 55.0, 65.41, 55.0, 98.0, 82.41, 73.42, 65.41,
    ];

    bgmInterval = window.setInterval(() => {
      if (!audioCtx || !isBgmActive || !bgmGainNode) return;
      try {
        const t = audioCtx.currentTime;
        const noteFreq = bassNotes[bgmStep % 16];

        // 1. Driving Synthwave Bass
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650 + Math.sin(t * 0.5) * 350, t);
        filter.Q.setValueAtTime(3.0, t);

        gain.gain.setValueAtTime(0.24, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bgmGainNode);

        osc.start(t);
        osc.stop(t + 0.11);

        // 2. Punchy Kick on beats 0, 4, 8, 12
        if (bgmStep % 4 === 0) {
          const kickOsc = audioCtx.createOscillator();
          const kickGain = audioCtx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(130, t);
          kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

          kickGain.gain.setValueAtTime(0.38, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          kickOsc.connect(kickGain);
          kickGain.connect(bgmGainNode);
          kickOsc.start(t);
          kickOsc.stop(t + 0.1);
        }

        // 3. Crisp Snare on beats 4, 12
        if (bgmStep % 8 === 4) {
          const snareOsc = audioCtx.createOscillator();
          const snareGain = audioCtx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(220, t);
          snareOsc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

          snareGain.gain.setValueAtTime(0.2, t);
          snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

          snareOsc.connect(snareGain);
          snareGain.connect(bgmGainNode);
          snareOsc.start(t);
          snareOsc.stop(t + 0.08);
        }

        bgmStep++;
      } catch {
        stopArcadeBgm();
      }
    }, stepDurationMs);
  } catch {}
}

export function stopArcadeBgm(): void {
  isBgmActive = false;
  if (bgmInterval !== null) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGainNode && audioCtx) {
    try {
      bgmGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (bgmGainNode) {
          bgmGainNode.disconnect();
          bgmGainNode = null;
        }
      }, 550);
    } catch {}
  }
}

export function toggleArcadeBgm(): boolean {
  if (isBgmActive) {
    stopArcadeBgm();
    return false;
  } else {
    startArcadeBgm();
    return true;
  }
}

export function playScopeClick(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Metallic scope lever click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.025);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  } catch {}
}

export function playPoliceSiren(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.linearRampToValueAtTime(950, t + 0.22);
    osc.frequency.linearRampToValueAtTime(620, t + 0.45);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  } catch {}
}

export function playLootPickup(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    [587.33, 880.0, 1174.66, 1760.0].forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      const noteTime = t + idx * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.14);
    });
  } catch {}
}

export function playStratagemBeacon(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.35);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  } catch {}
}

export function playJetDash(): void {
  if (!isSoundEnabled()) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const t = audioCtx.currentTime;
    // Sonic jet whoosh & air compression
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.28);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(2.5, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.32);
  } catch {}
}


