import { Vec2 } from 'cc';

/** Stable gameplay identifiers. Display names intentionally stay outside save/logic keys. */
export enum RegionId {
  CITY = 'CITY',
  OUTSKIRTS = 'OUTSKIRTS',
  HIGHLAND = 'HIGHLAND',
  FIELDS = 'FIELDS',
  RIVERBANK = 'RIVERBANK',
  ROYAL_TOMB = 'ROYAL_TOMB',
}

export type WorldBounds = { minX: number; maxX: number; minY: number; maxY: number };
export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export type RegionDefinition = {
  id: RegionId;
  displayName: string;
  currentWorldBounds: WorldBounds;
  /** Omitted for compatibility-only regions that are not part of this trial. */
  cameraBounds?: WorldBounds;
  optionalUnlockCheck?: () => boolean;
};

export type RegionEntry = {
  id: string;
  regionId: RegionId;
  worldPosition: Vec2;
  facingDirection: FacingDirection;
  /** Distance, in world pixels, between the spawn and its corresponding exit trigger. */
  safeOffset: number;
};

export type RegionExit = {
  id: string;
  sourceRegionId: RegionId;
  triggerBounds: WorldBounds;
  travelDirection: FacingDirection;
  targetRegionId: RegionId;
  targetEntryId: string;
};

export const pointInWorldBounds = (point: Readonly<Vec2>, bounds: WorldBounds) =>
  point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY;
