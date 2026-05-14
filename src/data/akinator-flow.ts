export interface QuizOption {
  id: string;
  label: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  helper?: string;
  options: QuizOption[];
}

export interface ScenarioDef {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  questions: QuizQuestion[];
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: "date",
    label: "데이트",
    shortLabel: "데이트",
    icon: "💕",
    questions: [
      {
        id: "date_meal",
        prompt: "지금 끼니는 언제에 가깝나요?",
        helper: "주변 검색 키워드에 반영돼요.",
        options: [
          { id: "lunch", label: "점심", tags: [] },
          { id: "dinner", label: "저녁", tags: ["meal_dinner"] },
          { id: "brunch", label: "브런치", tags: ["meal_brunch"] },
        ],
      },
      {
        id: "date_cuisine",
        prompt: "어떤 종류의 음식이 끌리나요?",
        options: [
          { id: "ko", label: "한식", tags: ["cuisine_korean"] },
          { id: "jp", label: "일식", tags: ["cuisine_japanese"] },
          { id: "cn", label: "중식", tags: ["cuisine_chinese"] },
          { id: "west", label: "양식·이탈리안", tags: ["cuisine_western"] },
          { id: "fusion", label: "퓨전·카페식", tags: ["cuisine_fusion"] },
        ],
      },
      {
        id: "date_spicy",
        prompt: "매운맛은 어느 쪽이 좋으세요?",
        options: [
          { id: "spicy_yes", label: "매운 걸 즐겨요", tags: ["spicy_love"] },
          { id: "spicy_no", label: "맵지 않게", tags: ["spicy_avoid"] },
          { id: "spicy_mid", label: "상관 없어요", tags: [] },
        ],
      },
      {
        id: "date_seat",
        prompt: "좌식 테이블이 필요하신가요?",
        options: [
          { id: "floor", label: "네, 좌식이면 좋아요", tags: ["floor_seat"] },
          { id: "chair", label: "의자 좌석이면 충분해요", tags: ["table_only"] },
          { id: "seat_any", label: "상관 없어요", tags: [] },
        ],
      },
      {
        id: "date_vibe",
        prompt: "분위기는 어떤 쪽이 좋나요?",
        options: [
          { id: "quiet", label: "조용히 대화하고 싶어요", tags: ["quiet"] },
          { id: "lively", label: "활기 있어도 좋아요", tags: ["lively"] },
        ],
      },
      {
        id: "date_budget",
        prompt: "예산 감은 어떻게 잡을까요?",
        options: [
          { id: "bud", label: "가볍게", tags: ["budget"] },
          { id: "mid", label: "무난하게", tags: ["mid_price"] },
          { id: "prem", label: "특별한 날이에요", tags: ["premium"] },
        ],
      },
      {
        id: "date_alcohol",
        prompt: "술자리까지 염두에 두시나요?",
        options: [
          { id: "alc_y", label: "네, 한잔 가능해요", tags: ["alcohol_yes"] },
          { id: "alc_n", label: "음료·식사만이에요", tags: ["alcohol_no"] },
        ],
      },
    ],
  },
  {
    id: "office",
    label: "회사 점심",
    shortLabel: "회사",
    icon: "🏢",
    questions: [
      {
        id: "off_time",
        prompt: "시간이 얼마나 있나요?",
        options: [
          { id: "quick", label: "30분 안쪽", tags: ["quick"] },
          { id: "normal", label: "1시간 전후", tags: [] },
          { id: "slow", label: "여유 있게", tags: ["slow_ok"] },
        ],
      },
      {
        id: "off_cuisine",
        prompt: "팀 취향은 어느 쪽에 가까워요?",
        options: [
          { id: "ko", label: "한식·백반", tags: ["cuisine_korean"] },
          { id: "jp", label: "일식·돈카츠", tags: ["cuisine_japanese"] },
          { id: "cn", label: "중식·면요리", tags: ["cuisine_chinese", "noodles"] },
          { id: "west", label: "양식·버거", tags: ["cuisine_western"] },
          { id: "any", label: "아무거나 빨리", tags: ["cuisine_any"] },
        ],
      },
      {
        id: "off_spicy",
        prompt: "매운맛은요?",
        options: [
          { id: "spicy_yes", label: "매운 것도 OK", tags: ["spicy_love"] },
          { id: "spicy_no", label: "맵지 않게", tags: ["spicy_avoid"] },
        ],
      },
      {
        id: "off_budget",
        prompt: "회식이 아닌 점심 예산은?",
        options: [
          { id: "bud", label: "가볍게", tags: ["budget"] },
          { id: "mid", label: "보통", tags: ["mid_price"] },
        ],
      },
    ],
  },
  {
    id: "travel",
    label: "여행 중 한 끼",
    shortLabel: "여행",
    icon: "✈️",
    questions: [
      {
        id: "tr_meal",
        prompt: "끼니는 언제인가요?",
        options: [
          { id: "lunch", label: "점심", tags: [] },
          { id: "dinner", label: "저녁", tags: ["meal_dinner"] },
          { id: "brunch", label: "브런치", tags: ["meal_brunch"] },
        ],
      },
      {
        id: "tr_move",
        prompt: "이동은 어떻게 하실 예정이에요?",
        options: [
          { id: "walk", label: "도보 위주", tags: ["travel_walk", "quick"] },
          { id: "transit", label: "대중교통·택시", tags: ["travel_transit"] },
        ],
      },
      {
        id: "tr_cuisine",
        prompt: "현지에서 먹고 싶은 스타일은?",
        options: [
          { id: "local", label: "로컬 맛집", tags: ["cuisine_korean"] },
          { id: "photo", label: "인생샷·감성", tags: ["cuisine_fusion", "premium"] },
          { id: "safe", label: "무난한 메뉴", tags: ["cuisine_any", "mid_price"] },
        ],
      },
      {
        id: "tr_spicy",
        prompt: "매운맛 도전은?",
        options: [
          { id: "yes", label: "도전할래요", tags: ["spicy_love"] },
          { id: "no", label: "순한 맛이 좋아요", tags: ["spicy_avoid"] },
        ],
      },
    ],
  },
  {
    id: "family",
    label: "상견례·가족 행사",
    shortLabel: "가족",
    icon: "👔",
    questions: [
      {
        id: "fam_meal",
        prompt: "끼니는 언제인가요?",
        options: [
          { id: "lunch", label: "점심", tags: [] },
          { id: "dinner", label: "저녁", tags: ["meal_dinner"] },
        ],
      },
      {
        id: "fam_room",
        prompt: "룸·조용한 자리가 필요하신가요?",
        options: [
          { id: "yes", label: "네, 중요한 자리예요", tags: ["quiet", "premium"] },
          { id: "no", label: "홀 좌석도 괜찮아요", tags: ["mid_price"] },
        ],
      },
      {
        id: "fam_cuisine",
        prompt: "음식 종류는?",
        options: [
          { id: "ko", label: "한정식·한식", tags: ["cuisine_korean"] },
          { id: "jp", label: "일식·스시", tags: ["cuisine_japanese"] },
          { id: "cn", label: "중식", tags: ["cuisine_chinese"] },
          { id: "west", label: "양식", tags: ["cuisine_western"] },
        ],
      },
      {
        id: "fam_seat",
        prompt: "좌식이 필요하신가요?",
        options: [
          { id: "floor", label: "네", tags: ["floor_seat"] },
          { id: "chair", label: "의자면 돼요", tags: ["table_only"] },
        ],
      },
    ],
  },
  {
    id: "solo",
    label: "혼밥",
    shortLabel: "혼밥",
    icon: "🍚",
    questions: [
      {
        id: "solo_meal",
        prompt: "끼니는?",
        options: [
          { id: "lunch", label: "점심", tags: [] },
          { id: "dinner", label: "저녁", tags: ["meal_dinner"] },
        ],
      },
      {
        id: "solo_style",
        prompt: "어떤 한 끼를 원하세요?",
        options: [
          { id: "noodle", label: "따뜻한 국물·면", tags: ["noodles"] },
          { id: "rice", label: "덮밥·비빔밥류", tags: ["rice_hot"] },
          { id: "light", label: "가볍게", tags: ["light_veg", "budget"] },
        ],
      },
      {
        id: "solo_spicy",
        prompt: "매운맛은?",
        options: [
          { id: "yes", label: "매운 거 좋아요", tags: ["spicy_love"] },
          { id: "no", label: "순하게", tags: ["spicy_avoid"] },
        ],
      },
      {
        id: "solo_speed",
        prompt: "시간은?",
        options: [
          { id: "quick", label: "빨리 먹고 갈래요", tags: ["quick"] },
          { id: "slow", label: "천천히", tags: ["slow_ok"] },
        ],
      },
    ],
  },
  {
    id: "friends",
    label: "친구 모임",
    shortLabel: "친구",
    icon: "🎉",
    questions: [
      {
        id: "fr_meal",
        prompt: "끼니는?",
        options: [
          { id: "lunch", label: "점심", tags: [] },
          { id: "dinner", label: "저녁", tags: ["meal_dinner"] },
          { id: "brunch", label: "브런치", tags: ["meal_brunch"] },
        ],
      },
      {
        id: "fr_vibe",
        prompt: "분위기는?",
        options: [
          { id: "lively", label: "시끌벅적 OK", tags: ["lively"] },
          { id: "mid", label: "무난하게", tags: ["mid_price"] },
        ],
      },
      {
        id: "fr_cuisine",
        prompt: "메뉴 장르는?",
        options: [
          { id: "meat", label: "고기·구이", tags: ["meat", "cuisine_korean"] },
          { id: "sea", label: "해산·회", tags: ["seafood"] },
          { id: "intl", label: "양식·이탈리안", tags: ["cuisine_western"] },
          { id: "pub", label: "술안주 위주", tags: ["alcohol_yes", "lively"] },
        ],
      },
      {
        id: "fr_spicy",
        prompt: "매운맛은?",
        options: [
          { id: "yes", label: "맵게 가요", tags: ["spicy_love"] },
          { id: "no", label: "순하게", tags: ["spicy_avoid"] },
        ],
      },
    ],
  },
];

export function getScenarioById(id: string | null | undefined): ScenarioDef | null {
  if (!id) return null;
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

export function collectProfileTags(
  scenarioId: string,
  answers: Readonly<Record<string, string>>,
): string[] {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return [];
  const tags = new Set<string>();
  tags.add(`scenario_${scenarioId}`);
  for (const q of scenario.questions) {
    const optId = answers[q.id];
    if (!optId) continue;
    const opt = q.options.find((o) => o.id === optId);
    if (opt) for (const t of opt.tags) tags.add(t);
  }
  return [...tags];
}

/**
 * 질문 정의 순으로 선택지 라벨만 이어 붙인 문자열 (본페이지·디버그 요약용).
 * `committedStepIndex`에 `session.stepIndex`를 넘기면, 그보다 뒤 질문에 남아 있을 수 있는
 * 오래된 답변은 표시하지 않습니다(뒤로가기 후에도 순서가 맞게 보이도록).
 */
export function formatAnswersInFlowOrder(
  scenarioId: string,
  answers: Readonly<Record<string, string>>,
  options?: { committedStepIndex?: number },
): string {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) {
    return Object.entries(answers)
      .map(([k, v]) => `${k}=${v}`)
      .join(" → ");
  }
  const maxQuestionExclusive =
    options?.committedStepIndex === undefined
      ? scenario.questions.length
      : Math.max(0, options.committedStepIndex - 1);
  const parts: string[] = [];
  for (let qi = 0; qi < scenario.questions.length; qi++) {
    if (qi >= maxQuestionExclusive) break;
    const q = scenario.questions[qi];
    const optId = answers[q.id];
    if (!optId) continue;
    const opt = q.options.find((o) => o.id === optId);
    if (opt) parts.push(opt.label);
  }
  return parts.join(" → ");
}
