export type StoryChapterId = string;
export type StoryStepId = string;
export type StoryFlagValue = boolean | number | string;

export type StoryEventType =
  | 'chapter-started'
  | 'dialogue-completed'
  | 'player-moved'
  | 'tool-equipped'
  | 'guide-arrived'
  | 'excavation-completed'
  | 'learning-completed'
  | 'npc-reached'
  | 'temple-entered'
  | 'temple-seat-reached'
  | 'divination-completed'
  | 'result-confirmed';

export type StoryEvent = {
  type: StoryEventType;
  cardId?: string;
  npcId?: string;
  siteId?: string;
  toolKind?: string;
  correct?: boolean;
};

export type DialogueLine = {
  speaker: string;
  text: string;
  portraitId?: string;
  kind?: 'dialogue' | 'narration' | 'system';
};

export type StoryObjective = {
  title: string;
  detail?: string;
  targetX?: number;
  targetY?: number;
  targetRadius?: number;
};

export type StoryStepDefinition = {
  id: StoryStepId;
  chapterId: StoryChapterId;
  dialogue?: DialogueLine[];
  objective?: StoryObjective;
  completeOn?: StoryEventType;
  nextStepId?: StoryStepId;
  checkpoint?: boolean;
};

export type StoryChapterDefinition = {
  id: StoryChapterId;
  title: string;
  firstStepId: StoryStepId;
  steps: StoryStepDefinition[];
};

export type StoryEventHistoryEntry = {
  instanceId: string;
  eventId: string;
  npcId?: string;
  cardIds: string[];
  locationId?: string;
  outcomeId?: string;
  seed: number;
  completedAt: number;
};

export type NpcArcState = {
  stageId: string;
  relationship: number;
  pendingFollowUpId?: string;
};

export type PendingDynamicEvent = {
  instanceId: string;
  eventId: string;
  seed: number;
  npcId?: string;
  cardIds: string[];
  locationId?: string;
  outcomeId?: string;
};

export type StorySaveState = {
  version: number;
  currentChapterId: StoryChapterId | null;
  currentStepId: StoryStepId | null;
  completedChapterIds: StoryChapterId[];
  flags: Record<string, StoryFlagValue>;
  destinyPower: number;
  firstDivinationFreeUsed: boolean;
  reservedStorySiteId: string | null;
  eventPoolVersion: number;
  eventHistory: StoryEventHistoryEntry[];
  eventSeenCounts: Record<string, number>;
  npcArcStates: Record<string, NpcArcState>;
  recentNpcIds: string[];
  recentCardIds: string[];
  worldFlags: Record<string, StoryFlagValue>;
  pendingEvent: PendingDynamicEvent | null;
};

export type StorySnapshot = Readonly<StorySaveState>;

