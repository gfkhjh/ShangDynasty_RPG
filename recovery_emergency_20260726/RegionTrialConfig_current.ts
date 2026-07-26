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
      currentWorldBounds: { minX: -2020, maxX: 2020, minY: -960, maxY: 2170 },
      cameraBounds: { minX: -2020, maxX: 2020, minY: -960, maxY: 2170 },
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
      cameraBounds: { minX: 140, maxX: 3060, minY: -2260, maxY: -340 },
    },
    {
      id: RegionId.RIVERBANK,
      displayName: '洹水河畔',
      currentWorldBounds: { minX: -6000, maxX: -3800, minY: -3000, maxY: 850 },
      cameraBounds: { minX: -5940, maxX: -3860, minY: -2940, maxY: 850 },
    },
    {
      id: RegionId.ROYAL_TOMB,
      displayName: '王陵甲骨窖穴',
      currentWorldBounds: { minX: 600, maxX: 5200, minY: -4100, maxY: -2450 },
      cameraBounds: { minX: 540, maxX: 5260, minY: -4160, maxY: -2390 },
    },
  ],
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
    // -- OUTSKIRTS west ↔ HIGHLAND --
    {
      id: 'outskirts-west-road-entry',
      regionId: RegionId.OUTSKIRTS,
      worldPosition: new Vec2(-1960, 440),
      facingDirection: 'right',
      safeOffset: 80,
    },
    {
      id: 'highland-east-road-entry',
      regionId: RegionId.HIGHLAND,
      worldPosition: new Vec2(5600, -1300),
      facingDirection: 'left',
      safeOffset: 80,
    },
    // -- North: OUTSKIRTS ↔ ROYAL_TOMB --
    {
      id: 'outskirts-north-road-entry',
      regionId: RegionId.OUTSKIRTS,
      worldPosition: new Vec2(0, 2120),
      facingDirection: 'down',
      safeOffset: 80,
    },
    {
      id: 'royal-tomb-south-road-entry',
      regionId: RegionId.ROYAL_TOMB,
      worldPosition: new Vec2(2290, -3980),
      facingDirection: 'up',
      safeOffset: 80,
    },
    // -- East: OUTSKIRTS ↔ FIELDS --
    {
      id: 'outskirts-east-road-entry',
      regionId: RegionId.OUTSKIRTS,
      worldPosition: new Vec2(1940, 615),
      facingDirection: 'left',
      safeOffset: 80,
    },
    {
      id: 'fields-west-road-entry',
      regionId: RegionId.FIELDS,
      worldPosition: new Vec2(280, -760),
      facingDirection: 'right',
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
    // -- West: OUTSKIRTS ↔ HIGHLAND --
    {
      id: 'outskirts-west-road-to-highland',
      sourceRegionId: RegionId.OUTSKIRTS,
      triggerBounds: { minX: -2020, maxX: -1972, minY: 384, maxY: 496 },
      travelDirection: 'left',
      targetRegionId: RegionId.HIGHLAND,
      targetEntryId: 'highland-east-road-entry',
    },
    {
      id: 'highland-east-road-to-outskirts',
      sourceRegionId: RegionId.HIGHLAND,
      triggerBounds: { minX: 5652, maxX: 5700, minY: -1346, maxY: -1254 },
      travelDirection: 'right',
      targetRegionId: RegionId.OUTSKIRTS,
      targetEntryId: 'outskirts-west-road-entry',
    },
    // -- North: OUTSKIRTS ↔ ROYAL_TOMB --
    {
      id: 'outskirts-north-road-to-royal-tomb',
      sourceRegionId: RegionId.OUTSKIRTS,
      triggerBounds: { minX: -47, maxX: 47, minY: 2140, maxY: 2170 },
      travelDirection: 'up',
      targetRegionId: RegionId.ROYAL_TOMB,
      targetEntryId: 'royal-tomb-south-road-entry',
    },
    {
      id: 'royal-tomb-south-road-to-outskirts',
      sourceRegionId: RegionId.ROYAL_TOMB,
      triggerBounds: { minX: 2234, maxX: 2346, minY: -4100, maxY: -4080 },
      travelDirection: 'down',
      targetRegionId: RegionId.OUTSKIRTS,
      targetEntryId: 'outskirts-north-road-entry',
    },
    // -- East: OUTSKIRTS ↔ FIELDS --
    {
      id: 'outskirts-east-road-to-fields',
      sourceRegionId: RegionId.OUTSKIRTS,
      triggerBounds: { minX: 1960, maxX: 2020, minY: 580, maxY: 650 },
      travelDirection: 'right',
      targetRegionId: RegionId.FIELDS,
      targetEntryId: 'fields-west-road-entry',
    },
    {
      id: 'fields-west-road-to-outskirts',
      sourceRegionId: RegionId.FIELDS,
      triggerBounds: { minX: 210, maxX: 290, minY: -800, maxY: -720 },
      travelDirection: 'left',
      targetRegionId: RegionId.OUTSKIRTS,
      targetEntryId: 'outskirts-east-road-entry',
    },
  ],
});
