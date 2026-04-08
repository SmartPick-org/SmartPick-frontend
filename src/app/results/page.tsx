"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppState } from "@/state/appState";
import { fetchRecommendations, fetchAdvisorAnswer } from "@/state/apiService";
import type { AdvisorQueryType } from "@/state/api";

const ADVISOR_QUERIES: { type: AdvisorQueryType; label: string }[] = [
  { type: "credit_fees", label: "연회비 및 수수료 안내" },
  { type: "international_fees", label: "해외 이용 수수료 정보" },
  { type: "reviews", label: "카드 실사용 유저 리뷰" },
  { type: "how_to_apply", label: "신청 방법 및 자격 조건" },
  { type: "late_payment", label: "연체 및 이자 유의사항" },
  { type: "revolving", label: "리볼빙(결제이월) 정보" }
];
import { RecommendCard, RecommendResponse } from "@/state/api";
import { CATEGORY_KEY_TO_LABEL, CategoryKey } from "@/state/categories";

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

const formatKoreanAmount = (amount: number) => {
  const rounded = Math.round(amount / 5000) * 5000;
  if (rounded === 0) return "0원";
  const man = Math.floor(rounded / 10000);
  const chun = Math.floor((rounded % 10000) / 1000);
  let result = "";
  if (man > 0) result += `${man}만`;
  if (chun > 0) {
    if (man > 0) result += ` ${chun}천`;
    else result += `${chun}천`;
  }
  return result + "원";
};

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
      // 1. 소비 데이터가 아직 없는 경우(하이드레이션 대기 중) 요청을 보내지 않습니다.
      if (Object.keys(state.spendingData).length === 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
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

  const handleAdvisorQuery = async (queryType: AdvisorQueryType, label: string) => {
    if (!activeCard || qaLoading) return;
    try {
      setQaLoading(true);
      const res = await fetchAdvisorAnswer({
        card_name: activeCard.card_name,
        card_company: activeCard.card_company,
        query_type: queryType
      });
      setChat(prev => [...prev, { q: label, a: res.answer }]);
    } catch (err) {
      setChat(prev => [...prev, { q: label, a: "죄송합니다. 답변을 가져오는 중 오류가 발생했습니다." }]);
    } finally {
      setQaLoading(false);
    }
  };

  // Use state.spendingData to get all categories the user input, in the order they appear in metadata
  const categories = useMemo(() => {
    return Object.keys(state.spendingData);
  }, [state.spendingData]);

  const recommendations = data?.recommended_cards || [];

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



  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-start gap-12">
          {/* [A] Category Indicators - Align mt with Card Content Baseline */}
          <div className="mt-[246px] flex w-[88px] flex-col">
            {categories.map((catKey) => (
              <div
                key={catKey}
                className="flex h-[64px] items-center justify-center p-1"
              >
                <div className="flex h-[40px] w-full items-center justify-center rounded-lg bg-[#F2F4F7] px-2 text-center text-[13px] font-semibold text-[#2D333F]">
                  {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                </div>
              </div>
            ))}
          </div>

          {/* [B] Horizontal Recommendation Scroll */}
          <div className="flex-1 overflow-x-auto pb-12 scrollbar-hide scroll-smooth">
            <div className="flex gap-10 min-w-max pr-12 pt-4">
              {recommendations
                .filter(card => card.expected_monthly_benefit > 0)
                .map((card, idx) => {
                  const isBest = idx === 0;
                  return (
                    <div key={card.card_id} className="relative w-[320px] shrink-0">
                      <div className={`flex flex-col rounded-[24px] px-[24px] py-[40px] transition-all h-full border ${isBest ? "bg-[#EFEEFF] scale-[1.01] shadow-[0_20px_40px_rgba(98,91,245,0.12)] border-[#625BF5]/30 ring-1 ring-[#625BF5]/10" : "bg-white shadow-sm border-slate-100"
                        }`}>
                        {/* Fixed Card Header Total Height: 28 + 32 + 32 + 96 = 188px (Content only) + 40px Padding = 228px */}
                        <div className="h-[28px] mb-0 flex flex-col justify-start"> {/* Badge Area */}
                          {idx === 0 || isBest ? (
                            <div className={`inline-block rounded-full px-4 py-1 self-start text-[11px] font-bold text-white bg-[#625BF5]`}>
                              1순위 추천
                            </div>
                          ) : (
                            <div className={`inline-block rounded-full px-4 py-1 self-start text-[11px] font-bold text-white bg-slate-400`}>
                              {idx + 1}순위 추천
                            </div>
                          )}
                        </div>

                        <div className="h-[32px] mt-[12px] flex items-center"> {/* Title Area (12px Gap from Badge) */}
                          <h2 className={`text-[22px] font-bold tracking-[-0.02em] leading-tight truncate ${isBest ? "text-[#2D333F]" : "text-slate-900"}`} title={card.card_name}>
                            {card.card_name}
                          </h2>
                        </div>

                        <div className="h-[32px] mt-1 mb-[18px] flex items-center"> {/* Subtitle Area */}
                          <p className={`text-[14px] font-medium ${isBest ? "text-slate-500" : "text-slate-500"}`}>{card.card_company}</p>
                        </div>

                        <div className="h-[80px] flex flex-col justify-center"> {/* Yearly Benefit Area */}
                          <div className={`flex items-baseline gap-1 text-[13px] font-normal ${isBest ? "text-slate-500" : "text-slate-600"}`}>
                            <span>예상 월별 혜택</span>
                            <span className={`font-bold tabular-nums text-[#625BF5]`}>{card.expected_monthly_benefit.toLocaleString()}원</span>
                          </div>
                          <div className="mt-1">
                            <p className={`text-[13px] font-bold ${isBest ? "text-[#2D333F]" : "text-slate-900"}`}>1년 예상 혜택</p>
                            <div className={`leading-tight tabular-nums font-extrabold ${isBest ? "text-[#2D333F]" : "text-slate-900"}`}>
                              <span className={`text-[32px] ${isBest ? "text-[#625BF5]" : ""}`}>{Math.floor((card.expected_monthly_benefit * 12) / 10000)}</span>
                              <span className="text-[18px]">만</span>
                              {((card.expected_monthly_benefit * 12) % 10000) > 0 && (
                                <>
                                  <span className={`ml-1 text-[32px] ${isBest ? "text-[#625BF5]" : ""}`}>{Math.floor(((card.expected_monthly_benefit * 12) % 10000) / 1000)}</span>
                                  <span className="text-[18px]">천</span>
                                </>
                              )}
                              <span className="text-[18px]">원</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          {categories.map((catKey) => {
                            const b = card.category_breakdown.find(item => item.category === catKey);
                            const isNot = !b || b.monthly_discount_krw <= 0;
                            return (
                              <div key={catKey} className={`flex h-[64px] items-center justify-between ${isBest ? "" : "border-b last:border-0 border-slate-50"}`}>
                                <span className={`text-[15px] font-medium leading-[1.6] ${isNot ? "text-slate-400" : isBest ? "text-slate-600" : "text-slate-500"}`}>
                                  {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                                </span>
                                <span className={`text-[15px] font-bold tabular-nums leading-[1.6] ${isNot ? "text-slate-300" : isBest ? "text-[#625BF5]" : "text-slate-900"}`}>
                                  {isNot ? "0원" : `${b.monthly_discount_krw.toLocaleString()}원`}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <footer className="mt-auto pt-6 flex flex-col">
                          <div className={`flex flex-col gap-1 text-[12px] font-normal ${isBest ? "text-slate-500" : "text-slate-400"}`}>
                            <p>연회비 : <span className="tabular-nums">{card.annual_fee.toLocaleString()}원</span></p>
                            <p>전월실적 : <span className="tabular-nums">{card.minimum_performance.toLocaleString()}원</span></p>
                          </div>
                          {idx < 3 && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveId(card.card_id);
                                setChat([]);
                              }}
                              className={`mt-[24px] flex h-[52px] w-full items-center justify-center rounded-[12px] text-[16px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${isBest ? "bg-[#625BF5] text-white shadow-md shadow-[#625BF5]/20" : "bg-[#1e69ff] text-white shadow-md shadow-blue-500/10"}`}
                            >
                              더 물어보기
                            </button>
                          )}
                        </footer>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* [D] Insight Card */}
        <div className="mt-12 ml-[176px]">
          <header className="mb-6 flex items-center gap-2 text-base font-bold text-[#2D333F]">
            <span className="text-[#625BF5]">✦</span>
            <span>은정님을 위한 맞춤 큐레이션</span>
          </header>
          <div className="rounded-[24px] bg-white p-[32px] shadow-sm ring-1 ring-[#F2F4F7]">
            <div className="text-[16px] font-medium leading-[1.7] text-slate-600 whitespace-pre-wrap">
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
                    <div className="rounded-2xl rounded-tr-sm bg-[#625BF5] px-4 py-2 text-sm text-white max-w-[80%]">
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

            <div className="pt-4 border-t bg-slate-50/50 -mx-8 px-8 pb-8">
              <p className="text-[12px] font-semibold text-slate-400 mb-3 ml-1 uppercase tracking-wider">상세 정보 문의</p>
              <div className="grid grid-cols-2 gap-2">
                {ADVISOR_QUERIES.map((item) => (
                  <button
                    key={item.type}
                    disabled={qaLoading}
                    onClick={() => handleAdvisorQuery(item.type, item.label)}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center text-[13px] font-bold text-slate-700 transition-all hover:border-[#625BF5] hover:bg-[#EFEEFF] hover:text-[#625BF5] disabled:opacity-50"
                  >
                    {item.label}
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
