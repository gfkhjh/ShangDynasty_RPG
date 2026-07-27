import { StoryChapterDefinition } from './StoryTypes';

// A new content id ensures saves from the old prototype cannot suppress the
// revised canonical opening.
export const CHAPTER_ONE_ID = 'chapter-1-silent-oracle-v8';
export const XIAO_SHITOU_POSITION = { x: 260, y: 20 } as const;
export const FIRST_FRAGMENT_POSITION = { x: 390, y: -920 } as const;
export const CHAPTER_ONE_FRAGMENT_CARDS = [
  { seekStepId: 'chapter-1-seek-first-fragment', lessonStepId: 'chapter-1-first-lesson', cardId: 'rain', character: '雨' },
  { seekStepId: 'chapter-1-seek-field-fragment', lessonStepId: 'chapter-1-field-lesson', cardId: 'field', character: '田' },
  { seekStepId: 'chapter-1-seek-water-fragment', lessonStepId: 'chapter-1-water-lesson', cardId: 'catalog-u6c34', character: '水' },
  { seekStepId: 'chapter-1-seek-earth-fragment', lessonStepId: 'chapter-1-earth-lesson', cardId: 'catalog-u571f', character: '土' },
  { seekStepId: 'chapter-1-seek-cloud-fragment', lessonStepId: 'chapter-1-cloud-lesson', cardId: 'cloud-official', character: '云' },
] as const;

export const chapterOneDefinition: StoryChapterDefinition = {
  id: CHAPTER_ONE_ID,
  title: '第一章：失语的甲骨',
  firstStepId: 'prologue-silent-heaven',
  steps: [
    {
      id: 'prologue-silent-heaven',
      chapterId: CHAPTER_ONE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '武丁末年，大荒地气忽乱。那一夜，传说中沟通天地、人神与先祖的通天灵龟甲突然崩碎，化作无数碎片坠向山林、荒野、古墟与河畔。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '神甲一碎，宗庙中的灼骨只剩裂痕，再也显不出吉凶。先祖沉默，神明无声，殷商延续已久的占卜之力就此断绝。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '农人不知雨期，行者无从问路，戍卒难问归期。失去天意指引的人们，只能在迷茫与不安中等待天明。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '可就在万骨失语之时，你却听见城外传来极轻的呼唤。一道微弱金光划破晨雾，坠入无人经过的荒田。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '序章完成：天道失语。你听见了世间最后一缕甲骨低语。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-1-opening',
      checkpoint: true,
    },
    {
      id: 'chapter-1-opening',
      chapterId: CHAPTER_ONE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '天色渐明，城外的碎甲呼唤仍未停息。你将从第一片能够回应自己的骨纹开始，重新寻找失落的卜力。',
        },
        {
          speaker: '贞人师',
          text: '昨夜城外有金光坠下。旁人寻到的碎片都像寻常石头，唯有一片在你靠近时发出了细响。',
        },
        {
          speaker: '贞人师',
          text: '去找守在城门外的小石头，循着异光把散落的碎甲寻回来。现在的你还不能占卜，必须先让失去的骨纹重新开口。',
        },
        {
          speaker: '贞人师',
          text: '若碎甲真的只回应你，你便可能是世间最后一位能够唤醒甲骨灵力的守卜人。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第一章开启：失语的甲骨。当前目标：前往城门外寻找小石头，调查昨夜坠落的异光。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-1-meet-xiaoshitou',
      checkpoint: true,
    },
    {
      id: 'chapter-1-meet-xiaoshitou',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 异光之地',
        detail: '前往城门外，向小石头询问昨夜的异光',
        targetX: XIAO_SHITOU_POSITION.x,
        targetY: XIAO_SHITOU_POSITION.y,
        targetRadius: 78,
      },
      completeOn: 'npc-reached',
      nextStepId: 'chapter-1-xiaoshitou-dialogue',
    },
    {
      id: 'chapter-1-xiaoshitou-dialogue',
      chapterId: CHAPTER_ONE_ID,
      dialogue: [
        {
          speaker: '小石头',
          text: '你终于来了！昨夜那道光就落在前面的荒地里，地面震得像有巨兽翻身。',
        },
        {
          speaker: '你',
          text: '贞人师说，你们在那里找到了一块没有兆纹的甲骨？',
        },
        {
          speaker: '小石头',
          text: '不止一块。别人拿起它们时，就像拿着普通石片。可刚才你一靠近，土里的那块竟然又亮了。',
        },
        {
          speaker: '小石头',
          text: '你看，就在前面那片金色微光下面。也许它真的在等你。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '任务更新：寻找并触碰发光的甲骨碎片。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-1-seek-first-fragment',
      checkpoint: true,
    },
    {
      id: 'chapter-1-seek-first-fragment',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 第一片碎甲',
        detail: '装备铲子，前往金色标记处挖掘异常土层',
        targetX: FIRST_FRAGMENT_POSITION.x,
        targetY: FIRST_FRAGMENT_POSITION.y,
        targetRadius: 105,
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-1-first-lesson',
      checkpoint: true,
    },
    {
      id: 'chapter-1-fragment-awakens',
      chapterId: CHAPTER_ONE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '“雨、田、水、土、云”五片碎甲在你掌中彼此呼应。沉寂的骨纹像被唤醒一般，从裂口处泛起温暖的金光。',
        },
        {
          speaker: '神秘低语',
          text: '……拾回……吾身……让失去声音的天地……重新开口……',
        },
        {
          speaker: '你',
          text: '这些不是普通的卜骨。五个文字连成了田野求雨之意，纹路深处却还藏着一道残缺的呼唤。',
        },
        {
          speaker: '小石头',
          text: '我什么也听不见，但骨纹真的亮了！贞人师说得没错，它只回应你。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '获得：“雨、田、水、土、云”五字甲骨碎片。寻骨完成，残缺卜力已经苏醒。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-1-first-request',
    },
    {
      id: 'chapter-1-first-lesson',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 出土辨字',
        detail: '观察刚挖出的骨纹，辨认那三道从天而降的纹路',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-1-seek-field-fragment',
    },
    {
      id: 'chapter-1-seek-field-fragment',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 荒田余光',
        detail: '第一片碎甲唤醒了附近的骨纹。循着微光，在荒田中挖出下一枚碎片。',
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-1-field-lesson',
    },
    {
      id: 'chapter-1-field-lesson',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 辨识田字',
        detail: '观察像田界一样分隔的骨纹，猜出它代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-1-seek-water-fragment',
    },
    {
      id: 'chapter-1-seek-water-fragment',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 水声引路',
        detail: '碎甲传来微弱水声，循声挖出下一枚碎片。',
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-1-water-lesson',
    },
    {
      id: 'chapter-1-water-lesson',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 辨识水字',
        detail: '观察像水流分支的骨纹，猜出它代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-1-seek-earth-fragment',
    },
    {
      id: 'chapter-1-seek-earth-fragment',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 土下藏骨',
        detail: '发光的土层仍在回应你。继续挖掘下一枚碎片。',
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-1-earth-lesson',
    },
    {
      id: 'chapter-1-earth-lesson',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 辨识土字',
        detail: '观察像大地隆起的骨纹，猜出它代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-1-seek-cloud-fragment',
    },
    {
      id: 'chapter-1-seek-cloud-fragment',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 云气成纹',
        detail: '最后一道微光映向天边云气。循着云气挖出最后一枚碎片，完成首次寻骨。',
      },
      completeOn: 'excavation-completed',
      nextStepId: 'chapter-1-cloud-lesson',
    },
    {
      id: 'chapter-1-cloud-lesson',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 辨识云字',
        detail: '观察像云气卷曲层叠的骨纹，猜出它代表什么。',
      },
      completeOn: 'learning-completed',
      nextStepId: 'chapter-1-fragment-awakens',
    },
    {
      id: 'chapter-1-first-request',
      chapterId: CHAPTER_ONE_ID,
      dialogue: [
        {
          speaker: '旁白',
          kind: 'narration',
          text: '当你认出骨纹的含义，碎甲上的金光汇入掌心。沉寂已久的天地间，终于响起一声微弱的龟甲轻鸣。',
        },
        {
          speaker: '贞人师',
          text: '果然如此。别人眼中的石头，在你手中却能重新显现文字与兆意。',
        },
        {
          speaker: '小石头',
          text: '贞人师，城南的农人阿禾已经在宗庙外等了许久。禾苗将枯，他想问近日是否会有雨。',
        },
        {
          speaker: '贞人师',
          text: '去吧。以“雨”字碎甲完成第一次问卜。每替一人解开迷惘，碎甲便会积下一分天命灵力，也会呼应散落在大荒中的同伴。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '守卜任务开启：为阿禾占问雨期，并观察碎甲显出的异常兆纹。',
        },
      ],
      completeOn: 'dialogue-completed',
      nextStepId: 'chapter-1-enter-temple',
      checkpoint: true,
    },
    {
      id: 'chapter-1-enter-temple',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '失语的甲骨 · 第一次问卜',
        detail: '前往宗庙内殿，接待等待求雨的农人阿禾',
        targetX: 0,
        targetY: 1010,
        targetRadius: 110,
      },
      completeOn: 'temple-entered',
      nextStepId: 'chapter-1-take-divination-seat',
    },
    {
      id: 'chapter-1-take-divination-seat',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '第一次问卜 · 入席',
        detail: '走到内殿占卜席前，点击“坐下”接待阿禾',
      },
      completeOn: 'temple-seat-reached',
      nextStepId: 'chapter-1-first-divination',
    },
    {
      id: 'chapter-1-first-divination',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '第一次问卜 · 求雨',
        detail: '选择那片代表天降甘霖的甲骨，为阿禾完成占卜',
      },
      completeOn: 'divination-completed',
      nextStepId: 'chapter-1-leave-divination-seat',
      checkpoint: true,
    },
    {
      id: 'chapter-1-leave-divination-seat',
      chapterId: CHAPTER_ONE_ID,
      objective: {
        title: '异常兆纹',
        detail: '完成学习后起身，查看碎甲额外显出的线索',
      },
      completeOn: 'result-confirmed',
      nextStepId: 'chapter-1-clue-revealed',
    },
    {
      id: 'chapter-1-clue-revealed',
      chapterId: CHAPTER_ONE_ID,
      dialogue: [
        {
          speaker: '阿禾',
          text: '多谢守卜人。知道甘霖仍有迹可循，我便能安心回去照看田里的禾苗了。',
        },
        {
          speaker: '旁白',
          kind: 'narration',
          text: '阿禾离开后，“雨”字兆纹并未熄灭。几道不属于求雨卜辞的裂纹缓缓延伸，汇成一道指向西侧河畔的残缺骨纹。',
        },
        {
          speaker: '神秘低语',
          text: '……另一片……在水声掩埋之处……',
        },
        {
          speaker: '神秘低语',
          text: '守卜人……寻回散落大荒的碎甲……以骨渡人……以心安世……',
        },
        {
          speaker: '贞人师',
          text: '占卜不仅能解答来人的疑问，还会让灵龟甲碎片彼此呼应。西侧河畔，就是下一条寻骨线索。',
        },
        {
          speaker: '提示',
          kind: 'system',
          text: '第一章完成：失语的甲骨。获得线索“水声掩埋之处”，后续寻骨任务已开启。',
        },
      ],
      completeOn: 'dialogue-completed',
      checkpoint: true,
    },
  ],
};
