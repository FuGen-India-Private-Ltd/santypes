import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllCurriculumChapters,
  CURRICULUM_PHASES,
  getCurriculumChapterById,
} from '../src/core/curriculum-data.ts';
import {
  getChapterProgress,
  completeLessonChapter,
  getNextUnlockedChapter,
  getNextChapterAfter,
  isChapterUnlocked,
  saveCustomLesson,
  getCustomLessons,
  deleteCustomLesson,
  resetCurriculumStorageForTesting,
} from '../src/stubs/curriculum-stub.ts';

describe('Curriculum & Lesson Mode', () => {
  beforeEach(() => {
    resetCurriculumStorageForTesting();
  });

  it('contains 6 progressive phases and exactly 26 chapters', () => {
    expect(CURRICULUM_PHASES.length).toBe(6);
    const all = getAllCurriculumChapters();
    expect(all.length).toBe(26);
    expect(all[0].id).toBe('p1c1');
    expect(all[all.length - 1].id).toBe('p6c4');
  });

  it('unlocks the first chapter initially while locking subsequent chapters', () => {
    expect(isChapterUnlocked(0)).toBe(true);
    expect(isChapterUnlocked(1)).toBe(false);
    expect(isChapterUnlocked(2)).toBe(false);

    const next = getNextUnlockedChapter();
    expect(next?.id).toBe('p1c1');
  });

  it('does not mark a chapter done if target criteria are not met', () => {
    const chap = getCurriculumChapterById('p1c1')!;
    expect(chap.wpmTarget).toBe(10);
    // p1c1 target: 10 WPM, 90% Acc
    const result = completeLessonChapter('p1c1', 5, 80);
    expect(result.passed).toBe(false);
    expect(result.unlockedNext).toBe(false);

    const progress = getChapterProgress('p1c1');
    expect(progress.done).toBe(false);
    expect(progress.attempts).toBe(1);
    expect(isChapterUnlocked(1)).toBe(false);
  });

  it('marks chapter completed and unlocks next chapter when meeting targets', () => {
    // Pass p1c1 with 12 WPM, 95% Acc
    const result = completeLessonChapter('p1c1', 12, 95);
    expect(result.passed).toBe(true);
    expect(result.unlockedNext).toBe(true);

    const progress = getChapterProgress('p1c1');
    expect(progress.done).toBe(true);
    expect(progress.bestWpm).toBe(12);
    expect(progress.bestAcc).toBe(95);

    // Chapter 2 (index 1) should now be unlocked!
    expect(isChapterUnlocked(1)).toBe(true);
    const next = getNextUnlockedChapter();
    expect(next?.id).toBe('p1c2');
  });

  it('persists and manages custom practice lessons', () => {
    const lesson = saveCustomLesson('My Medical Drill', 'stethoscope prescription cardiology');
    expect(lesson.id).toBeTruthy();
    expect(lesson.title).toBe('My Medical Drill');

    const all = getCustomLessons();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('My Medical Drill');

    deleteCustomLesson(lesson.id);
    expect(getCustomLessons().length).toBe(0);
  });

  it('correctly resolves the sequential next chapter after any given chapter', () => {
    const nextAfterP1C1 = getNextChapterAfter('p1c1');
    expect(nextAfterP1C1).toBeDefined();
    expect(nextAfterP1C1?.id).toBe('p1c2');

    const nextAfterP1C2 = getNextChapterAfter('p1c2');
    expect(nextAfterP1C2?.id).toBe('p1c3');

    const lastChap = getAllCurriculumChapters().slice(-1)[0];
    expect(getNextChapterAfter(lastChap.id)).toBeNull();
  });

  it('progresses forward through sequential chapter completions and tracks best scores', () => {
    // Attempt 1: fail p1c1
    completeLessonChapter('p1c1', 6, 80);
    expect(getChapterProgress('p1c1').done).toBe(false);

    // Attempt 2: pass p1c1
    completeLessonChapter('p1c1', 15, 96);
    expect(getChapterProgress('p1c1').done).toBe(true);
    expect(getChapterProgress('p1c1').bestWpm).toBe(15);
    expect(getChapterProgress('p1c1').attempts).toBe(2);

    // p1c2 should now be unlocked
    expect(isChapterUnlocked(1)).toBe(true);

    // Pass p1c2
    completeLessonChapter('p1c2', 18, 98);
    expect(getChapterProgress('p1c2').done).toBe(true);

    // p1c3 should now be unlocked
    expect(isChapterUnlocked(2)).toBe(true);
  });
});
