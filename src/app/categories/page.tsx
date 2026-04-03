"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/state/appState";
import { CATEGORY_META, CATEGORY_LABEL_MAP } from "@/state/categories";

export default function CategoriesPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();

  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    if (Array.isArray(state.selectedCategories)) {
      return {};
    }
    return { ...state.selectedCategories };
  });

  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const activeTopCount = Object.values(selections).filter((sub) => sub.length > 0).length;
  const nextEnabled = activeTopCount >= 2 && activeTopCount <= 5;

  const toggleSubCategory = (topKey: string, subName: string) => {
    setSelections((prev) => {
      const currentSubs = prev[topKey] || [];
      const has = currentSubs.includes(subName);
      let newSubs = [];
      if (has) {
        newSubs = currentSubs.filter((n) => n !== subName);
      } else {
        newSubs = [...currentSubs, subName];
      }
      return { ...prev, [topKey]: newSubs };
    });
  };

  const handleNext = () => {
    if (!nextEnabled) return;
    const payload: Record<string, string[]> = {};
    Object.entries(selections).forEach(([k, v]) => {
      if (v.length > 0) {
        payload[k] = v;
      }
    });

    dispatch({ type: "SET_CATEGORIES", payload });
    router.push("/input-spending");
  };

  const toggleFlip = (key: string) => {
    setFlipped((prev) => ({ ...prev, [key]: !prev[key] }));
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
            <p className="mt-2 text-slate-500">2~5개의 카테고리를 선택하고 상세 항목을 골라주세요.</p>
          </div>
        </header>

        <div className="mb-8 flex items-center justify-between text-sm text-slate-500">
          <span>선택 {Math.min(activeTopCount, 5)}/5</span>
          {activeTopCount >= 5 ? <span className="font-semibold text-rose-500">최대 5개까지 선택 가능합니다.</span> : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_META.map((category) => {
            const currentSubs = selections[category.key] || [];
            const isSelected = currentSubs.length > 0;
            const isFlipped = flipped[category.key];

            return (
              <div key={category.key} style={{ perspective: "1000px" }} className="h-[220px] w-full group">
                <div
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                  className="relative h-full w-full transition-transform duration-500"
                >
                  {/* Front Face */}
                  <button
                    type="button"
                    onClick={() => toggleFlip(category.key)}
                    style={{ backfaceVisibility: "hidden" }}
                    className={`absolute inset-0 flex w-full flex-col items-start justify-between rounded-3xl border p-6 text-left transition-all ${isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-md"
                      }`}
                  >
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-[0.28em] ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                          {category.key}
                        </span>
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                            {currentSubs.length}
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-bold">{category.label}</span>
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <span className={`text-sm leading-snug ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {category.helper}
                      </span>
                      <span className={`mt-2 inline-flex items-center text-xs font-medium ${isSelected ? "text-slate-400" : "text-indigo-500"}`}>
                        상세 항목 선택하기 &rarr;
                      </span>
                    </div>
                  </button>

                  {/* Back Face */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className={`absolute inset-0 flex flex-col rounded-3xl border shadow-md p-5 pb-4 overflow-hidden ${isSelected ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200"}`}
                  >
                    <div className="mb-3 flex items-center justify-between z-10">
                      <h3 className="text-base font-bold text-slate-800">
                        {category.label} 상세
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleFlip(category.key)}
                        className="rounded-full bg-slate-900 p-1.5 text-white hover:bg-slate-700 transition-colors shadow-sm"
                        aria-label="선택 완료"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Scrollable Chips Area */}
                    <div className="flex-1 overflow-y-auto pr-1 -mr-2 scrollbar-hide">
                      <div className="flex flex-wrap gap-2 pb-2">
                        {category.subCategories.map((sub) => {
                          const isSubSelected = currentSubs.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubCategory(category.key, sub);
                              }}
                              className={`rounded-xl px-3 py-1.5 text-sm transition-all focus:outline-none ${isSubSelected
                                ? "bg-slate-900 font-semibold text-white shadow-sm"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            disabled={!nextEnabled}
            className="rounded-full bg-slate-900 px-10 py-4 text-lg font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            다음 카테고리 비교하기
          </button>
        </div>
      </section>
    </main>
  );
}
