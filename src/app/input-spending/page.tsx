"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppState, getSelectTopCategories } from "@/state/appState";
import { CATEGORY_KEY_TO_LABEL, type CategoryKey } from "@/state/categories";

const DEFAULT_CATEGORIES = ["Food", "Traffic", "Shopping"];

// A helper to initialize equal splits
const initRatiosForSubs = (subs: string[]) => {
  if (subs.length === 0) return {};
  const base = Math.floor(100 / subs.length);
  let remainder = 100 - base * subs.length;
  const res: Record<string, number> = {};
  subs.forEach((sub, i) => {
    res[sub] = base + (i < remainder ? 1 : 0);
  });
  return res;
};

// Segmented Slider Component
function SegmentedSlider({
  subs,
  ratios,
  onChange
}: {
  subs: string[];
  ratios: Record<string, number>;
  onChange: (newRatios: Record<string, number>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  // We need to operate on an ordered array of proportions
  const activeSubs = subs.filter(s => ratios[s] !== undefined);
  if (activeSubs.length === 0) return null;

  if (activeSubs.length === 1) {
    return (
      <div className="mt-4">
        <div className="flex h-10 w-full overflow-hidden rounded-xl bg-slate-100">
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-medium text-white">
            {activeSubs[0]} (100%)
          </div>
        </div>
      </div>
    );
  }

  // Calculate cumulative percentages for thumb placement
  const percentages = activeSubs.map(s => ratios[s]);
  let acc = 0;
  const thumbPositions = percentages.slice(0, -1).map(p => {
    acc += p;
    return acc;
  });

  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingIdx(idx);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));

    const newRatioAtCursor = Math.round((x / rect.width) * 100);

    // Limits
    const prevPos = draggingIdx > 0 ? thumbPositions[draggingIdx - 1] : 0;
    const nextPos = draggingIdx < thumbPositions.length - 1 ? thumbPositions[draggingIdx + 1] : 100;

    // Ensure at least 1% per segment (optional, but good UX)
    const minPercent = 1;
    const clamedPos = Math.max(prevPos + minPercent, Math.min(newRatioAtCursor, nextPos - minPercent));

    // Now calc the delta and apply it.
    // Wait, the easiest way to update is to recalculate the two segments based on the new thumb position!
    // Left segment index = draggingIdx
    // Right segment index = draggingIdx + 1
    // New left segment size = clamedPos - prevPos
    // New right segment size = nextPos - clamedPos

    const newLeftSize = clamedPos - prevPos;
    const newRightSize = nextPos - clamedPos;

    const newRatios = { ...ratios };
    newRatios[activeSubs[draggingIdx]] = newLeftSize;
    newRatios[activeSubs[draggingIdx + 1]] = newRightSize;

    onChange(newRatios);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingIdx(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Color palette for segments
  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-purple-500"];

  return (
    <div className="mt-4">
      {/* Slider Bar */}
      <div
        ref={containerRef}
        className="relative flex h-10 w-full select-none items-center rounded-xl bg-slate-100"
      >
        {activeSubs.map((sub, i) => {
          const width = ratios[sub] || 0;
          return (
            <div
              key={sub}
              style={{ width: `${width}%` }}
              className={`flex h-full items-center justify-center overflow-hidden text-xs font-medium text-white transition-colors ${width > 0 ? colors[i % colors.length] : 'bg-transparent'} ${i === 0 ? 'rounded-l-xl' : ''} ${i === activeSubs.length - 1 ? 'rounded-r-xl' : ''}`}
            >
              {width > 10 ? <span className="truncate px-1">{sub} {width}%</span> : null}
            </div>
          );
        })}

        {/* Thumbs */}
        {thumbPositions.map((pos, i) => (
          <div
            key={`thumb-${i}`}
            className="absolute top-0 bottom-0 z-10 flex w-0 items-center justify-center"
            style={{ left: `${pos}%` }}
            onPointerDown={(e) => handlePointerDown(i, e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Hitbox expanded via after pseudo-element or padded wrapper */}
            <div className="group relative flex h-full cursor-col-resize items-center justify-center p-2 -mx-2">
              <div className={`h-full w-1 rounded-full bg-white shadow-sm transition-transform ${draggingIdx === i ? 'scale-x-150 bg-slate-900' : 'group-hover:scale-x-150 group-hover:bg-slate-300'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Precision Controls */}
      <div className="mt-4 flex flex-wrap gap-4">
        {activeSubs.map((sub) => (
          <div key={sub} className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-medium">{sub}</span>
            <div className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1">
              <button
                type="button"
                className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
                onClick={() => {
                  const val = ratios[sub] - 1;
                  // If we subtract 1 from this, we must add 1 to another to keep 100%.
                  // Simple hack: attach the remainder to the next sub, or previous if at end.
                  if (val < 0) return;
                  const idx = activeSubs.indexOf(sub);
                  const partnerIdx = idx < activeSubs.length - 1 ? idx + 1 : idx - 1;
                  if (partnerIdx === -1) return;

                  const newRatios = { ...ratios };
                  newRatios[sub] -= 1;
                  newRatios[activeSubs[partnerIdx]] += 1;
                  onChange(newRatios);
                }}
              >-</button>
              <span className="w-8 text-center">{ratios[sub]}%</span>
              <button
                type="button"
                className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
                onClick={() => {
                  const val = ratios[sub] + 1;
                  if (val > 100) return;
                  const idx = activeSubs.indexOf(sub);
                  const partnerIdx = idx < activeSubs.length - 1 ? idx + 1 : idx - 1;
                  if (partnerIdx === -1) return;
                  if (ratios[activeSubs[partnerIdx]] - 1 < 0) return;

                  const newRatios = { ...ratios };
                  newRatios[sub] += 1;
                  newRatios[activeSubs[partnerIdx]] -= 1;
                  onChange(newRatios);
                }}
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InputSpendingPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();

  const rawCategories = getSelectTopCategories(state.selectedCategories);
  const categories = rawCategories.length ? rawCategories : DEFAULT_CATEGORIES;

  const [spending, setSpending] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    categories.forEach((cat) => {
      seed[cat] = state.spendingData[cat] ?? 0;
    });
    return seed;
  });

  // Track ratios per top-category locally before submitting
  const [ratios, setRatios] = useState<Record<string, Record<string, number>>>(() => {
    const initialRatios: Record<string, Record<string, number>> = {};

    // Either initialize from selected subcategories or from existing appState
    // If state.selectedCategories is array, it has no subcategories, so we just use 100% dummy or empty
    if (!Array.isArray(state.selectedCategories)) {
      Object.entries(state.selectedCategories).forEach(([topCat, subs]) => {
        // If there's an existing state for it, use it
        if (state.subCategoryRatios[topCat]) {
          initialRatios[topCat] = { ...state.subCategoryRatios[topCat] };
        } else {
          initialRatios[topCat] = initRatiosForSubs(subs);
        }
      });
    }
    return initialRatios;
  });

  const [open, setOpen] = useState<Record<string, boolean>>({});

  const total = useMemo(
    () => Object.values(spending).reduce((sum, value) => sum + value, 0),
    [spending]
  );

  const handleValueChange = (category: string, value: number) => {
    setSpending((prev) => ({
      ...prev,
      [category]: Number.isFinite(value) ? value : 0
    }));
  };

  const handleRatiosChange = (category: string, newRatios: Record<string, number>) => {
    setRatios((prev) => ({
      ...prev,
      [category]: newRatios
    }));
  };

  const toggleDetail = (category: string) => {
    setOpen((prev) => {
      const isCurrentlyOpen = prev[category] ?? true;
      return { ...prev, [category]: !isCurrentlyOpen };
    });
  };

  const handleNext = () => {
    if (total <= 0) return;
    dispatch({ type: "SET_SPENDING", payload: spending });
    dispatch({ type: "SET_SUBCATEGORY_RATIOS", payload: ratios });
    router.push("/results");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-10 py-12">
      <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.85fr_1.15fr]">
        <aside className="sticky top-10 h-fit rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Step 4</span>
            <span>Spending</span>
          </div>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">실시간 소비 요약</h2>
          <p className="mt-2 text-sm text-slate-500">
            총액 기준으로 도넛 차트가 들어갈 예정입니다.
          </p>
          <div className="mt-8 flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-200 text-sm text-slate-400">
              Donut
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Total</p>
            <p className="mt-2 text-3xl font-semibold">총액 {total.toLocaleString()}원</p>
          </div>
        </aside>

        <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">월 소비 금액 입력</h1>
          <p className="mt-2 text-slate-500">카테고리별 예상 소비 금액과 세부 항목 비중을 조절해 주세요.</p>

          <div className="mt-6 space-y-6">
            {categories.map((category) => {
              const isOpen = open[category] ?? true; // Default open for visibility of sliders
              const label = CATEGORY_KEY_TO_LABEL.get(category as CategoryKey) ?? category;

              let currentSubs: string[] = [];
              if (!Array.isArray(state.selectedCategories) && state.selectedCategories[category]) {
                currentSubs = state.selectedCategories[category];
              }
              const currentRatios = ratios[category] || {};

              return (
                <div key={category} className="rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
                      <p className="text-sm text-slate-500">대략적인 월 소비 금액과 각 항목별 비중(%)을 입력하세요.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDetail(category)}
                      className="text-sm font-semibold text-slate-600 hover:text-slate-900 focus:outline-none"
                    >
                      {isOpen ? `${label} 접기` : `${label} 설정`}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_180px]">
                        <input
                          aria-label={`${label} 슬라이더`}
                          type="range"
                          min={0}
                          max={1000000}
                          step={10000}
                          value={spending[category] ?? 0}
                          onChange={(event) =>
                            handleValueChange(category, Number(event.target.value))
                          }
                          className="accent-slate-900"
                        />
                        <div className="relative">
                          <input
                            aria-label={`${label} 금액`}
                            type="number"
                            min={0}
                            step={10000}
                            value={spending[category] ?? 0}
                            onChange={(event) =>
                              handleValueChange(category, Number(event.target.value))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-right pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">원</span>
                        </div>
                      </div>

                      {currentSubs.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">세부 항목 예산 비중 배분</h4>
                          <SegmentedSlider
                            subs={currentSubs}
                            ratios={currentRatios}
                            onChange={(newRatios) => handleRatiosChange(category, newRatios)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={total <= 0}
              className="rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              다음
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
