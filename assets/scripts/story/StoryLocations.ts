import { Vec2 } from 'cc';
import { FacingDirection, RegionId, WorldBounds } from '../regions/RegionTypes';

/** Authored entry and conversation positions for the main story. */
export type StoryLocation = {
  id: string;
  regionId: RegionId;
  spawnPosition: Vec2;
  facingDirection: FacingDirection;
  cameraBounds?: WorldBounds;
  optionalTriggerId?: string;
};

const location = (id: string, regionId: RegionId, x: number, y: number, facingDirection: FacingDirection, optionalTriggerId?: string): StoryLocation => ({
  id, regionId, spawnPosition: new Vec2(x, y), facingDirection, optionalTriggerId,
});

export const STORY_LOCATIONS: Record<string, StoryLocation> = {
  'new-game-city-entry': location('new-game-city-entry', RegionId.CITY, 0, 20, 'down'),
  'chapter-1-city-guide': location('chapter-1-city-guide', RegionId.CITY, 260, 20, 'left', 'xiaoshitou'),
  'chapter-1-field-entry': location('chapter-1-field-entry', RegionId.FIELDS, 430, -452, 'right'),
  'chapter-1-first-fragment': location('chapter-1-first-fragment', RegionId.FIELDS, 390, -920, 'down'),
  'city-divination-temple': location('city-divination-temple', RegionId.CITY, 0, 1010, 'up', 'temple-entry'),
  // Entries and NPC positions are deliberately separate: the player arrives
  // nearby, then walks up to the speaker instead of standing inside them.
  'chapter-2-riverbank-investigation': location('chapter-2-riverbank-investigation', RegionId.RIVERBANK, -5060, -700, 'right'),
  'chapter-2-riverbank-npc': location('chapter-2-riverbank-npc', RegionId.RIVERBANK, -4900, -700, 'left', 'fisher'),
  'chapter-3-royal-tomb-entry': location('chapter-3-royal-tomb-entry', RegionId.ROYAL_TOMB, 2290, -3910, 'right'),
  'chapter-3-royal-tomb-npc': location('chapter-3-royal-tomb-npc', RegionId.ROYAL_TOMB, 2450, -3910, 'left', 'gorge-keeper'),
  'story-return-city': location('story-return-city', RegionId.CITY, 0, 20, 'down'),
};

export type StoryLocationId = keyof typeof STORY_LOCATIONS;

export function storyLocation(id: string | undefined): StoryLocation | null {
  return id ? STORY_LOCATIONS[id] ?? null : null;
}
