"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppState } from "@/state/appState";
import { fetchRecommendations, askQuestion } from "@/state/apiService";
import { RecommendCard, RecommendResponse } from "@/state/api";

const LoadingSkeleton = () => (
  <div className="mx-auto max-w-7xl animate-pulse">
    <div className="flex h-[600px] gap-6">
      <div className="mt-[260px] w-32 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[52px] rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[32px] bg-slate-200" />
        ))}
      </div>
    </div>
  </div>
);

export default function ResultsPage() {
  const { state } = useAppState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendResponse | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchRecommendations(state);
        setData(res);
      } catch (err: any) {
        setError(err.message || "추천 정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [state]);

  const activeCard = useMemo(() =>
    data?.recommended_cards.find((c) => c.card_id === activeId) ?? null
    , [data, activeId]);

  const handleAsk = async (question: string) => {
    if (!data || qaLoading) return;
    try {
      setQaLoading(true);
      const res = await askQuestion(JSON.stringify(data), question);
      setChat(prev => [...prev, { q: question, a: res.answer }]);
    } catch (err) {
      setChat(prev => [...prev, { q: question, a: "죄송합니다. 답변을 가져오는 중 오류가 발생했습니다." }]);
    } finally {
      setQaLoading(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#f4f7fa] px-6 py-24"><LoadingSkeleton /></main>;

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fa] p-10">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-white"
        >
          다시 시도
        </button>
      </main>
    );
  }

  const recommendations = data?.recommended_cards || [];
  const categories = recommendations[0]?.category_breakdown.map(b => b.category) || [];

  return (
    <main className="min-h-screen bg-[#f4f7fa] px-6 py-12 md:px-12">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-start gap-4">
          {/* [A] Category Indicators */}
          <div className="mt-[260px] flex w-32 flex-col gap-4">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex h-[52px] items-center justify-center rounded-lg bg-[#eef5cf] px-3 py-2 text-center text-xs font-semibold text-[#545f26]"
              >
                {cat}
              </div>
            ))}
          </div>

          {/* [B] 3 Recommendation Cards */}
          <div className="grid flex-1 grid-cols-3 gap-6">
            {recommendations.map((card, idx) => {
              const isBest = idx === 0;
              return (
                <div key={card.card_id} className="relative">
                  <div className={`flex flex-col rounded-[32px] p-8 transition-all h-full ${isBest ? "bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100" : "bg-transparent"
                    }`}>
                    {isBest && (
                      <div className="absolute -top-3 left-8 rounded-full bg-[#1e69ff] px-4 py-1 text-xs font-bold text-white">
                        1순위 추천
                      </div>
                    )}

                    <header className="mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 truncate" title={card.card_name}>{card.card_name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{card.card_company}</p>
                    </header>

                    <div className="mb-10 flex flex-col gap-1">
                      <div className="flex items-baseline gap-1 text-[10px] font-medium text-slate-500">
                        <span>예상 월별 혜택</span>
                        <span className="text-blue-600 font-bold">{card.expected_monthly_benefit.toLocaleString()}원</span>
                      </div>
                      <div className="mt-1">
                        <p className="text-[10px] font-bold text-slate-900">1년 예상 혜택</p>
                        <p className={`font-bold leading-tight ${isBest ? "text-4xl text-[#1e69ff]" : "text-3xl text-slate-900"}`}>
                          {(card.expected_monthly_benefit * 12 / 10000).toLocaleString()}만원
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {card.category_breakdown.map((b) => {
                        const isNot = b.monthly_discount_krw <= 0;
                        return (
                          <div key={b.category} className={`flex h-[52px] items-center text-sm font-medium ${isNot ? "text-slate-400 font-normal" : isBest ? "text-slate-800 font-bold" : "text-slate-700"
                            }`}>
                            {isNot ? "해당사항 없음" : `최대 ${(b.monthly_discount_krw / 10000).toLocaleString()}만원 혜택`}
                          </div>
                        );
                      })}
                    </div>

                    <footer className="mt-auto pt-8 flex flex-col gap-1 text-[11px] font-medium text-slate-400">
                      <p>연회비 : {card.annual_fee.toLocaleString()}원</p>
                      <p>전월실적 : {card.minimum_performance.toLocaleString()}원</p>
                    </footer>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(card.card_id);
                        setChat([]);
                      }}
                      className="flex w-full max-w-[200px] items-center justify-center rounded-2xl bg-[#1e69ff] py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-transform hover:scale-[1.02]"
                    >
                      더 물어보기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* [D] Insight Card */}
        <div className="mt-16">
          <header className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
            <span className="text-blue-500">✦</span>
            <span>은정님을 위한 맞춤 큐레이션</span>
          </header>
          <div className="rounded-[32px] bg-white p-10 shadow-sm ring-1 ring-slate-100">
            <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
              {data?.explanation || "분석 결과를 생성 중입니다..."}
            </div>
          </div>
        </div>
      </section>

      {/* Side Sheet */}
      {activeCard ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActiveId(null)} />
          <aside role="dialog" aria-modal="true" className="absolute right-0 top-0 h-full w-[450px] bg-white p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Card Assistant</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{activeCard.card_name}</h2>
              </div>
              <button onClick={() => setActiveId(null)} className="rounded-full bg-slate-100 p-2 text-slate-500">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {chat.length === 0 && (
                <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
                  {activeCard.explanation || "이 카드에 대해 궁금한 점을 물어보세요!"}
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-2 text-sm text-white max-w-[80%]">
                      {m.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm text-slate-800 max-w-[80%]">
                      {m.a}
                    </div>
                  </div>
                </div>
              ))}
              {qaLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-400 animate-pulse">답변을 생각 중입니다...</div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-xs font-semibold text-slate-400">추천 질문</p>
              <div className="flex flex-wrap gap-2">
                {["이 카드의 교통 혜택을 더 자세히 알려줘", "연회비 대비 혜택이 충분한가?", "전월 실적 채우기 쉬울까?"].map((q) => (
                  <button
                    key={q}
                    disabled={qaLoading}
                    onClick={() => handleAsk(q)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
