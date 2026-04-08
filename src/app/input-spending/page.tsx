"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppState, getSelectTopCategories } from "@/state/appState";
import { CATEGORY_KEY_TO_LABEL, type CategoryKey } from "@/state/categories";

const DEFAULT_CATEGORIES = ["Food", "Traffic", "Shopping"];

// Standardized hex palettes per top-category for SVG and UI consistency
const PALETTES_HEX: Record<string, string[]> = {
  Food: ["#0ea5e9", "#38bdf8", "#0284c7", "#7dd3fc", "#0369a1"], // sky
  Traffic: ["#3b82f6", "#60a5fa", "#2563eb", "#93c5fd", "#1d4ed8"], // blue
  Shopping: ["#6366f1", "#818cf8", "#4f46e5", "#a5b4fc", "#4338ca"], // indigo
  Coffee: ["#14b8a6", "#2dd4bf", "#0d9488", "#5eead4", "#0f766e"], // teal
  Cultural: ["#8b5cf6", "#a78bfa", "#7c3aed", "#c4b5fd", "#6d28d9"], // violet
  Travel: ["#d946ef", "#e879f9", "#c026d3", "#f0abfc", "#a21caf"], // fuchsia
  Life: ["#10b981", "#34d399", "#059669", "#6ee7b7", "#047857"], // emerald
  EduHealth: ["#06b6d4", "#22d3ee", "#0891b2", "#67e8f9", "#0e7490"], // cyan
  Others: ["#64748b", "#94a3b8", "#475569", "#cbd5e1", "#334155"], // slate
};

// Map each step logic back to 5% increments securely
const initRatiosForSubs = (subs: string[]) => {
  if (subs.length === 0) return {};
  const base = Math.floor(100 / subs.length / 5) * 5;
  let remainder = 100 - base * subs.length;
  const res: Record<string, number> = {};
  subs.forEach((sub, i) => {
    let diff = 0;
    if (remainder > 0 && remainder >= 5) {
      diff = 5;
      remainder -= 5;
    }
    res[sub] = base + diff;
  });
  return res;
};

function SegmentedSlider({
  subs,
  ratios,
  palette,
  onChange
}: {
  subs: string[];
  ratios: Record<string, number>;
  palette: string[];
  onChange: (newRatios: Record<string, number>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const activeSubs = subs.filter(s => ratios[s] !== undefined);
  if (activeSubs.length === 0) return null;

  if (activeSubs.length === 1) {
    return (
      <div className="mt-4">
        <div className="flex h-10 w-full overflow-hidden rounded-xl bg-slate-100">
          <div style={{ backgroundColor: palette[0] }} className="flex h-full w-full items-center justify-center text-sm font-medium text-white">
            {activeSubs[0]} (100%)
          </div>
        </div>
      </div>
    );
  }

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

    const rawRatio = (x / rect.width) * 100;
    // Snap to 5% steps
    const newRatioAtCursor = Math.round(rawRatio / 5) * 5;

    const prevPos = draggingIdx > 0 ? thumbPositions[draggingIdx - 1] : 0;
    const nextPos = draggingIdx < thumbPositions.length - 1 ? thumbPositions[draggingIdx + 1] : 100;

    const minPercent = 5;
    const clampedPos = Math.max(prevPos + minPercent, Math.min(newRatioAtCursor, nextPos - minPercent));

    const newLeftSize = clampedPos - prevPos;
    const newRightSize = nextPos - clampedPos;

    const newRatios = { ...ratios };
    newRatios[activeSubs[draggingIdx]] = newLeftSize;
    newRatios[activeSubs[draggingIdx + 1]] = newRightSize;

    onChange(newRatios);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingIdx(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

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
              style={{ width: `${width}%`, backgroundColor: width > 0 ? palette[i % palette.length] : 'transparent' }}
              className={`flex h-full items-center justify-center overflow-hidden text-xs font-medium text-white transition-colors ${i === 0 ? 'rounded-l-xl' : ''} ${i === activeSubs.length - 1 ? 'rounded-r-xl' : ''}`}
            >
              {width > 10 ? <span className="truncate px-1 drop-shadow-sm">{sub} {width}%</span> : null}
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
            <div className="group relative flex h-full cursor-col-resize items-center justify-center p-2 -mx-2">
              <div className={`h-full w-1 rounded-full bg-white shadow-sm ring-1 ring-slate-900/10 transition-transform ${draggingIdx === i ? 'scale-x-[3] bg-slate-900' : 'group-hover:scale-x-150 group-hover:bg-slate-300'}`} />
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

  const [totalBudget, setTotalBudget] = useState(state.totalBudget);

  const [spending, setSpending] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    categories.forEach((cat) => {
      seed[cat] = state.spendingData[cat] ?? 0;
    });
    return seed;
  });

  const [ratios, setRatios] = useState<Record<string, Record<string, number>>>(() => {
    const initialRatios: Record<string, Record<string, number>> = {};
    if (!Array.isArray(state.selectedCategories)) {
      Object.entries(state.selectedCategories).forEach(([topCat, subs]) => {
        const saved = state.subCategoryRatios[topCat];
        const savedKeys = saved ? Object.keys(saved) : [];

        // Check if current selections match exactly with what's in global state/storage
        const containsAll = subs.every(s => savedKeys.includes(s));
        const matchesExactly = containsAll && subs.length === savedKeys.length;

        if (matchesExactly) {
          initialRatios[topCat] = { ...saved };
        } else {
          // If the subset has changed (added or removed a sub-category), re-initialize the baseline ratios
          initialRatios[topCat] = initRatiosForSubs(subs);
        }
      });
    }
    return initialRatios;
  });



  const handleValueChange = (category: string, value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;

    // Validate bounds: sum of all other spends + new value cannot exceed totalBudget
    const otherTotal = Object.entries(spending).reduce((sum, [c, v]) => c === category ? sum : sum + v, 0);
    const maxAllowed = Math.max(0, totalBudget - otherTotal);
    const finalValue = Math.min(safeValue, maxAllowed);

    setSpending((prev) => ({
      ...prev,
      [category]: finalValue
    }));
  };

  const handleRatiosChange = (category: string, newRatios: Record<string, number>) => {
    setRatios((prev) => ({
      ...prev,
      [category]: newRatios
    }));
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (spending[b] || 0) - (spending[a] || 0));
  }, [categories, spending]);

  const handleNext = () => {
    if (totalBudget <= 0) return;
    dispatch({ type: "SET_TOTAL_BUDGET", payload: totalBudget });
    dispatch({ type: "SET_SPENDING", payload: spending });
    dispatch({ type: "SET_SUBCATEGORY_RATIOS", payload: ratios });
    router.push("/results");
  };

  // Build donutchart data mappings
  const chartData = useMemo(() => {
    let utilized = 0;
    const items: { name: string; amount: number; color: string }[] = [];

    sortedCategories.forEach((cat) => {
      const topAmount = spending[cat] || 0;
      if (topAmount <= 0) return;
      const topRatios = ratios[cat] || {};
      const subs = Object.keys(topRatios);
      const palette = PALETTES_HEX[cat] || PALETTES_HEX.Others;

      if (subs.length > 0) {
        subs.forEach((sub, idx) => {
          const amt = topAmount * (topRatios[sub] / 100);
          if (amt > 0) {
            utilized += amt;
            items.push({ name: sub, amount: amt, color: palette[idx % palette.length] });
          }
        });
      } else {
        utilized += topAmount;
        const label = CATEGORY_KEY_TO_LABEL.get(cat as CategoryKey) || cat;
        items.push({ name: label, amount: topAmount, color: palette[0] });
      }
    });

    const remaining = Math.max(0, totalBudget - utilized);
    if (remaining > 0) {
      items.push({ name: "기타 (미배분)", amount: remaining, color: "#e2e8f0" }); // slate-200
    }

    return items;
  }, [spending, ratios, totalBudget]);

  const SVG_SIZE = 160;
  const CX = SVG_SIZE / 2, CY = SVG_SIZE / 2;
  const R = 64;
  const CIRCUMF = 2 * Math.PI * R;
  let cumulativePie = 0;

  return (
    <main className="min-h-screen bg-slate-50 px-10 py-12">
      <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.85fr_1.15fr]">
        <aside className="sticky top-10 h-fit rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Step 4</span>
            <span>Spending</span>
          </div>
          <h2 className="mt-6 text-lg font-semibold text-slate-900">월 소비 예산 요약</h2>
          <p className="mt-2 text-sm text-slate-500">
            입력하신 예산 총액과 항목별 섭취 비율이 자동 계산됩니다.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-40 h-40">
              <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="-rotate-90 transform">
                {chartData.map((item, i) => {
                  if (item.amount <= 0) return null;
                  const ratio = item.amount / totalBudget;
                  const strokeDasharray = `${ratio * CIRCUMF} ${CIRCUMF}`;
                  const strokeDashoffset = -cumulativePie * CIRCUMF;
                  cumulativePie += ratio;
                  return (
                    <circle
                      key={`pie-${i}`}
                      cx={CX}
                      cy={CY}
                      r={R}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={16}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 ease-out"
                    />
                  );
                })}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400 font-medium">총 예산</span>
                <span className="text-sm font-bold text-slate-800">{(totalBudget / 10000).toLocaleString()}만</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                </div>
                <span className="text-slate-900 font-semibold">{(item.amount / 10000).toLocaleString()}만</span>
              </div>
            ))}
          </div>

        </aside>

        <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-900">당신의 한 달 총 예산은 얼마인가요?</h3>
            <p className="text-sm text-indigo-700 mt-1 mb-5">입력한 예산 총액 안에서 항목별 상한을 배분하게 됩니다.</p>
            <div className="flex items-center gap-4">
              <input
                aria-label="총 예산 슬라이더"
                type="range"
                min={100000}
                max={5000000}
                step={10000}
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
              <div className="relative w-40">
                <input
                  aria-label="총 예산액"
                  type="number"
                  min={100000}
                  step={10000}
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-right pr-8 font-semibold text-indigo-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">원</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">세부 항목 분배</h1>
          <p className="mt-2 text-slate-500">각 영역별로 얼마를 사용할지 한도를 정하고 비중을 배분해 주세요.</p>

          <div className="mt-6 space-y-6">
            {sortedCategories.map((category) => {
              const label = CATEGORY_KEY_TO_LABEL.get(category as CategoryKey) ?? category;

              let currentSubs: string[] = [];
              if (!Array.isArray(state.selectedCategories) && state.selectedCategories[category]) {
                currentSubs = state.selectedCategories[category];
              }
              const currentRatios = ratios[category] || {};
              const palette = PALETTES_HEX[category] || PALETTES_HEX.Others;

              return (
                <div key={category} className="rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
                    </div>
                  </div>

                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mb-6 grid gap-4 md:grid-cols-[1fr_180px]">
                      <input
                        aria-label={`${label} 슬라이더`}
                        type="range"
                        min={0}
                        max={totalBudget}
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
                          max={totalBudget}
                          step={10000}
                          value={spending[category] ?? 0}
                          onChange={(event) =>
                            handleValueChange(category, Number(event.target.value))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-right pr-8 font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">원</span>
                      </div>
                    </div>

                    {currentSubs.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">슬라이더로 예산 비율을 조정해주세요</h4>
                        <SegmentedSlider
                          subs={currentSubs}
                          ratios={currentRatios}
                          palette={palette}
                          onChange={(newRatios) => handleRatiosChange(category, newRatios)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={totalBudget <= 0}
              className="rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 hover:bg-slate-800 transition-colors shadow-sm"
            >
              다음으로 이동
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
