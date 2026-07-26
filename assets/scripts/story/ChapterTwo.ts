import { StoryChapterDefinition } from './StoryTypes';

// 第二章 · 模板章（后续第三~九章照抄本文件的数据格式即可，只换字与数量）。
// chapterId 与《殷墟小卜官》主线蓝图 ChapterRoadmap.ts 中的 'chapter-2' 节点一致。
//
// 本章字量 12，全部来自 ChapterCharMap 第二章分配，是十二枚「水文甲骨」碎片：
//   河 / 泉 / 沙 / 石 / 木 / 风 / 山 / 上 / 下 / 左 / 右 / 中
// 它们本是先民刻在卜骨上、记录水势、潮期、舟楫往来的「水文甲骨」。剧情据此落地为
// 「河畔渔村 · 水文卜骨初勘」：守卜人循第一章线索『水声掩埋之处』抵达西侧河畔，
// 在渔村河滩寻回失语的水文碎甲，并以『河』字为渔家卜算十日潮期。
//
// 相比第一章「失语的甲骨」（纯线性 5 字寻骨 + 单次问卜），本模板章刻意做出差异，
// 供后续章节参考其「差异化」思路而非照搬：
//   1) 寻骨过程按河畔空间递进（浅滩→卵石→河心→深处→水下），每段有地点变化，
//      不再是一成不变的「继续挖掘 XX 字」。
//   2) 中段插入「潮汐事件 + NPC 人物弧」（chapter-2-midstream-tide）：渔娘阿潍
//      讲起父亲与水文卜骨，关系由戒备转向信赖，节奏被切断又续上。
//   3) 收束改为「水纹共鸣」：十二字须按河流方位（上中下游、左右、中）排好才共鸣，
//      点出『水托其数，无水文则无卜』，而非第一章的『五字连成求雨之意』。
//   4) 问卜环节扩成「三轮」：卜十日潮期 → 卜今冬渔获 → 卜上游失踪之物的方位，
//      节奏更缓，避免一卜即终；抉择感独白埋 choiceFlags 伏笔（引擎线性，待接入）。
//
// 占卜多轮说明（接 YinXuCity）：首轮结束后不强制起身，overlay 保持、supplicant 自动
// 续接下一轮，直到第三轮才走 leave-divination-seat → clue-revealed。YinXuCity 已按
// 「第二章占卜步骤」泛化处理（占卜墨料严格按需求文档：每轮 4 墨、仅首章首卜免费，第二章不免费；线索指上游），与本文件步骤 id 对应。

export const CHAPTER_TWO_ID = 'chapter-2-river-echo';
export const CHAPTER_TWO_FISHER_POSITION = { x: -700, y: -1180 } as const;

// 12 枚水文甲骨碎片。seekStepId / lessonStepId 供 YinXuCity 后续接入挖掘站点与
// 学习判定（对齐第一章 CHAPTER_ONE_FRAGMENT_CARDS 的字段结构）。
// cardId 为本游戏字库既有卡片（河/泉/沙/石/木/风/山/上/下/左/右/中 均有 cardId）。
export const CHAPTER_TWO_FRAGMENT_CARDS = [
  { seekStepId: 'chapter-2-seek-001', lessonStepId: 'chapter-2-lesson-001', cardId: 'river-official', character: '河' },
  { seekStepId: 'chapter-2-seek-002', lessonStepId: 'chapter-2-lesson-002', cardId: 'catalog-u6cc9', character: '泉' },
  { seekStepId: 'chapter-2-seek-003', lessonStepId: 'chapter-2-lesson-003', cardId: 'catalog-u6c99', character: '沙' },
  { seekStepId: 'chapter-2-seek-004', lessonStepId: 'chapter-2-lesson-004', cardId: 'catalog-u77f3', character: '石' },
  { seekStepId: 'chapter-2-seek-005', lessonStepId: 'chapter-2-lesson-005', cardId: 'tree-temp', character: '木' },
  { seekStepId: 'chapter-2-seek-006', lessonStepId: 'chapter-2-lesson-006', cardId: 'catalog-u98ce', character: '风' },
  { seekStepId: 'chapter-2-seek-007', lessonStepId: 'chapter-2-lesson-007', cardId: 'catalog-u5c71', character: '山' },
  { seekStepId: 'chapter-2-seek-008', lessonStepId: 'chapter-2-lesson-008', cardId: 'catalog-u4e0a', character: '上' },
  { seekStepId: 'chapter-2-seek-009', lessonStepId: 'chapter-2-lesson-009', cardId: 'catalog-u4e0b', character: '下' },
  { seekStepId: 'chapter-2-seek-010', lessonStepId: 'chapter-2-lesson-010', cardId: 'catalog-u5de6', character: '左' },
  { seekStepId: 'chapter-2-seek-011', lessonStepId: 'chapter-2-lesson-011', cardId: 'catalog-u53f3', character: '右' },
  { seekStepId: 'chapter-2-seek-012', lessonStepId: 'chapter-2-lesson-012', cardId: 'catalog-u4e2d', character: '中' },
] as const;

export const chapterTwoDefinition: StoryChapterDefinition = {
  id: CHAPTER_TWO_ID,
  title: '第二章：河畔初兆',
  firstStepId: 'chapter-2-opening',
  steps: [
    {
      id: 'chapter-2-opening',
      chapterId: CHAPTER_TWO_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '第一章的卜辞余韵未散，那道指向西侧河畔的残缺骨纹仍在掌心发烫。贞人师说，水声掩埋之处，必有另一片碎甲在等待回应。',
        },
        {
          speaker: '贞人师',
          text: '西侧河畔住着靠水吃饭的渔家。神甲碎后，他们记水势、算潮期、辨舟楫往来的水文卜骨也一同失了声，连今年该几时出船都无人能断。',
        },
        {
          speaker: '小石头',
          text: '我听阿禾说，渔娘阿潍这几天都守在河滩上，像在等什么。说不定她拾到的，也是只回应你的碎甲。',
        },
        {
          speaker: '贞人师',
          text: '去吧。顺着水声走到河畔，寻回那些刻着水文的卜骨。水是卜的血脉，骨头一响，天意才有处落脚。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第二章开启：河畔初兆。当前目标：循水声前往西侧河畔，寻回失语的水文碎甲。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-2-reach-river',
      checkpoint: true,
    },
    {
      id: 'chapter-2-reach-river',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 水声之地',
        detail: '沿水声西行，河风里夹着苇叶与鱼腥。走到河滩边，向守在那里的渔娘阿潍打听失语的水文卜骨。',
        targetX: CHAPTER_TWO_FISHER_POSITION.x,
        targetY: CHAPTER_TWO_FISHER_POSITION.y,
        targetRadius: 82,
      },
      completeOn: 'npc-reached',
      nextStepId: 'chapter-2-fisher-dialogue',
    },
    {
      id: 'chapter-2-fisher-dialogue',
      chapterId: CHAPTER_TWO_ID,
      dialogue: [
        {
          speaker: '渔娘阿潍',
          text: '你也是被水声引来的？这几日河滩半夜总响起细响，像有人在数着什么。',
        },
        {
          speaker: '你',
          text: '贞人师说，这里埋着记水文的碎甲。它们只回应能听见甲骨的人。',
        },
        {
          speaker: '渔娘阿潍',
          text: '水文……怪了。我们渔家祖辈的卜骨上也全是水势——几尺涨、几时潮、舟往哪边走。可自打天意断了，那些骨片连一道刻痕都显不出。',
        },
        {
          speaker: '渔娘阿潍',
          text: '我爹老渔把式在世时，总说『骨上之水，是人与河讨生活的路』。他留下一匣水文卜骨，如今却比死物还哑。昨儿我在浅滩踩到块硬物，捞起来竟是片带纹的甲骨。',
        },
        {
          speaker: '渔娘阿潍',
          text: '你若真能让它开口，先替我行个方便——我只想知道，今年这反常的潮信，到底还让不让人下网。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '任务更新：在河畔河滩挖掘并发掘失语的水文甲骨碎片。每寻回一枚，阿潍的戒备便松一分。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-2-seek-001',
      checkpoint: true,
    },
    // —— 前半段 6 字：河畔空间由浅滩向河心推进，每字带水势/舟楫语境 ——
    {
      id: 'chapter-2-seek-001',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 浅滩初光',
        detail: '第一枚碎甲在浅滩的水洼里发光。装备铲子，挖出那枚如河道蜿蜒横刻的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-001',
      checkpoint: true,
    },
    {
      id: 'chapter-2-lesson-001',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识河字',
        detail: '观察如河道蜿蜒的骨纹，是先民记“一河之水、舟楫往来”的起点，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-002',
    },
    {
      id: 'chapter-2-seek-002',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 退潮卵石',
        detail: '潮水退去，卵石缝里涌出一道细泉。挖出那枚如泉眼三股上涌的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-002',
    },
    {
      id: 'chapter-2-lesson-002',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识泉字',
        detail: '观察三股上涌如泉眼的骨纹，是渔家记“泉眼活水、不竭之渔”的刻法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-003',
    },
    {
      id: 'chapter-2-seek-003',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 水边湿沙',
        detail: '碎甲的水声引你到水边湿沙。挖出那枚斜列如沙痕风纹的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-003',
    },
    {
      id: 'chapter-2-lesson-003',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识沙字',
        detail: '观察斜列如沙痕的骨纹，是退潮后“沙线记滩、辨舟可行”的刻法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-004',
    },
    {
      id: 'chapter-2-seek-004',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 河湾回水',
        detail: '骨纹指向河湾回水处，石缝下埋着微光。挖出那枚如礁石叠垒的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-004',
    },
    {
      id: 'chapter-2-lesson-004',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识石字',
        detail: '观察层叠如礁石的骨纹，是先民记“磐石为锚、泊舟稳处”的刻法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-005',
    },
    {
      id: 'chapter-2-seek-005',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 苇丛之畔',
        detail: '微光映向苇丛边，半沉的旧木（舟之材）下压着一道纹。挖出那枚如木纹顺水的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-005',
    },
    {
      id: 'chapter-2-lesson-005',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识木字',
        detail: '观察顺水如木纹的骨纹，是“伐木为舟、顺流而下”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-006',
    },
    {
      id: 'chapter-2-seek-006',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 滩涂泥裂',
        detail: '风过泥裂，留一道旋痕微光。挖出那枚如风旋三缕的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-006',
    },
    {
      id: 'chapter-2-lesson-006',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识风字',
        detail: '观察三缕回旋如风旋的骨纹，是“观风辨向、扬帆知潮”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-midstream-tide',
    },
    // —— 中段事件：潮汐涨落 + 渔娘阿潍人物弧（区别于第一章的纯线性） ——
    {
      id: 'chapter-2-midstream-tide',
      chapterId: CHAPTER_TWO_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '第六枚碎甲归位的刹那，河水忽然涨了半尺。浪头退去时，一块布满旧刻痕的卜骨从沙里翻出，被阿潍一把捞住。',
        },
        {
          speaker: '渔娘阿潍',
          text: '……这是我爹的。他走的那年，正用这骨记着“六月六，潮信反常”。神甲一碎，它就再没显过字。',
        },
        {
          speaker: '渔娘阿潍',
          text: '我原当你是宗庙派来敷衍的。可你挖出的骨片，真的一枚枚在我眼前亮了。守卜人，我信你一次。',
        },
        {
          speaker: '神秘低语',
          text: '……水起于源……源托其流……半程已聚，余者待唤……',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿潍将父亲的旧卜骨贴胸收好，眼里那点戒备，终于化成了托付。你与她之间，多了一份不必言说的默契。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '中段：六字已聚，阿潍的疑虑渐消。继续向河心深处寻回余下六枚水文碎甲。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-2-seek-007',
      checkpoint: true,
    },
    // —— 后半段 6 字：由河心向深处、水下推进，转入方位 ——
    {
      id: 'chapter-2-seek-007',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 河心远山',
        detail: '河心水面映出远山倒影，影下沉着微光。挖出那枚如峰峦叠峙的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-007',
    },
    {
      id: 'chapter-2-lesson-007',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识山字',
        detail: '观察三峰叠峙如远山的骨纹，是“寻源而上、山有伏流”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-008',
    },
    {
      id: 'chapter-2-seek-008',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 河心浅滩',
        detail: '浮木随波上浮，指向天上。挖出那枚如上行笔势的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-008',
    },
    {
      id: 'chapter-2-lesson-008',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识上字',
        detail: '观察长笔上行如溯流而上的骨纹，是“上行则近源”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-009',
    },
    {
      id: 'chapter-2-seek-009',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 河心深处',
        detail: '发光土层引你到更深暗流下沉处。挖出那枚如下垂笔势的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-009',
    },
    {
      id: 'chapter-2-lesson-009',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识下字',
        detail: '观察长笔下垂如沉流而下的骨纹，是“下行则入渊”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-010',
    },
    {
      id: 'chapter-2-seek-010',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 深处左岸',
        detail: '河滩左岸礁影里沉着微光。挖出那枚如左舒笔势的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-010',
    },
    {
      id: 'chapter-2-lesson-010',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识左字',
        detail: '观察向左舒展出锋的骨纹，是“左岸回水、泊舟安稳”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-011',
    },
    {
      id: 'chapter-2-seek-011',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 旧渔坞',
        detail: '退潮露出半沉的旧渔坞，坞板右向刻着一道痕。挖出那枚如右舒笔势的碎片。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-011',
    },
    {
      id: 'chapter-2-lesson-011',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识右字',
        detail: '观察向右舒展出锋的骨纹，是“右岸顺流、扬帆向海”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-seek-012',
    },
    {
      id: 'chapter-2-seek-012',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 水下正中',
        detail: '最末一道微光没入水下正中安稳处。屏息潜水，挖出那枚如中贯笔势的碎片，完成首次河畔寻骨。',
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-2-lesson-012',
    },
    {
      id: 'chapter-2-lesson-012',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 辨识中字',
        detail: '观察中贯竖笔如江心稳流的骨纹，是“中流为枢、四方可期”的记法，猜出这纹路代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-2-fragment-awakens',
    },
    // —— 收束事件：水纹共鸣（区别于第一章「五字连成求雨之意」） ——
    {
      id: 'chapter-2-fragment-awakens',
      chapterId: CHAPTER_TWO_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '十二枚水文碎甲在掌心依次排开。你本能地按河流的方位理好——上溯其源、下入其渊、左回右顺、中山为枢——骨纹竟应声亮起，像先民在河滩上反复辨看水势与舟路。',
        },
        {
          speaker: '神秘低语',
          text: '……水也……纹也……无水纹，则无卜……先有骨上之水，后有天意之辞……',
        },
        {
          speaker: '你',
          text: '原来水文卜骨是卜辞的根基。它们记下的不是死数，是渔家与河水讨生活的路，是一笔一笔的方位与水势。',
        },
        {
          speaker: '渔娘阿潍',
          text: '我听不见金光里的声音，可骨片真的在你手里连成了串！你果然是贞人师说的守卜人。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '获得：“河、泉、沙、石、木、风、山、上、下、左、右、中”十二枚水文甲骨碎片。水文卜力已苏醒，骨上之水可落为天意之辞。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-2-first-request',
    },
    {
      id: 'chapter-2-first-request',
      chapterId: CHAPTER_TWO_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '十二枚水文碎甲归位，掌心的金光汇成一道细小的河图。渔家与河水讨生活的路，仿佛又能在骨上数得清了。',
        },
        {
          speaker: '渔娘阿潍',
          text: '守卜人，今年河水怪得很，我不敢贸然出船。能用这些字卜一卜，十日之内可还有安稳潮期么？',
        },
        {
          speaker: '你',
          text: '（你斟酌片刻：眼前这桩急难最该先解。你取过“河”字——先解潮期，其余的卜，且待骨纹引你去看。）',
        },
        {
          speaker: '贞人师',
          text: '去吧。以“河”字碎甲为阿潍占算十日潮期。每替一人解开迷惘，水文卜力便积下一分，也会引动更深处的水声。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '守卜任务开启（第一轮）：为渔娘阿潍占算十日潮期，并留意“河”字兆纹里多出的那道裂纹。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-2-enter-temple',
      checkpoint: true,
    },
    {
      id: 'chapter-2-enter-temple',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '河畔初兆 · 第一轮问卜',
        detail: '告别河滩，随阿潍返回宗庙内殿。河风渐远，灼骨之香渐近，接待前来问潮期的渔娘阿潍。',
        targetX: 0,
        targetY: 1010,
        targetRadius: 110,
      },
      completeOn: 'temple-entered',
      nextStepId: 'chapter-2-take-divination-seat',
    },
    {
      id: 'chapter-2-take-divination-seat',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '第一轮问卜 · 入席',
        detail: '走到内殿占卜席前，点击“坐下”，听阿潍讲清她要卜的十日潮期。',
      },
      completeOn: 'temple-seat-reached',
      nextStepId: 'chapter-2-divination-1',
    },
    {
      id: 'chapter-2-divination-1',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '第一轮问卜 · 十日潮期',
        detail: '取过那枚如河道蜿蜒的甲骨，为渔娘阿潍占算十日潮期——这是水文卜力第一次落为天意之辞。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-2-divination-2',
      checkpoint: true,
    },
    {
      id: 'chapter-2-divination-2',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '第二轮问卜 · 今冬渔获',
        detail: '阿潍见卜辞灵验，又问今冬渔获丰歉；贞人师让你顺藤摸瓜。取过一枚水文甲骨占算——裂纹比上一轮又长了一分，仍不必起身。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-2-divination-3',
      checkpoint: true,
    },
    {
      id: 'chapter-2-divination-3',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '第三轮问卜 · 上游方位',
        detail: '两卜相连，裂纹皆逆水指向上游。最后一卜，为「上游失踪之物」占算方位——三卜毕，裂纹将彻底指向河源，届时再起身查看。',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-2-leave-divination-seat',
      checkpoint: true,
    },
    {
      id: 'chapter-2-leave-divination-seat',
      chapterId: CHAPTER_TWO_ID,
      objective: {
        title: '异常兆纹',
        detail: '完成三轮占卜后起身，查看那枚如河道蜿蜒的碎甲额外显出的逆水裂纹。',
      },
      completeOn: 'result-confirmed',
      nextStepId: 'chapter-2-clue-revealed',
    },
    {
      id: 'chapter-2-clue-revealed',
      chapterId: CHAPTER_TWO_ID,
      dialogue: [
        {
          speaker: '渔娘阿潍',
          text: '原来十日内确有两天宜出船，今冬也非绝收。有了这个数，我便敢下网了。多谢守卜人。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿潍离去后，兆纹并未熄灭。几道不属于潮期卜辞的裂纹缓缓延伸，竟逆着河水，指向更上游的某处暗流。',
        },
        {
          speaker: '神秘低语',
          text: '……上游……失踪的……不止水文……有人刻意掩去……',
        },
        {
          speaker: '贞人师',
          text: '三轮卜辞彼此牵引，这道裂纹逆水而上——下一处碎甲，恐怕不在河畔，而在上游深处。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第二章完成：河畔初兆。获得线索“上游失踪之物”，逆流寻踪的章节已开启。',
        },
      ],
      completeOn: 'dialogue-completed',
      checkpoint: true,
    },
  ],
};
