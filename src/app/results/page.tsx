"use client";

import { useState } from "react";
import { useAppState } from "@/state/appState";

const RECOMMENDATIONS = [
  {
    id: "rec_01",
    name: "스마트 프라임 카드",
    company: "SmartPick",
    yearlyBenefit: "420,000원",
    extraBenefit: "+80,000원"
  },
  {
    id: "rec_02",
    name: "데일리 리워드 카드",
    company: "SmartPick",
    yearlyBenefit: "360,000원",
    extraBenefit: "+40,000원"
  },
  {
    id: "rec_03",
    name: "알뜰 체크 카드",
    company: "SmartPick",
    yearlyBenefit: "310,000원",
    extraBenefit: "+20,000원"
  }
];

export default function ResultsPage() {
  const { state } = useAppState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const mode = state.comparisonMode ?? "NEW";

  const activeCard = RECOMMENDATIONS.find((card) => card.id === activeId) ?? null;

  return (
    <main className="min-h-screen bg-slate-50 px-10 py-12">
      <section className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-[28px] border border-slate-100 bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="rounded-full border border-slate-200 px-3 py-1">Step 5</span>
            <span>Results</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">추천 결과</h1>
          <p className="mt-2 text-slate-500">입력하신 소비 패턴을 기준으로 계산한 결과입니다.</p>
        </header>

        {mode === "COMPARE" ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Current Card
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                {state.selectedCurrentCard?.name ?? "현재 카드"}
              </h2>
              <p className="mt-2 text-slate-500">
                바꾸면 연간 <span className="font-semibold text-slate-900">+120,000원</span> 더 이득
              </p>
            </aside>

            <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">추천 카드</h3>
              <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                {RECOMMENDATIONS.map((card) => (
                  <div
                    key={card.id}
                    className="min-w-[240px] rounded-2xl border border-slate-200 p-5"
                  >
                    <p className="text-sm text-slate-500">{card.company}</p>
                    <h4 className="mt-2 text-lg font-semibold text-slate-900">{card.name}</h4>
                    <p className="mt-3 text-sm text-slate-500">연간 예상 혜택</p>
                    <p className="text-xl font-semibold text-slate-900">{card.yearlyBenefit}</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-600">
                      {card.extraBenefit}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveId(card.id)}
                      className="mt-4 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      더 물어보기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {RECOMMENDATIONS.map((card, index) => (
              <div
                key={card.id}
                className={`rounded-[28px] border p-6 shadow-sm ${
                  index === 0
                    ? "border-slate-900 bg-white shadow-lg shadow-slate-900/10"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-sm text-slate-500">{card.company}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{card.name}</h3>
                <p className="mt-4 text-sm text-slate-500">연간 예상 혜택</p>
                <p className="text-2xl font-semibold text-slate-900">{card.yearlyBenefit}</p>
                <button
                  type="button"
                  onClick={() => setActiveId(card.id)}
                  className="mt-5 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  더 물어보기
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {activeCard ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActiveId(null)} />
          <aside
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-[45%] min-w-[360px] bg-white p-8 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Question Panel</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {activeCard.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
              >
                닫기
              </button>
            </div>
            <div className="mt-6 space-y-3">
              <button className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left text-sm">
                이 카드의 교통 혜택을 더 자세히 알려줘
              </button>
              <button className="w-full rounded-xl bg-slate-100 px-4 py-3 text-left text-sm">
                연회비 대비 혜택이 충분한가?
              </button>
              <div className="mt-6 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                대화가 이 영역에 표시됩니다.
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
