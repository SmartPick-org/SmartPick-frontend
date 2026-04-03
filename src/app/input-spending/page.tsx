"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/state/appState";
import { CATEGORY_KEY_TO_LABEL } from "@/state/categories";

const DEFAULT_CATEGORIES = ["Food", "Traffic", "Shopping"];

export default function InputSpendingPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const categories = state.selectedCategories.length
    ? state.selectedCategories
    : DEFAULT_CATEGORIES;

  const [spending, setSpending] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    categories.forEach((cat) => {
      seed[cat] = state.spendingData[cat] ?? 0;
    });
    return seed;
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

  const toggleDetail = (category: string) => {
    setOpen((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleNext = () => {
    if (total <= 0) return;
    dispatch({ type: "SET_SPENDING", payload: spending });
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
          <p className="mt-2 text-slate-500">카테고리별 예상 소비 금액을 입력해 주세요.</p>

          <div className="mt-6 space-y-6">
            {categories.map((category) => {
              const isOpen = open[category];
              const label = CATEGORY_KEY_TO_LABEL.get(category) ?? category;
              return (
                <div key={category} className="rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
                      <p className="text-sm text-slate-500">월 소비 금액</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDetail(category)}
                      className="text-sm font-semibold text-slate-600"
                    >
                      {isOpen ? `${label} 상세 닫기` : `${label} 상세 보기`}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
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
                    />
                    <input
                      aria-label={`${label} 금액`}
                      type="number"
                      min={0}
                      step={10000}
                      value={spending[category] ?? 0}
                      onChange={(event) =>
                        handleValueChange(category, Number(event.target.value))
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2 text-right"
                    />
                  </div>

                  {isOpen ? (
                    <p className="mt-3 text-sm text-slate-500">
                      {label} 카테고리 상세 설명
                    </p>
                  ) : null}
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
