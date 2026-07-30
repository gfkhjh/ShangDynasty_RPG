import { CHAPTER_ONE_ID } from './ChapterOne';
import { CHAPTER_TWO_ID } from './ChapterTwo';
import { CHAPTER_THREE_ID } from './ChapterThree';
import { CHAPTER_FOUR_ID } from './ChapterFour';
import { CHAPTER_FIVE_ID } from './ChapterFive';
import { CHAPTER_SIX_ID } from './ChapterSix';
import { CHAPTER_SEVEN_ID } from './ChapterSeven';
import { CHAPTER_EIGHT_ID } from './ChapterEight';
import { CHAPTER_NINE_ID } from './ChapterNine';

// 甲骨命途 · 主线节点数据源（独立于学习进度，供大厅路线页「甲骨命途」渲染）。
// 文案只点主线方向，不剧透关键人物与具体结局，符合「未解锁内容不提前剧透」原则。
// 九章主线合计 250 字，另有 50 个甲骨拾遗字，完整图鉴仍为 300 字。
// chapterId 为 null 表示序章或该章剧本尚未实现（路线页中以 locked 显示，标题与方向仍可见）。

export type ChapterRoadmapNode = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  charCount: number;
  chapterId: string | null;
  theme: string;
};

export const CHAPTER_ROADMAP: ChapterRoadmapNode[] = [
  {
    id: 'prologue',
    eyebrow: '序章',
    title: '天道失语',
    detail: '神甲崩碎，万骨无声',
    charCount: 0,
    chapterId: null,
    theme: '世界背景 · 通天灵龟甲碎裂',
  },
  {
    id: 'chapter-1',
    eyebrow: '第一章',
    title: '失语的甲骨',
    detail: '寻五字、复苏卜力',
    charCount: 5,
    chapterId: CHAPTER_ONE_ID,
    theme: '教学闭环 · 雨田水土地云',
  },
  {
    id: 'chapter-2',
    eyebrow: '第二章',
    title: '河畔初兆',
    detail: '顺水声抵河畔，初勘新碎甲',
    charCount: 12,
    chapterId: CHAPTER_TWO_ID,
    theme: '水域 · 方位 · 舟船起点',
  },
  {
    id: 'chapter-3',
    eyebrow: '第三章',
    title: '逆流寻踪',
    detail: '沿流逆流，追查失踪线索',
    charCount: 19,
    chapterId: CHAPTER_THREE_ID,
    theme: '河畔深入 · 多字调查',
  },
  {
    id: 'chapter-4',
    eyebrow: '第四章',
    title: '山林迷径',
    detail: '入山问路，依字义辨向',
    charCount: 26,
    chapterId: CHAPTER_FOUR_ID,
    theme: '山林 · 道路 · 部族',
  },
  {
    id: 'chapter-5',
    eyebrow: '第五章',
    title: '护送归途',
    detail: '护送祭器队，动物与方向导航',
    charCount: 26,
    chapterId: CHAPTER_FIVE_ID,
    theme: '山林 · 护送 · 动作字',
  },
  {
    id: 'chapter-6',
    eyebrow: '第六章',
    title: '古墟残灯',
    detail: '探工匠古墟，光暗器物修复',
    charCount: 32,
    chapterId: CHAPTER_SIX_ID,
    theme: '古墟 · 器物 · 光暗',
  },
  {
    id: 'chapter-7',
    eyebrow: '第七章',
    title: '错册余火',
    detail: '勘祭祀错简，初见非自然崩碎',
    charCount: 38,
    chapterId: CHAPTER_SEVEN_ID,
    theme: '古墟 · 记录 · 祭祀',
  },
  {
    id: 'chapter-8',
    eyebrow: '第八章',
    title: '王陵三证',
    detail: '王陵证词，守旧派凿甲真相',
    charCount: 44,
    chapterId: CHAPTER_EIGHT_ID,
    theme: '王陵 · 证词 · 立场',
  },
  {
    id: 'chapter-9',
    eyebrow: '终章',
    title: '重续通天之契',
    detail: '重聚骨片，重铸或弃神谕',
    charCount: 48,
    chapterId: CHAPTER_NINE_ID,
    theme: '合甲 · 三结局 · 公开学堂',
  },
];

// 路线图仅统计九章主线字；拾遗数量单独展示。
export const ROADMAP_TOTAL_CHARS = CHAPTER_ROADMAP.reduce((sum, n) => sum + n.charCount, 0);
export const ROADMAP_SUPPLEMENT_CHARS = 50;
export const ROADMAP_FULL_CATALOG_CHARS = ROADMAP_TOTAL_CHARS + ROADMAP_SUPPLEMENT_CHARS;

if (ROADMAP_TOTAL_CHARS !== 250 || ROADMAP_FULL_CATALOG_CHARS !== 300) {
  throw new Error(`[ChapterRoadmap] 字数配置异常：主线 ${ROADMAP_TOTAL_CHARS}，完整图鉴 ${ROADMAP_FULL_CATALOG_CHARS}。`);
}
