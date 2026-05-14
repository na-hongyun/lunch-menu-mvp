/**
 * 3段階ランチカテゴリツリー（日本向け）。
 * データソースを差し替えても同一スキーマを維持する。
 */
export interface LunchCategoryLeaf {
  id: string;
  label: string;
  /**
   * Places Text Search 向けの補助キーワード（食べログ・ホットペッパー等のタグ想定）。
   */
  searchBoost?: string;
}

export interface LunchCategoryMid {
  id: string;
  label: string;
  children: LunchCategoryLeaf[];
}

export interface LunchCategoryMajor {
  id: string;
  label: string;
  children: LunchCategoryMid[];
}

export type LunchCategoryTree = LunchCategoryMajor[];
