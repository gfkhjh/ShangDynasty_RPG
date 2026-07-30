import { Color, DebugMode, game, Graphics, Label, Node, screen, UIOpacity, UITransform, Vec2, view, Widget } from 'cc';
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
  /** Static landing validation for authored scripted entries; excludes transient actors. */
  canScriptedEntryStand?: (entry: Readonly<RegionEntry>) => boolean;
  getCameraPosition: () => Readonly<Vec2>;
  setCameraPosition: (position: Readonly<Vec2>) => void;
  syncCameraImmediately: () => void;
  setRegionUi: (regionId: RegionId) => void;
  setInputLocked: (locked: boolean) => void;
  getWorldNode: () => Node;
  onRegionChanged?: (regionId: RegionId) => void;
};

type ScriptedTransitionCallbacks = {
  onCompleted?: () => void;
  onFailed?: (reason: string) => void;
};

/**
 * Keeps the first route deliberately self-contained: it changes no map data and
 * only teleports while a Canvas-level black screen is fully opaque.
 */
export class RegionTransitionManager {
  readonly fadeOutSeconds = .22;
  readonly fadeInSeconds = .22;
  readonly cooldownSeconds = .5;
  private readonly entries = new Map<string, RegionEntry>();
  private readonly definitions = new Map<RegionId, RegionDefinition>();
  private stateValue = RegionTransitionState.IDLE;
  private currentRegionValue: RegionId;
  private activeExit: RegionExit | null = null;
  private stateElapsed = 0;
  private cooldownRemaining = 0;
  private overlay!: Node;
  private overlayOpacity!: UIOpacity;
  private readonly refreshOverlay = () => {
    if (!this.overlay?.isValid) return;
    const transform = this.overlay.getComponent(UITransform)!;
    const hostTransform = this.host.getComponent(UITransform);
    const visible = view.getVisibleSize();
    // visibleSize is the design-size viewport under SHOW_ALL and can remain
    // 1280×720 while the browser canvas grows sideways.  screen.windowSize is
    // the actual render target, so using the larger value covers both cases.
    const width = Math.max(screen.windowSize.width, visible.width, hostTransform?.width ?? 0);
    const height = Math.max(screen.windowSize.height, visible.height, hostTransform?.height ?? 0);
    transform.setContentSize(width, height);
    const graphics = this.overlay.getComponent(Graphics)!;
    graphics.clear();
    graphics.fillColor = new Color(0, 0, 0, 255);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
  };
  private debugWorld: Node | null = null;
  private debugLabel: Label | null = null;
  private mismatchReported = false;
  private cooldownExitCleared = false;
  private sourceSnapshot: { regionId: RegionId; position: Vec2; facing: FacingDirection; cameraPosition: Vec2 } | null = null;
  private pendingEntryId: string | null = null;
  private pendingScriptedCallbacks: ScriptedTransitionCallbacks | null = null;

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
    this.createOverlay();
    this.createDebugNodes();
    this.callbacks.setRegionUi(initialRegion);
  }

  get currentRegionId() { return this.currentRegionValue; }
  get state() { return this.stateValue; }
  get isInputLocked() { return this.stateValue !== RegionTransitionState.IDLE && this.stateValue !== RegionTransitionState.COOLDOWN; }
  getEntry(entryId: string): RegionEntry | null { return this.entries.get(entryId) ?? null; }
  getRegisteredEntries(): ReadonlyArray<RegionEntry> { return Array.from(this.entries.values()); }

  /** Returns the first natural boundary exit on a route to another map. */
  getExitToward(targetRegionId: RegionId): RegionExit | null {
    const source = this.currentRegionValue;
    if (source === targetRegionId) return null;
    const canReach = (start: RegionId) => {
      const queue: RegionId[] = [start];
      const visited = new Set<RegionId>([start]);
      while (queue.length) {
        const current = queue.shift()!;
        if (current === targetRegionId) return true;
        for (const exit of this.exits) {
          if (exit.sourceRegionId !== current || visited.has(exit.targetRegionId)) continue;
          visited.add(exit.targetRegionId);
          queue.push(exit.targetRegionId);
        }
      }
      return false;
    };
    return this.exits.find(exit => exit.sourceRegionId === source && canReach(exit.targetRegionId)) ?? null;
  }
  get cameraBounds() {
    const definition = this.definitions.get(this.currentRegionValue);
    if (!definition || !pointInWorldBounds(this.callbacks.getPlayerFootPosition(), definition.currentWorldBounds)) return undefined;
    return definition.cameraBounds;
  }

  /** Uses the existing blackout state machine for scripted travel as well as exits. */
  transitionToEntry(entryId: string, scriptedCallbacks?: ScriptedTransitionCallbacks) {
    if (this.stateValue !== RegionTransitionState.IDLE && this.stateValue !== RegionTransitionState.COOLDOWN) {
      scriptedCallbacks?.onFailed?.(`transition-state:${this.stateValue}`);
      return false;
    }
    const entry = this.entries.get(entryId);
    if (!entry) {
      console.error('[RegionTransition] scripted entry validation failed.', { entryId, entry });
      scriptedCallbacks?.onFailed?.('entry-not-registered');
      return false;
    }
    this.sourceSnapshot = {
      regionId: this.currentRegionValue,
      position: new Vec2(this.callbacks.getPlayerFootPosition().x, this.callbacks.getPlayerFootPosition().y),
      facing: this.callbacks.getPlayerFacing(),
      cameraPosition: new Vec2(this.callbacks.getCameraPosition().x, this.callbacks.getCameraPosition().y),
    };
    this.pendingEntryId = entryId;
    this.pendingScriptedCallbacks = scriptedCallbacks ?? null;
    this.activeExit = null;
    this.stateValue = RegionTransitionState.FADING_OUT;
    this.stateElapsed = 0;
    this.callbacks.setInputLocked(true);
    return true;
  }

  update(dt: number) {
    this.updateDebugView();
    if (this.stateValue === RegionTransitionState.IDLE) {
      this.syncRegionFromWorldPosition();
      this.tryStartExit();
      return;
    }
    this.stateElapsed += dt;
    if (this.stateValue === RegionTransitionState.FADING_OUT) {
      this.setOverlayAlpha(Math.min(1, this.stateElapsed / this.fadeOutSeconds));
      if (this.stateElapsed >= this.fadeOutSeconds) this.switchRegionWhileBlack();
      return;
    }
    if (this.stateValue === RegionTransitionState.FADING_IN) {
      this.setOverlayAlpha(Math.max(0, 1 - this.stateElapsed / this.fadeInSeconds));
      if (this.stateElapsed >= this.fadeInSeconds) {
        this.setOverlayAlpha(0);
        this.stateValue = RegionTransitionState.COOLDOWN;
        this.stateElapsed = 0;
        this.cooldownRemaining = this.cooldownSeconds;
        this.cooldownExitCleared = false;
        this.callbacks.setInputLocked(false);
      }
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
    this.stateValue = RegionTransitionState.FADING_OUT;
    this.stateElapsed = 0;
    this.callbacks.setInputLocked(true);
  }

  private switchRegionWhileBlack() {
    const exit = this.activeExit;
    const scriptedEntry = this.pendingEntryId ? this.entries.get(this.pendingEntryId) : undefined;
    const entry = scriptedEntry ?? (exit ? this.entries.get(exit.targetEntryId) : undefined);
    const entryMatchesTarget = scriptedEntry ? true : !!exit && !!entry && entry.regionId === exit.targetRegionId;
    // Scripted arrivals validate while the target region identity is active.
    // This prevents source-region state (for example RIVERBANK elevation) from
    // rejecting a valid target entry before the blackout switch commits.
    if (scriptedEntry && entry) this.currentRegionValue = entry.regionId;
    const entryStandable = entryMatchesTarget && !!entry
      ? (scriptedEntry
        ? (this.callbacks.canScriptedEntryStand
          ? this.callbacks.canScriptedEntryStand(entry)
          : this.callbacks.canPlayerStand(entry.worldPosition))
        : this.callbacks.canPlayerStand(entry.worldPosition))
      : false;
    if ((!exit && !scriptedEntry) || !entry || !entryMatchesTarget || !entryStandable) {
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
      const scriptedCallbacks = this.pendingScriptedCallbacks;
      this.pendingScriptedCallbacks = null;
      scriptedCallbacks?.onCompleted?.();
      this.checkCoordinateMismatchOnce();
      const destinationPosition = this.callbacks.getPlayerFootPosition();
      const insideDestinationExit = this.exits.some(candidate =>
        candidate.sourceRegionId === entry.regionId
        && pointInWorldBounds(destinationPosition, candidate.triggerBounds));
      if (exit) this.logTransitionDebug('switched-while-black', exit, destinationPosition, {
        beforePosition: this.sourceSnapshot
          ? { x: this.sourceSnapshot.position.x, y: this.sourceSnapshot.position.y }
          : null,
        afterPosition: { x: destinationPosition.x, y: destinationPosition.y },
        insideDestinationExit,
      });
      this.sourceSnapshot = null;
      this.stateValue = RegionTransitionState.FADING_IN;
      this.stateElapsed = 0;
    } catch (error) {
      console.error('[RegionTransition] switch failed; restoring the source state.', error);
      const scriptedCallbacks = this.pendingScriptedCallbacks;
      this.pendingScriptedCallbacks = null;
      scriptedCallbacks?.onFailed?.('switch-exception');
      this.restoreSourceState();
    } finally {
      this.activeExit = null;
      this.pendingEntryId = null;
    }
  }

  private createOverlay() {
    this.overlay = new Node('RegionTransitionBlackout');
    this.overlay.parent = this.host;
    this.overlay.setPosition(0, 0, 1000);
    this.overlay.addComponent(UITransform);
    const widget = this.overlay.addComponent(Widget);
    widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
    widget.left = widget.right = widget.top = widget.bottom = 0;
    widget.alignMode = Widget.AlignMode.ALWAYS;
    this.overlay.addComponent(Graphics);
    this.refreshOverlay();
    view.on('canvas-resize', this.refreshOverlay, this);
    view.on('design-resolution-changed', this.refreshOverlay, this);
    this.overlayOpacity = this.overlay.addComponent(UIOpacity);
    this.setOverlayAlpha(0);
  }

  private setOverlayAlpha(progress: number) {
    this.overlayOpacity.opacity = Math.round(Math.max(0, Math.min(1, progress)) * 255);
    this.overlay.active = this.overlayOpacity.opacity > 0;
    if (this.overlay.active) this.overlay.setSiblingIndex((this.overlay.parent?.children.length ?? 1) - 1);
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
   * never be adopted from coordinates because doing so bypasses the blackout,
   * input lock, teleport and camera synchronization state machine.
   */
  private syncRegionFromWorldPosition() {
    // Region identities are authoritative after a blackout transition. The
    // legacy global-coordinate regions overlap around the FIELDS west road.
    if (this.currentRegionValue === RegionId.FIELDS) return;
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
          + 'wilderness regions require a configured blackout exit.',
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
    this.pendingEntryId = null;
    const scriptedCallbacks = this.pendingScriptedCallbacks;
    this.pendingScriptedCallbacks = null;
    scriptedCallbacks?.onFailed?.('entry-validation-failed-during-switch');
    this.stateValue = RegionTransitionState.FADING_IN;
    this.stateElapsed = 0;
  }
}
