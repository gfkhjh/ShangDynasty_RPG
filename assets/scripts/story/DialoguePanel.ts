import {
  BlockInputEvents,
  Color,
  Graphics,
  Label,
  Node,
  screen,
  tween,
  Tween,
  UIOpacity,
  UITransform,
  Vec3,
  view,
  Widget,
} from 'cc';
import { DialogueLine } from './StoryTypes';

export class DialoguePanel {
  private readonly root: Node;
  private readonly speakerLabel: Label;
  private readonly bodyLabel: Label;
  private readonly hintLabel: Label;
  private readonly cinematicBackdrop: Node;
  private readonly cinematicOpacity: UIOpacity;
  private readonly bodyOpacity: UIOpacity;
  private readonly mistNodes: Node[] = [];
  private readonly lightMotes: Node[] = [];
  private lines: DialogueLine[] = [];
  private index = 0;
  private completed: (() => void) | null = null;
  private cinematicSequence = false;
  private closing = false;
  private readonly resizeCinematicBackdrop = () => this.refreshCinematicBackdrop();

  constructor(parent: Node) {
    this.root = new Node('StoryDialoguePanel');
    this.root.parent = parent;
    this.root.setPosition(0, -245, 300);
    this.root.addComponent(UITransform).setContentSize(1120, 210);
    this.root.addComponent(BlockInputEvents);

    this.cinematicBackdrop = new Node('StoryCinematicBackdrop');
    // The narration atmosphere is a screen-space Canvas child, rather than a
    // child of the fixed-size dialogue card.  This keeps it full-bleed on
    // every aspect ratio while the dialogue card stays at its authored size.
    this.cinematicBackdrop.parent = parent;
    this.cinematicBackdrop.setPosition(0, 0, 290);
    const cinematicTransform = this.cinematicBackdrop.addComponent(UITransform);
    cinematicTransform.setAnchorPoint(.5, .5);
    const cinematicWidget = this.cinematicBackdrop.addComponent(Widget);
    cinematicWidget.isAlignTop = true;
    cinematicWidget.isAlignBottom = true;
    cinematicWidget.isAlignLeft = true;
    cinematicWidget.isAlignRight = true;
    cinematicWidget.top = 0;
    cinematicWidget.bottom = 0;
    cinematicWidget.left = 0;
    cinematicWidget.right = 0;
    cinematicWidget.alignMode = Widget.AlignMode.ALWAYS;
    this.cinematicOpacity = this.cinematicBackdrop.addComponent(UIOpacity);
    this.cinematicOpacity.opacity = 0;
    this.cinematicBackdrop.addComponent(Graphics);
    this.refreshCinematicBackdrop();
    view.on('canvas-resize', this.resizeCinematicBackdrop, this);
    view.on('design-resolution-changed', this.resizeCinematicBackdrop, this);
    this.createCinematicAtmosphere();

    const background = this.root.addComponent(Graphics);
    background.fillColor = new Color(42, 29, 22, 242);
    background.roundRect(-560, -105, 1120, 210, 18);
    background.fill();
    background.strokeColor = new Color(210, 164, 91, 255);
    background.lineWidth = 4;
    background.roundRect(-558, -103, 1116, 206, 16);
    background.stroke();

    this.speakerLabel = this.createLabel('StorySpeaker', -460, 66, 210, 42, 23, new Color(245, 203, 121));
    this.bodyLabel = this.createLabel('StoryBody', 45, 5, 900, 118, 22, new Color(255, 244, 218));
    this.bodyOpacity = this.bodyLabel.node.addComponent(UIOpacity);
    this.bodyLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    this.bodyLabel.verticalAlign = Label.VerticalAlign.TOP;
    this.bodyLabel.enableWrapText = true;
    this.hintLabel = this.createLabel('StoryAdvanceHint', 445, -77, 190, 28, 14, new Color(205, 183, 148));
    this.hintLabel.string = '点击继续';
    this.root.on(Node.EventType.TOUCH_END, this.advance, this);
    this.root.active = false;
  }

  get isOpen() {
    return this.root.active;
  }

  open(lines: DialogueLine[], completed?: () => void, cinematicSequence = false) {
    this.lines = [...lines];
    this.index = 0;
    this.completed = completed ?? null;
    this.cinematicSequence = cinematicSequence;
    this.closing = false;
    this.root.active = this.lines.length > 0;
    if (this.root.active) {
      // The card must remain above the direct Canvas backdrop in traversal
      // order as well as in its authored Z layer.
      this.root.setSiblingIndex((this.root.parent?.children.length ?? 1) - 1);
      this.startAtmosphere();
      this.renderCurrent();
    }
    else this.finish();
  }

  advance() {
    if (!this.root.active || this.closing) return;
    this.index++;
    if (this.index >= this.lines.length) {
      this.finish();
      return;
    }
    this.renderCurrent();
  }

  close() {
    this.lines = [];
    this.index = 0;
    this.completed = null;
    this.cinematicSequence = false;
    this.closing = false;
    this.stopAtmosphere();
    this.root.active = false;
  }

  destroy() {
    this.root.off(Node.EventType.TOUCH_END, this.advance, this);
    view.off('canvas-resize', this.resizeCinematicBackdrop, this);
    view.off('design-resolution-changed', this.resizeCinematicBackdrop, this);
    this.cinematicBackdrop.destroy();
    this.root.destroy();
  }

  private refreshCinematicBackdrop() {
    if (!this.cinematicBackdrop.isValid) return;
    const transform = this.cinematicBackdrop.getComponent(UITransform)!;
    const parentTransform = this.cinematicBackdrop.parent?.getComponent(UITransform);
    const windowSize = screen.windowSize;
    const visibleSize = view.getVisibleSize();
    // Slight overscan prevents a one-pixel seam from floating point Canvas
    // conversion during browser resize/fullscreen transitions.
    const width = Math.max(windowSize.width, visibleSize.width, parentTransform?.width ?? 0) + 12;
    const height = Math.max(windowSize.height, visibleSize.height, parentTransform?.height ?? 0) + 12;
    this.cinematicBackdrop.setPosition(0, 0, 290);
    this.cinematicBackdrop.getComponent(Widget)?.updateAlignment();
    // Widget supplies true four-side Canvas alignment; overscan is applied
    // afterwards so browser rounding cannot expose a map-coloured edge.
    transform.setContentSize(width, height);

    const cinematic = this.cinematicBackdrop.getComponent(Graphics)!;
    cinematic.clear();
    cinematic.fillColor = new Color(18, 13, 11, 218);
    cinematic.rect(-width / 2, -height / 2, width, height);
    cinematic.fill();
    cinematic.fillColor = new Color(74, 49, 31, 52);
    cinematic.ellipse(-width * .28125, height * .16, width * .258, height * .229);
    cinematic.ellipse(width * .305, -height * .118, width * .32, height * .264);
    cinematic.fill();
    cinematic.strokeColor = new Color(195, 140, 62, 75);
    cinematic.lineWidth = 2;
    cinematic.moveTo(-width / 2, height * .128);
    cinematic.bezierCurveTo(-width * .281, height * .229, -width * .164, height * .017, width * .02, height * .128);
    cinematic.bezierCurveTo(width * .207, height * .233, width * .336, height * .035, width / 2, height * .164);
    cinematic.moveTo(-width / 2, -height * .164);
    cinematic.bezierCurveTo(-width * .32, -height * .058, -width * .16, -height * .285, width * .031, -height * .146);
    cinematic.bezierCurveTo(width * .219, -height * .021, width * .355, -height * .261, width / 2, -height * .133);
    cinematic.stroke();
  }

  private finish() {
    const completed = this.completed;
    if (this.cinematicSequence) {
      this.completed = null;
      this.closing = true;
      // Start the next chapter banner while the prologue atmosphere is still
      // visible underneath it. The two layers then cross-fade without exposing
      // a bright frame of the playable map.
      completed?.();
      Tween.stopAllByTarget(this.bodyOpacity);
      Tween.stopAllByTarget(this.cinematicOpacity);
      tween(this.bodyOpacity).to(.32, { opacity: 0 }, { easing: 'quadIn' }).start();
      tween(this.cinematicOpacity)
        .delay(.18)
        .to(.68, { opacity: 0 }, { easing: 'sineInOut' })
        .call(() => this.close())
        .start();
      return;
    }
    this.close();
    completed?.();
  }

  private renderCurrent() {
    const line = this.lines[this.index];
    const narration = line.kind === 'narration';
    const system = line.kind === 'system';
    this.speakerLabel.string = narration ? '旁白' : system ? '提示' : line.speaker;
    this.bodyLabel.string = line.text;
    this.hintLabel.string = `${this.index + 1}/${this.lines.length}  点击继续`;
    Tween.stopAllByTarget(this.bodyOpacity);
    this.bodyOpacity.opacity = 0;
    tween(this.bodyOpacity).to(.28, { opacity: 255 }, { easing: 'quadOut' }).start();
    Tween.stopAllByTarget(this.cinematicOpacity);
    const showCinematic = this.cinematicSequence;
    tween(this.cinematicOpacity)
      .to(showCinematic ? .36 : .22, { opacity: showCinematic ? 235 : 0 }, { easing: 'sineInOut' })
      .start();
    if (showCinematic && narration) this.pulseNarrationEffect(this.index);
  }

  private createCinematicAtmosphere() {
    for (let index = 0; index < 3; index++) {
      const mist = new Node(`StoryMist-${index}`);
      mist.parent = this.cinematicBackdrop;
      mist.setPosition(-470 + index * 360, 155 - index * 145, 1);
      mist.addComponent(UITransform).setContentSize(520, 115);
      const opacity = mist.addComponent(UIOpacity);
      opacity.opacity = 18 + index * 7;
      const g = mist.addComponent(Graphics);
      g.fillColor = new Color(173, 139, 92, 40);
      g.ellipse(0, 0, 255, 52);
      g.fill();
      this.mistNodes.push(mist);
    }
    const motePositions = [
      [-455, 180], [-260, -35], [-55, 205], [178, -130], [390, 125], [520, -40],
    ];
    motePositions.forEach(([x, y], index) => {
      const mote = new Node(`StoryBoneLight-${index}`);
      mote.parent = this.cinematicBackdrop;
      mote.setPosition(x, y, 2);
      mote.addComponent(UITransform).setContentSize(20, 20);
      const opacity = mote.addComponent(UIOpacity);
      opacity.opacity = 45;
      const g = mote.addComponent(Graphics);
      g.fillColor = new Color(242, 190, 91, 175);
      g.circle(0, 0, 2.5 + index % 3);
      g.fill();
      this.lightMotes.push(mote);
    });
  }

  private startAtmosphere() {
    this.mistNodes.forEach((mist, index) => {
      Tween.stopAllByTarget(mist);
      const x = mist.position.x;
      tween(mist)
        .repeatForever(
          tween()
            .to(4.2 + index, { position: new Vec3(x + 90, mist.position.y + 16, 1) }, { easing: 'sineInOut' })
            .to(4.2 + index, { position: new Vec3(x, mist.position.y - 8, 1) }, { easing: 'sineInOut' }),
        )
        .start();
    });
    this.lightMotes.forEach((mote, index) => {
      const opacity = mote.getComponent(UIOpacity)!;
      Tween.stopAllByTarget(mote);
      Tween.stopAllByTarget(opacity);
      tween(mote)
        .repeatForever(
          tween()
            .by(1.5 + index * .13, { position: new Vec3(index % 2 ? -12 : 14, 24, 0) }, { easing: 'sineInOut' })
            .by(1.5 + index * .13, { position: new Vec3(index % 2 ? 12 : -14, -24, 0) }, { easing: 'sineInOut' }),
        )
        .start();
      tween(opacity)
        .repeatForever(
          tween()
            .to(.8 + index * .08, { opacity: 165 }, { easing: 'sineInOut' })
            .to(.8 + index * .08, { opacity: 32 }, { easing: 'sineInOut' }),
        )
        .start();
    });
  }

  private pulseNarrationEffect(index: number) {
    const mote = this.lightMotes[index % this.lightMotes.length];
    if (!mote) return;
    const opacity = mote.getComponent(UIOpacity)!;
    Tween.stopAllByTarget(opacity);
    opacity.opacity = 40;
    tween(opacity)
      .to(.16, { opacity: 240 }, { easing: 'quadOut' })
      .to(.7, { opacity: 55 }, { easing: 'quadIn' })
      .start();
  }

  private stopAtmosphere() {
    Tween.stopAllByTarget(this.bodyOpacity);
    Tween.stopAllByTarget(this.cinematicOpacity);
    this.mistNodes.forEach(node => Tween.stopAllByTarget(node));
    this.lightMotes.forEach(node => {
      Tween.stopAllByTarget(node);
      Tween.stopAllByTarget(node.getComponent(UIOpacity)!);
    });
    this.cinematicOpacity.opacity = 0;
  }

  private createLabel(name: string, x: number, y: number, width: number, height: number, fontSize: number, color: Color) {
    const node = new Node(name);
    node.parent = this.root;
    node.setPosition(x, y, 1);
    node.addComponent(UITransform).setContentSize(width, height);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.color = color;
    label.overflow = Label.Overflow.CLAMP;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    return label;
  }
}

