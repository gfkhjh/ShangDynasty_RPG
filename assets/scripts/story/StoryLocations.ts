import { Vec2 } from 'cc';
import { FacingDirection, RegionId } from '../regions/RegionTypes';

/**
 * The sole location registry used by chapters, test buttons and saved-story
 * recovery.  Positions belong to the current RegionId's authored play space;
 * chapter files must never retain a second, legacy-world coordinate table.
 */
export type StoryLocation = {
  id: string;
  regionId: RegionId;
  /** Registered RegionEntry used for a blackout-safe scripted arrival. */
  entryId: string;
  /** NPC/objective position within the current region's authored space. */
  localPosition: Vec2;
  facingDirection: FacingDirection;
  optionalTriggerId?: string;
};

const location = (
  id: string, regionId: RegionId, entryId: string, x: number, y: number,
  facingDirection: FacingDirection, optionalTriggerId?: string,
): StoryLocation => ({
  id, regionId, entryId, localPosition: new Vec2(x, y), facingDirection, optionalTriggerId,
});

export const STORY_LOCATIONS = {
  'new-game-city-entry': location('new-game-city-entry', RegionId.CITY, 'new-game-city-entry', 0, 20, 'down'),
  'city-divination-temple': location('city-divination-temple', RegionId.CITY, 'city-divination-temple', 0, 1010, 'up', 'temple-entry'),
  'story-return-city': location('story-return-city', RegionId.CITY, 'story-return-city', 0, 20, 'down'),

  'chapter-1-city-entry': location('chapter-1-city-entry', RegionId.CITY, 'chapter-1-city-entry', 188, 20, 'right'),
  'chapter-1-city-guide': location('chapter-1-city-guide', RegionId.CITY, 'chapter-1-city-entry', 260, 20, 'left', 'xiaoshitou'),
  'chapter-1-field-entry': location('chapter-1-field-entry', RegionId.FIELDS, 'chapter-1-field-entry', 430, -452, 'right'),
  'chapter-1-first-fragment': location('chapter-1-first-fragment', RegionId.FIELDS, 'chapter-1-field-entry', 390, -920, 'down'),

  'chapter-2-riverbank-entry': location('chapter-2-riverbank-entry', RegionId.RIVERBANK, 'chapter-2-riverbank-entry', -5060, -700, 'right'),
  'chapter-2-riverbank-npc': location('chapter-2-riverbank-npc', RegionId.RIVERBANK, 'chapter-2-riverbank-entry', -4900, -700, 'left', 'fisher'),

  // The former point overlapped the authored mountain-rock at (2260, -3930).
  // This location is beside the gorge keeper on clear, walkable tomb ground.
  'chapter-3-royal-tomb-entry': location('chapter-3-royal-tomb-entry', RegionId.ROYAL_TOMB, 'chapter-3-royal-tomb-entry', 2530, -3910, 'left'),
  'chapter-3-royal-tomb-npc': location('chapter-3-royal-tomb-npc', RegionId.ROYAL_TOMB, 'chapter-3-royal-tomb-entry', 2450, -3910, 'left', 'gorge-keeper'),

  'chapter-4-highland-entry': location('chapter-4-highland-entry', RegionId.HIGHLAND, 'chapter-4-highland-entry', 3460, -800, 'left'),
  'chapter-4-highland-npc': location('chapter-4-highland-npc', RegionId.HIGHLAND, 'chapter-4-highland-entry', 3300, -800, 'right', 'forest-keeper'),
  'chapter-5-fields-entry': location('chapter-5-fields-entry', RegionId.FIELDS, 'chapter-5-fields-entry', 1560, -1500, 'left'),
  'chapter-5-fields-npc': location('chapter-5-fields-npc', RegionId.FIELDS, 'chapter-5-fields-entry', 1400, -1500, 'right', 'escort-guide'),
  'chapter-6-royal-tomb-entry': location('chapter-6-royal-tomb-entry', RegionId.ROYAL_TOMB, 'chapter-6-royal-tomb-entry', 1660, -3180, 'left'),
  'chapter-6-royal-tomb-npc': location('chapter-6-royal-tomb-npc', RegionId.ROYAL_TOMB, 'chapter-6-royal-tomb-entry', 1500, -3180, 'right', 'lamp-keeper'),
  'chapter-7-highland-entry': location('chapter-7-highland-entry', RegionId.HIGHLAND, 'chapter-7-highland-entry', 4710, -1100, 'left'),
  'chapter-7-highland-npc': location('chapter-7-highland-npc', RegionId.HIGHLAND, 'chapter-7-highland-entry', 4550, -1100, 'right', 'scroll-keeper'),
  'chapter-8-royal-tomb-entry': location('chapter-8-royal-tomb-entry', RegionId.ROYAL_TOMB, 'chapter-8-royal-tomb-entry', 3160, -3200, 'left'),
  'chapter-8-royal-tomb-npc': location('chapter-8-royal-tomb-npc', RegionId.ROYAL_TOMB, 'chapter-8-royal-tomb-entry', 3000, -3200, 'right', 'tomb-keeper'),
  'chapter-9-city-entry': location('chapter-9-city-entry', RegionId.CITY, 'chapter-9-city-entry', 0, 1010, 'left'),
  'chapter-9-city-npc': location('chapter-9-city-npc', RegionId.CITY, 'chapter-9-city-entry', 0, 1010, 'up', 'grand-diviner'),
} as const satisfies Record<string, StoryLocation>;

export type StoryLocationId = keyof typeof STORY_LOCATIONS;

export function storyLocation(id: string | undefined): StoryLocation | null {
  return id ? STORY_LOCATIONS[id as StoryLocationId] ?? null : null;
}
