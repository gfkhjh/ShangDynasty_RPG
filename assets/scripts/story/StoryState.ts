import {
  NpcArcState,
  PendingDynamicEvent,
  StoryEventHistoryEntry,
  StoryFlagValue,
  StorySaveState,
} from './StoryTypes';

export const STORY_SAVE_VERSION = 1;
export const STORY_EVENT_POOL_VERSION = 1;
const MAX_EVENT_HISTORY = 200;
const MAX_RECENT_NPCS = 8;
const MAX_RECENT_CARDS = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value: unknown, maxLength = Number.MAX_SAFE_INTEGER) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0).slice(-maxLength);
}

function nonNegativeInteger(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

function flagRecord(value: unknown): Record<string, StoryFlagValue> {
  if (!isRecord(value)) return {};
  const result: Record<string, StoryFlagValue> = {};
  Object.entries(value).forEach(([key, item]) => {
    if (typeof item === 'boolean' || typeof item === 'string' || (typeof item === 'number' && Number.isFinite(item))) {
      result[key] = item;
    }
  });
  return result;
}

function seenCounts(value: unknown) {
  if (!isRecord(value)) return {};
  const result: Record<string, number> = {};
  Object.entries(value).forEach(([key, item]) => {
    result[key] = nonNegativeInteger(item);
  });
  return result;
}

function npcArcStates(value: unknown) {
  if (!isRecord(value)) return {};
  const result: Record<string, NpcArcState> = {};
  Object.entries(value).forEach(([npcId, item]) => {
    if (!isRecord(item) || typeof item.stageId !== 'string') return;
    result[npcId] = {
      stageId: item.stageId,
      relationship: nonNegativeInteger(item.relationship),
      pendingFollowUpId: typeof item.pendingFollowUpId === 'string' ? item.pendingFollowUpId : undefined,
    };
  });
  return result;
}

function eventHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item): StoryEventHistoryEntry | null => {
      if (typeof item.instanceId !== 'string' || typeof item.eventId !== 'string') return null;
      return {
        instanceId: item.instanceId,
        eventId: item.eventId,
        npcId: typeof item.npcId === 'string' ? item.npcId : undefined,
        cardIds: stringArray(item.cardIds),
        locationId: typeof item.locationId === 'string' ? item.locationId : undefined,
        outcomeId: typeof item.outcomeId === 'string' ? item.outcomeId : undefined,
        seed: nonNegativeInteger(item.seed),
        completedAt: nonNegativeInteger(item.completedAt),
      };
    })
    .filter((item): item is StoryEventHistoryEntry => Boolean(item))
    .slice(-MAX_EVENT_HISTORY);
}

function pendingEvent(value: unknown): PendingDynamicEvent | null {
  if (!isRecord(value) || typeof value.instanceId !== 'string' || typeof value.eventId !== 'string') return null;
  return {
    instanceId: value.instanceId,
    eventId: value.eventId,
    seed: nonNegativeInteger(value.seed),
    npcId: typeof value.npcId === 'string' ? value.npcId : undefined,
    cardIds: stringArray(value.cardIds),
    locationId: typeof value.locationId === 'string' ? value.locationId : undefined,
    outcomeId: typeof value.outcomeId === 'string' ? value.outcomeId : undefined,
  };
}

export function createDefaultStorySave(): StorySaveState {
  return {
    version: STORY_SAVE_VERSION,
    currentChapterId: null,
    currentStepId: null,
    completedChapterIds: [],
    flags: {},
    destinyPower: 0,
    firstDivinationFreeUsed: false,
    reservedStorySiteId: null,
    eventPoolVersion: STORY_EVENT_POOL_VERSION,
    eventHistory: [],
    eventSeenCounts: {},
    npcArcStates: {},
    recentNpcIds: [],
    recentCardIds: [],
    worldFlags: {},
    pendingEvent: null,
  };
}

export function migrateStorySave(value: unknown): StorySaveState {
  const defaults = createDefaultStorySave();
  if (!isRecord(value)) return defaults;
  return {
    version: STORY_SAVE_VERSION,
    currentChapterId: typeof value.currentChapterId === 'string' ? value.currentChapterId : null,
    currentStepId: typeof value.currentStepId === 'string' ? value.currentStepId : null,
    completedChapterIds: Array.from(new Set(stringArray(value.completedChapterIds))),
    flags: flagRecord(value.flags),
    destinyPower: nonNegativeInteger(value.destinyPower),
    firstDivinationFreeUsed: value.firstDivinationFreeUsed === true,
    reservedStorySiteId: typeof value.reservedStorySiteId === 'string' ? value.reservedStorySiteId : null,
    eventPoolVersion: nonNegativeInteger(value.eventPoolVersion, STORY_EVENT_POOL_VERSION),
    eventHistory: eventHistory(value.eventHistory),
    eventSeenCounts: seenCounts(value.eventSeenCounts),
    npcArcStates: npcArcStates(value.npcArcStates),
    recentNpcIds: stringArray(value.recentNpcIds, MAX_RECENT_NPCS),
    recentCardIds: stringArray(value.recentCardIds, MAX_RECENT_CARDS),
    worldFlags: flagRecord(value.worldFlags),
    pendingEvent: pendingEvent(value.pendingEvent),
  };
}

