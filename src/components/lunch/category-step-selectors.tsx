"use client";

import type { LunchCategoryLeaf } from "@/lib/categories/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CategoryStepSelectorsProps {
  majors: { id: string; label: string }[];
  mids: { id: string; label: string }[];
  leaves: LunchCategoryLeaf[];
  majorId: string;
  midId: string;
  leafId: string;
  onMajorChange: (id: string) => void;
  onMidChange: (id: string) => void;
  onLeafChange: (id: string) => void;
}

export function CategoryStepSelectors({
  majors,
  mids,
  leaves,
  majorId,
  midId,
  leafId,
  onMajorChange,
  onMidChange,
  onLeafChange,
}: CategoryStepSelectorsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 md:grid-rows-[auto_auto] md:gap-6">
      <div className="grid gap-3 md:col-span-2 md:min-h-[5.5rem]">
        <Label
          htmlFor="lunch-major"
          className="text-sm font-bold tracking-tight text-foreground"
        >
          ステップ1 · カテゴリー
        </Label>
        <Select
          key={`cat-major-${majorId || "none"}`}
          value={majorId || ""}
          onValueChange={(v) => onMajorChange(v ?? "")}
        >
          <SelectTrigger id="lunch-major" className="h-11 w-full min-w-0">
            <SelectValue placeholder="例：和食、中華…" />
          </SelectTrigger>
          <SelectContent>
            {majors.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:min-h-[5.25rem]">
        <Label
          htmlFor="lunch-mid"
          className="text-sm font-bold tracking-tight text-foreground"
        >
          ステップ2 · ジャンル
        </Label>
        <Select
          key={`cat-mid-${majorId || "none"}`}
          value={midId || ""}
          onValueChange={(v) => onMidChange(v ?? "")}
          disabled={!majorId}
        >
          <SelectTrigger id="lunch-mid" className="h-11 w-full min-w-0">
            <SelectValue placeholder="例：定食、パスタ…" />
          </SelectTrigger>
          <SelectContent>
            {mids.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:min-h-[5.25rem]">
        <Label
          htmlFor="lunch-leaf"
          className="text-sm font-bold tracking-tight text-foreground"
        >
          ステップ3 · 詳細
        </Label>
        <Select
          key={`cat-leaf-${majorId || "none"}-${midId || "none"}`}
          value={leafId || ""}
          onValueChange={(v) => onLeafChange(v ?? "")}
          disabled={!midId}
        >
          <SelectTrigger id="lunch-leaf" className="h-11 w-full min-w-0">
            <SelectValue placeholder="例：にぎり寿司、オムライス…" />
          </SelectTrigger>
          <SelectContent>
            {leaves.map((leaf) => (
              <SelectItem key={leaf.id} value={leaf.id}>
                {leaf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
