// Santypes Cyber Arcade — 3D Combat Simulations & High-Velocity Racing Drills
// 100% Framework-Free Pure TypeScript

import {
  ARCADE_GAMES,
  GameId,
  GameInstanceHandle,
  ArcadeDifficulty,
  ARCADE_TROPHIES,
  getUnlockedTrophies,
  ArcadeTrophy,
  WEAPON_SKINS,
  getActiveWeaponSkin,
  setActiveWeaponSkin,
  WeaponSkinId,
} from './arcade/arcade-types.ts';
import { startTitanProtocolGame } from './arcade/titan-protocol-game.ts';
import { startSpeedRacerGame } from './arcade/speed-racer-game.ts';
import { startCyberExtractionGame } from './arcade/cyber-extraction-game.ts';
import { startCyberDropzoneGame } from './arcade/cyber-dropzone-game.ts';
import { awardArcadeReward, getAccountState } from '../stubs/account-stub.ts';
import {
  playTactileClick,
  toggleSound,
  isSoundEnabled,
  playArcadePowerup,
  playArcadeCombo,
  playAchievementUnlock,
  stopArcadeBgm,
  toggleArcadeBgm,
  isArcadeBgmPlaying,
} from '../utils/sound.ts';
import {
  escapeHTML,
  finiteNumber,
  safeStorageGetItem,
  safeStorageSetItem,
} from '../utils/html.ts';

const VALID_DIFFICULTIES = new Set<ArcadeDifficulty>(['cadet', 'elite', 'nightmare']);

function normalizeDifficulty(value: unknown): ArcadeDifficulty {
  return typeof value === 'string' && VALID_DIFFICULTIES.has(value as ArcadeDifficulty)
    ? (value as ArcadeDifficulty)
    : 'elite';
}

export function renderArcade(
  container: HTMLElement,
  _onNavigate?: (tab: string) => void
): () => void {
  let activeGameInstance: GameInstanceHandle | null = null;
  let isPlaying = false;
  let activeGameId: GameId | null = null;
  let isTrophiesDrawerOpen = false;
  let isArmoryDrawerOpen = false;
  const selectedDifficulty: Record<GameId, ArcadeDifficulty> = {
    titanProtocol: normalizeDifficulty(safeStorageGetItem('santypes_diff_titanProtocol')),
    speedRacer: normalizeDifficulty(safeStorageGetItem('santypes_diff_speedRacer')),
    cyberExtraction: normalizeDifficulty(safeStorageGetItem('santypes_diff_cyberExtraction')),
    cyberDropzone: normalizeDifficulty(safeStorageGetItem('santypes_diff_cyberDropzone')),
  };

  // Root Shell Layout
  container.innerHTML = `
    <div class="arcade-view-container" id="arcade-container">
      <!-- Mounted dynamically: Hub or Arena -->
      <div id="arcade-viewport" style="width:100%;height:100%;"></div>
    </div>
  `;

  const viewport = container.querySelector('#arcade-viewport') as HTMLElement;

  function getBestScore(storageKey: string): number {
    return finiteNumber(Number(safeStorageGetItem(storageKey)), 0, 0);
  }

  function setBestScore(storageKey: string, score: number): boolean {
    const safeScore = finiteNumber(score, 0, 0);
    const current = getBestScore(storageKey);
    if (safeScore > current) {
      safeStorageSetItem(storageKey, String(safeScore));
      return true;
    }
    return false;
  }

  /* ========================================================================= */
  /* VIEW 1: ARCADE GALLERY / HUB                                              */
  /* ========================================================================= */

  function renderHub(): void {
    isPlaying = false;
    activeGameId = null;
    if (activeGameInstance) {
      activeGameInstance.stop();
      activeGameInstance = null;
    }

    const state = getAccountState();
    const unlockedTrophies = getUnlockedTrophies();
    const unlockedCount = ARCADE_TROPHIES.filter((t) => unlockedTrophies[t.id]).length;
    const activeSkin = getActiveWeaponSkin();

    viewport.innerHTML = `
      <div class="arcade-hub-view">
        <!-- Top Header Ribbon -->
        <div class="arcade-hub-header">
          <div class="arcade-brand-block">
            <div class="arcade-hub-title">
              <span>CYBER ARCADE</span>
            </div>
            <div class="arcade-hub-subtitle">
              High-immersion velocity racing circuits & cinematic combat boss duels
            </div>
          </div>

          <!-- Quick Stats Ribbon -->
          <div class="arcade-quick-stats">
            <div class="arcade-stat-item">
              <span>Pilot Lv:</span>
              <strong style="color:var(--accent-cyan);">${state.level}</strong>
            </div>
            <div class="arcade-stat-item">
              <span>Total XP:</span>
              <strong style="color:#c084fc;">${state.xp.toLocaleString()}</strong>
            </div>
            <div class="arcade-stat-item">
              <span>Streak:</span>
              <strong style="color:#f59e0b;display:inline-flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>${state.streak.current}</span>
              </strong>
            </div>
            <button class="arcade-stat-item" id="btn-toggle-trophies" style="cursor:pointer;background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.35);padding:4px 10px;border-radius:8px;transition:all 0.15s ease;" title="Inspect Combat Pilot Trophies">
              <span>🏆 Medals:</span>
              <strong style="color:#facc15;">${unlockedCount} / ${ARCADE_TROPHIES.length}</strong>
            </button>
            <button class="arcade-stat-item" id="btn-toggle-armory" style="cursor:pointer;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.35);padding:4px 10px;border-radius:8px;transition:all 0.15s ease;" title="The Armory: Equip 3D Weapon & Vehicle Skins">
              <span>🛡️ Armory:</span>
              <strong style="color:var(--accent-cyan);">${activeSkin.name}</strong>
            </button>
            <button class="arcade-stat-item" id="btn-toggle-bgm" style="cursor:pointer;background:rgba(168,85,247,0.12);border:1px solid rgba(168,85,247,0.35);padding:4px 10px;border-radius:8px;transition:all 0.15s ease;" title="Toggle Procedural Cyberpunk Synth BGM">
              <span>🎵 Synth:</span>
              <strong style="color:#c084fc;">${isArcadeBgmPlaying() ? 'ON' : 'OFF'}</strong>
            </button>
          </div>
        </div>

        <!-- Collapsible Combat Pilot Trophies Drawer -->
        <div class="arcade-trophies-drawer" id="arcade-trophies-drawer" style="${isTrophiesDrawerOpen ? 'display:block;' : 'display:none;'}">
          <div class="trophies-drawer-inner">
            <div class="trophies-drawer-header">
              <span class="trophies-drawer-title">🎖️ COMBAT PILOT DOSSIER // ELITE TROPHIES</span>
              <span class="trophies-drawer-subtitle">${unlockedCount} of ${ARCADE_TROPHIES.length} Medals Unlocked</span>
            </div>
            <div class="trophies-grid">
              ${ARCADE_TROPHIES.map((t) => {
                const isEarned = Boolean(unlockedTrophies[t.id]);
                return `
                  <div class="arcade-trophy-badge ${isEarned ? 'earned' : 'locked'}">
                    <div class="trophy-badge-icon">${t.icon}</div>
                    <div class="trophy-badge-info">
                      <div class="trophy-badge-title">${t.title}</div>
                      <div class="trophy-badge-desc">${t.desc}</div>
                      <div class="trophy-badge-status">${isEarned ? `✅ UNLOCKED (+${t.xpReward} XP)` : `🔒 LOCKED // +${t.xpReward} XP`}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Collapsible The Armory Drawer -->
        <div class="arcade-armory-drawer" id="arcade-armory-drawer" style="${isArmoryDrawerOpen ? 'display:block;' : 'display:none;'}">
          <div class="armory-drawer-inner">
            <div class="armory-drawer-header">
              <span class="armory-drawer-title">🛡️ THE ARMORY // 3D WEAPON & VEHICLE SKINS</span>
              <span class="armory-drawer-subtitle">Equipped: ${activeSkin.name}</span>
            </div>
            <div class="armory-grid">
              ${WEAPON_SKINS.map((s) => {
                const isEquipped = s.id === activeSkin.id;
                const isUnlocked = state.xp >= s.requiredXp;
                const hexColor = '#' + s.accentColor.toString(16).padStart(6, '0');
                const primHex = '#' + s.primaryColor.toString(16).padStart(6, '0');
                return `
                  <div class="arcade-skin-card ${isEquipped ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}" data-skin-id="${s.id}">
                    <div class="skin-card-top">
                      <div class="skin-swatch" style="background:linear-gradient(135deg, ${primHex} 0%, ${hexColor} 100%);border-color:${hexColor};"></div>
                      <span class="skin-badge">${s.badge}</span>
                    </div>
                    <div class="skin-name">${s.name}</div>
                    <div class="skin-desc">${s.desc}</div>
                    <div class="skin-status" style="color:${isEquipped ? 'var(--accent-cyan)' : isUnlocked ? '#4ade80' : '#64748b'};">
                      ${isEquipped ? '★ EQUIPPED' : isUnlocked ? 'CLICK TO EQUIP' : `LOCKED (Req. ${s.requiredXp} XP)`}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Scrollable Cards Grid -->
        <div class="arcade-games-scroll-body">
          <div class="arcade-games-grid">
            ${ARCADE_GAMES
              .map((game) => {
                const best = getBestScore(game.storageKey);
                const displayBest = game.metric === 'Best WPM' ? `${best} WPM` : best.toLocaleString();
                const curDiff = selectedDifficulty[game.id] || 'elite';

                return `
                  <div class="arcade-game-card" data-game-id="${game.id}" style="--card-accent:${game.themeColor};">
                    <div class="arcade-card-top">
                      <div class="arcade-card-icon-wrap">${game.icon}</div>
                      <span class="arcade-card-badge">${game.techBadge}</span>
                    </div>

                    <div class="arcade-card-body">
                      <h3 class="arcade-card-title">${game.name}</h3>
                      <p class="arcade-card-desc">${game.desc}</p>

                      <div class="arcade-card-difficulty" data-card-game="${game.id}">
                        <button class="arcade-diff-btn ${curDiff === 'cadet' ? 'active' : ''}" data-diff="cadet" title="Cadet: Relaxed pacing & forgiving parry windows">Cadet</button>
                        <button class="arcade-diff-btn ${curDiff === 'elite' ? 'active' : ''}" data-diff="elite" title="Elite: Tournament standard combat & pacing">Elite</button>
                        <button class="arcade-diff-btn ${curDiff === 'nightmare' ? 'active nightmare' : ''}" data-diff="nightmare" title="Nightmare: Hyperdrive speed, high damage & +50% XP">Nightmare</button>
                      </div>
                    </div>

                    <div class="arcade-card-footer">
                      <div class="arcade-card-metric">
                        <span class="arcade-metric-label">${game.metric}</span>
                        <span class="arcade-metric-value">${displayBest}</span>
                      </div>
                      <button class="arcade-card-launch-btn">
                        <span>LAUNCH</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    // Toggle Trophies Drawer
    viewport.querySelector('#btn-toggle-trophies')?.addEventListener('click', (e) => {
      e.stopPropagation();
      playTactileClick('button');
      isTrophiesDrawerOpen = !isTrophiesDrawerOpen;
      if (isTrophiesDrawerOpen) isArmoryDrawerOpen = false;
      renderHub();
    });

    // Toggle Armory Drawer
    viewport.querySelector('#btn-toggle-armory')?.addEventListener('click', (e) => {
      e.stopPropagation();
      playTactileClick('button');
      isArmoryDrawerOpen = !isArmoryDrawerOpen;
      if (isArmoryDrawerOpen) isTrophiesDrawerOpen = false;
      renderHub();
    });

    // Toggle BGM
    viewport.querySelector('#btn-toggle-bgm')?.addEventListener('click', (e) => {
      e.stopPropagation();
      playTactileClick('button');
      toggleArcadeBgm();
      renderHub();
    });

    // Armory Skin Selection
    viewport.querySelectorAll('.arcade-skin-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const skinId = (card as HTMLElement).dataset.skinId as WeaponSkinId;
        const skin = WEAPON_SKINS.find((s) => s.id === skinId);
        if (skin && state.xp >= skin.requiredXp) {
          playTactileClick('button');
          setActiveWeaponSkin(skinId);
          renderHub();
        } else {
          playTactileClick('error');
        }
      });
    });

    // Difficulty button clicks
    viewport.querySelectorAll('.arcade-diff-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playTactileClick('button');
        const rawDiff = (btn as HTMLElement).dataset.diff;
        const card = btn.closest('.arcade-game-card') as HTMLElement;
        const gameId = card?.dataset.gameId as GameId;
        if (
          rawDiff &&
          VALID_DIFFICULTIES.has(rawDiff as ArcadeDifficulty) &&
          gameId &&
          ARCADE_GAMES.some((g) => g.id === gameId)
        ) {
          const diff = rawDiff as ArcadeDifficulty;
          selectedDifficulty[gameId] = diff;
          safeStorageSetItem(`santypes_diff_${gameId}`, diff);
          renderHub();
        }
      });
    });

    // Card launch events
    viewport.querySelectorAll('.arcade-game-card').forEach((card) => {
      card.addEventListener('click', () => {
        playTactileClick('button');
        const id = (card as HTMLElement).dataset.gameId as GameId;
        if (id) {
          launchGame(id);
        }
      });
    });
  }

  /* ========================================================================= */
  /* VIEW 2: ARENA CONTAINER & GAME RUNTIME                                    */
  /* ========================================================================= */

  function launchGame(gameId: GameId): void {
    const meta = ARCADE_GAMES.find((g) => g.id === gameId);
    if (!meta) return;

    isPlaying = true;
    activeGameId = gameId;

    if (activeGameInstance) {
      activeGameInstance.stop();
      activeGameInstance = null;
    }

    viewport.innerHTML = `
      <div class="arcade-arena-view">
        <!-- Top Arena Header / HUD Ribbon -->
        <div class="arcade-arena-header">
          <button class="arcade-back-btn" id="btn-back-hub" title="Exit to Arcade Gallery (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Gallery</span> <kbd>Esc</kbd>
          </button>

          <div class="arcade-hud-center" id="arena-hud-container">
            <!-- Populated by game engine -->
          </div>

          <div class="arcade-arena-actions">
            <button class="icon-btn" id="btn-arena-sound" title="Toggle Sound">
              ${isSoundEnabled() ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>'}
            </button>
            <button class="btn-secondary" id="btn-arena-restart" style="padding:8px 16px;font-size:13px;display:inline-flex;align-items:center;gap:6px;" title="Quick Restart (Tab)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              <span>Restart</span> <kbd>Tab</kbd>
            </button>
          </div>
        </div>

        <!-- Stage Viewport -->
        <div class="arcade-stage-wrapper" id="arena-stage-wrapper">
          <div class="arcade-stage-container" id="arena-stage-container"></div>
        </div>

        <!-- Ergonomic Bottom Input Deck (for boss duel) -->
        <div class="arcade-bottom-deck" id="arena-bottom-deck" style="${meta.category === 'racing' ? 'display:none;' : ''}">
          <div class="arcade-input-wrapper">
            <input
              type="text"
              class="arcade-game-input"
              id="arena-game-input"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="Type matching target word..."
            />
          </div>
          <div class="arcade-input-hints">
            <span><kbd>Space</kbd> / <kbd>Enter</kbd> Transmit / Lock Target</span>
            <span><kbd>Tab</kbd> Restart</span>
            <span><kbd>Esc</kbd> Exit to Gallery</span>
          </div>
        </div>

        <!-- Mission Debrief Modal Backdrop (Hidden initially) -->
        <div class="arcade-modal-backdrop" id="arena-debrief-modal" style="display:none;"></div>
      </div>
    `;

    // Hook Back Button
    viewport.querySelector('#btn-back-hub')?.addEventListener('click', () => {
      playTactileClick('button');
      renderHub();
    });

    // Hook Sound Toggle
    const soundBtn = viewport.querySelector('#btn-arena-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const next = toggleSound();
        soundBtn.innerHTML = next
          ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>'
          : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        if (next) playTactileClick('button');
      });
    }

    // Hook Restart Button
    viewport.querySelector('#btn-arena-restart')?.addEventListener('click', () => {
      playTactileClick('button');
      launchGame(gameId);
    });

    const stageEl = viewport.querySelector('#arena-stage-container') as HTMLElement;
    const inputEl = viewport.querySelector('#arena-game-input') as HTMLInputElement;
    const hudEl = viewport.querySelector('#arena-hud-container') as HTMLElement;

    const bottomDeck = viewport.querySelector('#arena-bottom-deck') as HTMLElement;
    if (meta.category === 'racing' && bottomDeck) {
      bottomDeck.style.display = 'none';
    } else if (bottomDeck) {
      bottomDeck.style.display = 'flex';
    }

    // Launch based on game type (WebGL fallback boundary)
    const diff = selectedDifficulty[gameId] || 'elite';
    try {
      if (gameId === 'titanProtocol') {
        activeGameInstance = startTitanProtocolGame(stageEl, inputEl, hudEl, (stats) => showDebrief(meta, stats, diff), diff);
      } else if (gameId === 'speedRacer') {
        activeGameInstance = startSpeedRacerGame(stageEl, hudEl, (stats) => showDebrief(meta, stats, diff), diff);
      } else if (gameId === 'cyberExtraction') {
        activeGameInstance = startCyberExtractionGame(stageEl, inputEl, hudEl, (stats) => showDebrief(meta, stats, diff), diff);
      } else if (gameId === 'cyberDropzone') {
        activeGameInstance = startCyberDropzoneGame(stageEl, inputEl, hudEl, (stats) => showDebrief(meta, stats, diff), diff);
      }
    } catch (err) {
      console.error('Failed to initialize 3D game stage:', err);
      const card = document.createElement('div');
      card.className = 'app-fallback-card';
      const title = document.createElement('h2');
      title.textContent = '3D Graphics Context Unavailable';
      const copy = document.createElement('p');
      copy.textContent = 'WebGL is disabled or unavailable in this browser environment. Return to the gallery or practice typing modes safely.';
      card.append(title, copy);
      stageEl.innerHTML = '';
      stageEl.appendChild(card);
    }
  }

  /* ========================================================================= */
  /* MISSION REPORT / GAME OVER DEBRIEF                                        */
  /* ========================================================================= */

  function showDebrief(
    meta: (typeof ARCADE_GAMES)[0],
    stats: { score: number; words: number; accuracy: number; maxCombo: number },
    diff: ArcadeDifficulty = 'elite'
  ): void {
    const modalEl = viewport.querySelector('#arena-debrief-modal') as HTMLElement;
    if (!modalEl) return;

    const isNewBest = setBestScore(meta.storageKey, stats.score);
    const reward = awardArcadeReward(stats.score, stats.words, stats.accuracy, stats.maxCombo);

    const rank =
      stats.accuracy >= 98 && stats.maxCombo >= 20
        ? { grade: 'S-RANK', label: 'MASTER OPERATIVE', color: '#facc15' }
        : stats.accuracy >= 94
        ? { grade: 'A-RANK', label: 'COMBAT VETERAN', color: 'var(--accent-cyan)' }
        : stats.accuracy >= 88
        ? { grade: 'B-RANK', label: 'COMBAT PILOT', color: '#4ade80' }
        : { grade: 'C-RANK', label: 'CADET RECRUIT', color: '#94a3b8' };

    if (isNewBest || reward.leveledUp) {
      playArcadePowerup();
    } else {
      playArcadeCombo();
    }

    modalEl.style.display = 'flex';
    modalEl.innerHTML = `
      <div class="arcade-debrief-card">
        <div class="debrief-icon">${escapeHTML(meta.icon)}</div>
        <h2 class="debrief-title">${escapeHTML(meta.name)} — Mission Report</h2>

        <div style="display:flex;justify-content:center;gap:8px;margin:8px 0 16px;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:800;color:${rank.color};border:1px solid ${rank.color};padding:3px 10px;border-radius:6px;background:rgba(0,0,0,0.5);">${escapeHTML(rank.grade)} // ${escapeHTML(rank.label)}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text-muted);border:1px solid rgba(255,255,255,0.1);padding:3px 8px;border-radius:6px;background:rgba(255,255,255,0.03);text-transform:uppercase;">MODE: ${escapeHTML(diff)}</span>
        </div>

        <div class="debrief-score-hero">
          <span class="debrief-score-label">${escapeHTML(meta.metric)}</span>
          <span class="debrief-score-value">${meta.metric === 'Best WPM' ? `${finiteNumber(stats.score, 0, 0)} WPM` : finiteNumber(stats.score, 0, 0).toLocaleString()}</span>
          ${isNewBest ? `<div class="debrief-new-best-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg> <span>NEW PERSONAL BEST!</span></div>` : ''}
          ${reward.leveledUp ? `<div class="debrief-new-best-pill" style="background:rgba(168,85,247,0.25);border-color:#a855f7;color:#c084fc;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> <span>LEVEL UP! PROMOTED TO LEVEL ${finiteNumber(reward.newLevel, 1, 1)}</span></div>` : ''}
        </div>

        <div class="debrief-stats-grid">
          <div class="debrief-stat-cell">
            <span class="k">Targets</span>
            <span class="v">${finiteNumber(stats.words, 0, 0)}</span>
          </div>
          <div class="debrief-stat-cell">
            <span class="k">Accuracy</span>
            <span class="v">${finiteNumber(stats.accuracy, 0, 0, 100)}%</span>
          </div>
          <div class="debrief-stat-cell">
            <span class="k">Max Streak</span>
            <span class="v">x${finiteNumber(stats.maxCombo, 0, 0)}</span>
          </div>
        </div>

        <div class="debrief-xp-reward">
          <span>Combat Pilot XP Awarded:</span>
          <span class="debrief-xp-val">+${finiteNumber(reward.earnedXp, 0, 0)} XP</span>
        </div>

        <div class="debrief-actions">
          <button class="debrief-restart-btn" id="btn-debrief-restart">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            <span>Play Again</span> <kbd>Space</kbd>
          </button>
          <button class="debrief-gallery-btn" id="btn-debrief-gallery">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Gallery</span> <kbd>Esc</kbd>
          </button>
        </div>
      </div>
    `;

    modalEl.querySelector('#btn-debrief-restart')?.addEventListener('click', () => {
      playTactileClick('button');
      launchGame(meta.id);
    });

    modalEl.querySelector('#btn-debrief-gallery')?.addEventListener('click', () => {
      playTactileClick('button');
      renderHub();
    });
  }

  /* ========================================================================= */
  /* TROPHY / ACHIEVEMENT TOAST NOTIFICATIONS                                  */
  /* ========================================================================= */

  function showTrophyToast(trophy: ArcadeTrophy): void {
    playAchievementUnlock();
    let toastContainer = container.querySelector('#arcade-trophy-toast-container') as HTMLElement;
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'arcade-trophy-toast-container';
      toastContainer.style.position = 'absolute';
      toastContainer.style.top = '16px';
      toastContainer.style.left = '50%';
      toastContainer.style.transform = 'translateX(-50%)';
      toastContainer.style.zIndex = '9999';
      toastContainer.style.pointerEvents = 'none';
      container.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'arcade-trophy-toast';
    toast.innerHTML = `
      <div style="background:rgba(5,4,10,0.95);border:2px solid #facc15;border-radius:12px;padding:12px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 0 35px rgba(250,204,21,0.65);animation:fadeIn 0.25s ease;">
        <span style="font-size:28px;">${escapeHTML(trophy.icon)}</span>
        <div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#facc15;font-weight:900;letter-spacing:1px;">TROPHY UNLOCKED!</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:#ffffff;font-weight:800;">${escapeHTML(trophy.title)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${escapeHTML(trophy.desc)}</div>
        </div>
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#4ade80;font-weight:800;margin-left:10px;background:rgba(74,222,128,0.1);padding:3px 8px;border-radius:6px;border:1px solid rgba(74,222,128,0.3);">+${finiteNumber(trophy.xpReward, 0, 0)} XP</span>
      </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 450);
    }, 4500);
  }

  function onTrophyUnlocked(e: Event): void {
    const customEvent = e as CustomEvent<ArcadeTrophy>;
    if (customEvent.detail) {
      showTrophyToast(customEvent.detail);
    }
  }

  window.addEventListener('santypes:trophy-unlocked', onTrophyUnlocked);

  /* ========================================================================= */
  /* GLOBAL KEYBOARD ROUTER                                                    */
  /* ========================================================================= */

  function onGlobalKeyDown(e: KeyboardEvent): void {
    const modalEl = viewport.querySelector('#arena-debrief-modal') as HTMLElement;
    const isDebriefOpen = modalEl && modalEl.style.display !== 'none';

    if (e.key === 'Escape') {
      if (isPlaying || isDebriefOpen) {
        e.preventDefault();
        renderHub();
      }
    } else if (e.key === 'Tab' && isPlaying && activeGameId) {
      e.preventDefault();
      launchGame(activeGameId);
    } else if ((e.key === ' ' || e.key === 'Enter') && isDebriefOpen && activeGameId) {
      e.preventDefault();
      launchGame(activeGameId);
    }
  }

  window.addEventListener('keydown', onGlobalKeyDown);

  // Initial Mount
  renderHub();

  return () => {
    window.removeEventListener('keydown', onGlobalKeyDown);
    window.removeEventListener('santypes:trophy-unlocked', onTrophyUnlocked);
    stopArcadeBgm();
    if (activeGameInstance) {
      activeGameInstance.stop();
      activeGameInstance = null;
    }
  };
}
