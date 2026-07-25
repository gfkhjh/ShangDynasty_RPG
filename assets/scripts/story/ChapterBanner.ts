import {
  BlockInputEvents,
  Color,
  Graphics,
  Label,
  Node,
  tween,
  Tween,
  UIOpacity,
  UITransform,
  Vec3,
} from 'cc';

export class ChapterBanner {
  private readonly root: Node;
  private readonly numberLabel: Label;
  private readonly titleLabel: Label;
  private readonly subtitleLabel: Label;
  private readonly opacity: UIOpacity;
  private readonly titleGlow: Node;
  private readonly crackFlash: Node;
  private readonly fallingFragments: Node[] = [];

  constructor(parent: Node) {
    this.root = new Node('StoryChapterBanner');
    this.root.parent = parent;
    this.root.setPosition(0, 0, 520);
    this.root.addComponent(UITransform).setContentSize(1280, 720);
    this.root.addComponent(BlockInputEvents);
    this.opacity = this.root.addComponent(UIOpacity);
    const background = this.root.addComponent(Graphics);
    background.fillColor = new Color(22, 16, 13, 248);
    background.rect(-640, -360, 1280, 720);
    background.fill();
    background.fillColor = new Color(79, 49, 32, 110);
    background.circle(-410, 170, 180);
    background.circle(435, -205, 230);
    background.fill();
    background.strokeColor = new Color(208, 160, 77, 210);
    background.lineWidth = 3;
    background.moveTo(-360, 56);
    background.lineTo(-105, 56);
    background.moveTo(105, 56);
    background.lineTo(360, 56);
    background.stroke();
    background.strokeColor = new Color(143, 101, 57, 150);
    background.lineWidth = 2;
    background.moveTo(-475, -235);
    background.lineTo(-302, -79);
    background.lineTo(-386, 64);
    background.moveTo(470, 228);
    background.lineTo(318, 85);
    background.lineTo(402, -65);
    background.stroke();

    this.titleGlow = new Node('StoryTitleGlow');
    this.titleGlow.parent = this.root;
    this.titleGlow.setPosition(0, 18, 0);
    this.titleGlow.addComponent(UITransform).setContentSize(560, 180);
    const glowOpacity = this.titleGlow.addComponent(UIOpacity);
    glowOpacity.opacity = 35;
    const glow = this.titleGlow.addComponent(Graphics);
    glow.fillColor = new Color(214, 155, 61, 42);
    glow.ellipse(0, 0, 275, 82);
    glow.fill();

    this.crackFlash = new Node('StoryCrackFlash');
    this.crackFlash.parent = this.root;
    this.crackFlash.setPosition(0, 5, 2);
    this.crackFlash.addComponent(UITransform).setContentSize(900, 520);
    const crackOpacity = this.crackFlash.addComponent(UIOpacity);
    crackOpacity.opacity = 0;
    const crack = this.crackFlash.addComponent(Graphics);
    crack.strokeColor = new Color(255, 218, 139, 230);
    crack.lineWidth = 3;
    crack.moveTo(0, 242);
    crack.lineTo(-36, 142);
    crack.lineTo(18, 76);
    crack.lineTo(-58, 8);
    crack.lineTo(-12, -62);
    crack.lineTo(-82, -188);
    crack.moveTo(18, 76);
    crack.lineTo(110, 22);
    crack.lineTo(68, -52);
    crack.lineTo(142, -154);
    crack.moveTo(-36, 142);
    crack.lineTo(-148, 82);
    crack.lineTo(-204, -8);
    crack.stroke();

    this.createFallingFragments();

    this.numberLabel = this.createLabel(
      'StoryChapterNumber', '序章', 0, 105, 420, 54, 24, new Color(223, 183, 102),
    );
    this.titleLabel = this.createLabel(
      'StoryChapterTitle', '天道失语', 0, 12, 700, 92, 52, new Color(255, 226, 158),
    );
    this.subtitleLabel = this.createLabel(
      'StoryChapterSubtitle',
      '通天灵龟甲崩碎，天地、人神与先祖之间的声音一夜断绝。',
      0, -92, 800, 50, 19, new Color(211, 190, 157),
    );
    this.root.active = false;
  }

  show(
    chapterNumber = '序章',
    title = '天道失语',
    subtitle = '通天灵龟甲崩碎，天地、人神与先祖之间的声音一夜断绝。',
    mode: 'prologue' | 'chapter' = 'chapter',
  ) {
    Tween.stopAllByTarget(this.root);
    Tween.stopAllByTarget(this.opacity);
    Tween.stopAllByTarget(this.titleGlow);
    Tween.stopAllByTarget(this.titleGlow.getComponent(UIOpacity)!);
    Tween.stopAllByTarget(this.crackFlash.getComponent(UIOpacity)!);
    this.numberLabel.string = chapterNumber;
    this.titleLabel.string = title;
    this.subtitleLabel.string = subtitle;
    const prologue = mode === 'prologue';
    this.fallingFragments.forEach(node => { node.active = prologue; });
    this.crackFlash.active = prologue;
    this.opacity.opacity = 0;
    this.numberLabel.node.setScale(.86, .86, 1);
    this.titleLabel.node.setScale(.82, .82, 1);
    this.subtitleLabel.node.setScale(.92, .92, 1);
    this.root.active = true;
    tween(this.opacity).to(.42, { opacity: 255 }).start();
    tween(this.numberLabel.node).delay(.12).to(.52, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' }).start();
    tween(this.titleLabel.node).delay(.25).to(.68, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
    tween(this.subtitleLabel.node).delay(.55).to(.5, { scale: new Vec3(1, 1, 1) }, { easing: 'quadOut' }).start();
    tween(this.titleGlow)
      .repeatForever(
        tween()
          .to(1.15, { scale: new Vec3(1.16, 1.12, 1) }, { easing: 'sineInOut' })
          .to(1.15, { scale: new Vec3(.94, .94, 1) }, { easing: 'sineInOut' }),
      )
      .start();
    tween(this.titleGlow.getComponent(UIOpacity)!)
      .repeatForever(
        tween()
          .to(1.15, { opacity: 82 }, { easing: 'sineInOut' })
          .to(1.15, { opacity: 28 }, { easing: 'sineInOut' }),
      )
      .start();
    if (prologue) {
      const flashOpacity = this.crackFlash.getComponent(UIOpacity)!;
      flashOpacity.opacity = 0;
      tween(flashOpacity)
        .delay(.18)
        .to(.12, { opacity: 205 }, { easing: 'quadOut' })
        .to(.55, { opacity: 0 }, { easing: 'quadIn' })
        .start();
      this.animateFallingFragments();
    }
  }

  get isOpen() {
    return this.root.active;
  }

  close(onClosed?: () => void) {
    if (!this.root.active) {
      onClosed?.();
      return;
    }
    Tween.stopAllByTarget(this.opacity);
    tween(this.opacity)
      .to(.22, { opacity: 0 }, { easing: 'quadIn' })
      .call(() => {
        this.stopEffects();
        this.root.active = false;
        onClosed?.();
      })
      .start();
  }

  destroy() {
    this.stopEffects();
    this.root.destroy();
  }

  private createFallingFragments() {
    const seeds = [
      [-520, 300, 10], [-405, 228, -14], [-292, 332, 18], [-176, 255, -8],
      [185, 326, 13], [302, 246, -16], [426, 318, 9], [535, 212, -12],
    ];
    seeds.forEach(([x, y, angle], index) => {
      const node = new Node(`StoryFallingFragment-${index}`);
      node.parent = this.root;
      node.setPosition(x, y, 1);
      node.angle = angle;
      node.addComponent(UITransform).setContentSize(48, 64);
      const opacity = node.addComponent(UIOpacity);
      opacity.opacity = 85 + index * 12;
      const g = node.addComponent(Graphics);
      g.fillColor = new Color(112, 75, 43, 220);
      g.strokeColor = new Color(222, 171, 83, 190);
      g.lineWidth = 2;
      g.moveTo(-18, 26);
      g.lineTo(15, 31);
      g.lineTo(22, 5);
      g.lineTo(9, -29);
      g.lineTo(-21, -20);
      g.lineTo(-25, 7);
      g.close();
      g.fill();
      g.stroke();
      g.strokeColor = new Color(236, 188, 99, 120);
      g.lineWidth = 1.5;
      g.moveTo(-8, 18);
      g.lineTo(5, 7);
      g.lineTo(-2, -12);
      g.moveTo(5, 7);
      g.lineTo(14, -2);
      g.stroke();
      this.fallingFragments.push(node);
    });
  }

  private animateFallingFragments() {
    this.fallingFragments.forEach((node, index) => {
      Tween.stopAllByTarget(node);
      const startX = node.position.x;
      const startY = 315 + (index % 3) * 48;
      node.setPosition(startX, startY, 1);
      const duration = 2.4 + (index % 4) * .33;
      tween(node)
        .repeatForever(
          tween()
            .to(duration, {
              position: new Vec3(startX + (index % 2 === 0 ? 42 : -38), -330, 1),
              angle: node.angle + (index % 2 === 0 ? 52 : -46),
            }, { easing: 'sineIn' })
            .call(() => {
              node.setPosition(startX, startY, 1);
              node.angle = index % 2 === 0 ? 10 : -12;
            }),
        )
        .start();
    });
  }

  private stopEffects() {
    Tween.stopAllByTarget(this.titleGlow);
    Tween.stopAllByTarget(this.titleGlow.getComponent(UIOpacity)!);
    Tween.stopAllByTarget(this.crackFlash.getComponent(UIOpacity)!);
    this.fallingFragments.forEach(node => Tween.stopAllByTarget(node));
  }

  private createLabel(
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number,
    color: Color,
  ) {
    const node = new Node(name);
    node.parent = this.root;
    node.setPosition(x, y, 1);
    node.addComponent(UITransform).setContentSize(width, height);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 10;
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.SHRINK;
    return label;
  }
}
