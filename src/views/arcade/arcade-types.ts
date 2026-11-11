// Santypes Arcade Types & Metadata Manifest
import { isSafeRecordKey, safeStorageGetItem, safeStorageSetItem } from '../../utils/html.ts';

export type GameId =
  | 'titanProtocol'
  | 'speedRacer'
  | 'cyberExtraction'
  | 'cyberDropzone';

export type ArcadeDifficulty = 'cadet' | 'elite' | 'nightmare';

export interface DifficultyConfig {
  id: ArcadeDifficulty;
  name: string;
  badge: string;
  desc: string;
  color: string;
  xpMultiplier: number;
}

export const DIFFICULTY_PRESETS: Record<ArcadeDifficulty, DifficultyConfig> = {
  cadet: {
    id: 'cadet',
    name: 'Cadet',
    badge: 'Recruit',
    desc: 'Forgiving parry windows & relaxed pacing for learning mechanics.',
    color: '#38bdf8',
    xpMultiplier: 0.85,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    badge: 'Standard',
    desc: 'Tournament combat pacing with standard boss HP and competitive rivals.',
    color: '#f59e0b',
    xpMultiplier: 1.0,
  },
  nightmare: {
    id: 'nightmare',
    name: 'Nightmare',
    badge: '+50% XP',
    desc: 'Hyperdrive speeds, relentless attack volleys, and maximum XP rewards.',
    color: '#f43f5e',
    xpMultiplier: 1.5,
  },
};

export interface GameInstanceHandle {
  stop: () => void;
  id: string;
}

export interface GameMeta {
  id: GameId;
  name: string;
  icon: string;
  category: 'boss' | 'racing' | 'survival' | 'royale';
  techBadge: string;
  themeColor: string;
  desc: string;
  metric: string;
  storageKey: string;
}

export const ARCADE_GAMES: GameMeta[] = [
  {
    id: 'titanProtocol',
    name: 'Titan Protocol',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" y1="14" x2="9" y2="18"></line><line x1="7" y1="17" x2="4" y2="20"></line><line x1="3" y1="19" x2="5" y2="21"></line></svg>`,
    category: 'boss',
    techBadge: '3D Mech Duel',
    themeColor: '#f43f5e',
    desc: 'Cinematic 1-on-1 fighting duel vs rogue mech boss NEXUS-9: read attack telegraphs, parry strikes, shatter shields, and execute lethal combos.',
    metric: 'Best Score',
    storageKey: 'santypes_arcade_best_titanProtocol',
  },
  {
    id: 'speedRacer',
    name: 'Speed Racer GP',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
    category: 'racing',
    techBadge: 'Drag Sprint',
    themeColor: '#4ade80',
    desc: 'Pure velocity drag sprint: type clean text streams to accelerate past AI rivals on the high-speed neon strip.',
    metric: 'Best WPM',
    storageKey: 'santypes_racer_best_wpm',
  },
  {
    id: 'cyberExtraction',
    name: 'Cyber Extraction',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="2" y1="12" x2="4" y2="12"></line></svg>`,
    category: 'survival',
    techBadge: 'Wave Shooter',
    themeColor: '#38bdf8',
    desc: 'Tactical perimeter defense & survival extraction: operate heavy automated rotary turrets, intercept enemy waves, and deploy tactical orbital airstrikes.',
    metric: 'Best Kills',
    storageKey: 'santypes_arcade_best_cyberExtraction',
  },
  {
    id: 'cyberDropzone',
    name: 'Cyber Dropzone',
    icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line><circle cx="12" cy="12" r="3"></circle><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path></svg>`,
    category: 'royale',
    techBadge: '3D Battle Royale',
    themeColor: '#eab308',
    desc: 'Tactical Free Fire battlegrounds: skydive into the hostile industrial zone, outrun the shrinking electric storm ring, loot tactical airdrops, and eliminate 50 operators for the ultimate BOOYAH!',
    metric: 'Best Kills',
    storageKey: 'santypes_arcade_best_cyberDropzone',
  },
];

export const ARCADE_WORDS = {
  easy: [
    'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they',
    'have', 'this', 'from', 'one', 'had', 'word', 'but', 'not', 'what', 'all',
    'were', 'when', 'your', 'can', 'said', 'there', 'use', 'each', 'which', 'she',
    'how', 'will', 'other', 'about', 'out', 'many', 'then', 'them', 'look', 'more',
    'space', 'star', 'ship', 'core', 'code', 'fire', 'bolt', 'beam', 'data', 'gate',
  ],
  medium: [
    'practice', 'keyboard', 'rhythm', 'accuracy', 'fingers', 'typing', 'focus',
    'speed', 'pattern', 'muscle', 'progress', 'session', 'challenge', 'reflex',
    'steady', 'quick', 'smooth', 'target', 'posture', 'motion', 'rapid', 'drill',
    'signal', 'telemetry', 'vector', 'matrix', 'terminal', 'cipher', 'quantum', 'shield',
    'thruster', 'reactor', 'orbital', 'plasma', 'impulse', 'overload', 'station',
  ],
  hard: [
    'accelerate', 'consistency', 'recognition', 'algorithm', 'synchronize',
    'vocabulary', 'concentration', 'efficiency', 'productivity', 'anticipate',
    'coordination', 'precision', 'momentum', 'flexibility', 'transmission',
    'electromagnetic', 'superposition', 'hyperdrive', 'gravitational', 'interstellar',
    'nanotechnology', 'cryptography', 'trajectory', 'subterranean', 'neutralize',
  ],
};

export function getArcadeWord(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): string {
  const pool =
    difficulty === 'hard'
      ? ARCADE_WORDS.hard.concat(ARCADE_WORDS.medium)
      : difficulty === 'medium'
      ? ARCADE_WORDS.medium.concat(ARCADE_WORDS.easy)
      : ARCADE_WORDS.easy;
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface ArcadeTrophy {
  id: string;
  title: string;
  gameId: GameId;
  desc: string;
  icon: string;
  xpReward: number;
}

export const ARCADE_TROPHIES: ArcadeTrophy[] = [
  {
    id: 'booyahChampion',
    title: 'Apex Champion',
    gameId: 'cyberDropzone',
    desc: 'Survive the 50-player lobby and achieve #1 BOOYAH in Cyber Dropzone',
    icon: '🔥',
    xpReward: 500,
  },
  {
    id: 'hyperdriveAce',
    title: 'Mach Speedster',
    gameId: 'speedRacer',
    desc: 'Break the velocity barrier with 100+ WPM in Speed Racer GP',
    icon: '⚡',
    xpReward: 350,
  },
  {
    id: 'nexusSlayer',
    title: 'Titan Slayer',
    gameId: 'titanProtocol',
    desc: 'Defeat NEXUS-9 on Elite or Nightmare combat difficulty',
    icon: '⚔️',
    xpReward: 450,
  },
  {
    id: 'perimeterGuardian',
    title: 'Extraction Legend',
    gameId: 'cyberExtraction',
    desc: 'Survive the evac dropship countdown with >80% perimeter integrity',
    icon: '🛡️',
    xpReward: 400,
  },
  {
    id: 'deadeyeSniper',
    title: 'Deadeye Marksman',
    gameId: 'cyberDropzone',
    desc: 'Finish any combat engagement with 98%+ typing accuracy',
    icon: '🎯',
    xpReward: 300,
  },
  {
    id: 'empOverkill',
    title: 'Tactical Nuke',
    gameId: 'cyberExtraction',
    desc: 'Unleash the 15-killstreak Tactical EMP Nuke',
    icon: '💥',
    xpReward: 500,
  },
];

const TROPHY_STORAGE_KEY = 'santypes_arcade_unlocked_trophies';

const VALID_TROPHY_IDS = new Set(ARCADE_TROPHIES.map((t) => t.id));

export function getUnlockedTrophies(): Record<string, boolean> {
  const clean = Object.create(null) as Record<string, boolean>;
  try {
    const raw = safeStorageGetItem(TROPHY_STORAGE_KEY);
    if (!raw) return clean;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return clean;
    }
    for (const key of Object.keys(parsed)) {
      if (
        isSafeRecordKey(key) &&
        VALID_TROPHY_IDS.has(key) &&
        (parsed as Record<string, unknown>)[key] === true
      ) {
        clean[key] = true;
      }
    }
    return clean;
  } catch {
    return clean;
  }
}

export function unlockArcadeTrophy(trophyId: string): boolean {
  if (!isSafeRecordKey(trophyId) || !VALID_TROPHY_IDS.has(trophyId)) {
    return false;
  }
  try {
    const current = getUnlockedTrophies();
    if (!Object.prototype.hasOwnProperty.call(current, trophyId)) {
      current[trophyId] = true;
      safeStorageSetItem(TROPHY_STORAGE_KEY, JSON.stringify(current));
      const trophy = ARCADE_TROPHIES.find((t) => t.id === trophyId);
      if (trophy) {
        window.dispatchEvent(
          new CustomEvent('santypes:trophy-unlocked', { detail: trophy })
        );
      }
      return true;
    }
  } catch {}
  return false;
}

export type WeaponSkinId = 'obsidian' | 'cyberpunk' | 'sovereign' | 'hazard';

export interface WeaponSkin {
  id: WeaponSkinId;
  name: string;
  badge: string;
  primaryColor: number;
  accentColor: number;
  emissiveColor: number;
  metalness: number;
  roughness: number;
  desc: string;
  requiredXp: number;
}

export const WEAPON_SKINS: WeaponSkin[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Stealth',
    badge: 'Standard Issue',
    primaryColor: 0x18181f,
    accentColor: 0x334155,
    emissiveColor: 0x000000,
    metalness: 0.85,
    roughness: 0.35,
    desc: 'Matte stealth black ceramic finish with dark carbon fiber weave.',
    requiredXp: 0,
  },
  {
    id: 'cyberpunk',
    name: 'Neon Gridrunner',
    badge: 'Epic',
    primaryColor: 0x0f172a,
    accentColor: 0x00f0ff,
    emissiveColor: 0x00f0ff,
    metalness: 0.6,
    roughness: 0.25,
    desc: 'Electric cyan receiver with pulsing neon circuits.',
    requiredXp: 1500,
  },
  {
    id: 'sovereign',
    name: 'Golden Sovereign',
    badge: 'Legendary',
    primaryColor: 0xd97706,
    accentColor: 0xfacc15,
    emissiveColor: 0x78350f,
    metalness: 0.95,
    roughness: 0.15,
    desc: 'Polished 24K reflective gold plating with gilded trims.',
    requiredXp: 3500,
  },
  {
    id: 'hazard',
    name: 'Hazard Protocol',
    badge: 'Military',
    primaryColor: 0xb45309,
    accentColor: 0xf59e0b,
    emissiveColor: 0x451a03,
    metalness: 0.7,
    roughness: 0.45,
    desc: 'Industrial heavy assault plating with warning chevron stripes.',
    requiredXp: 5000,
  },
];

const WEAPON_SKIN_STORAGE_KEY = 'santypes_arcade_active_skin';

export function getActiveWeaponSkin(): WeaponSkin {
  try {
    const raw = safeStorageGetItem(WEAPON_SKIN_STORAGE_KEY);
    const match = WEAPON_SKINS.find((s) => s.id === raw);
    if (match) return match;
  } catch {}
  return WEAPON_SKINS[0];
}

export function setActiveWeaponSkin(skinId: WeaponSkinId): void {
  if (!WEAPON_SKINS.some((s) => s.id === skinId)) return;
  try {
    safeStorageSetItem(WEAPON_SKIN_STORAGE_KEY, skinId);
    window.dispatchEvent(new CustomEvent('santypes:skin-changed', { detail: skinId }));
  } catch {}
}

