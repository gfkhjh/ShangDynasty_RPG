import { CHAPTER_CHAR_PLANS, SUPPLEMENT_CHARS, ChapterCharPlan } from './ChapterCharMap';

/**
 * The 300 target characters are intentionally split into three gameplay
 * layers. Only guided cards gate chapter completion; free-main and relic
 * cards are exploration rewards.
 */
export type CharacterCollectionLayer = 'guided' | 'main-free' | 'relic';

const GUIDED_COUNTS = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export type ChapterCollectionPlan = {
  chapterId: string;
  guidedCardIds: readonly string[];
  mainFreeCardIds: readonly string[];
  relicCardIds: readonly string[];
};

const cardIdFor = (char: { char: string; existingCardId: string | null }) =>
  char.existingCardId ?? `catalog-u${char.char.codePointAt(0)!.toString(16)}`;

function buildPlan(source: ChapterCharPlan, index: number): ChapterCollectionPlan {
  const cards = source.chars.map(cardIdFor);
  const guidedCount = GUIDED_COUNTS[index];
  return {
    chapterId: source.chapterId,
    guidedCardIds: cards.slice(0, guidedCount),
    mainFreeCardIds: cards.slice(guidedCount),
    relicCardIds: [],
  };
}

export const CHAPTER_COLLECTION_PLANS = CHAPTER_CHAR_PLANS.map(buildPlan);
export const MAIN_STORY_CARD_IDS = CHAPTER_COLLECTION_PLANS.flatMap(plan => [
  ...plan.guidedCardIds,
  ...plan.mainFreeCardIds,
]);
// 拾遗字 = 原计划分配的 50 个补充字（编号 251–300），字形数据从仓库总字池
// （手写卡 + imported catalog-u + 宝宝建的补充卡字）中按 id 匹配获取。
// 仓库总字池 = 之前的字 + 补充卡字，剧情基于仓库所有字推进，但不把 152 当拾遗。
export const RELIC_CARD_IDS = SUPPLEMENT_CHARS.map(cardIdFor);

// The original story files use these two corrected ids while the historical
// character table kept its earlier roadmap ids. Keep the data compatible
// instead of duplicating the 300-character list.
const LEGACY_PLAN_ID: Record<string, string> = {
  'chapter-7-wrong-scroll': 'chapter-7-wrong-scrolls',
  'chapter-8-tomb-three-proofs': 'chapter-8-royal-tombs',
};

export function collectionPlanFor(chapterId: string) {
  const planId = LEGACY_PLAN_ID[chapterId] ?? chapterId;
  return CHAPTER_COLLECTION_PLANS.find(plan => plan.chapterId === planId) ?? null;
}

export function fixedGuidedCardIds(chapterId: string) {
  return collectionPlanFor(chapterId)?.guidedCardIds ?? [];
}

(() => {
  const plans = CHAPTER_COLLECTION_PLANS;
  const guided = plans.reduce((total, plan) => total + plan.guidedCardIds.length, 0);
  const main = plans.reduce((total, plan) => total + plan.guidedCardIds.length + plan.mainFreeCardIds.length, 0);
  const relic = RELIC_CARD_IDS.length;
  console.assert(guided === 63, `[CollectionPlan] guided count: ${guided}`);
  console.assert(main === 250, `[CollectionPlan] main count: ${main}`);
  console.assert(relic === 50, `[CollectionPlan] relic count: ${relic}`);
})();
