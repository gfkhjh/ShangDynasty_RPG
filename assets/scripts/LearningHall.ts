import {
  _decorator,
  Color,
  Component,
  EventTouch,
  Graphics,
  input,
  Input,
  Label,
  Mask,
  MaskType,
  Node,
  Rect,
  resources,
  Sprite,
  SpriteFrame,
  EditBox,
  Texture2D,
  tween,
  UITransform,
  Vec3,
  view,
} from 'cc';
import { poemChallengeBank, type PoemChallengeDefinition } from './data/PoemChallengeBank';
import { chapterOneDefinition, CHAPTER_ONE_FRAGMENT_CARDS, CHAPTER_ONE_ID } from './story/ChapterOne';
import { chapterTwoDefinition, CHAPTER_TWO_FRAGMENT_CARDS, CHAPTER_TWO_ID } from './story/ChapterTwo';
import { chapterThreeDefinition, CHAPTER_THREE_FRAGMENT_CARDS, CHAPTER_THREE_ID } from './story/ChapterThree';
import { chapterFourDefinition, CHAPTER_FOUR_FRAGMENT_CARDS, CHAPTER_FOUR_ID } from './story/ChapterFour';
import { chapterFiveDefinition, CHAPTER_FIVE_FRAGMENT_CARDS, CHAPTER_FIVE_ID } from './story/ChapterFive';
import { chapterSixDefinition, CHAPTER_SIX_FRAGMENT_CARDS, CHAPTER_SIX_ID } from './story/ChapterSix';
import { chapterSevenDefinition, CHAPTER_SEVEN_FRAGMENT_CARDS, CHAPTER_SEVEN_ID } from './story/ChapterSeven';
import { chapterEightDefinition, CHAPTER_EIGHT_FRAGMENT_CARDS, CHAPTER_EIGHT_ID } from './story/ChapterEight';
import { chapterNineDefinition, CHAPTER_NINE_FRAGMENT_CARDS, CHAPTER_NINE_ID } from './story/ChapterNine';
import { CHAPTER_ROADMAP } from './story/ChapterRoadmap';

const { ccclass } = _decorator;

const STORY_CHAPTERS = {
  [CHAPTER_ONE_ID]: { definition: chapterOneDefinition, fragments: CHAPTER_ONE_FRAGMENT_CARDS },
  [CHAPTER_TWO_ID]: { definition: chapterTwoDefinition, fragments: CHAPTER_TWO_FRAGMENT_CARDS },
  [CHAPTER_THREE_ID]: { definition: chapterThreeDefinition, fragments: CHAPTER_THREE_FRAGMENT_CARDS },
  [CHAPTER_FOUR_ID]: { definition: chapterFourDefinition, fragments: CHAPTER_FOUR_FRAGMENT_CARDS },
  [CHAPTER_FIVE_ID]: { definition: chapterFiveDefinition, fragments: CHAPTER_FIVE_FRAGMENT_CARDS },
  [CHAPTER_SIX_ID]: { definition: chapterSixDefinition, fragments: CHAPTER_SIX_FRAGMENT_CARDS },
  [CHAPTER_SEVEN_ID]: { definition: chapterSevenDefinition, fragments: CHAPTER_SEVEN_FRAGMENT_CARDS },
  [CHAPTER_EIGHT_ID]: { definition: chapterEightDefinition, fragments: CHAPTER_EIGHT_FRAGMENT_CARDS },
  [CHAPTER_NINE_ID]: { definition: chapterNineDefinition, fragments: CHAPTER_NINE_FRAGMENT_CARDS },
};

const RANKS = [
  { name: '见习卜童', threshold: 0, icon: '🪶', c1: '#b8a368', c2: '#8a7038', bd: '#ffe4a5' },
  { name: '御用卜史', threshold: 1000, icon: '📜', c1: '#c49e58', c2: '#9a6e30', bd: '#ffe4a5' },
  { name: '太卜掌礼', threshold: 3000, icon: '🔱', c1: '#b080d0', c2: '#6a3a9a', bd: '#e8c8ff' },
  { name: '高阶殷卜士', threshold: 6000, icon: '🌟', c1: '#e07050', c2: '#a03020', bd: '#ffd0a0' },
  { name: '首席大卜正', threshold: 12000, icon: '👑', c1: '#d04040', c2: '#701010', bd: '#ffb0b0' },
] as const;

const AVATARS = [
  { id: 'oracle-boy-pixel', name: '玄衣卜官', emoji: '⚔', path: 'characters/oracle-boy-pixel/down-0/spriteFrame' },
  { id: 'oracle-girl-pixel', name: '青衣卜官', emoji: '✦', path: 'characters/oracle-girl-pixel/down-0/spriteFrame' },
  { id: 'oracle-boy-v1', name: '小卜官', emoji: '👦', path: 'characters/oracle-boy-v1/down-0/spriteFrame' },
  { id: 'oracle-girl-v1', name: '小卜女', emoji: '👧', path: 'characters/oracle-girl-v1/down-0/spriteFrame' },
] as const;

export type HallCard = {
  id: string;
  glyph: string;
  modern: string;
  pinyin: string;
  quality: 'blue' | 'red' | 'gold';
  meaning: string;
  evolution: string;
  history: string;
  asset?: string;
  imageBounds?: readonly [number, number, number, number];
  unlocked: boolean;
};

type HallMode = 'home' | 'enteringYinXu' | 'codex' | 'review' | 'reviewResult' | 'poem' | 'poemResult' | 'progress' | 'story' | 'parent' | 'settings' | 'ranks' | 'avatarCrop' | 'characterSelect';
type HallWrongBookEntry = { cardId: string; wrongCount: number; lastWrongAt: number };
type HallStoryProgress = {
  currentChapterId: string | null;
  currentStepId: string | null;
  completedChapterIds: string[];
  unlockedOracleIds: string[];
  destinyPower: number;
};
type HallCallbacks = {
  getCards: () => HallCard[];
  /** All catalog entries count toward progress, while getCards may hide undiscovered entries. */
  getCatalogProgress?: () => {
    collected: number;
    total: number;
    story: { collected: number; total: number };
    supplement: { collected: number; total: number };
  };
  getProgress: () => { ink: number; coins: number; experience: number; attempts: number; correct: number };
  getStoryProgress?: () => HallStoryProgress;
  recordReview: (cardId: string, correct: boolean) => void;
  getWrongBook: () => HallWrongBookEntry[];
  clearWrongBook: (cardId: string) => void;
  enterYinXu: () => void;
  getProfile: () => { playerName: string; avatarId: string; avatarUrl?: string; characterChoiceCompleted: boolean; musicOn: boolean; sfxOn: boolean; nightMode: boolean };
  setName: (name: string) => void;
  setAvatar: (avatarId: string, avatarUrl?: string) => void;
  choosePlayerCharacter: (avatarId: 'oracle-boy-pixel' | 'oracle-girl-pixel') => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
  toggleNight: () => void;
  getWeakCards: () => string[];
};

/**
 * Standalone learning-hall controller. It owns all launch, review and codex UI;
 * YinXuCity only supplies saved data and the transition back into the world.
 */
@ccclass('LearningHall')
export class LearningHall extends Component {
  private callbacks: HallCallbacks | null = null;
  private root: Node | null = null;
  private homeButton: Node | null = null;
  private mode: HallMode = 'home';
  private selectedCardId: string | null = null;
  private reviewQuestions: HallCard[] = [];
  private reviewOptions: HallCard[] = [];
  private reviewIndex = 0;
  private reviewCorrect = 0;
  private reviewMistakes: HallCard[] = [];
  private reviewLibraryOpen = false;
  private reviewSource: 'normal' | 'wrongBook' = 'normal';
  // Keep the visual and touch positions in one place: the result actions sit below the score panel.
  private readonly reviewResultActionY = -175;
  private readonly reviewResultActionWidth = 210;
  private readonly reviewResultActionHeight = 58;
  private selectedWrongBookId: string | null = null;
  private poemQuestions: Array<{ definition: PoemChallengeDefinition; card: HallCard }> = [];
  private poemOptions: HallCard[] = [];
  private poemIndex = 0;
  private poemCorrect = 0;
  private poemLastCorrect = false;
  // Every answer in the poem bank is backed by a real oracle image. Restrict
  // distractors to the same audited set so catalog placeholders can never
  // fall back to a modern Han character in this mode.
  private readonly poemGlyphCharacters = new Set(poemChallengeBank.map(item => item.answer));
  private enteringYinXu = false;
  private yinXuTransitionTimer: ReturnType<typeof setTimeout> | null = null;
  private nameDialogOpen = false;
  private hiddenGameNodes: Node[] = [];
  private viewportScale = 1;
  // 昵称编辑用的 HTML input（替代 EditBox，保证学习机/平板弹系统拼音键盘）
  private nameInputEl: HTMLInputElement | null = null;
  // 头像裁剪状态
  private cropSrc = '';
  private cropImgW = 0;
  private cropImgH = 0;
  private cropSf: SpriteFrame | null = null;
  private cropBoxX = 0;
  private cropBoxY = 0;
  private cropBoxSize = 250;
  private cropDragMode: 'none' | 'move' | 'scale' = 'none';
  private cropDragStartX = 0;
  private cropDragStartY = 0;
  private cropBoxStartX = 0;
  private cropBoxStartY = 0;
  private cropBoxStartSize = 0;
  private readonly cropArea = 380; // 裁剪显示区边长（设计坐标）
  private readonly cropCenterX = 0;
  private readonly cropCenterY = 10;
  private cropDispW = 0;
  private cropDispH = 0;
  // 图鉴分页
  private codexPage = 0;
  private readonly codexPageSize = 8;
  private chapterRoadmapContent: Node | null = null;
  private chapterRoadmapOffset = 0;
  private chapterRoadmapDragStartX = 0;
  private chapterRoadmapOffsetStart = 0;
  private chapterRoadmapDragging = false;
  private chapterRoadmapMinOffset = -390;

  get isOpen() {
    return this.root?.isValid ?? false;
  }

  initialize(callbacks: HallCallbacks) {
    this.callbacks = callbacks;
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    view.on('canvas-resize', this.onCanvasResize, this);
    this.createHomeButton();
    this.open();
  }

  onDestroy() {
    this.stopYinXuTransition();
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    view.off('canvas-resize', this.onCanvasResize, this);
  }

  open() {
    this.render(this.callbacks?.getProfile().characterChoiceCompleted ? 'home' : 'characterSelect');
  }

  openStoryLesson() {
    this.beginReview();
  }

  returnToCity() {
    this.close();
  }

  private cards() {
    return this.callbacks?.getCards() ?? [];
  }

  private catalogProgress() {
    const cards = this.cards();
    return this.callbacks?.getCatalogProgress?.() ?? {
      collected: cards.filter(card => card.unlocked).length,
      total: cards.length,
      story: { collected: cards.filter(card => card.unlocked).length, total: cards.length },
      supplement: { collected: 0, total: 0 },
    };
  }

  private codexPageCount() {
    return Math.max(1, Math.ceil(this.cards().length / this.codexPageSize));
  }

  private codexPageCards() {
    const start = this.codexPage * this.codexPageSize;
    return this.cards().slice(start, start + this.codexPageSize);
  }

  private progress() {
    return this.callbacks?.getProgress() ?? { ink: 0, coins: 0, experience: 0, attempts: 0, correct: 0 };
  }

  private createRoot(name: string, mode: HallMode) {
    if (this.root) { this.root.removeFromParent(); this.root.destroy(); }
    this.mode = mode;
    const visible = view.getVisibleSize();
    this.viewportScale = Math.min(visible.width / 1280, visible.height / 720);
    const root = new Node(name);
    root.parent = this.node;
    root.setPosition(0, 0, 600);
    root.addComponent(UITransform).setContentSize(1280, 720);
    root.setScale(this.viewportScale, this.viewportScale, 1);
    this.root = root;
    if (this.homeButton?.isValid) this.homeButton.active = false;
    this.hideGameNodes();
    this.drawBackground(root);
    return root;
  }

  /**
   * 分辨率或横竖屏变化后按同一设计稿重绘。设计画布由 YinXuCity 统一为
   * 1280×720 SHOW_ALL，故这里不会拉伸文字、弹窗或点击区域。
   */
  private onCanvasResize() {
    if (!this.isOpen || this.mode === 'enteringYinXu') return;
    this.render(this.mode);
  }

  /** 将当前屏幕点击位置换算回 1280×720 设计坐标。 */
  private eventToDesignPoint(event: EventTouch) {
    const point = event.getUILocation();
    const size = view.getVisibleSize();
    const scale = Math.max(.001, this.isOpen ? this.viewportScale : 1);
    return {
      x: (point.x - size.width / 2) / scale,
      y: (point.y - size.height / 2) / scale,
    };
  }

  private close() {
    this.stopYinXuTransition();
    this.removeNameInput();
    this.root?.removeFromParent();
    this.root?.destroy();
    this.root = null;
    this.hiddenGameNodes.forEach(node => { if (node.isValid) node.active = true; });
    this.hiddenGameNodes = [];
    if (this.homeButton?.isValid) this.homeButton.active = true;
  }

  /** Keeps the gameplay world out of the launch screen without disabling Canvas' camera. */
  private hideGameNodes() {
    if (this.hiddenGameNodes.length > 0) return;
    this.hiddenGameNodes = this.node.children.filter(node => node !== this.root && node !== this.homeButton && node.name !== 'Camera' && node.active);
    this.hiddenGameNodes.forEach(node => { node.active = false; });
  }

  private createHomeButton() {
    const button = new Node('ReturnLearningHallButton');
    button.parent = this.node;
    button.setPosition(295, 309, 300);
    button.addComponent(UITransform).setContentSize(120, 52);
    const graphics = button.addComponent(Graphics);
    graphics.fillColor = new Color(66, 58, 91, 238); graphics.roundRect(-58, -24, 116, 48, 12); graphics.fill();
    graphics.strokeColor = new Color(232, 192, 107); graphics.lineWidth = 2; graphics.roundRect(-58, -24, 116, 48, 12); graphics.stroke();
    this.label(button, 'ReturnLearningHallLabel', '学习大厅', 0, 0, 104, 36, 16, new Color(255, 237, 192));
    button.active = false;
    this.homeButton = button;
  }

  /** Home uses the player's chosen day/night background image; sub-pages keep the
   *  original deep-night sky so only the lobby skin changes (the YinXu world is untouched). */
  private drawBackground(root: Node) {
    const visible = view.getVisibleSize();
    const width = visible.width / this.viewportScale;
    const height = visible.height / this.viewportScale;
    if (this.mode === 'home' || this.mode === 'ranks' || this.mode === 'settings') {
      const night = this.callbacks?.getProfile().nightMode ?? false;
      const fallback = this.graphics(root, 'HallBgFallback', 0, 0, width, height, -1);
      fallback.fillColor = night ? new Color(12, 18, 40, 255) : new Color(205, 224, 230, 255);
      fallback.rect(-width / 2, -height / 2, width, height); fallback.fill();
      const bgNode = new Node('HallBackground');
      bgNode.parent = root; bgNode.setPosition(0, 0, 0);
      bgNode.addComponent(UITransform).setContentSize(width, height);
      const bgSprite = bgNode.addComponent(Sprite);
      bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
      const key = night ? 'art/hall_bg/dark_bg/spriteFrame' : 'art/hall_bg/hall_bg/spriteFrame';
      this.loadSprite(key, bgNode, bgSprite, true);
      // 大厅主页去掉底部装饰文字，弹窗/子页面保留
      if (this.mode !== 'home') {
        this.label(root, 'HallPattern', '甲  骨  文  ·  殷  商  探  索', 0, -height / 2 + 32, 920, 28, 14, night ? new Color(244, 205, 132, 120) : new Color(90, 70, 50, 120));
      }
      return;
    }
    // Sub-pages: day = parchment + warm texture (高级质感); night = original deep-night sky.
    const night = this.callbacks?.getProfile().nightMode ?? false;
    const graphics = this.graphics(root, 'HallBackground', 0, 0, width, height, 0);
    if (night) {
      // 夜间：保留原来的深蓝紫夜空 + 斜线纹理
      graphics.fillColor = new Color(18, 22, 49, 253); graphics.rect(-width / 2, -height / 2, width, height); graphics.fill();
      const bands: Array<[number, Color]> = [
        [272, new Color(57, 57, 104, 150)], [82, new Color(49, 69, 114, 110)], [-116, new Color(35, 50, 83, 115)],
      ];
      bands.forEach(([y, color]) => { graphics.fillColor = color; graphics.rect(-width / 2, y - 94, width, 188); graphics.fill(); });
      graphics.strokeColor = new Color(226, 190, 110, 46); graphics.lineWidth = 2;
      for (let x = -width / 2; x < width / 2; x += 110) { graphics.moveTo(x, -height / 2); graphics.lineTo(x + 190, -height / 2 + 210); }
      for (let y = -height / 2 + 40; y < height / 2; y += 105) { graphics.moveTo(-width / 2, y); graphics.lineTo(width / 2, y); }
      graphics.stroke();
      this.label(root, 'HallPattern', '甲  骨  文  ·  殷  商  探  索', 0, -height / 2 + 32, 920, 28, 14, new Color(244, 205, 132, 115));
    } else {
      // 白天：羊皮纸暖金底 + 柔和光带 + 古铜网格纹理，与夜间同结构但色调更暖
      graphics.fillColor = new Color(244, 236, 216, 255); graphics.rect(-width / 2, -height / 2, width, height); graphics.fill();
      const dayBands: Array<[number, Color]> = [
        [272, new Color(252, 243, 225, 145)], [82, new Color(238, 222, 188, 125)], [-116, new Color(224, 202, 162, 130)],
      ];
      dayBands.forEach(([y, color]) => { graphics.fillColor = color; graphics.rect(-width / 2, y - 94, width, 188); graphics.fill(); });
      // 古铜金斜线/水平网格：降低透明度让白天更通透
      graphics.strokeColor = new Color(186, 150, 88, 38); graphics.lineWidth = 2;
      for (let x = -width / 2; x < width / 2; x += 110) { graphics.moveTo(x, -height / 2); graphics.lineTo(x + 190, -height / 2 + 210); }
      for (let y = -height / 2 + 40; y < height / 2; y += 105) { graphics.moveTo(-width / 2, y); graphics.lineTo(width / 2, y); }
      graphics.stroke();
      this.label(root, 'HallPattern', '甲  骨  文  ·  殷  商  探  索', 0, -height / 2 + 32, 920, 28, 14, new Color(130, 100, 66, 150));
    }
  }

  private drawHeader(root: Node, title: string, subtitle: string, back = false) {
    const night = this.callbacks?.getProfile().nightMode ?? false;
    const header = this.graphics(root, 'HallHeader', 0, 286, 1150, 104, 2);
    if (night) {
      header.fillColor = new Color(60, 57, 101, 240); header.roundRect(-575, -52, 1150, 104, 22); header.fill();
      header.strokeColor = new Color(219, 180, 108, 176); header.lineWidth = 2; header.roundRect(-575, -52, 1150, 104, 22); header.stroke();
    } else {
      // 白天：浅米白面板 + 古铜金描边（描边线条与夜间一致）
      header.fillColor = new Color(251, 247, 238, 240); header.roundRect(-575, -52, 1150, 104, 22); header.fill();
      header.strokeColor = new Color(226, 190, 110, 200); header.lineWidth = 2; header.roundRect(-575, -52, 1150, 104, 22); header.stroke();
    }
    const profile = this.callbacks!.getProfile();
    const av = AVATARS.find(a => a.id === profile.avatarId) ?? AVATARS[0];
    this.drawAvatar(root, 'HallHeaderAvatar', -505, 286, 35, {
      url: profile.avatarUrl,
      spritePath: profile.avatarUrl ? undefined : av.path,
      frameColor: night ? new Color(232, 190, 118) : new Color(201, 168, 108),
      bgColor: night ? new Color(60, 54, 86) : new Color(255, 248, 236),
      z: 4,
      linear: true,
    });
    const nameColor = night ? new Color(255, 239, 201) : new Color(58, 36, 16);
    const statusColor = night ? new Color(214, 206, 226) : new Color(74, 48, 24);
    const titleColor = night ? new Color(255, 236, 185) : new Color(58, 36, 16);
    this.label(root, 'HallPlayerName', profile.playerName || '少年卜官', -325, 304, 220, 34, 22, nameColor, 'left', 6);
    this.label(root, 'HallPlayerStatus', subtitle, -300, 272, 280, 28, 13, statusColor, 'left', 6);
    this.label(root, 'HallTitle', title, 190, 291, 530, 44, 29, titleColor, 'center', 6);
    if (back) this.button(root, 'HallBack', '返回大厅', 480, 286, 150, 48, false);
  }

  private render(mode: HallMode, selectedId: string | null = this.selectedCardId) {
    if (!this.callbacks) return;
    if (mode === 'home') this.renderHome();
    else if (mode === 'enteringYinXu') this.renderEnteringYinXu();
    else if (mode === 'characterSelect') this.renderCharacterSelect();
    else if (mode === 'codex') this.renderCodex(selectedId);
    else if (mode === 'review') this.renderReview();
    else if (mode === 'reviewResult') this.renderReviewResult();
    else if (mode === 'poem') this.renderPoemChallenge();
    else if (mode === 'poemResult') this.renderPoemResult();
    else if (mode === 'progress') this.renderProgress();
    else if (mode === 'story') this.renderStoryRoadmap();
    else if (mode === 'ranks') this.renderRanks();
    else if (mode === 'avatarCrop') this.drawAvatarCrop();
    else if (mode === 'characterSelect') this.drawCharacterSelect();
    else this.renderPlaceholder(mode);
  }

  private renderHome() {
    const root = this.createRoot('LearningHall', 'home');
    const prog = this.catalogProgress();
    const t = this.theme();
    this.drawTopBar(root, t);
    this.drawCharacterCard(root, -442, 14, t);
    this.drawEnterYinXu(root, -16, -6, t);
    this.drawReviewSuggestion(root, 424, 55, t);
    this.drawCodexEntry(root, prog, 424, -140, t);
    this.drawPoemEntry(root, -442, -164, t);
    this.drawBottomNav(root, 'home', t);
  }

  /** A short, single transition is more reliable than repeatedly rebuilding the UI during loading. */
  private beginYinXuTransition() {
    if (this.enteringYinXu) return;
    const avatarId = this.callbacks?.getProfile().avatarId;
    if (avatarId !== 'oracle-boy-v1' && avatarId !== 'oracle-girl-v1') {
      this.render('characterSelect');
      return;
    }
    this.enteringYinXu = true;
    this.render('enteringYinXu');
    this.yinXuTransitionTimer = setTimeout(() => {
      if (!this.enteringYinXu) return;
      this.callbacks?.enterYinXu();
      this.close();
    }, 3500);
  }

  private renderCharacterSelect() {
    const root = this.createRoot('HallCharacterSelect', 'characterSelect');
    const t = this.theme();
    this.panel(root, 'HallCharacterSelectPanel', 0, 0, 840, 510, t.card, false);
    this.titleLabel(root, 'HallCharacterSelectTitle', '选择你的卜官', 0, 188, 560, 42, 30, t.goldInk, 6);
    this.label(root, 'HallCharacterSelectHint', '选择后即可进入殷墟探索；在设置中也可以随时更换。', 0, 150, 600, 28, 16, t.goldSub, 'center', 6);
    this.drawCharacterSelectCard(root, 'Boy', -190, 0, 'oracle-boy-v1', '少年卜官', '黑袍佩剑 · 发丝与衣摆随步伐摆动', true, t);
    this.drawCharacterSelectCard(root, 'Girl', 190, 0, 'oracle-girl-v1', '少女卜官', '青黛长衣 · 发簪与衣袖随步伐摆动', false, t);
    this.button(root, 'HallCharacterSelectBack', '返回', 0, -205, 150, 46, false);
  }

  private drawCharacterSelectCard(root: Node, key: string, x: number, y: number, asset: string, title: string, detail: string, accent: boolean, t: ReturnType<LearningHall['theme']>) {
    const card = this.graphics(root, `HallCharacter${key}Card`, x, y, 320, 278, 4);
    card.fillColor = accent ? new Color(255, 246, 222, 245) : new Color(244, 240, 232, 245);
    card.roundRect(-160, -139, 320, 278, 18); card.fill();
    card.strokeColor = accent ? new Color(193, 130, 62) : t.cardStroke;
    card.lineWidth = accent ? 4 : 3; card.roundRect(-158, -137, 316, 274, 16); card.stroke();
    const spriteNode = new Node(`HallCharacter${key}Sprite`); spriteNode.parent = root; spriteNode.setPosition(x, y + 37, 6);
    spriteNode.addComponent(UITransform).setContentSize(150, 150);
    const sprite = spriteNode.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    this.loadSprite(`characters/${asset}/down-0/spriteFrame`, spriteNode, sprite, false);
    this.label(root, `HallCharacter${key}Title`, title, x, y - 77, 250, 28, 21, t.goldInk, 'center', 6);
    this.label(root, `HallCharacter${key}Detail`, detail, x, y - 110, 276, 36, 13, t.goldSub, 'center', 6);
  }

  private stopYinXuTransition() {
    if (this.yinXuTransitionTimer !== null) clearTimeout(this.yinXuTransitionTimer);
    this.yinXuTransitionTimer = null;
    this.enteringYinXu = false;
  }

  private renderEnteringYinXu() {
    const root = this.createRoot('HallEnteringYinXu', 'enteringYinXu');
    const t = this.theme();
    const unlocked = this.cards().filter(card => card.unlocked);
    const current = unlocked.length > 0 ? unlocked[0] : null;

    this.panel(root, 'HallYinXuLoadingPanel', 0, 0, 760, 430, t.card, false);
    this.label(root, 'HallYinXuLoadingEyebrow', '殷 商 寻 字 之 旅', 0, 146, 480, 28, 15, t.goldSub, 'center', 6);
    this.label(root, 'HallYinXuLoadingTitle', '前往殷墟', 0, 100, 440, 48, 34, t.goldInk, 'center', 6);
    this.label(root, 'HallYinXuLoadingHint', '整理行囊，追寻三千年前的文字印记', 0, 62, 560, 28, 17, t.goldSub, 'center', 6);
    const seal = this.graphics(root, 'HallYinXuLoadingSeal', 0, -24, 150, 150, 4);
    seal.fillColor = new Color(141, 47, 31, 245); seal.circle(0, 0, 72); seal.fill();
    seal.strokeColor = new Color(244, 207, 129, 255); seal.lineWidth = 3; seal.circle(0, 0, 66); seal.stroke();
    if (current) this.oracleGlyph(root, 'HallYinXuLoadingGlyph', current, 0, -15, 76, 86, 6);
    else this.label(root, 'HallYinXuLoadingGlyphFallback', '甲', 0, -15, 86, 94, 52, new Color(255, 236, 187), 'center', 6);
    this.label(root, 'HallYinXuLoadingLoading', '正在启程 · 即将抵达殷墟', 0, -122, 360, 26, 17, t.goldInk, 'center', 6);
    const barW = 500, barH = 18, barY = -170;
    const bar = this.graphics(root, 'HallYinXuLoadingBar', 0, barY, barW, barH, 5);
    bar.fillColor = new Color(33, 25, 34, 190); bar.roundRect(-barW / 2, -barH / 2, barW, barH, 9); bar.fill();
    bar.strokeColor = new Color(231, 187, 97, 220); bar.lineWidth = 2; bar.roundRect(-barW / 2, -barH / 2, barW, barH, 9); bar.stroke();
    // The fill is a real tweened node: it continuously grows left-to-right for the whole transition.
    const fillW = barW - 8;
    const fillNode = new Node('HallYinXuLoadingBarFill');
    fillNode.parent = root;
    fillNode.setPosition(-barW / 2 + 4, barY, 6);
    const fillTransform = fillNode.addComponent(UITransform);
    fillTransform.setContentSize(fillW, barH - 8);
    fillTransform.setAnchorPoint(0, 0.5);
    const fill = fillNode.addComponent(Graphics);
    fill.fillColor = new Color(221, 159, 67, 255); fill.roundRect(0, -(barH - 8) / 2, fillW, barH - 8, 5); fill.fill();
    fillNode.setScale(0.01, 1, 1);
    tween(fillNode).to(3.35, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' }).start();
  }

  /** Day/night-aware palette, mirrored from hall_full.html CSS.
   *  Home cards are DARK translucent (rgba(28,24,18,.62)) on the bright backdrop,
   *  with pale-gold text inside; the backdrop text itself is deep brown.
   *  Night mode flips cards to dark indigo and text to pale gold. */
  private theme() {
    const night = this.callbacks?.getProfile().nightMode ?? false;
    return {
      night,
      ink: night ? new Color(255, 233, 200) : new Color(255, 245, 220),     // 卡片内浅金字：夜=暖金、昼=奶白
      sub: new Color(230, 216, 188),                                         // #e6d8bc 昼夜同值
      card: night ? new Color(40, 34, 58, 205) : new Color(60, 45, 32, 210), // 白天加深为深暖棕半透明
      cardStroke: night ? new Color(231, 187, 97, 200) : new Color(226, 190, 110, 130), // 白天描边更明显
      goldInk: new Color(255, 230, 189),                                     // #ffe6bd in-card text 昼夜同值
      goldSub: new Color(230, 216, 188),                                     // #e6d8bc 昼夜同值
    };
  }

  private hexToColor(hex: string, alpha = 255): Color {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return new Color(r, g, b, alpha);
  }

  /** Layout helpers: percentages of the 1280x720 design resolution, mirroring
   *  the vw/vh clamps used in hall_full.html. */
  private vw(ratio: number) { return 1280 * ratio; }
  private vh(ratio: number) { return 720 * ratio; }

  private currentRank(): number {
    const exp = this.progress().experience;
    let idx = 0;
    for (let i = 0; i < RANKS.length; i++) if (exp >= RANKS[i].threshold) idx = i;
    if (idx === RANKS.length - 1) {
      const { story } = this.catalogProgress();
      if (story.collected < story.total) idx = RANKS.length - 2;
    }
    return idx;
  }

  private drawTopBar(root: Node, t: ReturnType<LearningHall['theme']>) {
    const profile = this.callbacks!.getProfile();
    const progress = this.progress();
    const rankIdx = this.currentRank();
    const { collected } = this.catalogProgress();
    const topY = this.vh(0.445);
    // 头像（直径≈58px），留足右侧空间
    const avR = this.vh(0.040);
    const avX = -this.vw(0.432);
    const av = AVATARS.find(a => a.id === profile.avatarId) ?? AVATARS[0];
    this.drawAvatar(root, 'HallTopAvatar', avX, topY, avR, {
      url: profile.avatarUrl,
      emoji: profile.avatarUrl ? undefined : av.emoji,
      frameColor: new Color(231, 187, 97),
      bgColor: new Color(255, 248, 236),
      z: 5,
    });
    // 左上：头像右侧上方名字，下方金棕胶囊段位 + 已识字数（严格不重叠）
    const textStart = avX + avR + 6; // 文字块左边界，紧贴头像右边缘
    const nameColor = t.night ? t.ink : new Color(58, 36, 16);
    const subColor = t.night ? t.sub : new Color(74, 48, 24);
    this.label(root, 'HallPlayerName', profile.playerName || '少年卜官', textStart + 70, topY + 10, 140, 26, 17, nameColor, 'center', 6);
    this.drawRankBadge(root, rankIdx, textStart + 70, topY - 18, t);
    this.label(root, 'HallCollectedHint', `已识 ${collected} 字`, textStart + 54 + 54 + 6 + 45, topY - 18, 90, 22, 13, subColor, 'center', 6);
    // 右侧货币（名+值一行，对齐 .rightbar .cur）+ 右上角设置入口
    this.drawCurrencies(root, progress, this.vw(0.150), topY, t);
    this.drawSettingsBtn(root, this.vw(0.422), topY, t);
  }

  private drawRankBadge(root: Node, rankIdx: number, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    // 随段位变色：用 RANKS 每阶的 c1(顶渐变)/c2(底渐变)/bd(描边) 配色
    const rank = RANKS[rankIdx];
    const c1 = this.hexToColor(rank.c1);
    const c2 = this.hexToColor(rank.c2);
    const bd = this.hexToColor(rank.bd);
    const w = 108, h = 26;
    const node = this.graphics(root, 'HallRankBadge', x, y, w, h, 6);
    node.fillColor = c1; node.roundRect(-w / 2, -h / 2, w, h, 13); node.fill();
    node.fillColor = c2; node.roundRect(-w / 2, 2, w, h / 2 - 2, 0); node.fill();
    node.strokeColor = bd; node.lineWidth = 1; node.roundRect(-w / 2, -h / 2, w, h, 13); node.stroke();
    this.label(root, 'HallRankIcon', rank.icon, x - w / 2 + 16, y, 24, 24, 14, new Color(255, 252, 245), 'center', 7);
    this.label(root, 'HallRankName', rank.name, x + 6, y, w - 28, 20, 12, new Color(255, 252, 245), 'left', 7);
  }

  private drawCurrencies(root: Node, progress: { ink: number; coins: number; experience: number }, startX: number, y: number, t: ReturnType<LearningHall['theme']>) {
    // 对齐 .rightbar .cur：名+值在同一行，无胶囊
    const items: Array<[string, number]> = [
      ['墨料', progress.ink],
      ['贝币', progress.coins],
      ['经验', progress.experience],
    ];
    items.forEach(([name, val], i) => {
      const x = startX + i * 110;
      const curSub = t.night ? t.sub : new Color(74, 48, 24);
      const curInk = t.night ? t.ink : new Color(58, 36, 16);
      this.label(root, `HallCurName-${i}`, name, x - 8, y, 44, 22, 13, curSub, 'right', 6);
      this.label(root, `HallCurVal-${i}`, `${val}`, x + 20, y, 50, 22, 16, curInk, 'left', 6);
    });
  }

  private drawSettingsBtn(root: Node, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    // 右上角设置入口：简洁圆角方块 + 金边，随主题变色，仅一个齿轮图标
    const s = 46;
    const node = this.graphics(root, 'HallSettingsTopBtn', x, y, s, s, 6);
    node.fillColor = new Color(40, 30, 20, 130); node.roundRect(-s / 2, -s / 2, s, s, 12); node.fill();
    node.strokeColor = t.cardStroke; node.lineWidth = 1.5; node.roundRect(-s / 2 + 1.5, -s / 2 + 1.5, s - 3, s - 3, 11); node.stroke();
    this.label(root, 'HallSettingsTopIcon', '⚙', x, y, s - 8, s - 8, 22, new Color(255, 233, 200), 'center', 7);
  }

  private drawCharacterCard(root: Node, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    const rankIdx = this.currentRank();
    const w = this.vh(0.25), h = this.vh(0.34);
    const node = this.graphics(root, 'HallCharacterCard', x, y, w, h, 3);
    node.fillColor = t.card; node.roundRect(-w / 2, -h / 2, w, h, 14); node.fill();
    node.strokeColor = t.cardStroke; node.lineWidth = 1; node.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 13); node.stroke();
    // Use the selected protagonist so the hall and the map always show the same player character.
    const avR = this.vh(0.070);
    const avY = y + this.vh(0.060);
    const avatarId = this.callbacks?.getProfile().avatarId;
    const avatar = AVATARS.find(item => item.id === avatarId) ?? AVATARS[0];
    this.drawAvatar(root, 'HallCharAvatar', x, avY, avR, {
      spritePath: avatar.path,
      frameColor: new Color(231, 187, 97),
      bgColor: new Color(255, 248, 236),
      z: 5,
      linear: false,
    });
    // 去掉了“少年卜官”名字，只保留角色身份、段位进度与提示
    this.label(root, 'HallCharRole', '殷墟小卜官', x, y - this.vh(0.026), 150, 20, 13, t.goldInk, 'center', 6);
    const nextRank = RANKS[Math.min(rankIdx + 1, RANKS.length - 1)];
    const need = Math.max(0, nextRank.threshold - this.progress().experience);
    const rankTip = rankIdx >= RANKS.length - 1 ? '已达最高段位' : `距${nextRank.name}还需 ${need} 经验`;
    this.label(root, 'HallCharRankTip', rankTip, x, y - this.vh(0.062), 170, 20, 11, t.goldSub, 'center', 6);
    // 段位经验条（对齐 .rbar：底 rgba(70,55,40,.5) 填充 #d9a85a）
    const prevThreshold = RANKS[rankIdx].threshold;
    const pct = rankIdx >= RANKS.length - 1 ? 1 : Math.min(1, Math.max(0, (this.progress().experience - prevThreshold) / (nextRank.threshold - prevThreshold)));
    const barW = this.vh(0.18), barH = 6;
    const barY = y - this.vh(0.088);
    const barBg = this.graphics(root, 'HallCharRankBarBg', x, barY, barW, barH, 5);
    barBg.fillColor = new Color(70, 55, 40, 128); barBg.roundRect(-barW / 2, -barH / 2, barW, barH, 3); barBg.fill();
    if (pct > 0) {
      const barFill = this.graphics(root, 'HallCharRankBarFill', x - barW / 2 + (barW * pct) / 2, barY, barW * pct, barH, 6);
      barFill.fillColor = new Color(217, 168, 90, 255); barFill.roundRect(-(barW * pct) / 2, -barH / 2, barW * pct, barH, 3); barFill.fill();
    }
    this.label(root, 'HallCharHint', '点击查看五阶段位', x, y - this.vh(0.122), 160, 18, 11, t.goldSub, 'center', 6);
  }

  private drawEnterYinXu(root: Node, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    const r = this.vh(0.10);
    const inkColor = t.night ? t.ink : new Color(58, 36, 16);
    const subColor = t.night ? t.sub : new Color(74, 48, 24);
    this.label(root, 'HallEnterSupertitle', '殷商寻字', x, y + r + this.vh(0.055), 280, 30, 20, inkColor, 'center', 6);
    // 外黑环 + 橙红发光（对齐 box-shadow: 0 0 0 5px rgba(0,0,0,.25), 0 6px 30px rgba(220,80,40,.5)）
    const ring = this.graphics(root, 'HallEnterRing', x, y, (r + 5) * 2, (r + 5) * 2, 3);
    ring.fillColor = new Color(0, 0, 0, 64); ring.circle(0, 0, r + 5); ring.fill();
    const glow = this.graphics(root, 'HallEnterGlow', x, y, (r + 12) * 2, (r + 12) * 2, 3);
    glow.fillColor = new Color(220, 80, 40, 128); glow.circle(0, 0, r + 12); glow.fill();
    // 三层径向渐变 radial(circle at 35% 30%,#e85a44,#c83e2c,#8a2618)
    const node = this.graphics(root, 'HallEnterYinXu', x, y, r * 2, r * 2, 4);
    node.fillColor = new Color(232, 90, 68, 255); node.circle(0, 0, r); node.fill();
    node.fillColor = new Color(200, 62, 44, 255); node.circle(0, 0, r * 0.72); node.fill();
    node.fillColor = new Color(138, 38, 24, 255); node.circle(0, 0, r * 0.42); node.fill();
    node.strokeColor = new Color(255, 242, 216, 255); node.lineWidth = 3; node.circle(0, 0, r - 3); node.stroke();
    this.label(root, 'HallEnterEmoji', '🏛', x, y + this.vh(0.016), 64, 50, 30, new Color(255, 242, 216), 'center', 6);
    this.label(root, 'HallEnterTitle', '进入殷墟', x, y - this.vh(0.028), 150, 24, 14, new Color(255, 240, 220), 'center', 6);
    const enterSubColor = t.night ? t.sub : new Color(74, 48, 24);
    this.label(root, 'HallEnterSub', '探索草野河畔，发掘甲骨遗存', x, y - r - this.vh(0.040), 420, 22, 12, enterSubColor, 'center', 6);
  }

  private drawReviewSuggestion(root: Node, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    const weakIds = this.callbacks?.getWeakCards() ?? [];
    const weak = weakIds.map(id => this.cards().find(c => c.id === id)).filter((c): c is HallCard => !!c).slice(0, 3);
    const w = 340, h = 152;
    const node = this.graphics(root, 'HallReviewSug', x, y, w, h, 3);
    node.fillColor = t.card; node.roundRect(-w / 2, -h / 2, w, h, 10); node.fill();
    node.strokeColor = t.cardStroke; node.lineWidth = 1; node.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 9); node.stroke();
    // 顶部：标题（左上角）+ 去复习按钮
    const topY = y + h / 2 - 22;
    this.titleLabel(root, 'HallSugTitle', '建议复习', x - w / 2 + 8, topY, 120, 20, 14, t.goldInk, 6);
    this.button(root, 'HallSugGo', '去复习 ›', x + w / 2 - 54, topY, 80, 28, true);
    // 中间：代表性易错大字（现代汉字，整体下移避免与顶部标题重叠）
    const glyphY = y - 6;
    if (weak.length === 0) {
      this.label(root, 'HallSugEmpty', '暂无需复习', x, glyphY, w - 40, 30, 14, t.goldSub, 'center', 6);
    } else {
      const show = weak[0];
      const boxW = 120, boxH = 70;
      const box = this.graphics(root, 'HallSugGlyphBox', x, glyphY, boxW, boxH, 5);
      box.fillColor = t.card; box.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8); box.fill();
      box.strokeColor = t.cardStroke; box.lineWidth = 2; box.roundRect(-boxW / 2 + 1, -boxH / 2 + 1, boxW - 2, boxH - 2, 7); box.stroke();
      // 手动创建大字 Label，避免 label() 默认 SHRINK/Wrap 导致大字缩没
      const glyphNode = new Node('HallSugGlyph'); glyphNode.parent = root; glyphNode.setPosition(x, glyphY, 6);
      glyphNode.addComponent(UITransform).setContentSize(boxW - 10, boxH - 10);
      const glyphLabel = glyphNode.addComponent(Label);
      glyphLabel.string = show.modern;
      glyphLabel.fontSize = 48; glyphLabel.lineHeight = 52; glyphLabel.color = t.goldInk;
      glyphLabel.horizontalAlign = Label.HorizontalAlign.CENTER; glyphLabel.verticalAlign = Label.VerticalAlign.CENTER;
      glyphLabel.overflow = Label.Overflow.CLAMP; glyphLabel.enableWrapText = false;
    }
    // 底部：易错字数
    this.label(root, 'HallSugNote', `易错 ${weak.length} 字`, x - w / 2 + 80, y - h / 2 + 18, 120, 18, 12, t.goldSub, 'left', 6);
  }

  private drawCodexEntry(root: Node, prog: ReturnType<LearningHall['catalogProgress']>, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    const w = 340, h = 112;
    const node = this.graphics(root, 'HallCodexEntry', x, y, w, h, 3);
    node.fillColor = t.card; node.roundRect(-w / 2, -h / 2, w, h, 10); node.fill();
    node.strokeColor = t.cardStroke; node.lineWidth = 1; node.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 9); node.stroke();
    // 顶部：标题（左上角）+ 主线计数
    const topY = y + h / 2 - 18;
    this.titleLabel(root, 'HallCodexEntryTitle', '图鉴进度', x - w / 2 + 8, topY, 120, 20, 14, t.goldInk, 6);
    this.label(root, 'HallCodexEntryCount', `主线 ${prog.story.collected} / ${prog.story.total}`, x + w / 2 - 12, topY, 180, 22, 16, t.goldInk, 'right', 6);
    // 进度条（主线进度）
    const barW = 300, barH = 6; const pct = prog.story.total > 0 ? prog.story.collected / prog.story.total : 0;
    const barY = y + 4;
    const barBg = this.graphics(root, 'HallCodexBarBg', x, barY, barW, barH, 5);
    barBg.fillColor = new Color(70, 55, 40, 128); barBg.roundRect(-barW / 2, -barH / 2, barW, barH, 3); barBg.fill();
    if (pct > 0) {
      const barFill = this.graphics(root, 'HallCodexBarFill', x - barW / 2 + (barW * pct) / 2, barY, barW * pct, barH, 6);
      barFill.fillColor = new Color(217, 168, 90, 255); barFill.roundRect(-(barW * pct) / 2, -barH / 2, barW * pct, barH, 3); barFill.fill();
    }
    // 底部：拾遗进度说明（不移动位置，仅替换文案）
    const bottomY = y - h / 2 + 20;
    this.label(root, 'HallCodexEntrySub', `甲骨拾遗 ${prog.supplement.collected} / ${prog.supplement.total}`, x - w / 2 + 110, bottomY, 220, 18, 12, t.goldSub, 'left', 6);
    this.label(root, 'HallCodexEntryPct', `${Math.round(pct * 100)}%`, x + w / 2 - 12, bottomY, 50, 18, 12, t.goldSub, 'right', 6);
  }

  private drawPoemEntry(root: Node, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    const w = 250, h = 96;
    const panel = this.graphics(root, 'HallPoemEntry', x, y, w, h, 3);
    panel.fillColor = t.card; panel.roundRect(-w / 2, -h / 2, w, h, 12); panel.fill();
    panel.strokeColor = new Color(214, 168, 86); panel.lineWidth = 2; panel.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 11); panel.stroke();
    this.label(root, 'HallPoemEntryTitle', '诗词闯关', x - 38, y + 18, 135, 28, 19, new Color(255, 240, 194), 'center', 6);
    this.label(root, 'HallPoemEntryHint', '填诗句 · 选甲骨', x - 38, y - 12, 135, 22, 13, new Color(216, 200, 168), 'center', 6);
    this.button(root, 'HallPoemEntryButton', '开始 ›', x + 78, y, 76, 34, true);
  }

  private drawBottomNav(root: Node, mode: HallMode, t: ReturnType<LearningHall['theme']>) {
    const items: Array<[HallMode, string, string, boolean]> = [
      ['home', '🏠', '大厅', mode === 'home'],
      ['review', '📖', '复习', mode === 'review' || mode === 'reviewResult'],
      ['codex', '🏺', '图鉴', mode === 'codex'],
      ['parent', '⭐', '错题本', mode === 'parent'],
      ['progress', '📈', '进度', mode === 'progress'],
      ['story', '📜', '命途', mode === 'story'],
    ];
    // 项数变化自动居中（去掉设置后剩 5 项）
    const y = -this.vh(0.390); const gap = this.vh(0.120); const startX = -((items.length - 1) * gap) / 2;
    items.forEach(([m, icon, label, active], i) => {
      const x = startX + i * gap;
      const r = this.vh(0.036);
      const padY = y + this.vh(0.006);
      // 浅米 radial 圆垫（对齐 .icon-pad）
      const pad = this.graphics(root, `HallNavPad-${i}`, x, padY, r * 2, r * 2, 5);
      pad.fillColor = active ? new Color(255, 233, 176, 255) : new Color(255, 247, 230, 255);
      pad.circle(0, 0, r); pad.fill();
      pad.strokeColor = active ? new Color(160, 106, 46, 255) : new Color(110, 76, 40, 255);
      pad.lineWidth = 2; pad.circle(0, 0, r - 2); pad.stroke();
      this.label(root, `HallNavIcon-${i}`, icon, x, padY, r * 2 - 4, r * 2 - 4, 18, new Color(80, 60, 40), 'center', 6);
      // active 小圆点放在圆圈内部偏下
      if (active) {
        const dot = this.graphics(root, `HallNavDot-${i}`, x, padY - r + 6, 9, 3, 6);
        dot.fillColor = new Color(255, 217, 138, 255); dot.roundRect(-4.5, -1.5, 9, 3, 1.5); dot.fill();
      }
      const navLabelColor = active
        ? (t.night ? new Color(255, 233, 180) : new Color(122, 74, 20))
        : (t.night ? new Color(230, 215, 180) : new Color(58, 36, 16));
      this.label(root, `HallNavLabel-${i}`, label, x, padY - r - 10, 64, 18, 11, navLabelColor, 'center', 6);
    });
  }

  private renderRanks() {
    const root = this.createRoot('HallRanks', 'ranks');
    const rankIdx = this.currentRank();
    const t = this.theme();
    this.drawModal(root, {
      mask: new Color(12, 8, 3, 128), maskW: 1180, maskH: 680,
      w: 480, h: 560,
      fill: t.night ? new Color(24, 18, 12, 235) : new Color(255, 248, 228, 235),
      corner: 22, stroke: t.night ? new Color(255, 210, 140, 120) : new Color(255, 210, 140, 160), strokeW: 3, innerCorner: 21, innerInset: 1,
    });
    this.label(root, 'HallRanksTitle', '殷墟卜官 · 五阶段位', 0, 250, 420, 36, 18, t.night ? new Color(255, 233, 176) : new Color(90, 58, 26), 'center', 6);
    const titleLine = this.graphics(root, 'HallRanksTitleLine', 0, 226, 54, 2, 6);
    titleLine.fillColor = new Color(154, 106, 48, 255); titleLine.roundRect(-27, -1, 54, 2, 1); titleLine.fill();
    this.label(root, 'HallRanksSummary', `当前：${RANKS[rankIdx].name} · 经验 ${this.progress().experience}`, 0, 208, 420, 24, 11, t.night ? new Color(201, 180, 143) : new Color(122, 90, 54), 'center', 6);
    RANKS.forEach((rank, i) => {
      const y = 189 - i * 74;
      const isCur = i === rankIdx;
      const reached = i <= rankIdx;
      const c1 = this.hexToColor(rank.c1), c2 = this.hexToColor(rank.c2);
      const row = this.graphics(root, `HallRankRow-${i}`, 0, y, 432, 66, 5);
      row.fillColor = isCur ? new Color(255, 255, 255, 60) : new Color(255, 255, 255, 30);
      row.roundRect(-216, -33, 432, 66, 12); row.fill();
      row.strokeColor = isCur ? new Color(200, 62, 44, 255) : (reached ? new Color(110, 76, 40, 90) : new Color(110, 76, 40, 40));
      row.lineWidth = isCur ? 2 : 1; row.roundRect(-215, -32, 430, 64, 11); row.stroke();
      // 图标圆形渐变背景（对齐 HTML .ric）
      const iconR = 22;
      const iconX = -192;
      const iconBg = this.graphics(root, `HallRankRowIcon-${i}`, iconX, y, iconR * 2, iconR * 2, 6);
      iconBg.fillColor = c1; iconBg.circle(0, 0, iconR); iconBg.fill();
      iconBg.strokeColor = this.hexToColor(rank.bd); iconBg.lineWidth = 1; iconBg.circle(0, 0, iconR - 0.5); iconBg.stroke();
      this.label(root, `HallRankRowIconEmoji-${i}`, rank.icon, iconX, y, iconR * 1.5, iconR * 1.5, iconR * 1.1, new Color(255, 248, 236), 'center', 7);
      // 名字 + 经验需求（对齐 HTML .rinfo，图标右侧垂直居中）
      const nameColor = isCur ? new Color(200, 62, 44) : (t.night ? new Color(255, 240, 214) : new Color(58, 36, 16));
      this.label(root, `HallRankRowName-${i}`, rank.name, -40, y + 3, 220, 24, 15, nameColor, 'left', 6);
      const req = (i === RANKS.length - 1) ? `收集全部 ${this.catalogProgress().story.total} 个主线甲骨文字 + 经验12000` : `累计经验 ${rank.threshold}`;
      this.label(root, `HallRankRowReq-${i}`, req, -30, y - 15, 240, 20, 10, t.night ? new Color(216, 200, 168) : new Color(106, 74, 42), 'left', 6);
      // 状态（对齐 HTML .rstate：当前红 / 已达成绿 / 未解锁灰）
      const state = isCur ? '当前' : (reached ? '已达成' : '未解锁');
      const stateColor = isCur ? new Color(200, 62, 44) : (reached ? new Color(90, 138, 58) : new Color(138, 122, 106));
      this.label(root, `HallRankRowState-${i}`, state, 168, y - 4, 80, 24, 12, stateColor, 'center', 6);
    });
    this.button(root, 'HallRanksBack', '返回大厅', 0, -230, 220, 50, true);
  }


  private renderCodex(selectedId: string | null) {
    const root = this.createRoot('HallCodex', 'codex');
    const t = this.theme();
    const pageCount = this.codexPageCount();
    this.codexPage = Math.max(0, Math.min(this.codexPage, pageCount - 1));
    const pageCards = this.codexPageCards();
    const pageUnlocked = pageCards.filter(card => card.unlocked);
    this.selectedCardId = selectedId && pageCards.some(card => card.id === selectedId && card.unlocked) ? selectedId : pageUnlocked[0]?.id ?? null;
    this.drawHeader(root, '甲骨图鉴', `主线甲骨 ${this.catalogProgress().story.collected} / ${this.catalogProgress().story.total} · 甲骨拾遗 ${this.catalogProgress().supplement.collected} / ${this.catalogProgress().supplement.total}`, true);
    this.panel(root, 'HallCodexGrid', -190, -30, 760, 480, t.card, false);
    pageCards.forEach((card, index) => {
      const x = -430 + (index % 4) * 160; const y = 105 - Math.floor(index / 4) * 200;
      const item = this.graphics(root, `HallCodex-${index}`, x, y, 138, 168, 4);
      if (card.unlocked) {
        item.fillColor = t.card;
        item.roundRect(-69, -84, 138, 168, 12); item.fill();
        item.strokeColor = this.qualityColor(card.quality); item.lineWidth = 3; item.roundRect(-67, -82, 134, 164, 10); item.stroke();
        this.oracleGlyph(root, `HallCodexGlyph-${index}`, card, x, y + 22, 60, 75, 6);
        this.label(root, `HallCodexModern-${index}`, card.modern, x, y - 41, 116, 25, 20, t.goldInk);
        this.label(root, `HallCodexPinyin-${index}`, card.pinyin, x, y - 63, 116, 22, 13, t.goldSub);
      } else {
        item.fillColor = t.night ? new Color(54, 54, 67, 245) : new Color(74, 70, 64, 245);
        item.roundRect(-69, -84, 138, 168, 12); item.fill();
        item.strokeColor = t.night ? new Color(122, 119, 140) : new Color(138, 132, 120); item.lineWidth = 3; item.roundRect(-67, -82, 134, 164, 10); item.stroke();
        this.label(root, `HallCodexLocked-${index}`, '尚未发现', x, y + 10, 116, 40, 17, t.night ? new Color(180, 177, 193) : new Color(160, 155, 145));
        this.label(root, `HallCodexUnknown-${index}`, '？', x, y - 35, 70, 58, 36, t.night ? new Color(115, 112, 132) : new Color(130, 124, 112));
      }
    });
    if (this.codexPage > 0) this.button(root, 'HallCodexPrevPage', '上一页', -330, -232, 112, 38, false);
    this.label(root, 'HallCodexPageLabel', `${this.codexPage + 1} / ${pageCount}`, -190, -232, 120, 28, 16, new Color(255, 235, 190), 'center', 6);
    if (this.codexPage < pageCount - 1) this.button(root, 'HallCodexNextPage', '下一页', -50, -232, 112, 38, false);
    this.panel(root, 'HallCodexDetail', 405, -30, 330, 480, t.card, false);
    const selected = pageCards.find(card => card.id === this.selectedCardId);
    if (!selected) {
      this.label(root, 'HallCodexEmpty', '先前往殷墟探索，\n发现第一片甲骨文字吧！', 405, 0, 260, 100, 21, t.goldInk);
      return;
    }
    this.oracleGlyph(root, 'HallCodexSelectedGlyph', selected, 405, 120, 100, 126, 5);
    this.label(root, 'HallCodexSelectedTitle', `${selected.modern}  ·  ${selected.pinyin}`, 405, 38, 278, 38, 26, t.goldInk);
    this.label(root, 'HallCodexSelectedDetail', `字义：${selected.meaning}\n\n演变：${selected.evolution}\n\n商代生活：${selected.history}`, 405, -132, 282, 300, 14, t.goldSub, 'left');
  }

  private beginReview() {
    const unlocked = this.cards().filter(card => card.unlocked);
    if (unlocked.length === 0) {
      this.openReviewLibrary();
      return;
    }
    this.reviewSource = 'normal';
    this.reviewLibraryOpen = false;
    this.reviewQuestions = Array.from({ length: 5 }, () => unlocked[Math.floor(Math.random() * unlocked.length)]);
    this.reviewIndex = 0; this.reviewCorrect = 0; this.reviewMistakes = [];
    this.render('review');
  }

  private beginWrongBookReview() {
    const wrongIds = this.callbacks?.getWrongBook().map(entry => entry.cardId) ?? [];
    const wrongCards = wrongIds.map(id => this.cards().find(card => card.id === id)).filter((card): card is HallCard => !!card && card.unlocked);
    if (wrongCards.length === 0) { this.render('parent'); return; }
    this.reviewSource = 'wrongBook';
    this.reviewLibraryOpen = false;
    this.reviewQuestions = this.shuffle(wrongCards).slice(0, Math.min(5, wrongCards.length));
    this.reviewIndex = 0; this.reviewCorrect = 0; this.reviewMistakes = [];
    this.render('review');
  }

  private openReviewLibrary() {
    const root = this.createRoot('HallReviewLibrary', 'review');
    const unlocked = this.cards().filter(card => card.unlocked);
    const t = this.theme();
    this.reviewLibraryOpen = true;
    this.drawHeader(root, '复习所学', `已收集 ${unlocked.length} 个甲骨文字 · 浏览字卡后完成随机 5 题`, true);
    this.panel(root, 'HallReviewLibraryPanel', 0, 3, 1040, 430, t.card, false);
    if (unlocked.length === 0) {
      this.label(root, 'HallReviewEmptyTitle', '还没有可复习的真实甲骨字', 0, 62, 600, 48, 29, t.goldInk);
      this.label(root, 'HallReviewEmptyText', '在殷墟的考古坑完成辨识后，已收集的甲骨文字会自动出现在这里。', 0, -4, 590, 70, 19, t.goldSub);
      this.button(root, 'HallReviewGoCity', '进入殷墟探索', 0, -110, 220, 58, true);
      return;
    }
    unlocked.slice(0, 6).forEach((card, index) => {
      const x = -350 + (index % 3) * 350; const y = 76 - Math.floor(index / 3) * 155;
      const item = this.graphics(root, `HallReviewCard-${index}`, x, y, 300, 128, 4);
      item.fillColor = t.card; item.roundRect(-150, -64, 300, 128, 14); item.fill();
      item.strokeColor = t.cardStroke; item.lineWidth = 2; item.roundRect(-148, -62, 296, 124, 12); item.stroke();
      // Review cards retain the real oracle glyph; modern Hanzi remains only
      // as the teaching label beneath it.
      this.oracleGlyph(root, `HallReviewCardGlyph-${index}`, card, x - 105, y, 52, 64, 6, false);
      this.label(root, `HallReviewCardModern-${index}`, `${card.modern} · ${card.pinyin}`, x + 30, y + 25, 150, 30, 23, t.goldInk, 'left', 6);
      this.label(root, `HallReviewCardMeaning-${index}`, card.meaning, x + 30, y - 22, 166, 56, 13, t.goldSub, 'left', 6);
    });
    this.button(root, 'HallReviewStart', '开始随机 5 题', 0, -226, 230, 58, true);
  }

  private renderReview() {
    const question = this.reviewQuestions[this.reviewIndex];
    if (!question) { this.render('reviewResult'); return; }
    const root = this.createRoot('HallReview', 'review');
    const t = this.theme();
    const reviewTitle = this.reviewSource === 'wrongBook' ? '错题复习' : '复习所学';
    this.drawHeader(root, reviewTitle, `第 ${this.reviewIndex + 1} / ${this.reviewQuestions.length} 题 · 选择这个甲骨文对应的现代汉字`, true);
    this.panel(root, 'HallReviewGlyphPanel', -340, -20, 350, 430, t.card, false);
    this.label(root, 'HallReviewHint', '这个甲骨文字的意思是？', -340, 160, 280, 36, 20, t.goldInk);
    this.oracleGlyph(root, 'HallReviewGlyph', question, -340, 45, 155, 190, 5);
    this.label(root, 'HallReviewCaption', '观察字形，再选择现代汉字', -340, -155, 270, 42, 16, t.goldSub);
    const other = this.shuffle(this.cards().filter(card => card.id !== question.id));
    this.reviewOptions = this.shuffle([question, ...other.slice(0, 3)]);
    this.label(root, 'HallReviewOptionsTitle', '选择正确答案', 150, 160, 560, 38, 25, t.goldInk);
    const positions: Array<[number, number]> = [[5, 72], [295, 72], [5, -52], [295, -52]];
    this.reviewOptions.forEach((card, index) => this.button(root, `HallReviewOption-${index}`, `${String.fromCharCode(65 + index)}.  ${card.modern}`, positions[index][0], positions[index][1], 250, 88, false));
    this.label(root, 'HallReviewTip', '答题结果会计入学习进度；本期不消耗任何资源。', 150, -185, 560, 30, 15, t.goldSub);
  }

  private renderReviewResult() {
    const root = this.createRoot('HallReviewResult', 'reviewResult');
    const t = this.theme();
    this.drawHeader(root, this.reviewSource === 'wrongBook' ? '错题复习完成' : '复习完成', `${this.reviewQuestions.length} 题已完成`, true);
    this.panel(root, 'HallReviewResultPanel', 0, -5, 1000, 440, t.card, false);
    const scorePanel = this.graphics(root, 'HallReviewScorePanel', -290, 40, 330, 250, 4);
    scorePanel.fillColor = t.card; scorePanel.roundRect(-165, -125, 330, 250, 18); scorePanel.fill();
    scorePanel.strokeColor = t.cardStroke; scorePanel.lineWidth = 2; scorePanel.roundRect(-163, -123, 326, 246, 16); scorePanel.stroke();
    this.label(root, 'HallReviewScoreTitle', '本轮复习成绩', -290, 121, 250, 30, 18, t.goldInk);
    this.label(root, 'HallReviewScore', `${this.reviewCorrect} / ${this.reviewQuestions.length}`, -290, 50, 270, 92, 62, t.goldInk);
    this.label(root, 'HallReviewResultText', this.reviewCorrect === this.reviewQuestions.length ? '太棒了，全部答对！' : '记住易错字，下次会更棒。', -290, -35, 260, 46, 19, t.goldSub);
    this.label(root, 'HallReviewMistakeTitle', this.reviewMistakes.length ? '本轮易错甲骨 · 下次优先复习' : '本轮没有易错字', 155, 130, 490, 34, 22, t.goldInk);
    if (this.reviewMistakes.length === 0) {
      this.label(root, 'HallReviewPerfect', '全部答对，已经掌握得很好了！', 155, 43, 470, 56, 24, t.goldSub);
    } else {
      this.reviewMistakes.slice(0, 5).forEach((card, index) => {
        const x = 45 + (index % 2) * 222; const y = 73 - Math.floor(index / 2) * 72;
        const item = this.graphics(root, `HallReviewMistake-${index}`, x, y, 204, 60, 4);
        item.fillColor = t.card; item.roundRect(-102, -30, 204, 60, 12); item.fill();
        item.strokeColor = t.cardStroke; item.lineWidth = 2; item.roundRect(-100, -28, 200, 56, 10); item.stroke();
        this.oracleGlyph(root, `HallReviewMistakeGlyph-${index}`, card, x - 70, y, 34, 40, 6);
        this.label(root, `HallReviewMistakeModern-${index}`, `正确：${card.modern}`, x + 20, y + 8, 120, 22, 16, t.goldInk, 'left', 6);
        this.label(root, `HallReviewMistakePinyin-${index}`, card.pinyin, x + 20, y - 13, 120, 19, 12, t.goldSub, 'left', 6);
      });
    }
    this.button(root, 'HallReviewAgain', '再复习一次', -130, this.reviewResultActionY, this.reviewResultActionWidth, this.reviewResultActionHeight, true);
    this.button(root, 'HallReviewCodex', '查看甲骨图鉴', 130, this.reviewResultActionY, this.reviewResultActionWidth, this.reviewResultActionHeight, false);
  }

  private renderProgress() {
    const root = this.createRoot('HallProgress', 'progress');
    const prog = this.catalogProgress();
    const progress = this.progress();
    const t = this.theme();
    this.drawHeader(root, '学习进度', '你的甲骨文字收集与复习记录', true);
    this.panel(root, 'HallProgressPanel', 0, -10, 980, 440, t.card, false);
    const items: Array<[string, string, string, number]> = [
      ['主线图鉴', `${prog.story.collected} / ${prog.story.total}`, `甲骨拾遗 ${prog.supplement.collected} / ${prog.supplement.total}`, -310],
      ['复习答题', `${progress.correct} / ${progress.attempts}`, '累计答对 / 累计作答', 0],
      ['探索资源', `${progress.ink}`, '当前持有墨料', 310],
    ];
    items.forEach(([title, value, detail, x]) => {
      const card = this.graphics(root, `HallProgress-${title}`, x, 30, 260, 260, 4);
      card.fillColor = t.card; card.roundRect(-130, -130, 260, 260, 20); card.fill();
      card.strokeColor = t.cardStroke; card.lineWidth = 2; card.roundRect(-128, -128, 256, 256, 18); card.stroke();
      this.label(root, `HallProgressTitle-${title}`, title, x, 84, 220, 35, 22, t.goldInk);
      this.label(root, `HallProgressValue-${title}`, value, x, 15, 220, 72, 40, t.goldInk);
      this.label(root, `HallProgressDetail-${title}`, detail, x, -65, 220, 45, 15, t.goldSub);
    });
  }

  private renderStoryRoadmap() {
    const root = this.createRoot('HallStoryRoadmap', 'story');
    const story = this.callbacks?.getStoryProgress?.() ?? {
      currentChapterId: null,
      currentStepId: null,
      completedChapterIds: [],
      unlockedOracleIds: [],
      destinyPower: 0,
    };
    const t = this.theme();
    this.drawHeader(root, '甲骨命途', '沿着神甲裂纹，回望已经走过与尚未开启的故事', true);

    const summary = this.graphics(root, 'HallStorySummary', 0, 190, 1000, 72, 3);
    summary.fillColor = t.card; summary.roundRect(-500, -36, 1000, 72, 14); summary.fill();
    summary.strokeColor = t.cardStroke; summary.lineWidth = 2; summary.roundRect(-498, -34, 996, 68, 12); summary.stroke();
    const chapterDone = story.completedChapterIds.length;
    const activeChapterId = story.currentChapterId
      ?? story.completedChapterIds[story.completedChapterIds.length - 1]
      ?? CHAPTER_ONE_ID;
    const activeChapter = STORY_CHAPTERS[activeChapterId] ?? STORY_CHAPTERS[CHAPTER_ONE_ID];
    const activeChapterChars = activeChapter.fragments.filter(fragment =>
      story.unlockedOracleIds.indexOf(fragment.cardId) >= 0).length;
    const summaryItems = [
      ['故事', `${chapterDone} 章完成`],
      ['识字', `${this.catalogProgress().story.collected} / ${this.catalogProgress().story.total}`],
      ['本章骨纹', `${activeChapterChars} / ${activeChapter.fragments.length}`],
      ['命途卜力', `${story.destinyPower}`],
    ];
    summaryItems.forEach(([name, value], index) => {
      const x = -370 + index * 245;
      if (index > 0) {
        const divider = this.graphics(root, `HallStorySummaryDivider-${index}`, x - 122, 190, 2, 38, 5);
        divider.fillColor = new Color(214, 174, 100, 90); divider.rect(-1, -19, 2, 38); divider.fill();
      }
      this.label(root, `HallStorySummaryName-${index}`, name, x - 36, 202, 90, 22, 12, t.goldSub, 'right', 6);
      this.label(root, `HallStorySummaryValue-${index}`, value, x + 52, 185, 150, 34, 18, t.goldInk, 'left', 6);
    });

    const viewport = new Node('HallChapterRoadmapViewport');
    viewport.parent = root;
    viewport.setPosition(0, -30, 3);
    viewport.addComponent(UITransform).setContentSize(1060, 360);
    const mask = viewport.addComponent(Mask);
    mask.type = MaskType.GRAPHICS_RECT;
    const content = new Node('HallChapterRoadmapContent');
    content.parent = viewport;
    content.addComponent(UITransform).setContentSize(3000, 360);
    this.chapterRoadmapContent = content;

    const prologueCurrent = story.currentStepId === 'prologue-silent-heaven';
    type RoadmapEntry = { eyebrow: string; title: string; detail: string; percent: number; state: 'complete' | 'current' | 'locked' };
    const roadmap: RoadmapEntry[] = CHAPTER_ROADMAP.map((node): RoadmapEntry => {
      let state: RoadmapEntry['state'];
      let percent: number;
      if (node.id === 'prologue') {
        state = prologueCurrent ? 'current' : 'complete';
        percent = prologueCurrent ? 50 : 100;
      } else if (node.chapterId) {
        const chapter = STORY_CHAPTERS[node.chapterId];
        const completed = story.completedChapterIds.indexOf(node.chapterId) >= 0;
        const current = story.currentChapterId === node.chapterId;
        if (completed) { state = 'complete'; percent = 100; }
        else if (current && chapter) {
          state = 'current';
          const stepIndex = Math.max(0, chapter.definition.steps.findIndex(step => step.id === story.currentStepId));
          percent = Math.round(stepIndex / Math.max(1, chapter.definition.steps.length - 1) * 100);
        }
        else { state = 'locked'; percent = 0; }
      } else {
        state = 'locked'; percent = 0;
      }
      const chapter = node.chapterId ? STORY_CHAPTERS[node.chapterId] : undefined;
      const collected = chapter?.fragments.filter(fragment => story.unlockedOracleIds.indexOf(fragment.cardId) >= 0).length;
      const detail = chapter ? `剧情骨纹 ${collected} / ${chapter.fragments.length}` : node.detail;
      return { eyebrow: node.eyebrow, title: node.title, detail, percent, state };
    });

    const gap = 220;
    const startX = -650;
    const routeY = [44, -20, 50, -28, 44, -18, 52, -26, 40, -14];
    const currentRoadIndex = Math.max(0, roadmap.findIndex(chapter => chapter.state === 'current'));
    const night = this.callbacks?.getProfile().nightMode ?? false;
    this.chapterRoadmapMinOffset = -(startX + (roadmap.length - 1) * gap);
    const mist = this.graphics(viewport, 'HallChapterRoadmapMist', 0, 0, 1060, 300, 0);
    mist.fillColor = night ? new Color(38, 31, 28, 88) : new Color(238, 222, 188, 118);
    mist.roundRect(-530, -145, 1060, 290, 80); mist.fill();
    const line = this.graphics(content, 'HallChapterRoadmapLine', 0, 0, 2300, 300, 3);
    line.strokeColor = night ? new Color(90, 78, 68, 230) : new Color(142, 121, 92, 225); line.lineWidth = 7;
    line.moveTo(startX - 80, routeY[0]);
    for (let index = 1; index < roadmap.length; index++) {
      const previousX = startX + (index - 1) * gap;
      const x = startX + index * gap;
      const middle = (previousX + x) / 2;
      line.bezierCurveTo(middle, routeY[index - 1], middle, routeY[index], x, routeY[index]);
    }
    line.lineTo(startX + (roadmap.length - 1) * gap + 80, routeY[roadmap.length - 1]);
    line.stroke();
    if (currentRoadIndex > 0) {
      const lit = this.graphics(content, 'HallChapterRoadmapLitLine', 0, 0, 2300, 300, 4);
      lit.strokeColor = new Color(224, 165, 68, 245); lit.lineWidth = 4;
      lit.moveTo(startX - 80, routeY[0]);
      for (let index = 1; index <= currentRoadIndex; index++) {
        const previousX = startX + (index - 1) * gap;
        const x = startX + index * gap;
        const middle = (previousX + x) / 2;
        lit.bezierCurveTo(middle, routeY[index - 1], middle, routeY[index], x, routeY[index]);
      }
      lit.stroke();
    }
    roadmap.forEach((chapter, index) => {
      const x = startX + index * gap;
      const y = routeY[index];
      const current = chapter.state === 'current';
      const complete = chapter.state === 'complete';
      if (complete) {
        const halo = this.graphics(content, `HallChapterHalo-${index}`, x, y, 124, 124, 3);
        halo.fillColor = new Color(224, 165, 68, 32);
        halo.circle(0, 0, 58); halo.fill();
        tween(halo.node)
          .repeatForever(tween().to(2.0, { scale: new Vec3(1.08, 1.08, 1) }, { easing: 'sineInOut' })
            .to(2.0, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' }))
          .start();
      }
      if (current) {
        const outer = this.graphics(content, `HallChapterOuterGlow-${index}`, x, y, 170, 170, 3);
        outer.fillColor = new Color(255, 200, 90, 52); outer.circle(0, 0, 78); outer.fill();
        tween(outer.node)
          .repeatForever(tween().to(1.6, { scale: new Vec3(1.22, 1.22, 1) }, { easing: 'sineInOut' })
            .to(1.6, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' }))
          .start();
        const glow = this.graphics(content, `HallChapterGlow-${index}`, x, y, 130, 130, 4);
        glow.fillColor = new Color(255, 225, 140, 135); glow.circle(0, 0, 62); glow.fill();
        glow.strokeColor = new Color(255, 245, 170, 245); glow.lineWidth = 5; glow.circle(0, 0, 57); glow.stroke();
        tween(glow.node)
          .repeatForever(tween().to(1.1, { scale: new Vec3(1.18, 1.18, 1) }, { easing: 'sineInOut' })
            .to(1.1, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' }))
          .start();
        const ring = this.graphics(content, `HallChapterRing-${index}`, x, y, 160, 160, 4);
        ring.strokeColor = new Color(255, 245, 185, 245);
        ring.lineWidth = 4;
        ring.arc(0, 0, 75, 0, Math.PI * 1.9, false);
        ring.stroke();
        tween(ring.node)
          .repeatForever(tween().to(2.0, { angle: -360 }, { easing: 'linear' }))
          .start();
        const inner = this.graphics(content, `HallChapterInnerGlow-${index}`, x, y, 96, 96, 5);
        inner.fillColor = new Color(255, 248, 210, 100); inner.circle(0, 0, 46); inner.fill();
        tween(inner.node)
          .repeatForever(tween().to(1.4, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'sineInOut' })
            .to(1.4, { scale: new Vec3(0.96, 0.96, 1) }, { easing: 'sineInOut' }))
          .start();
      }
      const shard = this.graphics(content, `HallChapterShard-${index}`, x, y, 82, 92, 5);
      shard.fillColor = current ? new Color(245, 190, 95, 255)
        : complete ? new Color(164, 125, 67, 255) : new Color(66, 62, 61, 248);
      shard.moveTo(-33, 29); shard.lineTo(-21, 43); shard.lineTo(25, 38); shard.lineTo(38, 8);
      shard.lineTo(29, -37); shard.lineTo(-12, -44); shard.lineTo(-39, -18); shard.close(); shard.fill();
      shard.strokeColor = current ? new Color(255, 250, 200) : complete ? new Color(222, 188, 115) : new Color(119, 111, 102);
      shard.lineWidth = current ? 4 : 2; shard.stroke();
      const seal = this.graphics(content, `HallChapterSeal-${index}`, x, y, 58, 58, 6);
      seal.fillColor = current ? new Color(255, 215, 115, 255) : complete ? new Color(155, 111, 48) : new Color(68, 64, 64);
      seal.circle(0, 0, 27); seal.fill();
      seal.strokeColor = current ? new Color(255, 255, 220) : complete ? new Color(255, 230, 160) : new Color(130, 122, 110);
      seal.lineWidth = 2; seal.circle(0, 0, 25); seal.stroke();
      this.label(content, `HallChapterSealText-${index}`, complete ? '✓' : current ? '行' : '锁',
        x, y, 44, 44, current ? 28 : 22, current ? new Color(255, 252, 235) : complete ? new Color(255, 238, 193) : new Color(154, 146, 135), 'center', 7);

      // 每个节点只保留“章节名、骨纹进度、状态”三层信息，避免曲线路线上的文字互相压住。
      const labelDirection = y > 0 ? -1 : 1;
      const titleY = y + labelDirection * 86;
      const detailY = titleY + labelDirection * 25;
      const stateY = titleY + labelDirection * 47;
      const locked = chapter.state === 'locked';
      this.label(content, `HallChapterTitle-${index}`, chapter.title, x, titleY, 190, 30, current ? 22 : 19,
        locked ? new Color(116, 103, 88) : (current ? new Color(255, 245, 165) : new Color(92, 63, 35)), 'center', 6);
      this.label(content, `HallChapterDetail-${index}`, chapter.detail, x, detailY, 190, 24, 13,
        locked ? new Color(132, 120, 104) : (current ? new Color(156, 103, 42) : new Color(115, 82, 49)), 'center', 6);
      this.label(content, `HallChapterPercent-${index}`,
        locked ? '尚未解锁' : (current ? `探索中 · ${chapter.percent}%` : `已完成 · ${chapter.percent}%`),
        x, stateY, 170, 20, 12, locked ? new Color(125, 113, 98) : (current ? new Color(192, 120, 36) : new Color(121, 90, 54)), 'center', 7);
    });

    // Open with the current first chapter near the center. Dragging is clamped in onTouchMove.
    this.chapterRoadmapOffset = prologueCurrent ? 650 : Math.max(this.chapterRoadmapMinOffset, 650 - currentRoadIndex * gap);
    content.setPosition(this.chapterRoadmapOffset, 0, 1);
    this.label(root, 'HallStorySwipeHint', '‹  按住残卷左右拖动  ›', 0, -220, 260, 24, 13, t.goldSub, 'center', 6);
    this.label(root, 'HallChapterRoadmapFootnote',
      '完成本章学习与命途挑战，即可点亮下一段旅程。',
      0, -248, 900, 24, 12, t.goldSub, 'center', 6);
  }

  private renderWrongBook() {
    const root = this.createRoot('HallWrongBook', 'parent');
    const t = this.theme();
    const entries = this.callbacks?.getWrongBook() ?? [];
    const items = entries.map(entry => ({ entry, card: this.cards().find(card => card.id === entry.cardId) }))
      .filter((item): item is { entry: HallWrongBookEntry; card: HallCard } => !!item.card);
    this.selectedWrongBookId = this.selectedWrongBookId && items.some(item => item.card.id === this.selectedWrongBookId)
      ? this.selectedWrongBookId : items[0]?.card.id ?? null;
    const selected = items.find(item => item.card.id === this.selectedWrongBookId);
    this.drawHeader(root, '错题本', `待巩固 ${items.length} 个甲骨文字`, true);
    this.panel(root, 'HallWrongBookList', -215, -5, 630, 430, t.card, false);
    if (items.length === 0) {
      this.label(root, 'HallWrongBookEmpty', '暂无错题\n复习答错的字会自动收录到这里。', -215, 12, 480, 90, 24, t.goldInk, 'center', 6);
    } else {
      items.slice(0, 6).forEach((item, index) => {
        const x = -415 + (index % 3) * 200; const y = 88 - Math.floor(index / 3) * 190;
        const active = item.card.id === this.selectedWrongBookId;
        const tile = this.graphics(root, `HallWrongBookCard-${index}`, x, y, 166, 154, 4);
        tile.fillColor = active ? new Color(231, 209, 157, 248) : new Color(65, 51, 52, 245);
        tile.roundRect(-83, -77, 166, 154, 12); tile.fill();
        tile.strokeColor = active ? new Color(102, 183, 211) : t.cardStroke; tile.lineWidth = 2; tile.roundRect(-81, -75, 162, 150, 10); tile.stroke();
        this.oracleGlyph(root, `HallWrongBookGlyph-${index}`, item.card, x, y + 18, 54, 68, 6);
        this.label(root, `HallWrongBookModern-${index}`, item.card.modern, x, y - 39, 120, 22, 20, active ? new Color(78, 45, 28) : new Color(255, 240, 214), 'center', 6);
        this.label(root, `HallWrongBookCount-${index}`, `答错 ${item.entry.wrongCount} 次`, x, y - 61, 125, 18, 12, active ? new Color(123, 68, 42) : t.goldSub, 'center', 6);
      });
      this.button(root, 'HallWrongBookReview', '开始错题复习', -215, -245, 220, 50, true);
    }
    this.panel(root, 'HallWrongBookDetail', 350, -5, 300, 430, new Color(223, 184, 113), true);
    if (selected) {
      this.oracleGlyph(root, 'HallWrongBookSelectedGlyph', selected.card, 350, 122, 88, 105, 5);
      this.label(root, 'HallWrongBookSelectedTitle', `${selected.card.modern} · ${selected.card.pinyin}`, 350, 35, 250, 34, 24, new Color(85, 47, 30), 'center', 6);
      this.label(root, 'HallWrongBookSelectedMeaning', selected.card.meaning, 350, -58, 250, 126, 14, new Color(92, 56, 35), 'left', 6);
      this.button(root, 'HallWrongBookClear', '标记已掌握', 350, -210, 190, 44, false);
    }
  }

  private poemGlyphCards() {
    const byModern = new Map<string, HallCard>();
    this.cards().forEach(card => {
      if (card.unlocked && this.hasOracleGlyphAsset(card) && !byModern.has(card.modern)) {
        byModern.set(card.modern, card);
      }
    });
    // Cocos' current Babel target does not expand Map iterators correctly here
    // (`[].concat(byModern.values())`), so convert it explicitly.
    return Array.from(byModern.values());
  }

  private beginPoemChallenge() {
    const unlocked = this.poemGlyphCards();
    const available = poemChallengeBank.map(definition => ({ definition, card: unlocked.find(card => card.modern === definition.answer) }))
      .filter((item): item is { definition: PoemChallengeDefinition; card: HallCard } => !!item.card);
    this.poemQuestions = this.shuffle(available).slice(0, Math.min(5, available.length));
    this.poemIndex = 0; this.poemCorrect = 0; this.poemLastCorrect = false;
    this.render('poem');
  }

  private renderPoemChallenge() {
    const root = this.createRoot('HallPoemChallenge', 'poem');
    const t = this.theme(); const question = this.poemQuestions[this.poemIndex];
    this.drawHeader(root, '诗词闯关', question ? `第 ${this.poemIndex + 1} / ${this.poemQuestions.length} 关 · 选择甲骨字填空` : '先收集甲骨文字，再开始诗词闯关', true);
    this.panel(root, 'HallPoemPanel', 0, -5, 1020, 450, t.card, false);
    const glyphCards = this.poemGlyphCards();
    if (!question || glyphCards.length < 4) {
      this.label(root, 'HallPoemLocked', '需要至少收集 4 个甲骨文字，\n才能组成一题四张不同的候选字卡。', 0, 25, 700, 90, 26, t.goldInk, 'center', 6);
      this.button(root, 'HallPoemGoCity', '进入殷墟探索', 0, -110, 220, 56, true);
      return;
    }
    const wrong = glyphCards.filter(card => card.modern !== question.card.modern);
    this.poemOptions = this.shuffle([question.card, ...this.shuffle(wrong).slice(0, 3)]);
    this.label(root, 'HallPoemLine', question.definition.poem, 0, 132, 880, 70, 31, t.goldInk, 'center', 6);
    this.label(root, 'HallPoemHint', '请选择一张甲骨字卡填入【】', 0, 82, 600, 28, 17, t.goldSub, 'center', 6);
    const positions: Array<[number, number]> = [[-345, -52], [-115, -52], [115, -52], [345, -52]];
    this.poemOptions.forEach((card, index) => {
      const [x, y] = positions[index];
      const option = this.graphics(root, `HallPoemOption-${index}`, x, y, 190, 208, 4);
      option.fillColor = new Color(231, 209, 157, 248); option.roundRect(-95, -104, 190, 208, 14); option.fill();
      option.strokeColor = this.qualityColor(card.quality); option.lineWidth = 3; option.roundRect(-93, -102, 186, 204, 12); option.stroke();
      this.oracleGlyph(root, `HallPoemGlyph-${index}`, card, x, y + 27, 92, 112, 6, false);
      this.label(root, `HallPoemSelect-${index}`, `${String.fromCharCode(65 + index)} · 选此甲骨`, x, y - 76, 150, 24, 14, new Color(93, 56, 34), 'center', 6);
    });
  }

  private answerPoemChallenge(index: number) {
    const question = this.poemQuestions[this.poemIndex]; const selected = this.poemOptions[index];
    if (!question || !selected) return;
    this.poemLastCorrect = selected.id === question.card.id;
    this.callbacks?.recordReview(question.card.id, this.poemLastCorrect);
    if (this.poemLastCorrect) this.poemCorrect++;
    this.render('poemResult');
  }

  private renderPoemResult() {
    const root = this.createRoot('HallPoemResult', 'poemResult');
    const t = this.theme(); const question = this.poemQuestions[this.poemIndex];
    if (!question) { this.render('home'); return; }
    this.drawHeader(root, this.poemLastCorrect ? '闯关成功' : '本关待巩固', this.poemLastCorrect ? '甲骨字与诗句语义相符' : '已记录到错题本，请记住正确甲骨字', true);
    this.panel(root, 'HallPoemResultPanel', 0, -8, 1010, 455, t.card, false);
    this.drawPoemResultLine(root, question, t);
    this.oracleGlyph(root, 'HallPoemResultGlyph', question.card, -355, 12, 110, 135, 6, false);
    this.label(root, 'HallPoemResultChar', `${question.card.modern} · ${question.card.pinyin}`, -355, -100, 210, 28, 21, t.goldInk, 'center', 6);
    this.label(root, 'HallPoemResultMeaning', `甲骨字义：${question.card.meaning}`, -355, -166, 230, 95, 14, t.goldSub, 'left', 6);
    this.panel(root, 'HallPoemResultInfo', 180, -12, 540, 280, new Color(223, 184, 113), true);
    this.label(root, 'HallPoemResultSource', `出处：${question.definition.work}\n作者：${question.definition.author}`, 180, 80, 470, 60, 19, new Color(85, 47, 30), 'left', 6);
    this.label(root, 'HallPoemResultEmotionTitle', '思想感情', 180, 18, 470, 28, 20, new Color(85, 47, 30), 'left', 6);
    this.label(root, 'HallPoemResultEmotion', question.definition.emotion, 180, -58, 470, 105, 17, new Color(92, 56, 35), 'left', 6);
    const last = this.poemIndex >= this.poemQuestions.length - 1;
    this.button(root, 'HallPoemNext', last ? '完成闯关' : '下一关', 310, -202, 180, 50, true);
    this.label(root, 'HallPoemScore', `本轮答对 ${this.poemCorrect} / ${this.poemIndex + 1}`, -150, -202, 260, 28, 17, t.goldInk, 'center', 6);
  }

  private drawPoemResultLine(root: Node, question: { definition: PoemChallengeDefinition; card: HallCard }, t: ReturnType<LearningHall['theme']>) {
    const marker = '【】';
    const markerIndex = question.definition.poem.indexOf(marker);
    if (markerIndex < 0) {
      this.label(root, 'HallPoemResultLine', question.definition.poem, 0, 148, 860, 66, 29, t.goldInk, 'center', 6);
      return;
    }
    const poemWithGlyphSlot = question.definition.poem.replace(marker, '【　】');
    this.label(root, 'HallPoemResultLine', poemWithGlyphSlot, 0, 148, 860, 66, 29, t.goldInk, 'center', 6);
    // Classical-poetry lines here use full-width Chinese characters. Match the
    // label's centered character grid and place the real oracle image inside
    // the brackets instead of writing the modern answer back into the poem.
    const glyphSlotIndex = Array.from(question.definition.poem.slice(0, markerIndex) + '【').length;
    const characterCount = Array.from(poemWithGlyphSlot).length;
    const characterAdvance = 29;
    const glyphX = (glyphSlotIndex + .5 - characterCount / 2) * characterAdvance;
    this.oracleGlyph(root, 'HallPoemResultInlineGlyph', question.card, glyphX, 150, 30, 42, 7, false);
  }

  private nextPoemChallenge() {
    if (this.poemIndex < this.poemQuestions.length - 1) { this.poemIndex++; this.render('poem'); }
    else this.render('home');
  }

  private renderPlaceholder(mode: 'parent' | 'settings') {
    if (mode === 'settings') { this.drawSettingsPanel(); return; }
    this.renderWrongBook();
  }

  private drawCharacterSelect() {
    const root = this.createRoot('HallCharacterSelect', 'characterSelect');
    const t = this.theme();
    const mask = this.graphics(root, 'CharacterSelectMask', 0, 0, 1280, 720, 1);
    mask.fillColor = new Color(12, 16, 28, 220); mask.rect(-640, -360, 1280, 720); mask.fill();
    this.drawModal(root, { w: 900, h: 520, fill: new Color(49, 42, 61, 252), stroke: new Color(224, 179, 95), strokeW: 4, panelZ: 3 });
    this.label(root, 'CharacterSelectTitle', '选择你的卜官', 0, 210, 600, 48, 32, new Color(255, 226, 164), 'center', 7);
    this.label(root, 'CharacterSelectSubtitle', '踏入殷墟前，选择与你同行的角色', 0, 170, 620, 30, 17, t.sub, 'center', 7);
    const choices: Array<{ id: 'oracle-boy-pixel' | 'oracle-girl-pixel'; name: string; note: string; x: number }> = [
      { id: 'oracle-boy-pixel', name: '玄衣卜官', note: '黑袍负剑 · 发掘古迹', x: -210 },
      { id: 'oracle-girl-pixel', name: '青衣卜官', note: '青衫发冠 · 聆听甲骨', x: 210 },
    ];
    choices.forEach(choice => {
      const panel = this.graphics(root, `CharacterChoice-${choice.id}`, choice.x, -14, 332, 314, 4);
      panel.fillColor = new Color(37, 34, 49, 246); panel.roundRect(-166, -157, 332, 314, 18); panel.fill();
      panel.strokeColor = new Color(200, 158, 84); panel.lineWidth = 2.5; panel.roundRect(-164, -155, 328, 310, 16); panel.stroke();
      const sprite = new Node(`CharacterChoiceSprite-${choice.id}`);
      sprite.parent = root; sprite.setPosition(choice.x, 38, 6); sprite.addComponent(UITransform).setContentSize(136, 136);
      const image = sprite.addComponent(Sprite); image.sizeMode = Sprite.SizeMode.CUSTOM;
      resources.load(`characters/${choice.id}/down-0/spriteFrame`, SpriteFrame, (error, frame) => {
        if (!error && frame && image.isValid) image.spriteFrame = frame;
      });
      this.label(root, `CharacterChoiceName-${choice.id}`, choice.name, choice.x, -83, 260, 34, 24, new Color(255, 224, 158), 'center', 7);
      this.label(root, `CharacterChoiceNote-${choice.id}`, choice.note, choice.x, -114, 270, 24, 14, t.sub, 'center', 7);
      this.button(root, `CharacterChoiceButton-${choice.id}`, '选择此角色', choice.x, -164, 190, 48, true);
    });
  }

  /** 通用弹窗骨架：遮罩 + 居中圆角面板。所有弹窗共用，颜色/尺寸/圆角由调用处
   *  原样传入，确保视觉与之前完全一致，仅消除重复的样板绘制代码。 */
  private drawModal(root: Node, o: {
    mask?: Color; maskZ?: number; maskW?: number; maskH?: number;
    w: number; h: number; fill: Color;
    corner?: number; stroke?: Color; strokeW?: number; innerCorner?: number; innerInset?: number; panelZ?: number;
  }): Graphics {
    if (o.mask) {
      const mw = o.maskW ?? 1280, mh = o.maskH ?? 720;
      const mask = this.graphics(root, 'HallModalMask', 0, 0, mw, mh, o.maskZ ?? 1);
      mask.fillColor = o.mask; mask.rect(-mw / 2, -mh / 2, mw, mh); mask.fill();
    }
    const corner = o.corner ?? 18;
    const inset = o.innerInset ?? 2;
    const panel = this.graphics(root, 'HallModalPanel', 0, 0, o.w, o.h, o.panelZ ?? 3);
    panel.fillColor = o.fill; panel.roundRect(-o.w / 2, -o.h / 2, o.w, o.h, corner); panel.fill();
    panel.strokeColor = o.stroke ?? this.theme().cardStroke;
    panel.lineWidth = o.strokeW ?? 3;
    panel.roundRect(-o.w / 2 + inset, -o.h / 2 + inset, o.w - inset * 2, o.h - inset * 2, o.innerCorner ?? corner - 3); panel.stroke();
    return panel;
  }

  private drawSettingsPanel() {
    const root = this.createRoot('HallSettings', 'settings');
    const profile = this.callbacks!.getProfile();
    const t = this.theme();
    this.drawModal(root, {
      mask: new Color(40, 28, 12, 180),
      w: 560, h: 620,
      fill: t.night ? new Color(40, 34, 58, 190) : new Color(60, 45, 32, 195),
      corner: 22, strokeW: 4, innerCorner: 19,
    });
    // 标题 + 关闭（对齐 HTML .set-top）
    this.label(root, 'HallSettingsTitle', '设置', -158, 288, 200, 32, 20, t.ink, 'left', 6);
    const close = this.graphics(root, 'HallSetClose', 252, 288, 30, 30, 6);
    close.fillColor = t.night ? new Color(255, 210, 140, 40) : new Color(110, 76, 40, 40); close.roundRect(-15, -15, 30, 30, 15); close.fill();
    close.strokeColor = t.night ? new Color(255, 210, 140, 120) : new Color(110, 76, 40, 120); close.lineWidth = 1; close.roundRect(-14, -14, 28, 28, 14); close.stroke();
    this.label(root, 'HallSetCloseX', '✕', 252, 288, 20, 20, 16, t.ink, 'center', 7);
    // sec1 头像与昵称
    this.drawSettingsSection(root, 'HallSetSec1', 0, 196, 460, 156, t);
    this.drawSectionTitle(root, 'HallSetSec1Title', '头像与昵称', 258, t);
    this.label(root, 'HallSetCurAvatarLabel', '当前头像', -158, 214, 120, 24, 13, t.ink, 'left', 7);
    const cur = AVATARS.find(a => a.id === profile.avatarId) ?? AVATARS[0];
    this.drawAvatarCircle(root, 'HallSetCurAvatar', -30, 214, 22, cur.emoji, true, t, profile.avatarUrl);
    AVATARS.forEach((av, i) => {
      const x = 18 + i * 44;
      this.drawAvatarCircle(root, `HallSetAvatar-${i}`, x, 214, 18, av.emoji, av.id === profile.avatarId, t);
    });
    // 上传自定义头像按钮（+）
    const uploadR = 18, uploadX = 18 + AVATARS.length * 44;
    const upNode = this.graphics(root, 'HallSetAvatarUpload', uploadX, 214, uploadR * 2, uploadR * 2, 5);
    upNode.fillColor = new Color(255, 250, 235, 255); upNode.circle(0, 0, uploadR); upNode.fill();
    upNode.strokeColor = new Color(180, 165, 145, 200); upNode.lineWidth = 2; upNode.circle(0, 0, uploadR - 2); upNode.stroke();
    this.label(root, 'HallSetAvatarUploadPlus', '+', uploadX, 214, uploadR * 2 - 6, uploadR * 2 - 6, 22, new Color(150, 120, 90), 'center', 6);
    this.label(root, 'HallSetNameLabel', '昵称', -158, 162, 120, 24, 13, t.ink, 'left', 7);
    this.drawNicknameRow(root, profile.playerName, 70, 162, t);
    this.label(root, 'HallSwitchCharacterLabel', '地图角色', -158, 124, 120, 24, 13, t.ink, 'left', 7);
    this.button(root, 'HallSwitchCharacter', '切换角色', 118, 124, 154, 32, true);
    // sec2 声音设置
    this.drawSettingsSection(root, 'HallSetSec2', 0, 32, 460, 130, t);
    this.drawSectionTitle(root, 'HallSetSec2Title', '声音设置', 79, t);
    this.drawToggle(root, 'music', '背景音乐', -118, 50, profile.musicOn, t);
    this.drawToggle(root, 'sfx', '音效', -118, 14, profile.sfxOn, t);
    // sec3 显示
    this.drawSettingsSection(root, 'HallSetSec3', 0, -104, 460, 84, t);
    this.drawSectionTitle(root, 'HallSetSec3Title', '显示', -77, t);
    this.drawToggle(root, 'night', '夜间模式', -118, -104, profile.nightMode, t);
    // sec4 关于游戏
    this.drawSettingsSection(root, 'HallSetSec4', 0, -208, 460, 84, t);
    this.drawSectionTitle(root, 'HallSetSec4Title', '关于游戏', -181, t);
    this.label(root, 'HallSetAboutText', '殷墟甲骨文学习工具 · 开发中\n版本 V3.1 · 新国风探索 RPG', 0, -216, 460, 44, 12, t.sub, 'center', 7);
    // 昵称修改弹窗
    if (this.nameDialogOpen) this.drawNameDialog(root, profile.playerName, t);
  }

  private drawSettingsSection(root: Node, name: string, x: number, y: number, w: number, h: number, t: ReturnType<LearningHall['theme']>) {
    const sec = this.graphics(root, name, x, y, w, h, 2);
    sec.fillColor = t.night ? new Color(255, 248, 228, 18) : new Color(120, 90, 60, 18);
    sec.roundRect(-w / 2, -h / 2, w, h, 14); sec.fill();
    sec.strokeColor = t.night ? new Color(255, 210, 140, 55) : new Color(150, 110, 70, 55);
    sec.lineWidth = 1; sec.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 13); sec.stroke();
  }

  /** 小节标题：红左边框 + 文字（对齐 HTML .set-sec h4） */
  private drawSectionTitle(root: Node, name: string, text: string, y: number, t: ReturnType<LearningHall['theme']>) {
    const bar = this.graphics(root, `${name}Bar`, -220, y, 3, 14, 7);
    bar.fillColor = new Color(200, 62, 44, 255); bar.roundRect(-1.5, -7, 3, 14, 1.5); bar.fill();
    // 小节标题文字在白天模式下也保持浅金色，确保在深色卡片上清晰可见
    this.label(root, name, text, -118, y, 200, 22, 13, new Color(255, 217, 138), 'left', 7);
  }

  private drawAvatarCircle(root: Node, name: string, x: number, y: number, r: number, emoji: string, selected: boolean, t: ReturnType<LearningHall['theme']>, avatarUrl?: string) {
    if (selected) {
      const ring = this.graphics(root, `${name}Ring`, x, y, (r + 6) * 2, (r + 6) * 2, 3);
      ring.fillColor = new Color(255, 180, 70, 80); ring.circle(0, 0, r + 5); ring.fill();
      ring.strokeColor = new Color(255, 180, 70, 220); ring.lineWidth = 3; ring.circle(0, 0, r + 4); ring.stroke();
    }
    this.drawAvatar(root, name, x, y, r, {
      url: avatarUrl,
      emoji: avatarUrl ? undefined : emoji,
      frameColor: selected ? new Color(255, 180, 70) : new Color(201, 168, 108),
      bgColor: t.night ? new Color(60, 54, 86) : new Color(255, 248, 236),
      z: 4,
    });
  }

  private uploadAvatar() {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.startCrop(dataUrl);
      };
      reader.readAsDataURL(file);
    };
    document.body.appendChild(input);
    input.click();
    setTimeout(() => { if (input.parentNode) input.parentNode.removeChild(input); }, 1000);
  }

  /** 选图后进入手动裁剪：显示原图 + 可拖动/缩放的正方形裁剪框 */
  private startCrop(dataUrl: string) {
    const img = new Image();
    img.onload = () => {
      this.cropSrc = dataUrl;
      this.cropImgW = img.naturalWidth; this.cropImgH = img.naturalHeight;
      const tex = new Texture2D();
      tex.reset({ width: img.naturalWidth, height: img.naturalHeight });
      tex.uploadData(img);
      tex.setFilters(Texture2D.Filter.LINEAR, Texture2D.Filter.LINEAR);
      const sf = new SpriteFrame();
      sf.texture = tex; sf.rect = new Rect(0, 0, img.naturalWidth, img.naturalHeight);
      this.cropSf = sf;
      const fit = Math.min(this.cropArea / this.cropImgW, this.cropArea / this.cropImgH);
      this.cropDispW = this.cropImgW * fit; this.cropDispH = this.cropImgH * fit;
      const maxSize = Math.min(this.cropDispW, this.cropDispH);
      this.cropBoxSize = Math.max(120, maxSize * 0.7);
      this.cropBoxX = this.cropCenterX; this.cropBoxY = this.cropCenterY;
      this.cropDragMode = 'none';
      this.render('avatarCrop');
    };
    img.src = dataUrl;
  }

  /** 头像裁剪界面：原图 fit 居中 + 裁剪框（可拖动/缩放） + 取消/确认 */
  private drawAvatarCrop() {
    const root = this.createRoot('HallAvatarCrop', 'avatarCrop');
    const t = this.theme(); const night = t.night;
    const mask = this.graphics(root, 'HallCropMask', 0, 0, 1280, 720, 1);
    mask.fillColor = new Color(0, 0, 0, 205); mask.rect(-640, -360, 1280, 720); mask.fill();
    this.label(root, 'HallCropTitle', '调整头像', 0, 300, 400, 40, 22, t.ink, 'center', 6);
    this.label(root, 'HallCropHint', '拖动方框选择区域，可缩放', 0, 270, 400, 24, 13, t.sub, 'center', 6);
    const half = this.cropArea / 2;
    const areaBg = this.graphics(root, 'HallCropArea', this.cropCenterX, this.cropCenterY, this.cropArea, this.cropArea, 2);
    areaBg.fillColor = night ? new Color(20, 16, 12, 255) : new Color(38, 28, 18, 255);
    areaBg.roundRect(-half, -half, this.cropArea, this.cropArea, 8); areaBg.fill();
    areaBg.strokeColor = new Color(200, 160, 100, 220); areaBg.lineWidth = 2; areaBg.roundRect(-half + 1, -half + 1, this.cropArea - 2, this.cropArea - 2, 7); areaBg.stroke();
    if (this.cropSf && this.cropSf.texture) {
      const fit = Math.min(this.cropArea / this.cropImgW, this.cropArea / this.cropImgH);
      const imgNode = new Node('HallCropImg'); imgNode.parent = root; imgNode.setPosition(this.cropCenterX, this.cropCenterY, 3);
      imgNode.addComponent(UITransform).setContentSize(this.cropImgW, this.cropImgH);
      imgNode.setScale(fit, fit, 1);
      const sp = imgNode.addComponent(Sprite); sp.sizeMode = Sprite.SizeMode.CUSTOM; sp.spriteFrame = this.cropSf;
    }
    const bx = this.cropBoxX, by = this.cropBoxY, s = this.cropBoxSize, h = s / 2;
    const ax = this.cropCenterX, ay = this.cropCenterY;
    const aw = this.cropDispW / 2, ah = this.cropDispH / 2;
    const dark = new Color(0, 0, 0, 130);
    const topH = (ay + ah) - (by + h);
    const topBlk = this.graphics(root, 'HallCropDarkT', ax, (ay + ah + by + h) / 2, this.cropDispW, topH, 4);
    topBlk.fillColor = dark; topBlk.rect(-aw, -topH / 2, this.cropDispW, topH); topBlk.fill();
    const botH = (by - h) - (ay - ah);
    const botBlk = this.graphics(root, 'HallCropDarkB', ax, (by - h + ay - ah) / 2, this.cropDispW, botH, 4);
    botBlk.fillColor = dark; botBlk.rect(-aw, -botH / 2, this.cropDispW, botH); botBlk.fill();
    const leftW = (bx - h) - (ax - aw);
    const leftBlk = this.graphics(root, 'HallCropDarkL', (bx - h + ax - aw) / 2, by, leftW, s, 4);
    leftBlk.fillColor = dark; leftBlk.rect(-leftW / 2, -h, leftW, s); leftBlk.fill();
    const rightW = (ax + aw) - (bx + h);
    const rightBlk = this.graphics(root, 'HallCropDarkR', (ax + aw + bx + h) / 2, by, rightW, s, 4);
    rightBlk.fillColor = dark; rightBlk.rect(-rightW / 2, -h, rightW, s); rightBlk.fill();
    const frame = this.graphics(root, 'HallCropFrame', bx, by, s, s, 5);
    frame.strokeColor = new Color(231, 187, 97, 255); frame.lineWidth = 3; frame.roundRect(-h, -h, s, s, 4); frame.stroke();
    const corner = new Color(231, 187, 97, 255); const cs = 14;
    [[-h, h], [h, h], [-h, -h], [h, -h]].forEach(([cx, cy], i) => {
      const c = this.graphics(root, `HallCropC${i}`, bx + cx, by + cy, cs, cs, 6);
      c.fillColor = corner; c.roundRect(-cs / 2, -cs / 2, cs, cs, 3); c.fill();
    });
    const handle = this.graphics(root, 'HallCropHandle', bx + h, by - h, 28, 28, 6);
    handle.fillColor = new Color(200, 62, 44, 255); handle.circle(0, 0, 13); handle.fill();
    handle.strokeColor = new Color(255, 235, 200, 255); handle.lineWidth = 2; handle.circle(0, 0, 13); handle.stroke();
    this.button(root, 'HallCropCancel', '取消', -110, -300, 120, 44, false);
    this.button(root, 'HallCropConfirm', '确认裁剪', 110, -300, 140, 44, true);
  }

  /** 拖动 / 缩放裁剪框时只重画动态层（暗化 + 边框 + 角标 + 手柄），不重建整屏、不加 Sprite，保证拖动丝滑不卡顿 */
  private updateCropOverlay() {
    const root = this.root;
    if (!root) return;
    const bx = this.cropBoxX, by = this.cropBoxY, s = this.cropBoxSize, h = s / 2;
    const ax = this.cropCenterX, ay = this.cropCenterY;
    const aw = this.cropDispW / 2, ah = this.cropDispH / 2;
    const dark = new Color(0, 0, 0, 130);
    const blk = (name: string, x: number, y: number, w: number, hh: number) => {
      const node = root.getChildByName(name); if (!node) return;
      const g = node.getComponent(Graphics); if (!g) return;
      g.clear(); g.fillColor = dark; g.rect(-w / 2, -hh / 2, w, hh); g.fill();
      node.setPosition(x, y, 4);
    };
    blk('HallCropDarkT', ax, (ay + ah + by + h) / 2, this.cropDispW, Math.max(0, (ay + ah) - (by + h)));
    blk('HallCropDarkB', ax, (by - h + ay - ah) / 2, this.cropDispW, Math.max(0, (by - h) - (ay - ah)));
    blk('HallCropDarkL', (bx - h + ax - aw) / 2, by, Math.max(0, (bx - h) - (ax - aw)), s);
    blk('HallCropDarkR', (ax + aw + bx + h) / 2, by, Math.max(0, (ax + aw) - (bx + h)), s);
    const frame = root.getChildByName('HallCropFrame');
    if (frame) {
      const g = frame.getComponent(Graphics);
      if (g) { g.clear(); g.strokeColor = new Color(231, 187, 97, 255); g.lineWidth = 3; g.roundRect(-h, -h, s, s, 4); g.stroke(); }
      frame.setPosition(bx, by, 5);
    }
    const cornerPos: Array<[string, number, number]> = [['HallCropC0', -h, h], ['HallCropC1', h, h], ['HallCropC2', -h, -h], ['HallCropC3', h, -h]];
    cornerPos.forEach(([name, cx, cy]) => { const n = root.getChildByName(name); if (n) n.setPosition(bx + cx, by + cy, 6); });
    const handle = root.getChildByName('HallCropHandle');
    if (handle) handle.setPosition(bx + h, by - h, 6);
  }

  /** 把裁剪框覆盖的原图区域裁成 1:1（输出 256x256）后保存 */
  private doCropAndSave() {
    const fit = Math.min(this.cropArea / this.cropImgW, this.cropArea / this.cropImgH);
    const dispW = this.cropImgW * fit, dispH = this.cropImgH * fit;
    const left = this.cropCenterX - dispW / 2;
    const top = this.cropCenterY + dispH / 2;
    const s = this.cropBoxSize;
    let sx = ((this.cropBoxX - s / 2) - left) / fit;
    let sy = (top - (this.cropBoxY + s / 2)) / fit;
    let sw = s / fit; let sh = s / fit;
    if (sx < 0) { sw += sx; sx = 0; }
    if (sy < 0) { sh += sy; sy = 0; }
    if (sx + sw > this.cropImgW) sw = this.cropImgW - sx;
    if (sy + sh > this.cropImgH) sh = this.cropImgH - sy;
    if (sw <= 2 || sh <= 2) { this.exitCrop(); return; }
    const src = new Image();
    src.onload = () => {
      const cv = document.createElement('canvas'); cv.width = Math.round(sw); cv.height = Math.round(sh);
      const ctx = cv.getContext('2d');
      if (!ctx) { this.exitCrop(); return; }
      ctx.drawImage(src, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
      const out = document.createElement('canvas'); out.width = 256; out.height = 256;
      const octx = out.getContext('2d');
      if (!octx) { this.exitCrop(); return; }
      octx.drawImage(cv, 0, 0, cv.width, cv.height, 0, 0, 256, 256);
      const dataUrl = out.toDataURL('image/png');
      this.callbacks?.setAvatar('custom', dataUrl);
      this.exitCrop();
    };
    src.src = this.cropSrc;
  }

  private exitCrop() {
    this.cropSf = null; this.cropSrc = ''; this.cropDragMode = 'none';
    this.cropDispW = 0; this.cropDispH = 0;
    this.render('settings');
  }

  private onTouchMove(event: EventTouch) {
    if (this.mode === 'story' && this.chapterRoadmapDragging) {
      const { x } = this.eventToDesignPoint(event);
      this.chapterRoadmapOffset = Math.max(this.chapterRoadmapMinOffset, Math.min(650,
        this.chapterRoadmapOffsetStart + x - this.chapterRoadmapDragStartX));
      this.chapterRoadmapContent?.setPosition(this.chapterRoadmapOffset, 0, 1);
      return;
    }
    if (this.mode !== 'avatarCrop' || this.cropDragMode === 'none') return;
    const point = event.getUILocation(); const size = view.getVisibleSize();
    const x = point.x - size.width / 2; const y = point.y - size.height / 2;
    if (this.cropDragMode === 'move') {
      const dx = x - this.cropDragStartX, dy = y - this.cropDragStartY;
      const limX = (this.cropDispW - this.cropBoxSize) / 2;
      const limY = (this.cropDispH - this.cropBoxSize) / 2;
      this.cropBoxX = Math.max(this.cropCenterX - limX, Math.min(this.cropCenterX + limX, this.cropBoxStartX + dx));
      this.cropBoxY = Math.max(this.cropCenterY - limY, Math.min(this.cropCenterY + limY, this.cropBoxStartY + dy));
      this.updateCropOverlay();
    } else if (this.cropDragMode === 'scale') {
      const dist = Math.hypot(x - this.cropBoxX, y - this.cropBoxY) * 2;
      const maxSize = Math.min(this.cropDispW, this.cropDispH);
      this.cropBoxSize = Math.max(80, Math.min(maxSize, dist));
      const limX = (this.cropDispW - this.cropBoxSize) / 2;
      const limY = (this.cropDispH - this.cropBoxSize) / 2;
      this.cropBoxX = Math.max(this.cropCenterX - limX, Math.min(this.cropCenterX + limX, this.cropBoxX));
      this.cropBoxY = Math.max(this.cropCenterY - limY, Math.min(this.cropCenterY + limY, this.cropBoxY));
      this.updateCropOverlay();
    }
  }

  private onTouchEnd() {
    this.cropDragMode = 'none';
    this.chapterRoadmapDragging = false;
  }

  /** 设置页昵称展示行：点击后弹出编辑弹窗 */
  private drawNicknameRow(root: Node, name: string, x: number, y: number, t: ReturnType<LearningHall['theme']>) {
    const w = 240, h = 38;
    const bg = this.graphics(root, 'HallSetNameBg', x, y, w, h, 5);
    bg.fillColor = t.night ? new Color(40, 34, 28, 235) : new Color(255, 255, 255, 235); bg.roundRect(-w / 2, -h / 2, w, h, h / 2); bg.fill();
    bg.strokeColor = new Color(200, 160, 100, 220); bg.lineWidth = 2; bg.roundRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, h / 2 - 1); bg.stroke();
    this.label(root, 'HallSetNameValue', name, x, y, w - 20, h - 10, 16, t.night ? new Color(255, 245, 220) : new Color(60, 40, 20), 'center', 7);
    this.label(root, 'HallSetNameHint', '点击修改', x + 78, y, 60, h - 10, 11, new Color(180, 150, 110, 180), 'center', 7);
  }

  /** 昵称编辑弹窗：输入框 + 取消/保存 */
  private drawNameDialog(root: Node, currentName: string, t: ReturnType<LearningHall['theme']>) {
    const dw = 420, dh = 200;
    // 半透明遮罩（拦截点击，高 z 盖在设置面板之上）+ 面板
    this.drawModal(root, {
      mask: new Color(0, 0, 0, 160), maskZ: 20,
      w: dw, h: dh,
      fill: t.night ? new Color(30, 24, 18, 245) : new Color(255, 248, 228, 245),
      corner: 18, strokeW: 3, innerCorner: 15, panelZ: 21,
    });
    this.label(root, 'HallNameDialogTitle', '修改昵称', 0, 68, 300, 32, 18, t.ink, 'center', 22);
    // 输入框背景
    const iw = 320, ih = 42, iy = 10;
    const ibg = this.graphics(root, 'HallNameDialogInputBg', 0, iy, iw, ih, 22);
    ibg.fillColor = t.night ? new Color(48, 40, 32, 255) : new Color(255, 255, 255, 255); ibg.roundRect(-iw / 2, -ih / 2, iw, ih, ih / 2); ibg.fill();
    ibg.strokeColor = new Color(200, 160, 100, 220); ibg.lineWidth = 2; ibg.roundRect(-iw / 2 + 1, -ih / 2 + 1, iw - 2, ih - 2, ih / 2 - 1); ibg.stroke();
    // 真正的 HTML input（替代 EditBox），自动弹系统键盘，支持拼音输入中文
    this.removeNameInput();
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 12;
    input.value = currentName;
    input.placeholder = '输入昵称';
    const night = t.night;
    input.style.position = 'fixed';
    input.style.margin = '0';
    input.style.padding = '0 8px';
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.background = 'rgba(0,0,0,0)';
    input.style.color = night ? '#fff5dc' : '#3c2814';
    input.style.textAlign = 'center';
    input.style.fontSize = `${Math.round(16 * this.viewportScale)}px`;
    input.style.fontFamily = 'sans-serif';
    input.style.boxSizing = 'border-box';
    input.style.zIndex = '9999';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    });
    document.body.appendChild(input);
    this.nameInputEl = input;
    this.positionHtmlInput(input, 0, iy, iw, ih);
    // 自动聚焦，强制弹出软键盘（学习机/平板）
    setTimeout(() => { try { input.focus(); } catch (e) { /* ignore */ } }, 30);
    // 取消 / 保存按钮
    this.button(root, 'HallNameDialogCancel', '取消', -90, -58, 120, 40, false, 22);
    this.button(root, 'HallNameDialogSave', '保存', 90, -58, 120, 40, true, 22);
  }

  /** 把游戏内坐标(1280x720 中心原点)的输入框定位到屏幕像素，覆盖在游戏绘制框上 */
  private positionHtmlInput(el: HTMLInputElement, gx: number, gy: number, gw: number, gh: number) {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (gx + 640) * this.viewportScale;
    const py = (360 - gy) * this.viewportScale;
    const left = rect.left + px - (gw * this.viewportScale) / 2;
    const top = rect.top + py - (gh * this.viewportScale) / 2;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${gw * this.viewportScale}px`;
    el.style.height = `${gh * this.viewportScale}px`;
  }

  /** 移除昵称编辑用的 HTML input，避免残留 */
  private removeNameInput() {
    if (this.nameInputEl) {
      if (this.nameInputEl.parentNode) this.nameInputEl.parentNode.removeChild(this.nameInputEl);
      this.nameInputEl = null;
    }
  }

  private drawToggle(root: Node, key: string, label: string, labelX: number, y: number, on: boolean, t: ReturnType<LearningHall['theme']>) {
    this.label(root, `HallSetToggleLabel-${key}`, label, labelX, y, 200, 26, 15, t.ink, 'left', 6);
    const bw = 46, bh = 24; const bx = 198;
    const node = this.graphics(root, `HallSetToggle-${key}`, bx, y, bw, bh, 6);
    node.fillColor = on ? new Color(200, 62, 44, 255) : new Color(160, 160, 170, 220);
    node.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2); node.fill();
    if (on) { node.strokeColor = new Color(160, 106, 46, 255); node.lineWidth = 1; node.roundRect(-bw / 2 + 1, -bh / 2 + 1, bw - 2, bh - 2, bh / 2 - 1); node.stroke(); }
    const knobR = 9;
    const knobX = on ? bx + bw / 2 - 12 : bx - bw / 2 + 12;
    const knob = this.graphics(root, `HallSetToggleKnob-${key}`, knobX, y, knobR * 2, knobR * 2, 7);
    knob.fillColor = new Color(255, 255, 255, 255); knob.circle(0, 0, knobR); knob.fill();
  }

  private onTouchStart(event: EventTouch) {
    const { x, y } = this.eventToDesignPoint(event);
    if (!this.isOpen) {
      if (this.hit(x, y, 295, 309, 120, 52)) { this.playSfx('tap'); this.open(); }
      return;
    }
    if (this.mode === 'enteringYinXu') return;
    if (this.mode === 'home') {
      if (this.hitCircle(x, y, -16, -6, 72)) { this.playSfx('confirm'); this.beginYinXuTransition(); }
      else if (this.hit(x, y, -442, 14, 180, 245)) { this.playSfx('tap'); this.render('ranks'); }
      else if (this.hit(x, y, 540, 109, 86, 30)) { this.playSfx('tap'); this.openReviewLibrary(); }
      else if (this.hit(x, y, 424, -140, 340, 112)) { this.playSfx('tap'); this.render('codex'); }
      else if (this.hit(x, y, -442, -164, 250, 96)) { this.playSfx('confirm'); this.beginPoemChallenge(); }
      else if (this.hit(x, y, 540, 320, 46, 46)) { this.playSfx('tap'); this.render('settings'); }
      else {
        const navModes: HallMode[] = ['home', 'review', 'codex', 'parent', 'progress', 'story'];
        const gap = this.vh(0.120);
        const startX = -((navModes.length - 1) * gap) / 2;
        for (let index = 0; index < navModes.length; index++) {
          if (!this.hit(x, y, startX + index * gap, -281, 64, 64)) continue;
          const target = navModes[index];
          this.playSfx(target === 'home' ? 'back' : 'tap');
          if (target === 'review') this.openReviewLibrary();
          else this.render(target);
          break;
        }
      }
      return;
    }
    if (this.mode === 'ranks') {
      if (this.hit(x, y, 0, -230, 220, 50)) { this.playSfx('back'); this.render('home'); }
      return;
    }
    if (this.mode === 'avatarCrop') {
      if (this.hit(x, y, -110, -300, 120, 44)) { this.playSfx('tap'); this.exitCrop(); return; }
      if (this.hit(x, y, 110, -300, 140, 44)) { this.playSfx('confirm'); this.doCropAndSave(); return; }
      const s = this.cropBoxSize, h = s / 2, bx = this.cropBoxX, by = this.cropBoxY;
      if (this.hitCircle(x, y, bx + h, by - h, 20)) {
        this.cropDragMode = 'scale'; this.cropDragStartX = x; this.cropDragStartY = y;
        this.cropBoxStartX = bx; this.cropBoxStartY = by; this.cropBoxStartSize = s; return;
      }
      if (this.hit(x, y, bx, by, s, s)) {
        this.cropDragMode = 'move'; this.cropDragStartX = x; this.cropDragStartY = y;
        this.cropBoxStartX = bx; this.cropBoxStartY = by; this.cropBoxStartSize = s; return;
      }
      return;
    }
    if (this.mode === 'characterSelect') {
      if (this.hit(x, y, -210, -164, 190, 48)) {
        this.playSfx('confirm'); this.callbacks?.choosePlayerCharacter('oracle-boy-pixel'); this.render('home'); return;
      }
      if (this.hit(x, y, 210, -164, 190, 48)) {
        this.playSfx('confirm'); this.callbacks?.choosePlayerCharacter('oracle-girl-pixel'); this.render('home'); return;
      }
      return;
    }
    if (this.mode === 'settings') {
      if (this.nameDialogOpen) {
        // 点击弹窗面板外区域或取消 → 关闭
        if (!this.hit(x, y, 0, 0, 420, 200) || this.hit(x, y, -90, -58, 120, 40)) {
          this.playSfx('tap'); this.removeNameInput(); this.nameDialogOpen = false; this.render('settings'); return;
        }
        // 保存
        if (this.hit(x, y, 90, -58, 120, 40)) {
          const newName = (this.nameInputEl?.value ?? '').trim() || '少年卜官';
          this.callbacks?.setName(newName);
          this.playSfx('confirm'); this.removeNameInput(); this.nameDialogOpen = false; this.render('settings'); return;
        }
        return;
      }
      if (this.hit(x, y, 118, 124, 154, 32)) {
        this.playSfx('tap'); this.render('characterSelect'); return;
      }
      AVATARS.forEach((av, i) => { if (this.hit(x, y, 18 + i * 44, 214, 36, 36)) { this.playSfx('tap'); this.callbacks?.setAvatar(av.id); this.render('settings'); } });
      if (this.hit(x, y, 18 + AVATARS.length * 44, 214, 36, 36)) { this.playSfx('tap'); this.uploadAvatar(); }
      else if (this.hit(x, y, 70, 162, 240, 38)) { this.playSfx('tap'); this.nameDialogOpen = true; this.render('settings'); }
      else if (this.hit(x, y, 198, 50, 46, 24)) { this.playSfx('toggle'); this.callbacks?.toggleMusic(); this.render('settings'); }
      else if (this.hit(x, y, 198, 14, 46, 24)) { this.playSfx('toggle'); this.callbacks?.toggleSfx(); this.render('settings'); }
      else if (this.hit(x, y, 198, -104, 46, 24)) { this.playSfx('toggle'); this.callbacks?.toggleNight(); this.render('settings'); }
      else if (this.hit(x, y, 252, 288, 30, 30)) { this.playSfx('back'); this.render('home'); }
      return;
    }
    if (this.mode === 'story' && this.hit(x, y, 0, -30, 1060, 360)) {
      this.chapterRoadmapDragging = true;
      this.chapterRoadmapDragStartX = x;
      this.chapterRoadmapOffsetStart = this.chapterRoadmapOffset;
      return;
    }
    if (this.hit(x, y, 480, 286, 150, 48)) { this.playSfx('back'); this.render('home'); return; }
    if (this.mode === 'characterSelect') {
      if (this.hit(x, y, -190, 0, 320, 278)) {
        this.playSfx('confirm'); this.callbacks?.setAvatar('oracle-boy-v1'); this.beginYinXuTransition();
      } else if (this.hit(x, y, 190, 0, 320, 278)) {
        this.playSfx('confirm'); this.callbacks?.setAvatar('oracle-girl-v1'); this.beginYinXuTransition();
      } else if (this.hit(x, y, 0, -205, 150, 46)) {
        this.playSfx('back'); this.render('home');
      }
      return;
    }
    if (this.mode === 'codex') {
      if (this.codexPage > 0 && this.hit(x, y, -330, -232, 112, 38)) { this.playSfx('tap'); this.codexPage--; this.render('codex', null); return; }
      if (this.codexPage < this.codexPageCount() - 1 && this.hit(x, y, -50, -232, 112, 38)) { this.playSfx('tap'); this.codexPage++; this.render('codex', null); return; }
      this.codexPageCards().forEach((card, index) => {
        const cardX = -430 + (index % 4) * 160; const cardY = 105 - Math.floor(index / 4) * 200;
        if (card.unlocked && this.hit(x, y, cardX, cardY, 138, 168)) { this.playSfx('tap'); this.render('codex', card.id); }
      });
    } else if (this.mode === 'parent') {
      const entries = this.callbacks?.getWrongBook() ?? [];
      const items = entries.map(entry => ({ entry, card: this.cards().find(card => card.id === entry.cardId) })).filter((item): item is { entry: HallWrongBookEntry; card: HallCard } => !!item.card);
      items.slice(0, 6).forEach((item, index) => {
        const cardX = -415 + (index % 3) * 200; const cardY = 88 - Math.floor(index / 3) * 190;
        if (this.hit(x, y, cardX, cardY, 166, 154)) { this.playSfx('tap'); this.selectedWrongBookId = item.card.id; this.render('parent'); }
      });
      if (items.length > 0 && this.hit(x, y, -215, -245, 220, 50)) { this.playSfx('confirm'); this.beginWrongBookReview(); }
      else if (this.selectedWrongBookId && this.hit(x, y, 350, -210, 190, 44)) { this.playSfx('tap'); this.callbacks?.clearWrongBook(this.selectedWrongBookId); this.selectedWrongBookId = null; this.render('parent'); }
    } else if (this.mode === 'poem') {
      if (this.poemQuestions.length === 0 && this.hit(x, y, 0, -110, 220, 56)) { this.playSfx('confirm'); this.beginYinXuTransition(); return; }
      const positions: Array<[number, number]> = [[-345, -52], [-115, -52], [115, -52], [345, -52]];
      positions.forEach(([optionX, optionY], index) => {
        if (this.hit(x, y, optionX, optionY, 190, 208)) { this.playSfx('tap'); this.answerPoemChallenge(index); }
      });
    } else if (this.mode === 'poemResult') {
      if (this.hit(x, y, 310, -202, 180, 50)) { this.playSfx('confirm'); this.nextPoemChallenge(); }
    } else if (this.mode === 'review') {
      if (this.reviewLibraryOpen) {
        if (this.cards().filter(card => card.unlocked).length === 0 && this.hit(x, y, 0, -110, 220, 58)) { this.playSfx('confirm'); this.beginYinXuTransition(); }
        else if (this.hit(x, y, 0, -226, 230, 58)) { this.playSfx('confirm'); this.beginReview(); }
        return;
      }
      const positions: Array<[number, number]> = [[5, 72], [295, 72], [5, -52], [295, -52]];
      positions.forEach(([optionX, optionY], index) => {
        if (!this.hit(x, y, optionX, optionY, 250, 88)) return;
        const selected = this.reviewOptions[index]; const question = this.reviewQuestions[this.reviewIndex];
        if (!selected || !question) return;
        const correct = selected.id === question.id;
        this.callbacks?.recordReview(question.id, correct);
        if (correct) this.reviewCorrect++;
        else if (!this.reviewMistakes.some(card => card.id === question.id)) this.reviewMistakes.push(question);
        this.reviewIndex++;
        this.playSfx(correct ? 'confirm' : 'tap');
        this.render('review');
      });
    } else if (this.mode === 'reviewResult') {
      // A small invisible safety margin makes the whole rendered button easy to tap on touch screens.
      const touchWidth = this.reviewResultActionWidth + 20;
      const touchHeight = this.reviewResultActionHeight + 16;
      if (this.hit(x, y, -130, this.reviewResultActionY, touchWidth, touchHeight)) { this.playSfx('confirm'); this.reviewSource === 'wrongBook' ? this.beginWrongBookReview() : this.beginReview(); }
      else if (this.hit(x, y, 130, this.reviewResultActionY, touchWidth, touchHeight)) { this.playSfx('tap'); this.render('codex'); }
    }
  }

  private hit(x: number, y: number, centerX: number, centerY: number, width: number, height: number) {
    return Math.abs(x - centerX) <= width / 2 && Math.abs(y - centerY) <= height / 2;
  }

  private hitCircle(x: number, y: number, centerX: number, centerY: number, radius: number) {
    return (x - centerX) ** 2 + (y - centerY) ** 2 <= radius ** 2;
  }

  // ---- 木质咔哒按键音效（Web Audio 程序化合成，无需音频素材）----
  private audioCtx: any = null;
  private getAudioCtx(): any {
    if (typeof window === 'undefined') return null;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    if (!this.audioCtx) this.audioCtx = new Ctx();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    return this.audioCtx;
  }

  /** 按键音效：木质咔哒（Web Audio 程序化合成短噪声，无需音频素材）。
   *  复刻自试听通过的 wood_click：极短白噪声 → 一阶低通 → 快指数衰减。
   *  kind 仅在亮度/长度上做细微区分，整体保持同一木键手感。受 sfxOn 控制。 */
  private playSfx(kind: 'tap' | 'confirm' | 'toggle' | 'back' = 'tap') {
    const profile = this.callbacks?.getProfile();
    if (!profile || !profile.sfxOn) return;
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 不同按键的细微参数（统一木质咔哒，仅在亮度/长度上微调）
    let dur = 0.013, cutoff = 0.40, vol = 0.55, attack = 0.001, decay = 380;
    if (kind === 'confirm') { cutoff = 0.50; dur = 0.016; decay = 340; vol = 0.58; }
    else if (kind === 'toggle') { cutoff = 0.45; dur = 0.010; decay = 420; vol = 0.50; }
    else if (kind === 'back')   { cutoff = 0.35; dur = 0.014; decay = 400; vol = 0.50; }

    const sr = ctx.sampleRate;
    const n = Math.max(1, Math.floor(dur * sr));
    const buffer = ctx.createBuffer(1, n, sr);
    const data = buffer.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 2 - 1;                       // 白噪声
      lp += (x - lp) * cutoff;                               // 一阶低通，模拟木腔
      const t = i / sr;
      const a = t < attack ? t / attack : 1.0;               // 极快起音
      const env = a * Math.exp(-(t - attack) * decay);       // 指数衰减
      let s = lp * vol * env;
      if (s > 1) s = 1; else if (s < -1) s = -1;
      data[i] = s;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const master = ctx.createGain();
    master.gain.value = 0.7;                                 // 整体音量，避免连点过响
    src.connect(master); master.connect(ctx.destination);
    src.start(now);
  }

  private shuffle<T>(items: T[]) {
    for (let index = items.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1)); [items[index], items[swap]] = [items[swap], items[index]];
    }
    return items;
  }

  private hasOracleGlyphAsset(card: HallCard) {
    return !!card.asset && !!card.imageBounds && this.poemGlyphCharacters.has(card.modern);
  }

  private oracleGlyph(parent: Node, name: string, card: HallCard, x: number, y: number, maxWidth: number, maxHeight: number, z: number, allowTextFallback = true) {
    const fallback = this.label(parent, `${name}Fallback`, '', x, y, maxWidth, maxHeight, Math.max(20, Math.round(Math.min(maxWidth, maxHeight) * .52)), new Color(75, 43, 28), 'center', z);
    if (!card.asset || !card.imageBounds) return;
    const [left, top, right, bottom] = card.imageBounds;
    const scale = Math.min(maxWidth / Math.max(1, right - left + 1), maxHeight / Math.max(1, bottom - top + 1));
    const node = new Node(name); node.parent = parent; node.setPosition(x, y, z);
    node.addComponent(UITransform).setContentSize(Math.max(1, (right - left + 1) * scale), Math.max(1, (bottom - top + 1) * scale));
    const sprite = node.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    // Oracle rubbings must read as ink, even when a source crop has pale anti-aliased pixels.
    // Sprite tint multiplies the complete glyph (including edge pixels) to solid black.
    sprite.color = new Color(0, 0, 0, 255);
    this.loadSprite(`oracle/${card.asset}/spriteFrame`, node, sprite, false, () => { if (fallback.node.isValid) fallback.node.active = false; });
  }

  private loadSprite(key: string, node: Node, sprite: Sprite, linear: boolean, complete?: () => void) {
    resources.load(key, SpriteFrame, (error, frame) => {
      if (error || !frame || !node.isValid || !sprite.isValid) return;
      frame.texture.setFilters(linear ? Texture2D.Filter.LINEAR : Texture2D.Filter.NEAREST, linear ? Texture2D.Filter.LINEAR : Texture2D.Filter.NEAREST);
      sprite.spriteFrame = frame; sprite.sizeMode = Sprite.SizeMode.CUSTOM; complete?.();
    });
  }

  private loadSpriteFrameFromDataUrl(dataUrl: string, sprite: Sprite) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!sprite.isValid) return;
      const tex = new Texture2D();
      tex.reset({ width: img.width, height: img.height });
      tex.uploadData(img);
      tex.setFilters(Texture2D.Filter.LINEAR, Texture2D.Filter.LINEAR);
      const sf = new SpriteFrame();
      sf.texture = tex;
      sf.rect = new Rect(0, 0, img.width, img.height);
      sprite.spriteFrame = sf;
      sprite.color = Color.WHITE;
    };
    img.onerror = () => { console.warn('[LearningHall] failed to load avatar from dataUrl'); };
    img.src = dataUrl;
  }

  private graphics(parent: Node, name: string, x: number, y: number, width: number, height: number, z = 0) {
    const node = new Node(name); node.parent = parent; node.setPosition(x, y, z); node.addComponent(UITransform).setContentSize(width, height); return node.addComponent(Graphics);
  }

  /**
   * 通用文字节点。注意：Cocos 的 Label 节点 anchor 默认为 (0.5, 0.5)，
   * 即使 align='left' 也只是「框内文字左对齐」，x 仍是「节点中心」。
   * 因此传 left 时 x 会被当成文字框中心，文字框会向左延伸，容易导致标题出框。
   * 若需要「x 即文字真实左边缘」的贴左标题，请用 titleLabel()。
   */
  private label(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, fontSize: number, color: Color, align: 'left' | 'center' | 'right' = 'center', z = 2, outlineWidth = 0, outlineColor?: Color) {
    const node = new Node(name); node.parent = parent; node.setPosition(x, y, z);
    const transform = node.addComponent(UITransform); transform.setContentSize(width, height);
    if (align === 'right') transform.setAnchorPoint(1, 0.5);
    const label = node.addComponent(Label); label.string = text; label.fontSize = fontSize; label.lineHeight = fontSize + 7; label.color = color;
    label.enableWrapText = true; label.overflow = Label.Overflow.SHRINK;
    label.horizontalAlign = align === 'left' ? Label.HorizontalAlign.LEFT : (align === 'right' ? Label.HorizontalAlign.RIGHT : Label.HorizontalAlign.CENTER);
    label.verticalAlign = Label.VerticalAlign.CENTER;
    if (outlineWidth > 0 && outlineColor) {
      label.enableOutline = true;
      label.outlineWidth = outlineWidth;
      label.outlineColor = outlineColor;
    }
    return label;
  }

  /**
   * 真正左对齐的标题 Label：节点 anchor 设为 (0, 0.5)，x 即文字真实左边缘，
   * 不会出现 label() 默认 center anchor 导致的出框问题。用于卡片左上角标题等贴左场景。
   */
  private titleLabel(parent: Node, name: string, text: string, leftX: number, y: number, width: number, height: number, fontSize: number, color: Color, z = 6) {
    const node = new Node(name); node.parent = parent; node.setPosition(leftX, y, z);
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height); transform.setAnchorPoint(0, 0.5);
    const label = node.addComponent(Label);
    label.string = text; label.fontSize = fontSize; label.lineHeight = fontSize + 6; label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.LEFT; label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.CLAMP; label.enableWrapText = false;
    return label;
  }

  /**
   * 统一圆形头像：金边外框 + 浅暖白内底，上传图片/像素角色用 Mask 裁剪成圆形。
   * 所有有头像的位置都走这里，保证风格一致。
   */
  private drawAvatar(
    parent: Node, name: string, x: number, y: number, radius: number,
    opts: {
      url?: string;
      emoji?: string;
      spritePath?: string;
      frameColor?: Color;
      bgColor?: Color;
      z?: number;
      linear?: boolean;
    } = {}
  ) {
    const z = opts.z ?? 5;
    const frameColor = opts.frameColor ?? new Color(212, 167, 106, 255);
    const bgColor = opts.bgColor ?? new Color(255, 248, 236, 255);
    const innerR = radius - 3;
    const imgR = innerR - 1;

    const frame = this.graphics(parent, `${name}Frame`, x, y, radius * 2, radius * 2, z);
    frame.fillColor = frameColor; frame.circle(0, 0, radius); frame.fill();
    const bg = this.graphics(parent, `${name}Bg`, x, y, innerR * 2, innerR * 2, z + 1);
    bg.fillColor = bgColor; bg.circle(0, 0, innerR); bg.fill();

    if (opts.url) {
      const maskNode = new Node(`${name}Mask`); maskNode.parent = parent; maskNode.setPosition(x, y, z + 2);
      maskNode.addComponent(UITransform).setContentSize(imgR * 2, imgR * 2);
      const mask = maskNode.addComponent(Mask);
      mask.type = MaskType.GRAPHICS_ELLIPSE;
      mask.segments = 64;
      const imgNode = new Node(`${name}Img`); imgNode.parent = maskNode;
      imgNode.addComponent(UITransform).setContentSize(imgR * 2, imgR * 2);
      const sprite = imgNode.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
      this.loadSpriteFrameFromDataUrl(opts.url, sprite);
    } else if (opts.spritePath) {
      const maskNode = new Node(`${name}Mask`); maskNode.parent = parent; maskNode.setPosition(x, y, z + 2);
      maskNode.addComponent(UITransform).setContentSize(imgR * 2, imgR * 2);
      const mask = maskNode.addComponent(Mask);
      mask.type = MaskType.GRAPHICS_ELLIPSE;
      mask.segments = 64;
      const imgNode = new Node(`${name}Img`); imgNode.parent = maskNode;
      imgNode.addComponent(UITransform).setContentSize(imgR * 2, imgR * 2);
      const sprite = imgNode.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
      this.loadSprite(opts.spritePath, imgNode, sprite, opts.linear ?? true);
    } else if (opts.emoji) {
      this.label(parent, `${name}Emoji`, opts.emoji, x, y, imgR * 1.6, imgR * 1.6, imgR * 1.1, new Color(100, 70, 40), 'center', z + 2);
    }
  }

  private panel(parent: Node, name: string, x: number, y: number, width: number, height: number, color: Color, parchment: boolean) {
    const panel = this.graphics(parent, name, x, y, width, height, 2); panel.fillColor = color; panel.roundRect(-width / 2, -height / 2, width, height, 16); panel.fill();
    panel.strokeColor = parchment ? new Color(91, 51, 31) : new Color(221, 167, 80); panel.lineWidth = 5; panel.roundRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, 12); panel.stroke();
  }

  private button(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, accent: boolean, z = 6) {
    const night = this.callbacks?.getProfile().nightMode ?? false;
    const button = this.graphics(parent, name, x, y, width, height, z - 1);
    button.fillColor = accent ? new Color(157, 64, 47, 245) : (night ? new Color(52, 56, 86, 245) : new Color(92, 70, 50, 245));
    button.roundRect(-width / 2, -height / 2, width, height, 10); button.fill();
    button.strokeColor = new Color(231, 187, 97); button.lineWidth = 3; button.roundRect(-width / 2, -height / 2, width, height, 10); button.stroke();
    this.label(parent, `${name}Label`, text, x, y, width - 12, height - 8, 19, new Color(255, 238, 197), 'center', z);
  }

  private qualityColor(quality: HallCard['quality']) {
    return quality === 'red' ? new Color(202, 74, 61) : quality === 'gold' ? new Color(236, 184, 73) : new Color(75, 161, 205);
  }
}
