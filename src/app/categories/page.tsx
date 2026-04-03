"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/state/appState";
import { CATEGORY_META, CATEGORY_LABEL_MAP } from "@/state/categories";

export default function CategoriesPage() {
  const router = useRouter();
  const { dispatch } = useAppState();
  const [selected, setSelected] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleCategory = (name: string) => {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, name];
    });
  };

  const nextEnabled = selected.length >= 2 && selected.length <= 5;

  const handleNext = () => {
    if (!nextEnabled) return;
    const keys = selected
      .map((label) => CATEGORY_LABEL_MAP.get(label))
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
    dispatch({ type: "SET_CATEGORIES", payload: keys });
    router.push("/input-spending");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-10 py-12">
      <section className="mx-auto max-w-6xl rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Step 3</span>
            <span>Benefit Categories</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">혜택 카테고리 선택</h1>
            <p className="mt-2 text-slate-500">2~5개를 선택해 주세요.</p>
          </div>
        </header>

        <div className="mb-8 flex items-center justify-between text-sm text-slate-500">
          <span>선택 {Math.min(selected.length, 5)}/5</span>
          {selected.length >= 5 ? <span>최대 5개까지 선택 가능합니다.</span> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_META.map((category) => {
            const isSelected = selectedSet.has(category.label);
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => toggleCategory(category.label)}
                className={`flex flex-col items-start gap-3 rounded-2xl border px-5 py-6 text-left transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-sm"
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  {category.key}
                </span>
                <span className="text-lg font-semibold">{category.label}</span>
                <span className={`text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                  {category.helper}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!nextEnabled}
            className="rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            다음
          </button>
        </div>
      </section>
    </main>
  );
}
