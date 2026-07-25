import {
  StoryChapterDefinition,
  StoryEvent,
  StoryFlagValue,
  StorySaveState,
  StorySnapshot,
  StoryStepDefinition,
} from './StoryTypes';
import { migrateStorySave } from './StoryState';

type StoryListener = (snapshot: StorySnapshot, step: StoryStepDefinition | null) => void;

export class StoryController {
  private readonly chapters = new Map<string, StoryChapterDefinition>();
  private readonly listeners = new Set<StoryListener>();
  private state: StorySaveState;

  constructor(
    definitions: StoryChapterDefinition[],
    initialState: unknown,
    private readonly persist: (state: StorySaveState) => void,
  ) {
    definitions.forEach(chapter => {
      this.chapters.set(chapter.id, chapter);
    });
    this.state = migrateStorySave(initialState);
    this.repairCurrentStep();
  }

  snapshot(): StorySnapshot {
    return {
      ...this.state,
      completedChapterIds: [...this.state.completedChapterIds],
      flags: { ...this.state.flags },
      eventHistory: [...this.state.eventHistory],
      eventSeenCounts: { ...this.state.eventSeenCounts },
      npcArcStates: { ...this.state.npcArcStates },
      recentNpcIds: [...this.state.recentNpcIds],
      recentCardIds: [...this.state.recentCardIds],
      worldFlags: { ...this.state.worldFlags },
      pendingEvent: this.state.pendingEvent ? { ...this.state.pendingEvent, cardIds: [...this.state.pendingEvent.cardIds] } : null,
    };
  }

  currentStep() {
    const chapter = this.state.currentChapterId ? this.chapters.get(this.state.currentChapterId) : undefined;
    return chapter?.steps.find(step => step.id === this.state.currentStepId) ?? null;
  }

  subscribe(listener: StoryListener) {
    this.listeners.add(listener);
    listener(this.snapshot(), this.currentStep());
    return () => this.listeners.delete(listener);
  }

  startChapter(chapterId: string) {
    const chapter = this.chapters.get(chapterId);
    if (!chapter || this.state.completedChapterIds.includes(chapterId)) return false;
    this.state.currentChapterId = chapter.id;
    this.state.currentStepId = chapter.firstStepId;
    this.commit();
    return true;
  }

  handle(event: StoryEvent) {
    const step = this.currentStep();
    if (!step || step.completeOn !== event.type) return false;
    if (step.nextStepId) {
      const chapter = this.chapters.get(step.chapterId);
      if (!chapter?.steps.some(candidate => candidate.id === step.nextStepId)) return false;
      this.state.currentStepId = step.nextStepId;
    } else {
      this.completeCurrentChapter();
      return true;
    }
    this.commit();
    return true;
  }

  setFlag(key: string, value: StoryFlagValue) {
    if (this.state.flags[key] === value) return;
    this.state.flags[key] = value;
    this.commit();
  }

  addDestinyPower(amount: number) {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    if (safeAmount === 0) return;
    this.state.destinyPower += safeAmount;
    this.commit();
  }

  reserveStorySite(siteId: string | null) {
    if (this.state.reservedStorySiteId === siteId) return;
    this.state.reservedStorySiteId = siteId;
    this.commit();
  }

  useFirstFreeDivination() {
    if (this.state.firstDivinationFreeUsed) return false;
    this.state.firstDivinationFreeUsed = true;
    this.commit();
    return true;
  }

  resetForTesting() {
    this.state = migrateStorySave(null);
    this.commit();
  }

  // 测试用：重置为全新存档，再按目标章把其前置章节标记为已完成，
  // 这样 beginChapterOneIfNeeded 会直接从目标章开始，无需重玩前置章。
  startTestingAtChapter(priorCompletedIds: string[]) {
    this.state = migrateStorySave(null);
    this.state.completedChapterIds = [...new Set(priorCompletedIds)];
    this.commit();
  }

  private completeCurrentChapter() {
    const chapterId = this.state.currentChapterId;
    if (chapterId && !this.state.completedChapterIds.includes(chapterId)) {
      this.state.completedChapterIds.push(chapterId);
    }
    this.state.currentChapterId = null;
    this.state.currentStepId = null;
    this.state.reservedStorySiteId = null;
    this.commit();
  }

  private repairCurrentStep() {
    const chapterId = this.state.currentChapterId;
    if (!chapterId) {
      this.state.currentStepId = null;
      return;
    }
    const chapter = this.chapters.get(chapterId);
    if (!chapter) {
      this.state.currentChapterId = null;
      this.state.currentStepId = null;
      return;
    }
    if (!chapter.steps.some(step => step.id === this.state.currentStepId)) {
      this.state.currentStepId = chapter.firstStepId;
    }
  }

  private commit() {
    const snapshot = this.snapshot();
    this.persist(snapshot as StorySaveState);
    this.listeners.forEach(listener => listener(snapshot, this.currentStep()));
  }
}
