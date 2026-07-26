import { CHAPTER_CHAR_PLANS, ChapterCharPlan } from './ChapterCharMap';

/**
 * The 300 target characters are intentionally split into three gameplay
 * layers. Only guided cards gate chapter completion; free-main and relic
 * cards are exploration rewards.
 */
export type CharacterCollectionLayer = 'guided' | 'main-free' | 'relic';

const GUIDED_COUNTS = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const RELIC_COUNTS = [0, 1, 2, 3, 4, 5, 7, 10, 18] as const;

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
  const relicCount = RELIC_COUNTS[index];
  const mainCount = cards.length - relicCount;
  return {
    chapterId: source.chapterId,
    guidedCardIds: cards.slice(0, guidedCount),
    mainFreeCardIds: cards.slice(guidedCount, mainCount),
    relicCardIds: cards.slice(mainCount),
  };
}

export const CHAPTER_COLLECTION_PLANS = CHAPTER_CHAR_PLANS.map(buildPlan);
export const MAIN_STORY_CARD_IDS = CHAPTER_COLLECTION_PLANS.flatMap(plan => [
  ...plan.guidedCardIds,
  ...plan.mainFreeCardIds,
]);
export const RELIC_CARD_IDS = CHAPTER_COLLECTION_PLANS.flatMap(plan => plan.relicCardIds);

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
  const relic = plans.reduce((total, plan) => total + plan.relicCardIds.length, 0);
  console.assert(guided === 63, `[CollectionPlan] guided count: ${guided}`);
  console.assert(main === 250, `[CollectionPlan] main count: ${main}`);
  console.assert(relic === 50, `[CollectionPlan] relic count: ${relic}`);
})();
