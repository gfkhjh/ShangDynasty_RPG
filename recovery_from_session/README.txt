Reconstructed from OpenCode conversation history.
Base commit: f40a119 (fix: realign ROYAL_TOMB south boundary, remove CITY south/east gate air walls)

Files modified in this session:
  YinXuCity_reconstructed.ts  - Major changes (see below)
  RegionTrialConfig_reconstructed.ts - 3 line changes (ROYAL_TOMB camera, east entry/exit)
  RegionTransitionManager_reconstructed.ts - NOT MODIFIED (identical to f40a119)
  RegionTypes_reconstructed.ts - NOT MODIFIED (identical to f40a119)

YinXuCity.ts changes summary:
  1. RectObstacle: added regionId?: string
  2. East gate center: 605 -> 440
  3. Fields: outskirtsGroundNode, outskirtsTileContainer
  4. updateOutskirtsVisibility() method
  5. OUTSKIRTS boundary obstacles: tagged with regionId='OUTSKIRTS', coordinates updated
  6. South boundary gap: X=-47..47 -> X=-56..56
  7. East boundary gap: Y=549..661 -> Y=384..496
  8. Removed OutskirtsNorthWestBoundary, OutskirtsNorthEastBoundary
  9. East road: horizontal at cityEastWestRoadCenterY, 112x112 rotated 90 deg
  10. North gate body deleted (if key==='north') return)
  11. South gate body Y: -425 -> -185
  12. Wall thickness: hThick 160->142, vThick 144->100
  13. canStandRadius: region filtering added
  14. addObstacle: optional regionId parameter
  15. Grass tiles parented to outskirtsTileContainer
  16. Grass tile X loop extended (x < o.right + tileStep)
  17. onRegionChanged callback for visibility update
  18. Deleted 田野北侧土坡 obstacle
  19. updateOutskirtsVisibility() called at end of buildWorld()
