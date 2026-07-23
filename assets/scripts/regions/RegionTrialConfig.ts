import { Vec2 } from 'cc';
import { RegionDefinition, RegionEntry, RegionExit, RegionId } from './RegionTypes';

export type RegionTrialConfig = {
  definitions: RegionDefinition[];
  entries: RegionEntry[];
  exits: RegionExit[];
};

/**
 * Phase-one compatibility data. Coordinates remain in the existing global
 * world. Direct CITY <-> wilderness exits are inactive while the continuous
 * OUTSKIRTS main-map ring is introduced in stages.
 */
export const createPhaseOneRegionConfig = (): RegionTrialConfig => ({
  definitions: [
    {
      id: RegionId.CITY,
      displayName: '殷墟城',
      currentWorldBounds: { minX: -1300, maxX: 1300, minY: -240, maxY: 1450 },
      cameraBounds: { minX: -1300, maxX: 1300, minY: -960, maxY: 1450 },
    },
    {
      id: RegionId.OUTSKIRTS,
      displayName: '城外',
      currentWorldBounds: { minX: -1300, maxX: 1300, minY: -960, maxY: -240 },
      // CITY and OUTSKIRTS share this bound, so crossing the gate only changes
      // the runtime label/RegionId and never moves the camera or player.
      cameraBounds: { minX: -1300, maxX: 1300, minY: -960, maxY: 1450 },
    },
    {
      id: RegionId.HIGHLAND,
      displayName: '山林高地',
      currentWorldBounds: { minX: 3000, maxX: 5700, minY: -2200, maxY: -400 },
      cameraBounds: { minX: 3000, maxX: 5700, minY: -2200, maxY: -400 },
    },
    {
      id: RegionId.FIELDS,
      displayName: '郊外田野',
      currentWorldBounds: { minX: 200, maxX: 3000, minY: -2200, maxY: -400 },
      cameraBounds: { minX: 200, maxX: 3000, minY: -2200, maxY: -400 },
    },
    {
      id: RegionId.RIVERBANK,
      displayName: '洹水河畔',
      currentWorldBounds: { minX: -6000, maxX: -3800, minY: -3000, maxY: 850 },
      cameraBounds: { minX: -5940, maxX: -3860, minY: -2940, maxY: 850 },
    },
    { id: RegionId.ROYAL_TOMB, displayName: '王陵甲骨窖穴', currentWorldBounds: { minX: 600, maxX: 5200, minY: -4100, maxY: -2450 } },
  ],
  // Direct CITY <-> wilderness trials are inactive. Future transitions start
  // only at the outer ends of OUTSKIRTS roads.
  entries: [
    {
      id: 'outskirts-south-road-entry',
      regionId: RegionId.OUTSKIRTS,
      worldPosition: new Vec2(0, -860),
      facingDirection: 'up',
      safeOffset: 72,
    },
    {
      id: 'riverbank-north-road-entry',
      regionId: RegionId.RIVERBANK,
      worldPosition: new Vec2(-4900, 690),
      facingDirection: 'down',
      safeOffset: 80,
    },
  ],
  exits: [
    {
      id: 'outskirts-south-road-to-riverbank',
      sourceRegionId: RegionId.OUTSKIRTS,
      triggerBounds: { minX: -47, maxX: 47, minY: -960, maxY: -932 },
      travelDirection: 'down',
      targetRegionId: RegionId.RIVERBANK,
      targetEntryId: 'riverbank-north-road-entry',
    },
    {
      id: 'riverbank-north-road-to-outskirts',
      sourceRegionId: RegionId.RIVERBANK,
      // The only active RIVERBANK boundary exit stays north of the entry
      // point. Held south input moves the arriving player away from it.
      triggerBounds: { minX: -4956, maxX: -4844, minY: 770, maxY: 820 },
      travelDirection: 'up',
      targetRegionId: RegionId.OUTSKIRTS,
      targetEntryId: 'outskirts-south-road-entry',
    },
  ],
});
