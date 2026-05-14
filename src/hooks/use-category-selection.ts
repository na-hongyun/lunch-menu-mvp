"use client";

import type {
  LunchCategoryLeaf,
  LunchCategoryTree,
} from "@/lib/categories/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const NONE = "";

export interface CategorySelection {
  majorId: string;
  midId: string;
  leafId: string;
}

export interface UseCategorySelectionResult {
  majors: LunchCategoryTree;
  mids: { id: string; label: string }[];
  leaves: LunchCategoryLeaf[];
  selection: CategorySelection;
  setMajorId: (id: string) => void;
  setMidId: (id: string) => void;
  setLeafId: (id: string) => void;
  /** 詳細まで選べたときの leaf ID、未完了なら null */
  resolvedLeafId: string | null;
}

export function useCategorySelection(tree: LunchCategoryTree): UseCategorySelectionResult {
  const [majorId, setMajorIdState] = useState<string>(NONE);
  const [midId, setMidIdState] = useState<string>(NONE);
  const [leafId, setLeafIdState] = useState<string>(NONE);

  const mids = useMemo(() => {
    const major = tree.find((m) => m.id === majorId);
    return major?.children ?? [];
  }, [tree, majorId]);

  const leaves = useMemo(() => {
    const mid = mids.find((m) => m.id === midId);
    return mid?.children ?? [];
  }, [mids, midId]);

  /** 上位を変えたあと Radix Select と state がずれたときの整合 */
  /* eslint-disable react-hooks/set-state-in-effect -- ツリー変更時に無効な mid/leaf を同期削除するだけの処理 */
  useEffect(() => {
    if (!majorId) {
      if (midId !== NONE) setMidIdState(NONE);
      if (leafId !== NONE) setLeafIdState(NONE);
      return;
    }

    if (!tree.some((m) => m.id === majorId)) {
      setMajorIdState(NONE);
      setMidIdState(NONE);
      setLeafIdState(NONE);
      return;
    }

    if (midId !== NONE && !mids.some((m) => m.id === midId)) {
      setMidIdState(NONE);
      setLeafIdState(NONE);
      return;
    }

    if (midId === NONE && leafId !== NONE) {
      setLeafIdState(NONE);
      return;
    }

    if (
      leafId !== NONE &&
      (midId === NONE || !leaves.some((l) => l.id === leafId))
    ) {
      setLeafIdState(NONE);
    }
  }, [majorId, midId, leafId, tree, mids, leaves]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setMajorId = useCallback((id: string) => {
    setMajorIdState(id);
    setMidIdState(NONE);
    setLeafIdState(NONE);
  }, []);

  const setMidId = useCallback((id: string) => {
    setMidIdState(id);
    setLeafIdState(NONE);
  }, []);

  const setLeafId = useCallback((id: string) => {
    setLeafIdState(id);
  }, []);

  const resolvedLeafId =
    majorId && midId && leafId && leaves.some((l) => l.id === leafId)
      ? leafId
      : null;

  return {
    majors: tree,
    mids,
    leaves,
    selection: { majorId, midId, leafId },
    setMajorId,
    setMidId,
    setLeafId,
    resolvedLeafId,
  };
}
