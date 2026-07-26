import { Color, DebugMode, game, Graphics, Label, Node, UITransform, Vec2 } from 'cc';
import { FacingDirection, RegionDefinition, RegionEntry, RegionExit, RegionId, WorldBounds, pointInWorldBounds } from './RegionTypes';

export enum RegionTransitionState {
  IDLE = 'IDLE',
  FADING_OUT = 'FADING_OUT',
  SWITCHING = 'SWITCHING',
  FADING_IN = 'FADING_IN',
  COOLDOWN = 'COOLDOWN',
}

type RegionTransitionCallbacks = {
  getPlayerFootPosition: () => Readonly<Vec2>;
  getPlayerFacing: () => FacingDirection;
  setPlayerPosition: (position: Readonly<Vec2>) => void;
  setPlayerFacing: (facing: FacingDirection) => void;
  canPlayerStand: (position: Readonly<Vec2>) => boolean;
  getCameraPosition: () => Readonly<Vec2>;
  setCameraPosition: (position: Readonly<Vec2>) => void;
  syncCameraImmediately: () => void;
  setRegionUi: (regionId: RegionId) => void;
  setInputLocked: (locked: boolean) => void;
  getWorldNode: () => Node;
  onRegionChanged?: (regionId: RegionId) => void;
};

/**
 * Keeps regional travel self-contained: it changes no map data and moves the
 * player directly to the registered entry point without a blackout overlay.
 */
export class RegionTransitionManager {
  readonly cooldownSeconds = .5;
  private readonly entries = new Map<string, RegionEntry>();
  private readonly definitions = new Map<RegionId, RegionDefinition>();
  private stateValue = RegionTransitionState.IDLE;
  private currentRegionValue: RegionId;
  private activeExit: RegionExit | null = null;
  private stateElapsed = 0;
  private cooldownRemaining = 0;
  private debugWorld: Node | null = null;
  private debugLabel: Label | null = null;
  private mismatchReported = false;
  private cooldownExitCleared = false;
  private sourceSnapshot: { regionId: RegionId; position: Vec2; facing: FacingDirection; cameraPosition: Vec2 } | null = null;

  constructor(
    private readonly host: Node,
    definitions: readonly RegionDefinition[],
    entries: readonly RegionEntry[],
    private readonly exits: readonly RegionExit[],
    initialRegion: RegionId,
    private readonly callbacks: RegionTransitionCallbacks,
  ) {
    definitions.forEach(definition => this.definitions.set(definition.id, definition));
    entries.forEach(entry => this.entries.set(entry.id, entry));
    this.currentRegionValue = initialRegion;
    this.createDebugNodes();
    this.callbacks.setRegionUi(initialRegion);
  }

  get currentRegionId() { return this.currentRegionValue; }
  get state() { return this.stateValue; }
  get isInputLocked() { return this.stateValue !== RegionTransitionState.IDLE && this.stateValue !== RegionTransitionState.COOLDOWN; }
  get cameraBounds() {
    const definition = this.definitions.get(this.currentRegionValue);
    if (!definition || !pointInWorldBounds(this.callbacks.getPlayerFootPosition(), definition.currentWorldBounds)) return undefined;
    return definition.cameraBounds;
  }

  update(dt: number) {
    this.updateDebugView();
    if (this.stateValue === RegionTransitionState.IDLE) {
      this.syncRegionFromWorldPosition();
      this.tryStartExit();
      return;
    }
    if (this.stateValue === RegionTransitionState.COOLDOWN) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
      const stillInsideAnyExit = this.exits.some(exit => exit.sourceRegionId === this.currentRegionValue
        && pointInWorldBounds(this.callbacks.getPlayerFootPosition(), exit.triggerBounds));
      if (!stillInsideAnyExit) this.cooldownExitCleared = true;
      if (this.cooldownRemaining <= 0 && this.cooldownExitCleared) {
        this.stateValue = RegionTransitionState.IDLE;
        this.stateElapsed = 0;
      }
    }
  }

  inferRegionFromWorldPosition(position: Readonly<Vec2>) {
    return Array.from(this.definitions.values()).find(definition => pointInWorldBounds(position, definition.currentWorldBounds))?.id ?? null;
  }

  private tryStartExit() {
    const foot = this.callbacks.getPlayerFootPosition();
    const exit = this.exits.find(candidate => candidate.sourceRegionId === this.currentRegionValue
      && pointInWorldBounds(foot, candidate.triggerBounds));
    if (!exit) return;
    const target = this.definitions.get(exit.targetRegionId);
    if (target?.optionalUnlockCheck && !target.optionalUnlockCheck()) return;
    this.activeExit = exit;
    this.sourceSnapshot = {
      regionId: this.currentRegionValue,
      position: new Vec2(foot.x, foot.y),
      facing: this.callbacks.getPlayerFacing(),
      cameraPosition: new Vec2(this.callbacks.getCameraPosition().x, this.callbacks.getCameraPosition().y),
    };
    this.logTransitionDebug('start', exit, foot, {
      insideSourceTrigger: pointInWorldBounds(foot, exit.triggerBounds),
    });
    this.callbacks.setInputLocked(true);
    this.switchRegionImmediately();
  }

  private switchRegionImmediately() {
    const exit = this.activeExit;
    const entry = exit ? this.entries.get(exit.targetEntryId) : undefined;
    const entryMatchesTarget = !!exit && !!entry && entry.regionId === exit.targetRegionId;
    const entryStandable = entryMatchesTarget && !!entry
      ? this.callbacks.canPlayerStand(entry.worldPosition)
      : false;
    if (!exit || !entry || !entryMatchesTarget || !entryStandable) {
      if (exit) {
        this.logTransitionDebug('validation-failed', exit, this.callbacks.getPlayerFootPosition(), {
          entryRegionId: entry?.regionId ?? null,
          entryPosition: entry ? { x: entry.worldPosition.x, y: entry.worldPosition.y } : null,
          entryMatchesTarget,
          entryStandable,
        });
      }
      console.error('[RegionTransition] transition validation failed; restoring the source state.', { exit, entry });
      this.restoreSourceState();
      return;
    }
    this.stateValue = RegionTransitionState.SWITCHING;
    try {
      this.currentRegionValue = entry.regionId;
      this.callbacks.setPlayerPosition(entry.worldPosition);
      this.callbacks.setPlayerFacing(entry.facingDirection);
      this.callbacks.syncCameraImmediately();
      this.callbacks.setRegionUi(entry.regionId);
      this.callbacks.onRegionChanged?.(entry.regionId);
      this.checkCoordinateMismatchOnce();
      const destinationPosition = this.callbacks.getPlayerFootPosition();
      const insideDestinationExit = this.exits.some(candidate =>
        candidate.sourceRegionId === entry.regionId
        && pointInWorldBounds(destinationPosition, candidate.triggerBounds));
      if (exit) this.logTransitionDebug('switched-immediately', exit, destinationPosition, {
        beforePosition: this.sourceSnapshot
          ? { x: this.sourceSnapshot.position.x, y: this.sourceSnapshot.position.y }
          : null,
        afterPosition: { x: destinationPosition.x, y: destinationPosition.y },
        insideDestinationExit,
      });
      this.sourceSnapshot = null;
      this.enterCooldown();
    } catch (error) {
      console.error('[RegionTransition] switch failed; restoring the source state.', error);
      this.restoreSourceState();
    } finally {
      this.activeExit = null;
    }
  }

  private enterCooldown() {
    this.stateValue = RegionTransitionState.COOLDOWN;
    this.stateElapsed = 0;
    this.cooldownRemaining = this.cooldownSeconds;
    this.cooldownExitCleared = false;
    this.callbacks.setInputLocked(false);
  }

  private createDebugNodes() {
    if ((game.config?.debugMode ?? DebugMode.NONE) === DebugMode.NONE) return;
    this.debugWorld = new Node('RegionTransitionDebugWorld');
    this.debugWorld.parent = this.callbacks.getWorldNode();
    this.debugWorld.setPosition(0, 0, 150);
    this.debugWorld.addComponent(UITransform).setContentSize(12000, 8640);
    this.debugWorld.addComponent(Graphics);
    const labelNode = new Node('RegionTransitionDebugLabel');
    labelNode.parent = this.host;
    labelNode.setPosition(-455, 255, 950);
    labelNode.addComponent(UITransform).setContentSize(430, 110);
    this.debugLabel = labelNode.addComponent(Label);
    this.debugLabel.fontSize = 14;
    this.debugLabel.lineHeight = 18;
    this.debugLabel.color = new Color(255, 240, 160);
  }

  private updateDebugView() {
    const graphics = this.debugWorld?.getComponent(Graphics);
    if (!graphics) return;
    graphics.clear();
    this.exits.forEach(exit => this.drawBounds(graphics, exit.triggerBounds, exit.sourceRegionId === this.currentRegionValue ? new Color(255, 215, 72) : new Color(140, 140, 140)));
    this.entries.forEach(entry => {
      graphics.fillColor = new Color(80, 220, 120, 210);
      graphics.circle(entry.worldPosition.x, entry.worldPosition.y, 12);
      graphics.fill();
    });
    const bounds = this.cameraBounds;
    if (bounds) this.drawBounds(graphics, bounds, new Color(80, 180, 255));
    if (this.debugLabel) this.debugLabel.string = `RegionId: ${this.currentRegionValue}\nTransition: ${this.stateValue}\nCooldown: ${this.cooldownRemaining.toFixed(2)}s`;
  }

  private drawBounds(graphics: Graphics, bounds: WorldBounds, color: Color) {
    graphics.strokeColor = color;
    graphics.lineWidth = 3;
    graphics.rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    graphics.stroke();
  }

  private logTransitionDebug(
    phase: string,
    exit: RegionExit,
    position: Readonly<Vec2>,
    details: Record<string, unknown>,
  ) {
    if ((game.config?.debugMode ?? DebugMode.NONE) === DebugMode.NONE) return;
    console.info('[RegionTransitionDebug]', {
      phase,
      sourceRegionId: exit.sourceRegionId,
      exitId: exit.id,
      targetRegionId: exit.targetRegionId,
      targetEntryId: exit.targetEntryId,
      position: { x: position.x, y: position.y },
      ...details,
    });
  }

  private checkCoordinateMismatchOnce() {
    if (this.mismatchReported) return;
    const inferred = this.inferRegionFromWorldPosition(this.callbacks.getPlayerFootPosition());
    if (inferred && inferred !== this.currentRegionValue) {
      this.mismatchReported = true;
      console.warn(`[RegionTransition] currentRegionId ${this.currentRegionValue} differs from coordinate inference ${inferred}.`);
    }
  }

  /**
   * CITY and OUTSKIRTS are the only continuous pair. Wilderness regions must
   * never be adopted from coordinates because doing so bypasses the registered
   * entry, input lock, teleport and camera synchronization state machine.
   */
  private syncRegionFromWorldPosition() {
    const inferred = this.inferRegionFromWorldPosition(this.callbacks.getPlayerFootPosition());
    if (!inferred || inferred === this.currentRegionValue) return;
    const isContinuousMainMapCrossing =
      (this.currentRegionValue === RegionId.CITY && inferred === RegionId.OUTSKIRTS)
      || (this.currentRegionValue === RegionId.OUTSKIRTS && inferred === RegionId.CITY);
    if (!isContinuousMainMapCrossing) {
      if (!this.mismatchReported) {
        this.mismatchReported = true;
        console.warn(
          `[RegionTransition] ignored coordinate-only region change ${this.currentRegionValue} -> ${inferred}; `
          + 'wilderness regions require a configured travel exit.',
        );
      }
      return;
    }
    if (!this.mismatchReported) {
      this.mismatchReported = true;
      console.warn(`[RegionTransition] currentRegionId ${this.currentRegionValue} differs from coordinate inference ${inferred}; synchronizing compatibility state.`);
    }
    this.currentRegionValue = inferred;
    this.callbacks.setRegionUi(inferred);
    this.callbacks.onRegionChanged?.(inferred);
  }

  private restoreSourceState() {
    const snapshot = this.sourceSnapshot;
    if (snapshot) {
      this.currentRegionValue = snapshot.regionId;
      this.callbacks.setPlayerPosition(snapshot.position);
      this.callbacks.setPlayerFacing(snapshot.facing);
      this.callbacks.setCameraPosition(snapshot.cameraPosition);
      this.callbacks.setRegionUi(snapshot.regionId);
    }
    this.sourceSnapshot = null;
    this.activeExit = null;
    this.enterCooldown();
  }
}
