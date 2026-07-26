import { StoryChapterDefinition } from './StoryTypes';

// 第四章 · 承接第三章模板，但刻意走出「山林迷径」自己的特色（不与第一~三章雷同）。
// chapterId 与《殷墟小卜官》主线蓝图 ChapterRoadmap.ts 中的 'chapter-4' 节点一致。
//
// 本章字量 26，全部来自 ChapterCharMap 第四章分配，是二十六枚「山林路径甲骨」碎片：
//   月 / 星 / 六 / 七 / 八 / 九 / 十 / 百 / 千 / 火 / 金 / 江 / 湖 / 海
//   / 父 / 母 / 爸 / 妈 / 爷 / 奶 / 哥 / 姐 / 弟 / 妹 / 孩 / 儿
// 其中 江 / 湖 / 海 / 爸 / 妈 / 爷 / 奶 / 哥 / 姐 / 孩 的 cardId 已按 ImportedOracleCatalog 的 id 规则
// （catalog-u + 小写 unicode）预填为 catalog-u6c5f / 6e56 / 6d77 / 7238 / 5988 / 7237 / 5976 / 54e5 / 59d0 / 5b69
// （属 157 待补字）。同伴按现有格式录库后，引擎依 cardId 自动对上，无需再改本文件；
// 录库前 reserve/complete 对找不到的卡做安全降级（不塞坑、不崩）。
//
// 承接第三章线索『林径深处的骨』：守卜人循卜兆越过河水，踏入对岸幽深的山林，
// 遇见守林人阿岚，在迷径中寻回失语的山林路径碎甲，并卜算走散家眷的归途。
//
// 与一~三章刻意差异化：
//   1) 主题不同：一章教学(雨田水土地云) / 二章水域计数(河泉沙石…) / 三章上游水文(万人民…数序方位)，
//      本章是「山林路径·星月指路」——以 夜行星月(月星) + 林中水脉(江山湖海火金) + 失散家眷(父母爷奶哥姐弟妹孩儿)
//      三线串起寻骨路线，落点从「记时数、辨亲族、认水火」而非单纯计数或方位。
//   2) 中段事件改为「迷雾失路」：林中起雾，守林人阿岚说出一族因迷径失散的旧事，人物弧由戒备转托付
//      （呼应二章阿潍、三章阿沚，但阿岚更柔、更念旧，守的是“回家的路”）。
//   3) 收束改为「星月指路」：二十六字按『夜行—水脉—亲族』排布，在林间投出一条被星月照亮的归途，
//      点出『有星可辨向、有亲可识人、有脉可寻水，迷径方不成迷』，区别于二章『水纹共鸣』、三章『众志共鸣』。
//   4) 问卜三轮围绕「寻路 / 归途」：卜方位 → 卜是否平安 → 卜归途吉时，节奏缓，三轮直接串联末轮逼起身
//      （YinXuCity 占卜处理器已泛化为章无关）。

export const CHAPTER_FOUR_ID = 'chapter-4-forest-path';
// 守林人阿岚站位：山林入口开阔地（避开 tomb 祭祀区与 mountain 障碍），进章传送落其右侧。
export const CHAPTER_FOUR_NPC_POSITION = { x: 3300, y: -800 } as const;

// 26 枚山林路径甲骨碎片。seekStepId / lessonStepId 供 YinXuCity 后续接入挖掘站点与学习判定。
// cardId 为本游戏字库既有卡片；待补字已预填 catalog-u{小写unicode}（录库前引擎安全降级）。
export const CHAPTER_FOUR_FRAGMENT_CARDS = [
  { seekStepId: 'chapter-4-seek-001', lessonStepId: 'chapter-4-lesson-001', cardId: 'moon-temp', character: '月' },
  { seekStepId: 'chapter-4-seek-002', lessonStepId: 'chapter-4-lesson-002', cardId: 'star-official', character: '星' },
  { seekStepId: 'chapter-4-seek-003', lessonStepId: 'chapter-4-lesson-003', cardId: 'catalog-u516d', character: '六' },
  { seekStepId: 'chapter-4-seek-004', lessonStepId: 'chapter-4-lesson-004', cardId: 'catalog-u4e03', character: '七' },
  { seekStepId: 'chapter-4-seek-005', lessonStepId: 'chapter-4-lesson-005', cardId: 'catalog-u516b', character: '八' },
  { seekStepId: 'chapter-4-seek-006', lessonStepId: 'chapter-4-lesson-006', cardId: 'catalog-u4e5d', character: '九' },
  { seekStepId: 'chapter-4-seek-007', lessonStepId: 'chapter-4-lesson-007', cardId: 'catalog-u5341', character: '十' },
  { seekStepId: 'chapter-4-seek-008', lessonStepId: 'chapter-4-lesson-008', cardId: 'catalog-u767e', character: '百' },
  { seekStepId: 'chapter-4-seek-009', lessonStepId: 'chapter-4-lesson-009', cardId: 'catalog-u5343', character: '千' },
  { seekStepId: 'chapter-4-seek-010', lessonStepId: 'chapter-4-lesson-010', cardId: 'catalog-u706b', character: '火' },
  { seekStepId: 'chapter-4-seek-011', lessonStepId: 'chapter-4-lesson-011', cardId: 'catalog-u91d1', character: '金' },
  { seekStepId: 'chapter-4-seek-012', lessonStepId: 'chapter-4-lesson-012', cardId: 'catalog-u6c5f', character: '江' },
  { seekStepId: 'chapter-4-seek-013', lessonStepId: 'chapter-4-lesson-013', cardId: 'catalog-u6e56', character: '湖' },
  { seekStepId: 'chapter-4-seek-014', lessonStepId: 'chapter-4-lesson-014', cardId: 'catalog-u6d77', character: '海' },
  { seekStepId: 'chapter-4-seek-015', lessonStepId: 'chapter-4-lesson-015', cardId: 'catalog-u7236', character: '父' },
  { seekStepId: 'chapter-4-seek-016', lessonStepId: 'chapter-4-lesson-016', cardId: 'catalog-u6bcd', character: '母' },
  { seekStepId: 'chapter-4-seek-017', lessonStepId: 'chapter-4-lesson-017', cardId: 'catalog-u7238', character: '爸' },
  { seekStepId: 'chapter-4-seek-018', lessonStepId: 'chapter-4-lesson-018', cardId: 'catalog-u5988', character: '妈' },
  { seekStepId: 'chapter-4-seek-019', lessonStepId: 'chapter-4-lesson-019', cardId: 'catalog-u7237', character: '爷' },
  { seekStepId: 'chapter-4-seek-020', lessonStepId: 'chapter-4-lesson-020', cardId: 'catalog-u5976', character: '奶' },
  { seekStepId: 'chapter-4-seek-021', lessonStepId: 'chapter-4-lesson-021', cardId: 'catalog-u54e5', character: '哥' },
  { seekStepId: 'chapter-4-seek-022', lessonStepId: 'chapter-4-lesson-022', cardId: 'catalog-u59d0', character: '姐' },
  { seekStepId: 'chapter-4-seek-023', lessonStepId: 'chapter-4-lesson-023', cardId: 'catalog-u5f1f', character: '弟' },
  { seekStepId: 'chapter-4-seek-024', lessonStepId: 'chapter-4-lesson-024', cardId: 'catalog-u59b9', character: '妹' },
  { seekStepId: 'chapter-4-seek-025', lessonStepId: 'chapter-4-lesson-025', cardId: 'catalog-u5b69', character: '孩' },
  { seekStepId: 'chapter-4-seek-026', lessonStepId: 'chapter-4-lesson-026', cardId: 'catalog-u513f', character: '儿' },
] as const;

export const chapterFourDefinition: StoryChapterDefinition = {
  id: CHAPTER_FOUR_ID,
  title: '第四章：山林迷径',
  firstStepId: 'chapter-4-opening',
  steps: [
    {
      id: 'chapter-4-opening',
      chapterId: CHAPTER_FOUR_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '第三章的卜辞余音里，那道越过河水的裂纹并未停。它像一根被星月牵着的线，引着守卜人离开熟悉的峡口，朝对岸幽深的山林走去。',
        },
        {
          speaker: '贞人师',
          text: '你卜出的裂纹拐进了山林。那里住着守了一辈子林子的支族，守着一具『指路卜骨』——相传它能照出迷径里的归途。神甲碎后，它也失了声，走散的人便再也找不回方向。',
        },
        {
          speaker: '守峡人阿沚',
          text: '我表姐阿潍说过，林子那头的守林人叫阿岚，性子柔，最念旧。她守的不是水，是“回家的路”。你若去，提我阿沚的名字，她便信你几分。',
        },
        {
          speaker: '贞人师',
          text: '去吧。循着裂纹入林，寻回那些刻着山林路径的碎甲。有星可辨向、有亲可识人、有脉可寻水，迷径才不成迷。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第四章开启：山林迷径。当前目标：沿裂纹深入山林，寻回失语的山林路径碎甲。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-4-reach-forest',
      checkpoint: true,
    },
    {
      id: 'chapter-4-reach-forest',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 林口',
        detail: '林深雾重，脚下腐叶沙沙。走到守林人阿岚守着的地方，向她打听那枚失踪的指路卜骨。',
        targetX: CHAPTER_FOUR_NPC_POSITION.x,
        targetY: CHAPTER_FOUR_NPC_POSITION.y,
        targetRadius: 200,
      },
      completeOn: 'npc-reached',
      nextStepId: 'chapter-4-npc-dialogue',
    },
    {
      id: 'chapter-4-npc-dialogue',
      chapterId: CHAPTER_FOUR_ID,
      dialogue: [
        {
          speaker: '守林人阿岚',
          text: '阿沚那丫头竟还惦记我……你也是宗庙派来“勘路”的？这一林子的路，用不着外人指手画脚。',
        },
        {
          speaker: '你',
          text: '我不是来指路。第三章的卜辞里，裂纹越过了河水，指到了这里——有东西在林子里失踪了，对不对？',
        },
        {
          speaker: '守林人阿岚',
          text: '……指路卜骨。我族守了三代的引路骨，自打天意断了，就再没在雾里亮过。前些年一场怪雾，林子岔了道，一族走散的人，就再没全数回来过。',
        },
        {
          speaker: '守林人阿岚',
          text: '你也听见骨响？那便证明给我看。林里散着二十六枚山林路径碎甲，是我族记星月、认水脉、辨亲族的老刻。你若能一枚枚唤醒它们，我便信你真能把走散的人领回来。',
        },
        {
          speaker: '守林人阿岚',
          text: '先去林口看看吧——夜里照路的月影、空地指北的星位，都在最外圈。你醒来一枚，雾就散一分。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '任务更新：在山林中挖掘并发掘失语的山林路径甲骨碎片。每寻回一枚，阿岚的戒备便松一分。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-4-seek-001',
      checkpoint: true,
    },
    // —— 前半段 11 字：林口外圈，落点在「夜行 · 水脉 · 自然」 ——
    {
      id: 'chapter-4-seek-001',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 林隙月影',
        detail: '林隙间一汪月光照着的土里沉着微光。挖出如弯钩悬空的“月”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-001',
      checkpoint: true,
    },
    {
      id: 'chapter-4-lesson-001',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识月字',
        detail: '观察如弯钩悬空的骨纹，是“夜行借月、以辨西东”的记法，正确辨认“月”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-002',
    },
    {
      id: 'chapter-4-seek-002',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 空地星位',
        detail: '林中空地一簇散点微光下沉着碎甲。挖出如三簇聚列的“星”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-002',
    },
    {
      id: 'chapter-4-lesson-002',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识星字',
        detail: '观察三簇如星的骨纹，是“夜观星位、知北所在”的记法，正确辨认“星”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-003',
    },
    {
      id: 'chapter-4-seek-003',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 六岔口',
        detail: '六条兽径汇成的岔口中央沉着微光。挖出如两点并列的“六”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-003',
    },
    {
      id: 'chapter-4-lesson-003',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识六字',
        detail: '观察两点如岔的骨纹，是“六径分野、当记其数”的记法，正确辨认“六”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-004',
    },
    {
      id: 'chapter-4-seek-004',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 七株树下',
        detail: '七株老树围成的圈中心沉着微光。挖出如横折起笔的“七”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-004',
    },
    {
      id: 'chapter-4-lesson-004',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识七字',
        detail: '观察横折如断枝的骨纹，是“七木为界、林有其序”的记法，正确辨认“七”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-005',
    },
    {
      id: 'chapter-4-seek-005',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 八字形岩',
        detail: '一块形如八字岔分的岩石缝里透出微光。挖出如两笔分张的“八”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-005',
    },
    {
      id: 'chapter-4-lesson-005',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识八字',
        detail: '观察两笔如分流的骨纹，是“八面来风、各归其向”的记法，正确辨认“八”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-006',
    },
    {
      id: 'chapter-4-seek-006',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 九曲溪弯',
        detail: '九道弯的溪流转处沉着微光。挖出如弯钩带尾的“九”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-006',
    },
    {
      id: 'chapter-4-lesson-006',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识九字',
        detail: '观察弯钩带尾的骨纹，是“九曲溪回、水出其湾”的记法，正确辨认“九”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-007',
    },
    {
      id: 'chapter-4-seek-007',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 十步石阶',
        detail: '十级石阶的尽头沉着微光。挖出如横竖交错的“十”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-007',
    },
    {
      id: 'chapter-4-lesson-007',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识十字',
        detail: '观察横竖如阶的骨纹，是“十步为程、路有其度”的记法，正确辨认“十”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-008',
    },
    {
      id: 'chapter-4-seek-008',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 百木丛中',
        detail: '密林百木环抱的空地中央沉着微光。挖出如白上一撇的“百”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-008',
    },
    {
      id: 'chapter-4-lesson-008',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识百字',
        detail: '观察白上一撇的骨纹，是“百木成林、林有其名”的记法，正确辨认“百”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-009',
    },
    {
      id: 'chapter-4-seek-009',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 千叶堆',
        detail: '千叶堆积的腐殖层下沉着微光。挖出如撇横悬空的“千”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-009',
    },
    {
      id: 'chapter-4-lesson-009',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识千字',
        detail: '观察撇横如叶落的骨纹，是“千叶覆径、岁有其痕”的记法，正确辨认“千”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-010',
    },
    {
      id: 'chapter-4-seek-010',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 熄灭火塘',
        detail: '早已熄灭的营火塘灰里闪着微光。挖出如人顶火苗的“火”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-010',
    },
    {
      id: 'chapter-4-lesson-010',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识火字',
        detail: '观察人顶火苗的骨纹，是“夜宿有火、以驱林寒”的记法，正确辨认“火”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-011',
    },
    {
      id: 'chapter-4-seek-011',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 矿脉露头',
        detail: '岩壁矿脉的露头处沉着微光。挖出如金粒点簇的“金”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-011',
    },
    {
      id: 'chapter-4-lesson-011',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识金字',
        detail: '观察金粒点簇的骨纹，是“山中藏金、以为路标”的记法，正确辨认“金”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-012',
    },
    {
      id: 'chapter-4-seek-012',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 林中溪源',
        detail: '林中小溪的源头石缝里沉着微光。挖出如水流曲折的“江”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-012',
    },
    {
      id: 'chapter-4-lesson-012',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识江字',
        detail: '观察水流曲折的骨纹，是“林溪成江、以识水脉”的记法，正确辨认“江”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-013',
    },
    {
      id: 'chapter-4-seek-013',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 山间小潭',
        detail: '山坳里一处平静小潭的边石下沉着微光。挖出如波光满盈的“湖”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-013',
    },
    {
      id: 'chapter-4-lesson-013',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识湖字',
        detail: '观察波光满盈的骨纹，是“山洼蓄水、以辨停泊”的记法，正确辨认“湖”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-014',
    },
    {
      id: 'chapter-4-seek-014',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 雾中水洼',
        detail: '雾里一处浅浅水洼的边缘沉着微光。挖出如万水归旁的“海”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-014',
    },
    {
      id: 'chapter-4-lesson-014',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识海字',
        detail: '观察万水归旁的骨纹，是“诸水所归、以望远方”的记法，正确辨认“海”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-midstream-fog',
    },
    // —— 中段事件：迷雾失路 + 阿岚人物弧（呼应二章阿潍、三章阿沚，但更柔更念旧） ——
    {
      id: 'chapter-4-midstream-fog',
      chapterId: CHAPTER_FOUR_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '第十四枚碎甲归位的刹那，林子里忽地起了白雾。雾里，几道模糊的人影沿不同的岔道走散，再没回头——那是阿岚一族当年失路亲人的旧影。',
        },
        {
          speaker: '守林人阿岚',
          text: '……这是我阿婆的图。她说指路骨不是丢了，是那场怪雾里，一族的人被岔道引散了，再没认出回家的路。',
        },
        {
          speaker: '守林人阿岚',
          text: '我原当你和那些来“勘路”的官人一样，看了便走。可你挖出的骨片，真的一枚枚在我眼前亮了。守卜人，这回我信你。',
        },
        {
          speaker: '神秘低语',
          text: '……星也……亲也……脉也……骨归其径，迷乃成路……',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿岚将那幅林径图拓在掌心，眼底的戒备，第一次化作了托付。你与她之间，多了一道不必言说的契。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '中段：十四字已聚，阿岚终肯托付。继续入林深处，寻回余下的亲族与水火碎甲。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-4-seek-015',
      checkpoint: true,
    },
    // —— 后半段 12 字：林深处，落点在「亲族 · 归途」 ——
    {
      id: 'chapter-4-seek-015',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 老人歇脚',
        detail: '一棵老树下老人歇脚磨亮的石面上沉着微光。挖出如杖下持者的“父”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-015',
    },
    {
      id: 'chapter-4-lesson-015',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识父字',
        detail: '观察杖下持者的骨纹，是“持杖引路、为父之责”的记法，正确辨认“父”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-016',
    },
    {
      id: 'chapter-4-seek-016',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 妇人织处',
        detail: '林间一处妇人常坐织物的平石上沉着微光。挖出如女跪执事的“母”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-016',
    },
    {
      id: 'chapter-4-lesson-016',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识母字',
        detail: '观察女跪执事的骨纹，是“执事育幼、为母之劳”的记法，正确辨认“母”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-017',
    },
    {
      id: 'chapter-4-seek-017',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 父歇之岩',
        detail: '一块被坐得发亮的父辈歇岩缝里沉着微光。挖出如父下加巴的“爸”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-017',
    },
    {
      id: 'chapter-4-lesson-017',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识爸字',
        detail: '观察父下加巴的骨纹，是“呼父之称、倍觉亲近”的记法，正确辨认“爸”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-018',
    },
    {
      id: 'chapter-4-seek-018',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 母歇之石',
        detail: '一处母辈常歇的石墩下沉着微光。挖出如母下加马的“妈”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-018',
    },
    {
      id: 'chapter-4-lesson-018',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识妈字',
        detail: '观察母下加马的骨纹，是“呼母之称、最是依恋”的记法，正确辨认“妈”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-019',
    },
    {
      id: 'chapter-4-seek-019',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 祖父坐处',
        detail: '一棵古树下祖父常坐的树坑边沉着微光。挖出如父发垂白之形的“爷”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-019',
    },
    {
      id: 'chapter-4-lesson-019',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识爷字',
        detail: '观察父发垂白的骨纹，是“尊长之称、隔代亦亲”的记法，正确辨认“爷”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-020',
    },
    {
      id: 'chapter-4-seek-020',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 祖母灶边',
        detail: '林间一处祖母常守的小灶旁沉着微光。挖出如母持乳之形的“奶”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-020',
    },
    {
      id: 'chapter-4-lesson-020',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识奶字',
        detail: '观察母持乳形的骨纹，是“哺育之称、最是温软”的记法，正确辨认“奶”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-021',
    },
    {
      id: 'chapter-4-seek-021',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 兄长立处',
        detail: '一道岔口旁兄长常立的树桩边沉着微光。挖出如可下加大的“哥”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-021',
    },
    {
      id: 'chapter-4-lesson-021',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识哥字',
        detail: '观察可下加大的骨纹，是“长兄之称、可倚可傍”的记法，正确辨认“哥”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-022',
    },
    {
      id: 'chapter-4-seek-022',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 姊立之木',
        detail: '一棵姊姊常倚的树后沉着微光。挖出如女下加且的“姐”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-022',
    },
    {
      id: 'chapter-4-lesson-022',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识姐字',
        detail: '观察女下加且的骨纹，是“长姊之称、常倚而望”的记法，正确辨认“姐”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-023',
    },
    {
      id: 'chapter-4-seek-023',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 幼弟蹲处',
        detail: '一丛灌木下幼弟常蹲的土坑里沉着微光。挖出如人中藏小之形的“弟”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-023',
    },
    {
      id: 'chapter-4-lesson-023',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识弟字',
        detail: '观察人中藏小的骨纹，是“幼弟之称、随兄而行的”记法，正确辨认“弟”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-024',
    },
    {
      id: 'chapter-4-seek-024',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 小妹花丛',
        detail: '一片野花丛中小妹常采花处沉着微光。挖出如女下加未的“妹”字碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-024',
    },
    {
      id: 'chapter-4-lesson-024',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识妹字',
        detail: '观察女下加未的骨纹，是“幼妹之称、如花初绽”的记法，正确辨认“妹”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-025',
    },
    {
      id: 'chapter-4-seek-025',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 孩童藏处',
        detail: '一棵空心老树里孩童常藏身的暗格中沉着微光。挖出如小下加亥的“孩”字碎片（待补字，录库后可习）。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-025',
    },
    {
      id: 'chapter-4-lesson-025',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识孩字',
        detail: '观察小下加亥的骨纹，是“稚子之称、藏于林樾”的记法，正确辨认“孩”字。（此字待补录库）',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-seek-026',
    },
    {
      id: 'chapter-4-seek-026',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 婴孩襁褓',
        detail: '最末一道微光落在一处铺着软草的襁褓石上。借星月的光辨明方位，挖出如小儿裹身的“儿”字碎片，完成山林寻骨。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-4-lesson-026',
    },
    {
      id: 'chapter-4-lesson-026',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 辨识儿字',
        detail: '观察小儿裹身的骨纹，是“婴孩之称、林中所惜”的记法，正确辨认“儿”字。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-4-fragment-awakens',
    },
    // —— 收束事件：星月指路（区别于二章「水纹共鸣」、三章「众志共鸣」） ——
    {
      id: 'chapter-4-fragment-awakens',
      chapterId: CHAPTER_FOUR_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '二十六枚山林路径碎甲在掌心依次排开。你按『夜行—水脉—亲族』的脉络理好，骨纹竟在林间投出一条被星月照亮的归途——走散亲人的旧影，正沿着那道光，一一点亮回家的路。',
        },
        {
          speaker: '神秘低语',
          text: '……星也……亲也……脉也……有星可辨向、有亲可识人、有脉可寻水，迷径方不成迷……',
        },
        {
          speaker: '你',
          text: '原来山林路径卜骨记下的不是死路，是夜里的星月、林中的水脉、还有走散的亲人。它们齐了，归途才显在眼前。',
        },
        {
          speaker: '守林人阿岚',
          text: '我听不见金光里的声音，可骨片真的在你手里连成了路！你果然是贞人师说的守卜人。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '获得：“月、星、六、七、八、九、十、百、千、火、金、江、湖、海、父、母、爸、妈、爷、奶、哥、姐、弟、妹、孩、儿”二十六枚山林路径甲骨碎片。山林卜力已苏醒，骨上之径可落为天意之辞。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-4-first-request',
    },
    {
      id: 'chapter-4-first-request',
      chapterId: CHAPTER_FOUR_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '二十六枚山林碎甲归位，掌心的金光汇成一幅微缩林径图。阿岚一族在雾里走散的亲人，仿佛又能在骨上辨得清归途了。',
        },
        {
          speaker: '守林人阿岚',
          text: '守卜人，指路骨照出的归途往哪、走散的人是否平安、何时动身才不逆林气——这三问，我族盼了三代。能用这些字卜一卜么？',
        },
        {
          speaker: '你',
          text: '（你斟酌片刻：三问牵连，当一卜接一卜地解。你取过一枚山林甲骨——先卜方位，其余的卜，且待骨纹引你去看。）',
        },
        {
          speaker: '贞人师',
          text: '去吧。以星月指路之力，为阿岚卜算归途的三桩悬案。每替一人解开迷惘，山林卜力便积下一分，也会引动更深的去向。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '守卜任务开启（第一轮）：为守林人阿岚卜算归途的方位，并留意兆纹里多出的那道裂纹。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-4-enter-temple',
      checkpoint: true,
    },
    {
      id: 'chapter-4-enter-temple',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '山林迷径 · 第一轮问卜',
        detail: '告别林口，随阿岚返回宗庙内殿。林风渐远，灼骨之香渐近，接待前来问归途方位的阿岚。',
        targetX: 0,
        targetY: 1010,
        targetRadius: 110,
      },
      completeOn: 'temple-entered',
      nextStepId: 'chapter-4-take-divination-seat',
    },
    {
      id: 'chapter-4-take-divination-seat',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '第一轮问卜 · 入席',
        detail: '走到内殿占卜席前，点击“坐下”，听阿岚讲清她要卜的归途方位。',
      },
      completeOn: 'temple-seat-reached',
      nextStepId: 'chapter-4-divination-1',
    },
    {
      id: 'chapter-4-divination-1',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '第一轮问卜 · 归途方位',
        detail: '取过一枚山林甲骨，为守林人阿岚卜算走散亲人的归途如今指向何处——这是山林卜力第一次落为天意之辞。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-4-divination-2',
      checkpoint: true,
    },
    {
      id: 'chapter-4-divination-2',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '第二轮问卜 · 是否平安',
        detail: '阿岚见卜辞灵验，又问走散的人是否平安；贞人师让你顺藤摸瓜。取过一枚山林甲骨占算——裂纹比上一轮又长了一分，仍不必起身。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-4-divination-3',
      checkpoint: true,
    },
    {
      id: 'chapter-4-divination-3',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '第三轮问卜 · 归途吉时',
        detail: '两卜相连，裂纹皆指向下游的护送道。最后一卜，为「动身归途的吉时」占算——三卜毕，裂纹将彻底指向山外，届时再起身查看。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-4-leave-divination-seat',
      checkpoint: true,
    },
    {
      id: 'chapter-4-leave-divination-seat',
      chapterId: CHAPTER_FOUR_ID,
      objective: {
        title: '异常兆纹',
        detail: '完成三轮占卜后起身，查看山林甲骨额外显出的那道指向山外护送道的裂纹。',
      },
      completeOn: 'result-confirmed',
      nextStepId: 'chapter-4-clue-revealed',
    },
    {
      id: 'chapter-4-clue-revealed',
      chapterId: CHAPTER_FOUR_ID,
      dialogue: [
        {
          speaker: '守林人阿岚',
          text: '原来归途指向下游的护送道，走散的人确还平安，吉时就在三日后的平林。有了这个数，我便敢去把他们领回来了。多谢守卜人。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿岚离去后，兆纹并未熄灭。几道不属于方位卜辞的裂纹缓缓延伸，竟越过林线，指向山外一条热闹的护送道。',
        },
        {
          speaker: '神秘低语',
          text: '……道中也……有骨……待人相护……',
        },
        {
          speaker: '贞人师',
          text: '三轮卜辞彼此牵引，这道裂纹拐出了山林——下一处碎甲，恐怕不在林中，而在山外护送祭器的人流里。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第四章完成：山林迷径。获得线索“山外护送道上的骨”，护送归途的章节已开启。',
        },
      ],
      completeOn: 'dialogue-completed',
      checkpoint: true,
    },
  ],
};
