// Santypes Curriculum & Lesson Mode View Controller
// 100% Framework-Free Pure TypeScript

import {
  CURRICULUM_PHASES,
  getAllCurriculumChapters,
  ChapterDefinition,
} from '../core/curriculum-data.ts';
import {
  getChapterProgress,
  getAllProgress,
  getNextUnlockedChapter,
  isChapterUnlocked,
  setActiveLessonChapter,
  getCustomLessons,
  saveCustomLesson,
  deleteCustomLesson,
  LessonChapter,
  MAX_CUSTOM_TITLE_LENGTH,
  MAX_CUSTOM_TEXT_LENGTH,
} from '../stubs/curriculum-stub.ts';
import { BeginnerGuideModal } from '../components/beginner-guide-modal.ts';
import { showNotificationToast } from '../components/celebration-toast.ts';
import { getChapterGuidance } from '../core/finger-guide.ts';
import { escapeHTML } from '../utils/html.ts';

export function renderCurriculum(
  container: HTMLElement,
  onNavigate: (tab: string) => void
): () => void {
  let modalBackdrop: HTMLElement | null = null;
  let customModalBackdrop: HTMLElement | null = null;

  function renderView(): void {
    const allChapters = getAllCurriculumChapters();
    const progress = getAllProgress();
    const doneCount = allChapters.filter(c => progress[c.id]?.done).length;
    const totalCount = allChapters.length;
    const percentDone = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const nextChapter = getNextUnlockedChapter();
    const customLessons = getCustomLessons();

    container.innerHTML = `
      <div class="curriculum-container">
        <!-- 1. Hero Overview Card -->
        <div class="curriculum-hero">
          <div class="hero-left">
            <span class="curriculum-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Touch-Typing Curriculum</span>
            </span>
            <h1 class="curriculum-title">Master the Keyboard with Precision</h1>
            <p class="curriculum-desc">
              From individual finger isolation on the home row to advanced coding syntax and speed checkpoints.
              Complete each chapter with the required speed & accuracy to unlock the next challenge.
            </p>
          </div>

          <div class="hero-stats">
            <div class="stat-box">
              <span class="stat-box-val">${doneCount} <span style="font-size:16px;color:var(--text-muted)">/ ${totalCount}</span></span>
              <span class="stat-box-label">Chapters Completed</span>
            </div>
            <div class="stat-box">
              <span class="stat-box-val" style="color:var(--accent-cyan)">${percentDone}%</span>
              <span class="stat-box-label">Total Progress</span>
            </div>
            ${
              nextChapter
                ? `<button class="resume-btn" id="btn-resume-next" title="Continue with next unlocked chapter">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <span>Resume:</span> <span>${escapeHTML(nextChapter.title)}</span>
                   </button>`
                : `<span class="curriculum-badge" style="color:var(--accent-emerald);border-color:var(--accent-emerald);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg> <span>Curriculum Complete!</span></span>`
            }
          </div>
        </div>

        <!-- Action bar for Beginner Guide and Custom Lessons -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;flex-wrap:wrap;gap:10px;">
          <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0;">Progressive Lesson Phases</h3>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <button class="config-btn" id="btn-open-beginner-guide" style="padding:6px 14px;border:1px solid rgba(16, 185, 129, 0.4);background:rgba(16, 185, 129, 0.1);color:var(--accent-emerald);display:inline-flex;align-items:center;gap:8px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <span>Beginner Hand Guide & Rules</span>
            </button>
            <button class="config-btn" id="btn-new-custom-lesson" style="padding:6px 14px;border:1px solid var(--border-subtle);background:rgba(255,255,255,0.04);display:inline-flex;align-items:center;gap:8px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Create Custom Drill</span>
            </button>
          </div>
        </div>

        <!-- 2. Phases & Chapters -->
        ${CURRICULUM_PHASES.map((phase) => {
          const phaseDoneCount = phase.chapters.filter(c => progress[c.id]?.done).length;
          const phasePercent = Math.round((phaseDoneCount / phase.chapters.length) * 100);

          return `
            <div class="phase-card" id="phase-${phase.phase}">
              <div class="phase-header">
                <div class="phase-info">
                  <span class="phase-badge">Phase ${phase.phase}</span>
                  <div>
                    <h2 class="phase-title">${escapeHTML(phase.title)}</h2>
                    <span class="phase-desc">${escapeHTML(phase.desc)}</span>
                  </div>
                </div>
                <div class="phase-progress-group">
                  <div class="phase-track">
                    <div class="phase-fill" style="width: ${phasePercent}%;"></div>
                  </div>
                  <span class="phase-count">${phaseDoneCount}/${phase.chapters.length}</span>
                </div>
              </div>

              <div class="chapter-list">
                ${phase.chapters.map((chap) => {
                  const chapProgress = progress[chap.id];
                  const isDone = !!chapProgress?.done;
                  const globalIdx = allChapters.findIndex(c => c.id === chap.id);
                  const isUnlocked = isChapterUnlocked(globalIdx);

                  let statusIconClass = 'locked';
                  let statusSymbol = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
                  if (isDone) {
                    statusIconClass = 'done';
                    statusSymbol = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                  } else if (isUnlocked) {
                    statusIconClass = 'active';
                    statusSymbol = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                  }

                  return `
                    <div class="chapter-row ${isDone ? 'done' : ''} ${!isUnlocked ? 'locked' : ''}" data-chap-id="${chap.id}">
                      <div class="chapter-left">
                        <div class="chapter-status-icon ${statusIconClass}">
                          ${statusSymbol}
                        </div>
                        <div class="chapter-meta">
                          <span class="chapter-title">${escapeHTML(chap.title)}</span>
                          <div class="chapter-sub">
                            <span>Target: <strong>${chap.wpmTarget} WPM</strong> · <strong>${chap.accTarget}% Acc</strong></span>
                            ${
                              chapProgress?.bestWpm
                                ? `<span>· Best: <strong style="color:var(--accent-cyan);font-family:var(--font-mono)">${chapProgress.bestWpm} WPM</strong> (${chapProgress.bestAcc}%)</span>`
                                : ''
                            }
                            ${
                              chapProgress?.attempts
                                ? `<span>· ${chapProgress.attempts} attempt${chapProgress.attempts !== 1 ? 's' : ''}</span>`
                                : ''
                            }
                          </div>
                        </div>
                      </div>

                      <div class="chapter-right">
                        ${
                          chap.keys && chap.keys.length > 0
                            ? `<div class="chapter-keys">
                                ${chap.keys.map(k => `<span class="keycap">${escapeHTML(k)}</span>`).join('')}
                               </div>`
                            : ''
                        }
                        ${
                          isDone
                            ? `<span class="best-badge">PASSED</span>`
                            : isUnlocked
                            ? `<span class="action-arrow" style="display:inline-flex;align-items:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></span>`
                            : `<span style="font-size:12px;color:var(--text-muted)">Locked</span>`
                        }
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}

        <!-- 3. Custom Lessons (if any exist) -->
        ${
          customLessons.length > 0
            ? `
              <div class="phase-card" style="border-color:rgba(16, 185, 129, 0.3);">
                <div class="phase-header" style="background:rgba(16, 185, 129, 0.05);">
                  <div class="phase-info">
                    <span class="phase-badge" style="color:var(--accent-emerald);background:rgba(16, 185, 129, 0.15);">Custom Drills</span>
                    <div>
                      <h2 class="phase-title">Your Custom Practice Texts</h2>
                      <span class="phase-desc">${customLessons.length} custom lesson${customLessons.length !== 1 ? 's' : ''} saved locally</span>
                    </div>
                  </div>
                </div>

                <div class="chapter-list">
                  ${customLessons.map(lesson => `
                    <div class="chapter-row" data-custom-id="${escapeHTML(lesson.id)}">
                      <div class="chapter-left">
                        <div class="chapter-status-icon active" style="border-color:var(--accent-emerald);color:var(--accent-emerald);background:rgba(16, 185, 129, 0.15)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </div>
                        <div class="chapter-meta">
                          <span class="chapter-title">${escapeHTML(lesson.title)}</span>
                          <span class="chapter-sub" style="font-family:var(--font-mono)">${escapeHTML(lesson.text.slice(0, 65))}${lesson.text.length > 65 ? '…' : ''}</span>
                        </div>
                      </div>

                      <div class="chapter-right">
                        <button class="config-btn active-custom-launch" data-launch-id="${escapeHTML(lesson.id)}" style="padding:6px 12px;font-size:12px;">Launch</button>
                        <button class="config-btn active-custom-del" data-del-id="${escapeHTML(lesson.id)}" style="padding:6px 10px;font-size:12px;color:var(--accent-rose);display:inline-flex;align-items:center;" title="Delete lesson">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `
            : ''
        }
      </div>
    `;

    bindViewEvents();
  }

  function bindViewEvents(): void {
    // Resume next unlocked chapter button
    const resumeBtn = container.querySelector('#btn-resume-next');
    resumeBtn?.addEventListener('click', () => {
      const nextChap = getNextUnlockedChapter();
      if (nextChap) {
        openChapterModal(nextChap);
      }
    });

    // Chapter row clicks
    container.querySelectorAll('.chapter-row:not(.locked)[data-chap-id]').forEach(row => {
      row.addEventListener('click', () => {
        const chapId = (row as HTMLElement).dataset.chapId;
        const allChapters = getAllCurriculumChapters();
        const chap = allChapters.find(c => c.id === chapId);
        if (chap) {
          openChapterModal(chap);
        }
      });
    });

    // Custom lesson row launch
    container.querySelectorAll('[data-launch-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.launchId;
        const custom = getCustomLessons().find(l => l.id === id);
        if (custom) {
          launchLesson({
            id: custom.id,
            title: custom.title,
            goal: 'Practice your custom text drill with rhythm and precision.',
            wpmTarget: 0,
            accTarget: 90,
            mode: 'custom',
            text: custom.text,
          });
        }
      });
    });

    // Custom lesson delete
    container.querySelectorAll('[data-del-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.delId;
        if (id) {
          deleteCustomLesson(id);
          renderView();
        }
      });
    });

    // Create custom drill button
    const newCustomBtn = container.querySelector('#btn-new-custom-lesson');
    newCustomBtn?.addEventListener('click', () => {
      openCustomLessonModal();
    });

    // Open beginner guide modal
    const beginnerBtn = container.querySelector('#btn-open-beginner-guide');
    beginnerBtn?.addEventListener('click', () => {
      new BeginnerGuideModal().open();
    });
  }

  function openChapterModal(chap: ChapterDefinition & { phaseNum?: number; phaseTitle?: string }): void {
    closeModal();

    const progress = getChapterProgress(chap.id);
    const guidances = chap.keys ? getChapterGuidance(chap.keys) : [];

    modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop visible';
    modalBackdrop.innerHTML = `
      <div class="lesson-modal-card" style="max-width:540px;">
        <div class="lesson-modal-top">
          <div>
            <div class="modal-phase-tag">${escapeHTML(chap.phaseTitle || `Phase ${chap.phaseNum || 1}`)}</div>
            <h2 class="modal-lesson-title" style="margin-top:2px;">${escapeHTML(chap.title)}</h2>
          </div>
          <button class="icon-btn" id="btn-close-lesson-modal" aria-label="Close" style="display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <p style="font-size:13px;color:var(--text-secondary);margin:0;line-height:1.5;">
          ${escapeHTML(chap.goal)}
        </p>

        ${
          guidances.length > 0
            ? `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.05em;">
                    Practice Keys:
                  </span>
                  <button class="config-btn" id="btn-modal-open-guide" style="padding:4px 10px;font-size:11px;display:inline-flex;align-items:center;gap:6px;color:var(--accent-emerald);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    <span>View Hand Guide</span>
                  </button>
                </div>
                <div class="simple-practice-keys-row">
                  ${guidances.map(g => `
                    <div class="simple-practice-card">
                      <span class="spc-key">${escapeHTML(g.displayKey)}</span>
                      <div class="spc-meta">
                        <span class="spc-finger" style="display:inline-flex;align-items:center;gap:6px;">
                          <span style="width:7px;height:7px;border-radius:50%;background:${g.fingerColor};display:inline-block;flex-shrink:0;"></span>
                          <span>${escapeHTML(g.fingerName)}</span>
                        </span>
                        <span class="spc-motion">${g.motionArrow} ${escapeHTML(g.motionLabel)}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `
            : ''
        }

        <div class="modal-tips-box" style="padding:10px 14px;">
          <div style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--accent-cyan);margin-bottom:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
            <span>Technique Tip</span>
          </div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.4;">${escapeHTML(chap.tips)}</div>
        </div>

        <div class="modal-stats-row">
          <div class="modal-stat-tile">
            <div class="val" style="color:var(--accent-cyan)">${chap.wpmTarget}</div>
            <div class="lbl">Target WPM</div>
          </div>
          <div class="modal-stat-tile">
            <div class="val" style="color:var(--accent-emerald)">${chap.accTarget}%</div>
            <div class="lbl">Target Acc</div>
          </div>
          <div class="modal-stat-tile">
            <div class="val">${progress.bestWpm ? `${progress.bestWpm} WPM` : 'None'}</div>
            <div class="lbl">Best Record</div>
          </div>
        </div>

        <div class="modal-actions-row">
          <button class="config-btn" id="btn-cancel-modal" style="padding:8px 16px;">Cancel</button>
          <button class="btn-primary" id="btn-start-chapter-lesson" style="padding:10px 24px;font-weight:800;box-shadow:0 4px 12px rgba(0, 0, 0, 0.4);display:inline-flex;align-items:center;gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Start Lesson</span>
          </button>
        </div>
      </div>
    `;

    modalBackdrop.querySelector('#btn-modal-open-guide')?.addEventListener('click', () => {
      new BeginnerGuideModal().open();
    });

    modalBackdrop.querySelector('#btn-close-lesson-modal')?.addEventListener('click', closeModal);
    modalBackdrop.querySelector('#btn-cancel-modal')?.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    modalBackdrop.querySelector('#btn-start-chapter-lesson')?.addEventListener('click', () => {
      closeModal();
      launchLesson({
        id: chap.id,
        title: chap.title,
        goal: chap.goal,
        tips: chap.tips,
        wpmTarget: chap.wpmTarget,
        accTarget: chap.accTarget,
        mode: 'custom',
        text: chap.text,
        keys: chap.keys,
        phaseNum: chap.phaseNum,
      });
    });

    document.body.appendChild(modalBackdrop);
  }

  function openCustomLessonModal(): void {
    closeCustomModal();

    customModalBackdrop = document.createElement('div');
    customModalBackdrop.className = 'modal-backdrop visible';
    customModalBackdrop.innerHTML = `
      <div class="lesson-modal-card">
        <div class="lesson-modal-top">
          <div>
            <div class="modal-phase-tag">Custom Drill</div>
            <h2 class="modal-lesson-title">Create Custom Lesson</h2>
          </div>
          <button class="icon-btn" id="btn-close-custom-modal" aria-label="Close" style="display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Lesson Title:</label>
          <input type="text" id="custom-lesson-title-input" maxlength="${MAX_CUSTOM_TITLE_LENGTH}" class="custom-lesson-input" placeholder="e.g. JavaScript Async Drills, Medical Vocabulary..." />

          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Practice Text:</label>
          <textarea id="custom-lesson-text-input" maxlength="${MAX_CUSTOM_TEXT_LENGTH}" class="custom-lesson-textarea" placeholder="Paste or type the exact text or code you wish to practice..."></textarea>
        </div>

        <div class="modal-actions-row">
          <button class="config-btn" id="btn-cancel-custom">Cancel</button>
          <button class="btn-primary" id="btn-save-custom-lesson" style="padding:10px 20px;">
            <span>Save & Practice</span>
          </button>
        </div>
      </div>
    `;

    customModalBackdrop.querySelector('#btn-close-custom-modal')?.addEventListener('click', closeCustomModal);
    customModalBackdrop.querySelector('#btn-cancel-custom')?.addEventListener('click', closeCustomModal);
    customModalBackdrop.addEventListener('click', (e) => {
      if (e.target === customModalBackdrop) closeCustomModal();
    });

    customModalBackdrop.querySelector('#btn-save-custom-lesson')?.addEventListener('click', () => {
      const titleInput = customModalBackdrop?.querySelector('#custom-lesson-title-input') as HTMLInputElement;
      const textInput = customModalBackdrop?.querySelector('#custom-lesson-text-input') as HTMLTextAreaElement;

      const title = titleInput?.value.trim() || 'Custom Drill';
      const text = textInput?.value.trim();

      if (!text || text.length < 3) {
        showNotificationToast('Please enter at least 3 characters of text to practice.');
        return;
      }

      const lesson = saveCustomLesson(title, text);
      closeCustomModal();
      launchLesson({
        id: lesson.id,
        title: lesson.title,
        goal: 'Practice custom text with high accuracy.',
        wpmTarget: 0,
        accTarget: 90,
        mode: 'custom',
        text: lesson.text,
      });
    });

    document.body.appendChild(customModalBackdrop);
  }

  function launchLesson(chapter: LessonChapter): void {
    setActiveLessonChapter(chapter);
    onNavigate('test');
  }

  function closeModal(): void {
    if (modalBackdrop) {
      modalBackdrop.remove();
      modalBackdrop = null;
    }
  }

  function closeCustomModal(): void {
    if (customModalBackdrop) {
      customModalBackdrop.remove();
      customModalBackdrop = null;
    }
  }

  const onCurriculumKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (modalBackdrop) {
        e.preventDefault();
        closeModal();
        return;
      }
      if (customModalBackdrop) {
        e.preventDefault();
        closeCustomModal();
        return;
      }
    }
    if (e.key === 'Enter') {
      if (modalBackdrop) {
        e.preventDefault();
        const startBtn = modalBackdrop.querySelector('#btn-start-chapter-lesson') as HTMLElement;
        if (startBtn) startBtn.click();
        return;
      }
    }
  };

  window.addEventListener('keydown', onCurriculumKey);

  // Initial render
  renderView();

  return function teardown(): void {
    window.removeEventListener('keydown', onCurriculumKey);
    closeModal();
    closeCustomModal();
  };
}

