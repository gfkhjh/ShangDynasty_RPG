import { StoryChapterDefinition } from './StoryTypes';

// 第三章 · 模板章（照 ChapterTwo.ts 格式，只换字与数量；后续第四~九章照抄）。
// chapterId 与《殷墟小卜官》主线蓝图 ChapterRoadmap.ts 中的 'chapter-3' 节点一致。
//
// 本章字量 19，全部来自 ChapterCharMap 第三章分配，是十九枚「上游水文甲骨」碎片：
//   万 / 人 / 民 / 大 / 小 / 多 / 少 / 一 / 二 / 三 / 四 / 前 / 后 / 里 / 外 / 五 / 天 / 地 / 日
// 其中 前 / 后 / 里 的 cardId 已按 ImportedOracleCatalog 的 id 规则（catalog-u + 小写 unicode）预填为
// catalog-u524d / catalog-u540e / catalog-u91cc（属 157 待补字）。同伴按现有格式录库后，引擎依 cardId 自动对上，
// 无需再改本文件；录库前 reserve/complete 对找不到的卡做安全降级（不塞坑、不崩）。
// 本章模板仍按 19 字完整铺出叙事，引擎接入时对此三枚做占位/待补处理。
//
// 承接第二章线索『上游失踪之物』：守卜人循逆水裂纹深入上游峡谷，遇见守峡人阿沚
// （渔娘阿潍的表姐），在峡中寻回失语的十九枚上游水文碎甲，并卜算『镇水卜骨』的下落。
//
// 与第二章刻意差异化（沿用其「差异化思路」而非照搬）：
//   1) 寻骨空间由「河畔→上游峡谷」抬升，前半段在村口/峡口（人众·巨细），后半段入峡
//      （数序·方位·天地日），用计数与方位串起寻骨路线，区别于第二章的纯水势方位。
//   2) 中段事件改为「峡洪显壁」：一场上游山洪冲开峡壁，露出阿沚一族守护镇水卜骨的旧事，
//      人物弧从戒备转托付（呼应第二章阿潍，但阿沚更硬、更孤）。
//   3) 收束改为「众志共鸣」：十九字按『人众—数序—方位—天地日』排布，在峡壁投出上游水脉图，
//      点出『有人之众、有数之序、有方之位，卜乃有凭』，区别于第二章『水纹共鸣』。
//   4) 问卜环节同样扩成「三轮」：卜镇水卜骨方位 → 卜是否人为掩去 → 卜取回吉时，
//      节奏缓，避免一卜即终；三轮直接串联，末轮才逼起身（YinXuCity 占卜处理器已泛化为章无关）。

export const CHAPTER_THREE_ID = 'chapter-3-upstream-trace';

// 19 枚上游水文甲骨碎片。seekStepId / lessonStepId 供 YinXuCity 后续接入挖掘站点与学习判定。
// cardId 为本游戏字库既有卡片；前/后/里 已预填 catalog-u524d/540e/91cc（待同伴录库，录库前引擎安全降级）。
export const CHAPTER_THREE_FRAGMENT_CARDS = [
  { seekStepId: 'chapter-3-seek-001', lessonStepId: 'chapter-3-lesson-001', cardId: 'catalog-u4e07', character: '万' },
  { seekStepId: 'chapter-3-seek-002', lessonStepId: 'chapter-3-lesson-002', cardId: 'catalog-u4eba', character: '人' },
  { seekStepId: 'chapter-3-seek-003', lessonStepId: 'chapter-3-lesson-003', cardId: 'catalog-u6c11', character: '民' },
  { seekStepId: 'chapter-3-seek-004', lessonStepId: 'chapter-3-lesson-004', cardId: 'catalog-u5927', character: '大' },
  { seekStepId: 'chapter-3-seek-005', lessonStepId: 'chapter-3-lesson-005', cardId: 'catalog-u5c0f', character: '小' },
  { seekStepId: 'chapter-3-seek-006', lessonStepId: 'chapter-3-lesson-006', cardId: 'catalog-u591a', character: '多' },
  { seekStepId: 'chapter-3-seek-007', lessonStepId: 'chapter-3-lesson-007', cardId: 'catalog-u5c11', character: '少' },
  { seekStepId: 'chapter-3-seek-008', lessonStepId: 'chapter-3-lesson-008', cardId: 'catalog-u4e00', character: '一' },
  { seekStepId: 'chapter-3-seek-009', lessonStepId: 'chapter-3-lesson-009', cardId: 'catalog-u4e8c', character: '二' },
  { seekStepId: 'chapter-3-seek-010', lessonStepId: 'chapter-3-lesson-010', cardId: 'catalog-u4e09', character: '三' },
  { seekStepId: 'chapter-3-seek-011', lessonStepId: 'chapter-3-lesson-011', cardId: 'catalog-u56db', character: '四' },
  { seekStepId: 'chapter-3-seek-012', lessonStepId: 'chapter-3-lesson-012', cardId: 'catalog-u524d', character: '前' },
  { seekStepId: 'chapter-3-seek-013', lessonStepId: 'chapter-3-lesson-013', cardId: 'catalog-u540e', character: '后' },
  { seekStepId: 'chapter-3-seek-014', lessonStepId: 'chapter-3-lesson-014', cardId: 'catalog-u91cc', character: '里' },
  { seekStepId: 'chapter-3-seek-015', lessonStepId: 'chapter-3-lesson-015', cardId: 'catalog-u5916', character: '外' },
  { seekStepId: 'chapter-3-seek-016', lessonStepId: 'chapter-3-lesson-016', cardId: 'catalog-u4e94', character: '五' },
  { seekStepId: 'chapter-3-seek-017', lessonStepId: 'chapter-3-lesson-017', cardId: 'catalog-u5929', character: '天' },
  { seekStepId: 'chapter-3-seek-018', lessonStepId: 'chapter-3-lesson-018', cardId: 'catalog-u5730', character: '地' },
  { seekStepId: 'chapter-3-seek-019', lessonStepId: 'chapter-3-lesson-019', cardId: 'sun', character: '日' },
] as const;

export const chapterThreeDefinition: StoryChapterDefinition = {
  id: CHAPTER_THREE_ID,
  title: '第三章：逆流寻踪',
  firstStepId: 'chapter-3-opening',
  steps: [
    {
      id: 'chapter-3-opening',
      chapterId: CHAPTER_THREE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '第二章的卜辞余音里，那道逆水而上的裂纹始终没散。它像一根被水流牵着的线，引着守卜人离开熟悉的河滩，朝更上游的峡谷走去。',
        },
        {
          speaker: '贞人师',
          text: '你卜出的裂纹直指上游。那里住着靠峡吃水的支族，守着一具『镇水卜骨』——相传它能安一峡之水势。神甲碎后，它也失了声，上游的潮信便乱了套。',
        },
        {
          speaker: '渔娘阿潍',
          text: '我表姐阿沚守在上游峡口。她脾气硬，谁也不信。可若真有东西在上游失踪，除了她，没人看得全那一峡的水路。',
        },
        {
          speaker: '贞人师',
          text: '去吧。循着裂纹逆流而上，寻回那些刻着上游水文的碎甲。有人之众、有数之序，卜辞才能落得稳。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第三章开启：逆流寻踪。当前目标：沿逆水裂纹深入上游峡谷，寻回失语的上游水文碎甲。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-3-reach-gorge',
      checkpoint: true,
    },
    {
      id: 'chapter-3-reach-gorge',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 峡口',
        detail: '逆水而行，峡谷口的风里夹着湿冷的石腥。走到守峡人阿沚守着的地方，向她打听那枚失踪的镇水卜骨。',
        storyLocationId: 'chapter-3-royal-tomb-entry',
        targetRadius: 200,
      },
      completeOn: 'npc-reached',
      nextStepId: 'chapter-3-npc-dialogue',
    },
    {
      id: 'chapter-3-npc-dialogue',
      chapterId: CHAPTER_THREE_ID,
      dialogue: [
        {
          speaker: '守峡人阿沚',
          text: '又是宗庙派来的人？我这一峡的水路，用不着外人指手画脚。',
        },
        {
          speaker: '你',
          text: '我不是来指路。第二章的卜辞里，裂纹逆水指到了这里——有东西在上游失踪了，对不对？',
        },
        {
          speaker: '守峡人阿沚',
          text: '……镇水卜骨。我族守了三代的镇水骨，自打天意断了，就再没显过字。上月一场怪水，它连匣子一起没了影。',
        },
        {
          speaker: '守峡人阿沚',
          text: '你也听见骨响？那便证明给我看。峡里散着十九枚上游水文碎甲，是我族记水脉、数岔流、辨方位的旧刻。你若能一枚枚唤醒它们，我或许信你真能找回头骨。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '任务更新：在上游峡谷挖掘并发掘失语的上游水文甲骨碎片。每寻回一枚，阿沚的戒备便松一分。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-3-seek-001',
      checkpoint: true,
    },
    // —— 前半段 7 字：村口/峡口，落点在「人众 · 巨细」 ——
    {
      id: 'chapter-3-seek-001',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 村口旧址',
        detail: '上游众姓避水迁来的旧村口，断墙根下埋着微光。挖出如众多并列的“万”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-001',
      checkpoint: true,
    },
    {
      id: 'chapter-3-lesson-001',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识万字',
        detail: '观察如众庶并列的骨纹，是上游支族记“万家避水、聚族而居”的刻法，正确辨认“万”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-002',
    },
    {
      id: 'chapter-3-seek-002',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 独行足印',
        detail: '河滩上一道独行人的足印旁沉着微光。挖出如人形侧立的“人”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-002',
    },
    {
      id: 'chapter-3-lesson-002',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识人字',
        detail: '观察侧立如人的骨纹，是“一人涉水、独行探路”的记法，正确辨认“人”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-003',
    },
    {
      id: 'chapter-3-seek-003',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 民舍灶膛',
        detail: '废弃民舍的灶膛灰里闪着微光。挖出如目下众庶的“民”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-003',
    },
    {
      id: 'chapter-3-lesson-003',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识民字',
        detail: '观察“目下之众”的骨纹，是“庶民傍水、共守一峡”的记法，正确辨认“民”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-004',
    },
    {
      id: 'chapter-3-seek-004',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 峡口巨石',
        detail: '峡口一块巨石裂缝里透出微光。挖出如人张双臂的“大”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-004',
    },
    {
      id: 'chapter-3-lesson-004',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识大字',
        detail: '观察张臂如人的骨纹，是“巨石为门、镇峡之枢”的记法，正确辨认“大”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-005',
    },
    {
      id: 'chapter-3-seek-005',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 石缝小隙',
        detail: '巨石旁一道细缝里沉着微光。挖出如沙粒三点的“小”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-005',
    },
    {
      id: 'chapter-3-lesson-005',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识小字',
        detail: '观察三粒如沙的骨纹，是“细隙藏水、不可不察”的记法，正确辨认“小”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-006',
    },
    {
      id: 'chapter-3-seek-006',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 多股汇流',
        detail: '多股水流在峡前交汇，涡心沉着微光。挖出如二肉相叠的“多”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-006',
    },
    {
      id: 'chapter-3-lesson-006',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识多字',
        detail: '观察重叠如累肉的骨纹，是“众流相汇、水势渐盛”的记法，正确辨认“多”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-007',
    },
    {
      id: 'chapter-3-seek-007',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 退水苔痕',
        detail: '水退后石面留下稀疏苔痕，痕下微光。挖出如小缺一点的“少”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-007',
    },
    {
      id: 'chapter-3-lesson-007',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识少字',
        detail: '观察缺一点如稀的骨纹，是“水落则痕稀、宜辨浅滩”的记法，正确辨认“少”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-midstream-flood',
    },
    // —— 中段事件：峡洪显壁 + 阿沚人物弧（呼应第二章阿潍，但更孤更硬） ——
    {
      id: 'chapter-3-midstream-flood',
      chapterId: CHAPTER_THREE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '第七枚碎甲归位的刹那，上游忽起一阵山洪。浊流撞在峡壁，竟冲开一片覆着青苔的古老刻痕——那是一幅上游水脉图，末端赫然画着一具被激流卷走的卜骨。',
        },
        {
          speaker: '守峡人阿沚',
          text: '……这是我阿翁的图。他说镇水骨不是丢了，是被人趁着怪水，故意卷去了下游。',
        },
        {
          speaker: '守峡人阿沚',
          text: '我原当你和那些来「勘水」的官人一样，看了便走。可你挖出的骨片，真的一枚枚在我眼前亮了。守卜人，这回我信你。',
        },
        {
          speaker: '神秘低语',
          text: '……众也……序也……位也……骨归其脉，卜方有凭……',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿沚将那幅水脉图拓在掌心，眼底的孤硬，第一次化作了托付。你与她之间，多了一道不必言说的契。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '中段：七字已聚，阿沚终肯托付。继续入峡，寻回余下十二枚上游水文碎甲。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-3-seek-008',
      checkpoint: true,
    },
    // —— 后半段 12 字：入峡，落点在「数序 · 方位 · 天地日」 ——
    {
      id: 'chapter-3-seek-008',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 入峡一刻',
        detail: '入峡第一道刻痕在岩角发光。挖出如横划起数的“一”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-008',
    },
    {
      id: 'chapter-3-lesson-008',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识一字',
        detail: '观察起笔如横的骨纹，是“数之始、路之初”的记法，正确辨认“一”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-009',
    },
    {
      id: 'chapter-3-seek-009',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 第二岔流',
        detail: '峡中第二道岔流汇处沉着微光。挖出如两横并列的“二”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-009',
    },
    {
      id: 'chapter-3-lesson-009',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识二字',
        detail: '观察两横如双流的骨纹，是“二水分岔、当择其向”的记法，正确辨认“二”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-010',
    },
    {
      id: 'chapter-3-seek-010',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 三岔口',
        detail: '峡底三岔口中央沉着微光。挖出如三横叠列的“三”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-010',
    },
    {
      id: 'chapter-3-lesson-010',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识三字',
        detail: '观察三横如三径的骨纹，是“三径交汇、众流归一”的记法，正确辨认“三”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-011',
    },
    {
      id: 'chapter-3-seek-011',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 第四崖台',
        detail: '第四层崖台石棱下压着微光。挖出如方框四隅的“四”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-011',
    },
    {
      id: 'chapter-3-lesson-011',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识四字',
        detail: '观察方框四隅的骨纹，是“四方崖台、各有其位”的记法，正确辨认“四”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-012',
    },
    {
      id: 'chapter-3-seek-012',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 前行暗道',
        detail: '前行暗道尽头沉着微光。挖出如舟在人前的“前”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-012',
    },
    {
      id: 'chapter-3-lesson-012',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识前字',
        detail: '观察舟在人前的骨纹，是“向前的动作、当进则进”的记法，正确辨认“前”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-013',
    },
    {
      id: 'chapter-3-seek-013',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 回望来路',
        detail: '回望来路的石阶下沉着微光。挖出如人退行的“后”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-013',
    },
    {
      id: 'chapter-3-lesson-013',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识后字',
        detail: '观察人退行的骨纹，是“回望来路、知退方守”的记法，正确辨认“后”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-014',
    },
    {
      id: 'chapter-3-seek-014',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 洞里深处',
        detail: '洞里深处岩腔中沉着微光。挖出如田在衣中的“里”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-014',
    },
    {
      id: 'chapter-3-lesson-014',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识里字',
        detail: '观察田在衣中的骨纹，是“内里深处、藏水之腔”的记法，正确辨认“里”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-015',
    },
    {
      id: 'chapter-3-seek-015',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 洞外平台',
        detail: '洞外平台岩脚沉着微光。挖出如夕在山外的“外”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-015',
    },
    {
      id: 'chapter-3-lesson-015',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识外字',
        detail: '观察夕在山外的骨纹，是“山外旷野、水出其表”的记法，正确辨认“外”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-016',
    },
    {
      id: 'chapter-3-seek-016',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 第五梯田',
        detail: '第五级梯田埂下沉着微光。挖出如交错指形的“五”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-016',
    },
    {
      id: 'chapter-3-lesson-016',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识五字',
        detail: '观察交错如指的骨纹，是“五数已满、可定中轴”的记法，正确辨认“五”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-017',
    },
    {
      id: 'chapter-3-seek-017',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 峡顶天窗',
        detail: '峡顶天窗漏下的光柱里沉着微光。挖出如人顶苍穹的“天”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-017',
    },
    {
      id: 'chapter-3-lesson-017',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识天字',
        detail: '观察人顶苍穹的骨纹，是“仰观天象、以定水期”的记法，正确辨认“天”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-018',
    },
    {
      id: 'chapter-3-seek-018',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 峡底大地',
        detail: '峡底湿润的大地裂隙里沉着微光。挖出如土也相叠的“地”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-018',
    },
    {
      id: 'chapter-3-lesson-018',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识地字',
        detail: '观察土也相叠的骨纹，是“坤厚载水、峡有其基”的记法，正确辨认“地”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-seek-019',
    },
    {
      id: 'chapter-3-seek-019',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 日影定方',
        detail: '最末一道微光落在日影石上。借日影辨明方位，挖出如圆中一点的“日”字碎片，完成上游寻骨。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-3-lesson-019',
    },
    {
      id: 'chapter-3-lesson-019',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 辨识日字',
        detail: '观察圆中一点的骨纹，是“日影辨方、知水所向”的记法，正确辨认“日”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-3-fragment-awakens',
    },
    // —— 收束事件：众志共鸣（区别于第二章「水纹共鸣」） ——
    {
      id: 'chapter-3-fragment-awakens',
      chapterId: CHAPTER_THREE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '十九枚上游水文碎甲在掌心依次排开。你按『人众—数序—方位—天地日』的脉络理好，骨纹竟在峡壁投出一幅上游水脉图——镇水卜骨被卷去的方向，在图上缓缓亮起。',
        },
        {
          speaker: '神秘低语',
          text: '……众也……序也……位也……有人之众、有数之序、有方之位，卜乃有凭……',
        },
        {
          speaker: '你',
          text: '原来上游水文卜骨记下的不是死数，是万家避水、数序辨流、方位定脉的活路。它们齐了，镇水骨的下落才显得出来。',
        },
        {
          speaker: '守峡人阿沚',
          text: '我听不见金光里的声音，可骨片真的在你手里连成了图！你果然是贞人师说的守卜人。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '获得：“万、人、民、大、小、多、少、一、二、三、四、前、后、里、外、五、天、地、日”十九枚上游水文甲骨碎片。上游卜力已苏醒，骨上之众可落为天意之辞。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-3-first-request',
    },
    {
      id: 'chapter-3-first-request',
      chapterId: CHAPTER_THREE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '十九枚上游碎甲归位，掌心的金光汇成一幅微缩水脉图。阿沚一族与河水讨生活的路，仿佛又能在骨上数得清了。',
        },
        {
          speaker: '守峡人阿沚',
          text: '守卜人，镇水骨被卷去了哪里、是不是有人故意掩去、何时取回才不逆水势——这三问，我族盼了三代。能用这些字卜一卜么？',
        },
        {
          speaker: '你',
          text: '（你斟酌片刻：三问牵连，当一卜接一卜地解。你取过一枚上游甲骨——先卜方位，其余的卜，且待骨纹引你去看。）',
        },
        {
          speaker: '贞人师',
          text: '去吧。以众志共鸣之力，为阿沚卜算镇水卜骨的三桩悬案。每替一人解开迷惘，上游卜力便积下一分，也会引动更深的去向。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '守卜任务开启（第一轮）：为守峡人阿沚卜算镇水卜骨的方位，并留意兆纹里多出的那道裂纹。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-3-enter-temple',
      checkpoint: true,
    },
    {
      id: 'chapter-3-enter-temple',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '逆流寻踪 · 第一轮问卜',
        detail: '告别峡口，随阿沚返回宗庙内殿。峡风渐远，灼骨之香渐近，接待前来问镇水卜骨方位的阿沚。',
        storyLocationId: 'city-divination-temple',
        targetRadius: 110,
      },
      completeOn: 'temple-entered',
      nextStepId: 'chapter-3-take-divination-seat',
    },
    {
      id: 'chapter-3-take-divination-seat',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '第一轮问卜 · 入席',
        detail: '走到内殿占卜席前，点击“坐下”，听阿沚讲清她要卜的镇水卜骨方位。',
      },
      completeOn: 'temple-seat-reached',
      nextStepId: 'chapter-3-divination-1',
    },
    {
      id: 'chapter-3-divination-1',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '第一轮问卜 · 镇水方位',
        detail: '取过一枚上游甲骨，为守峡人阿沚卜算镇水卜骨如今被卷往何处——这是上游卜力第一次落为天意之辞。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-3-divination-2',
      checkpoint: true,
    },
    {
      id: 'chapter-3-divination-2',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '第二轮问卜 · 人为与否',
        detail: '阿沚见卜辞灵验，又问是否有人故意掩去镇水骨；贞人师让你顺藤摸瓜。取过一枚上游甲骨占算——裂纹比上一轮又长了一分，仍不必起身。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-3-divination-3',
      checkpoint: true,
    },
    {
      id: 'chapter-3-divination-3',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '第三轮问卜 · 取回吉时',
        detail: '两卜相连，裂纹皆指向下游两岸。最后一卜，为「取回镇水卜骨的吉时」占算——三卜毕，裂纹将彻底指向林路，届时再起身查看。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-3-leave-divination-seat',
      checkpoint: true,
    },
    {
      id: 'chapter-3-leave-divination-seat',
      chapterId: CHAPTER_THREE_ID,
      objective: {
        title: '异常兆纹',
        detail: '完成三轮占卜后起身，查看上游甲骨额外显出的那道指向下游两岸的裂纹。',
      },
      completeOn: 'result-confirmed',
      nextStepId: 'chapter-3-clue-revealed',
    },
    {
      id: 'chapter-3-clue-revealed',
      chapterId: CHAPTER_THREE_ID,
      dialogue: [
        {
          speaker: '守峡人阿沚',
          text: '原来镇水骨被卷去了下游两岸的林子里，且确有人趁怪水故意掩去。卜出的吉时，三日后平水可取。有了这个数，我便敢去寻找了。多谢守卜人。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿沚离去后，兆纹并未熄灭。几道不属于方位卜辞的裂纹缓缓延伸，竟越过河水，指向对岸幽深的山林。',
        },
        {
          speaker: '神秘低语',
          text: '……林中也……有骨……被人引去……',
        },
        {
          speaker: '贞人师',
          text: '三轮卜辞彼此牵引，这道裂纹拐入了两岸山林——下一处碎甲，恐怕不在水中，而在林径深处。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第三章完成：逆流寻踪。获得线索“林径深处的骨”，山林迷径的章节已开启。',
        },
      ],
      completeOn: 'dialogue-completed',
      checkpoint: true,
    },
  ],
};
