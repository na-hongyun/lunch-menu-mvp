import type { LunchCategoryTree } from "@/lib/categories/types";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCategorySelection } from "./use-category-selection";

const SAMPLE_TREE: LunchCategoryTree = [
  {
    id: "washoku",
    label: "和食",
    children: [
      {
        id: "washoku-soba-udon",
        label: "蕎麦・うどん",
        children: [
          { id: "washoku-soba-kake", label: "かけそば・かけうどん" },
          { id: "washoku-soba-tempura", label: "天ぷらそば・うどん" },
        ],
      },
      {
        id: "washoku-don",
        label: "丼もの",
        children: [{ id: "washoku-don-oyako", label: "親子丼" }],
      },
    ],
  },
  {
    id: "yoshoku",
    label: "洋食",
    children: [
      {
        id: "yoshoku-pasta",
        label: "パスタ・スパゲティ",
        children: [{ id: "yoshoku-napo-meat", label: "ナポリタン・ミートソース" }],
      },
    ],
  },
];

describe("useCategorySelection", () => {
  it("empty mids/leaves until the parent tier is chosen", () => {
    const { result } = renderHook(() => useCategorySelection(SAMPLE_TREE));

    expect(result.current.mids).toEqual([]);
    expect(result.current.leaves).toEqual([]);
    expect(result.current.resolvedLeafId).toBeNull();

    act(() => result.current.setMajorId("washoku"));

    expect(result.current.mids.map((m) => m.id)).toEqual([
      "washoku-soba-udon",
      "washoku-don",
    ]);
    expect(result.current.leaves).toEqual([]);
    expect(result.current.resolvedLeafId).toBeNull();
  });

  it("narrows leaves only under the active middle tier", () => {
    const { result } = renderHook(() => useCategorySelection(SAMPLE_TREE));

    act(() => {
      result.current.setMajorId("washoku");
      result.current.setMidId("washoku-soba-udon");
    });

    expect(result.current.leaves.map((l) => l.id)).toEqual([
      "washoku-soba-kake",
      "washoku-soba-tempura",
    ]);

    act(() => result.current.setMidId("washoku-don"));

    expect(result.current.leaves.map((l) => l.id)).toEqual(["washoku-don-oyako"]);
    expect(result.current.selection.leafId).toBe("");
    expect(result.current.resolvedLeafId).toBeNull();
  });

  it("resolvedLeafId is non-null only when major·mid·leaf form a valid path", () => {
    const { result } = renderHook(() => useCategorySelection(SAMPLE_TREE));

    act(() => {
      result.current.setMajorId("washoku");
      result.current.setMidId("washoku-soba-udon");
      result.current.setLeafId("washoku-soba-kake");
    });

    expect(result.current.resolvedLeafId).toBe("washoku-soba-kake");

    act(() => result.current.setMidId("washoku-don"));

    expect(result.current.resolvedLeafId).toBeNull();
    expect(result.current.selection.leafId).toBe("");
  });

  it("changing major resets mid and leaf", () => {
    const { result } = renderHook(() => useCategorySelection(SAMPLE_TREE));

    act(() => {
      result.current.setMajorId("washoku");
      result.current.setMidId("washoku-soba-udon");
      result.current.setLeafId("washoku-soba-kake");
    });

    expect(result.current.resolvedLeafId).toBe("washoku-soba-kake");

    act(() => result.current.setMajorId("yoshoku"));

    expect(result.current.selection.midId).toBe("");
    expect(result.current.selection.leafId).toBe("");
    expect(result.current.resolvedLeafId).toBeNull();
    expect(result.current.mids.map((m) => m.id)).toEqual(["yoshoku-pasta"]);
  });
});
