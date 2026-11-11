// Santypes Curriculum & Lesson Mode Service
// Manages progress persistence, unlocks, chapter targets, and custom lesson creation

import {
  ChapterDefinition,
  getAllCurriculumChapters,
  getCurriculumChapterById,
} from '../core/curriculum-data.ts';
import { finiteNumber, isSafeRecordKey } from '../utils/html.ts';

export const MAX_CUSTOM_TITLE_LENGTH = 120;
export const MAX_CUSTOM_TEXT_LENGTH = 10000;
export const MAX_CUSTOM_LESSONS = 50;

export interface LessonChapter {
  id: string;
  title: string;
  goal: string;
  tips?: string;
  wpmTarget: number;
  accTarget: number;
  mode?: string;
  text?: string;
  keys?: string[];
  phaseNum?: number;
}

export interface ChapterProgress {
  done: boolean;
  bestWpm: number;
  bestAcc: number;
  attempts: number;
  lastAttemptAt?: string;
}

export interface CustomLesson {
  id: string;
  title: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = 'santypes_curriculum_progress';
const CUSTOM_LESSONS_KEY = 'santypes_custom_lessons';

const memoryStore: Record<string, string> = {};

function storageGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] || null;
}

function storageSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

export function resetCurriculumStorageForTesting(): void {
  for (const k in memoryStore) delete memoryStore[k];
  try {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  } catch {}
}

let activeLessonChapter: LessonChapter | null = null;

export function getActiveLessonChapter(): LessonChapter | null {
  return activeLessonChapter;
}

export function setActiveLessonChapter(chapter: LessonChapter | null): void {
  activeLessonChapter = chapter;
}

export function getAllProgress(): Record<string, ChapterProgress> {
  const safeMap: Record<string, ChapterProgress> = Object.create(null);
  try {
    const raw = storageGet(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [id, entry] of Object.entries(parsed)) {
        if (!Object.hasOwn(parsed, id) || !isSafeRecordKey(id)) continue;
        if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
          const item = entry as Partial<ChapterProgress>;
          safeMap[id] = {
            done: Boolean(item.done),
            bestWpm: finiteNumber(item.bestWpm, 0, 0, 500),
            bestAcc: finiteNumber(item.bestAcc, 0, 0, 100),
            attempts: Math.floor(finiteNumber(item.attempts, 0, 0, 1_000_000)),
            lastAttemptAt: typeof item.lastAttemptAt === 'string' ? item.lastAttemptAt : undefined,
          };
        }
      }
    }
  } catch {
    // Ignore malformed stored curriculum progress
  }
  return safeMap;
}

export function getChapterProgress(chapterId: string): ChapterProgress {
  const all = getAllProgress();
  if (isSafeRecordKey(chapterId) && Object.hasOwn(all, chapterId)) {
    return all[chapterId];
  }
  return {
    done: false,
    bestWpm: 0,
    bestAcc: 0,
    attempts: 0,
  };
}

export function completeLessonChapter(
  chapterId: string,
  wpm: number,
  accuracy: number
): { passed: boolean; unlockedNext: boolean } {
  try {
    if (!isSafeRecordKey(chapterId)) {
      return { passed: false, unlockedNext: false };
    }
    const safeWpm = finiteNumber(wpm, 0, 0, 500);
    const safeAcc = finiteNumber(accuracy, 0, 0, 100);
    const all = getAllProgress();
    const current = Object.hasOwn(all, chapterId)
      ? all[chapterId]
      : {
          done: false,
          bestWpm: 0,
          bestAcc: 0,
          attempts: 0,
        };

    const chapterDef = getCurriculumChapterById(chapterId);
    const wpmTarget = chapterDef?.wpmTarget || 0;
    const accTarget = chapterDef?.accTarget || 90;

    const passedThisAttempt = safeWpm >= wpmTarget && safeAcc >= accTarget;
    const wasAlreadyDone = current.done;
    const isNowDone = wasAlreadyDone || passedThisAttempt;

    all[chapterId] = {
      done: isNowDone,
      bestWpm: Math.max(current.bestWpm, safeWpm),
      bestAcc: Math.max(current.bestAcc, safeAcc),
      attempts: current.attempts + 1,
      lastAttemptAt: new Date().toISOString(),
    };

    storageSet(STORAGE_KEY, JSON.stringify(all));

    return {
      passed: passedThisAttempt,
      unlockedNext: !wasAlreadyDone && passedThisAttempt,
    };
  } catch {
    return { passed: false, unlockedNext: false };
  }
}

export function getNextUnlockedChapter(): (ChapterDefinition & { phaseNum: number; phaseTitle: string }) | null {
  const chapters = getAllCurriculumChapters();
  const all = getAllProgress();

  for (let i = 0; i < chapters.length; i++) {
    const chap = chapters[i];
    const isDone = all[chap.id]?.done;
    if (!isDone) {
      // Check if unlocked: first chapter is always unlocked, otherwise previous chapter must be done
      const isUnlocked = i === 0 || all[chapters[i - 1].id]?.done;
      if (isUnlocked) {
        return chap;
      }
    }
  }

  // If all done, return last chapter
  return chapters[chapters.length - 1] || null;
}

export function getNextChapterAfter(currentChapterId: string): (ChapterDefinition & { phaseNum: number; phaseTitle: string }) | null {
  const chapters = getAllCurriculumChapters();
  const currentIndex = chapters.findIndex(c => c.id === currentChapterId);
  if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
    return chapters[currentIndex + 1];
  }
  return null;
}

export function isChapterUnlocked(chapterIndex: number): boolean {
  if (chapterIndex === 0) return true;
  const chapters = getAllCurriculumChapters();
  const prevChapter = chapters[chapterIndex - 1];
  if (!prevChapter) return true;
  const progress = getChapterProgress(prevChapter.id);
  return progress.done;
}

// Custom Lessons Management
export function getCustomLessons(): CustomLesson[] {
  try {
    const raw = storageGet(CUSTOM_LESSONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const safeLessons: CustomLesson[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const rawObj = item as Partial<CustomLesson>;
      if (typeof rawObj.id !== 'string' || !rawObj.id.trim()) continue;
      if (typeof rawObj.text !== 'string' || !rawObj.text.trim()) continue;
      safeLessons.push({
        id: rawObj.id.slice(0, 80),
        title: (typeof rawObj.title === 'string' ? rawObj.title.trim() : '') || 'Untitled Lesson',
        text: rawObj.text.slice(0, MAX_CUSTOM_TEXT_LENGTH),
        createdAt: typeof rawObj.createdAt === 'string' ? rawObj.createdAt : '',
      });
    }
    return safeLessons.slice(0, MAX_CUSTOM_LESSONS);
  } catch {
    return [];
  }
}

export function saveCustomLesson(title: string, text: string): CustomLesson {
  const lessons = getCustomLessons();
  const safeTitle = (typeof title === 'string' ? title.trim() : '').slice(0, MAX_CUSTOM_TITLE_LENGTH) || 'Untitled Lesson';
  const safeText = (typeof text === 'string' ? text.trim() : '').slice(0, MAX_CUSTOM_TEXT_LENGTH);
  const newLesson: CustomLesson = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: safeTitle,
    text: safeText,
    createdAt: new Date().toISOString(),
  };
  lessons.unshift(newLesson);
  const bounded = lessons.slice(0, MAX_CUSTOM_LESSONS);
  try {
    storageSet(CUSTOM_LESSONS_KEY, JSON.stringify(bounded));
  } catch (e) {
    console.warn('Could not save custom lesson:', e);
  }
  return newLesson;
}

export function deleteCustomLesson(id: string): void {
  const lessons = getCustomLessons().filter(l => l.id !== id);
  try {
    storageSet(CUSTOM_LESSONS_KEY, JSON.stringify(lessons));
  } catch (e) {
    console.warn('Could not delete custom lesson:', e);
  }
}
