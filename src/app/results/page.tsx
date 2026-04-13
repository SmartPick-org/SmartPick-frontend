"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useAppState } from "@/state/appState";
import { fetchRecommendations, fetchComparison, fetchAdvisorAnswer } from "@/state/apiService";
import type { AdvisorQueryType } from "@/state/api";
import { UI_CONSTANTS } from "@/constants/ui";

// 마크다운 렌더러 (외부 라이브러리 불필요)
function MarkdownText({ children, className }: { children?: string; className?: string }) {
  if (!children) return null;
  const lines = children.split("\n");
  return (
    <span className={className}>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <Fragment key={li}>
            {parts.map((part, pi) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={pi}>{part.slice(2, -2)}</strong>;
              } else if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={pi}>{part.slice(1, -1)}</em>;
              }
              return <Fragment key={pi}>{part}</Fragment>;
            })}
            {li < lines.length - 1 && <br />}
          </Fragment>
        );
      })}
    </span>
  );
}

const ADVISOR_QUERIES: { type: AdvisorQueryType; label: string }[] = [
  { type: "credit_fees", label: "연회비 및 수수료 안내" },
  { type: "international_fees", label: "해외 이용 수수료 정보" },
  { type: "reviews", label: "카드 실사용 유저 리뷰" },
  { type: "how_to_apply", label: "신청 방법 및 자격 조건" },
  { type: "late_payment", label: "연체 및 이자 유의사항" },
  { type: "revolving", label: "리볼빙(결제이월) 정보" }
];
import { RecommendCard, RecommendResponse, CompareResponse } from "@/state/api";
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

// ─── Compare View ──────────────────────────────────────────────────────────────
const COMPARE_ROW_H = 56;
const COMPARE_HEADER_H = 220;

function benefitText(amount: number): string {
  if (amount <= 0) return "해당사항 없음";
  const man = Math.floor(amount / 10000);
  return man > 0 ? `최대 ${man}만원 할인` : `최대 ${amount.toLocaleString()}원 할인`;
}

function diffText(diff: number): { text: string; cls: string } {
  if (diff === 0) return { text: "해당없음", cls: "text-slate-300" };
  const man = Math.floor(Math.abs(diff) / 10000);
  const sign = diff > 0 ? "+" : "-";
  const label = man > 0 ? `${sign} 최대 ${man}만원` : `${sign} ${Math.abs(diff).toLocaleString()}원`;
  return { text: label, cls: diff > 0 ? "text-[#625BF5]" : "text-rose-400" };
}

function CompareView({
  data,
  userName,
  onAskCard,
}: {
  data: CompareResponse;
  userName?: string;
  onAskCard: (card: RecommendCard) => void;
}) {
  const { current_card, recommended_card, monthly_diff, yearly_diff, category_comparison, explanation } = data;

  const allCategories = useMemo(
    () => category_comparison.map((c) => c.category),
    [category_comparison]
  );

  const yearlyMan = Math.floor(Math.abs(yearly_diff) / 10000);
  const monthlyMan = Math.floor(Math.abs(monthly_diff) / 10000);
  const isGain = yearly_diff >= 0;

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12">
      <section className="mx-auto max-w-7xl">

        {/* ── 4단 비교 레이아웃 ── */}
        <div className="flex items-start gap-4">

          {/* 사이드바: 카테고리 라벨 */}
          <div
            className="flex shrink-0 flex-col"
            style={{ paddingTop: COMPARE_HEADER_H, width: 108 }}
          >
            {allCategories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-center"
                style={{ height: COMPARE_ROW_H }}
              >
                <div className="flex w-full items-center justify-center rounded-lg bg-[#F2F4F7] px-2 py-1 text-center text-xs font-semibold text-[#2D333F]">
                  {CATEGORY_KEY_TO_LABEL.get(cat as CategoryKey) || cat}
                </div>
              </div>
            ))}
          </div>

          {/* 현재 카드 */}
          <div className="flex flex-1 flex-col rounded-[28px] border border-slate-200 bg-white px-6 py-7 shadow-sm">
            {/* 헤더 */}
            <div style={{ minHeight: COMPARE_HEADER_H }} className="flex flex-col justify-between pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">기존카드</p>
                <h2 className="mt-1 text-xl font-bold text-[#2D333F] leading-tight truncate" title={current_card.card_name}>
                  {current_card.card_name}
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">{current_card.card_company} | 기타정보</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  예상 최대 월별 혜택금액{" "}
                  <span className="font-semibold text-slate-600">
                    {Math.floor(current_card.expected_monthly_benefit / 10000)}만원
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  1년간 사용했을 때 예상 혜택금액{" "}
                  <span className="text-lg font-extrabold text-[#2D333F] tabular-nums">
                    {formatKoreanAmount(current_card.expected_monthly_benefit * 12)}
                  </span>
                </p>
              </div>
            </div>

            {/* 카테고리 행 */}
            {allCategories.map((cat) => {
              const item = category_comparison.find((c) => c.category === cat);
              const val = item?.current_discount ?? 0;
              return (
                <div
                  key={cat}
                  className="flex items-center border-t border-slate-50 text-sm"
                  style={{ height: COMPARE_ROW_H }}
                >
                  <span className={val > 0 ? "text-slate-700 font-medium" : "text-slate-300"}>
                    {benefitText(val)}
                  </span>
                </div>
              );
            })}

            {/* 푸터 */}
            <div className="mt-5 border-t border-slate-100 pt-4 space-y-0.5 text-xs text-slate-400">
              <p>연회비 : {formatKoreanAmount(current_card.annual_fee)}</p>
              <p>전월실적 : {formatKoreanAmount(current_card.minimum_performance)}</p>
            </div>
            <button
              type="button"
              onClick={() => onAskCard(current_card)}
              className="mt-4 w-full rounded-xl bg-[#1e69ff] py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
            >
              더 물어보기
            </button>
          </div>

          {/* diff 열 */}
          <div className="flex w-[180px] shrink-0 flex-col items-center">
            {/* 헤더: 연간 혜택 차이 */}
            <div
              className="flex flex-col items-center justify-end pb-4 text-center"
              style={{ minHeight: COMPARE_HEADER_H }}
            >
              <p className="text-sm text-slate-500 leading-snug">새로운 카드로 바꾸시면 지금보다</p>
              <p className="mt-1 text-xl font-extrabold leading-tight text-[#2D333F]">
                연간 최대{" "}
                <span className={isGain ? "text-[#625BF5]" : "text-rose-500"}>
                  {yearlyMan}만원
                </span>{" "}
                정도
              </p>
              <p className="text-xl font-extrabold text-[#2D333F]">혜택을 더 받을 수 있어요!</p>
            </div>

            {/* 카테고리별 diff */}
            {allCategories.map((cat) => {
              const item = category_comparison.find((c) => c.category === cat);
              const { text, cls } = diffText(item?.diff ?? 0);
              return (
                <div
                  key={cat}
                  className={`flex w-full items-center justify-center border-t border-slate-50 text-sm font-bold tabular-nums ${cls}`}
                  style={{ height: COMPARE_ROW_H }}
                >
                  {text}
                </div>
              );
            })}

            {/* 월간 요약 */}
            <div className="mt-5 text-center">
              <span className={`text-sm font-bold ${isGain ? "text-[#625BF5]" : "text-rose-500"}`}>
                {isGain ? "+" : "-"} 월간 최대 {monthlyMan}만원 혜택
              </span>
            </div>
          </div>

          {/* 추천 카드 */}
          <div className="flex flex-1 flex-col rounded-[28px] border-2 border-[#625BF5] bg-[#EFEEFF] px-6 py-7 shadow-[0_20px_50px_rgba(98,91,245,0.12)]">
            {/* 헤더 */}
            <div style={{ minHeight: COMPARE_HEADER_H }} className="flex flex-col justify-between pb-4">
              <div>
                <span className="inline-block rounded-full bg-[#625BF5] px-3 py-0.5 text-[11px] font-bold text-white">
                  1순위
                </span>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">새로운 추천 카드</p>
                <h2 className="mt-1 text-xl font-bold text-[#2D333F] leading-tight truncate" title={recommended_card.card_name}>
                  {recommended_card.card_name}
                </h2>
                <p className="mt-0.5 text-sm text-slate-400">{recommended_card.card_company} | 기타정보</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  예상 최대 월별 혜택금액{" "}
                  <span className="font-semibold text-[#625BF5]">
                    {Math.floor(recommended_card.expected_monthly_benefit / 10000)}만원
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  1년간 사용했을 때 예상 혜택금액{" "}
                  <span className="text-lg font-extrabold text-[#625BF5] tabular-nums">
                    {formatKoreanAmount(recommended_card.expected_monthly_benefit * 12)}
                  </span>
                </p>
              </div>
            </div>

            {/* 카테고리 행 */}
            {allCategories.map((cat) => {
              const item = category_comparison.find((c) => c.category === cat);
              const val = item?.recommended_discount ?? 0;
              return (
                <div
                  key={cat}
                  className="flex items-center border-t border-indigo-100 text-sm"
                  style={{ height: COMPARE_ROW_H }}
                >
                  <span className={val > 0 ? "font-medium text-[#2D333F]" : "text-slate-300"}>
                    {benefitText(val)}
                  </span>
                </div>
              );
            })}

            {/* 푸터 */}
            <div className="mt-5 border-t border-indigo-100 pt-4 space-y-0.5 text-xs text-slate-400">
              <p>연회비 : {formatKoreanAmount(recommended_card.annual_fee)}</p>
              <p>전월실적 : {formatKoreanAmount(recommended_card.minimum_performance)}</p>
            </div>
            <button
              type="button"
              onClick={() => onAskCard(recommended_card)}
              className="mt-4 w-full rounded-xl bg-[#625BF5] py-3 text-sm font-bold text-white hover:bg-[#5148e0] transition-colors shadow-md shadow-[#625BF5]/20"
            >
              더 물어보기
            </button>
          </div>
        </div>

        {/* 큐레이션 */}
        <div className="mt-10 ml-[124px]">
          <header className="mb-4 flex items-center gap-2 text-base font-bold text-[#2D333F]">
            <span className="text-[#625BF5]">✦</span>
            <span>{userName || "고객"}님을 위한 맞춤 큐레이션</span>
          </header>
          <div className="rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-[#F2F4F7]">
            <div className="text-[16px] font-medium leading-[1.7] text-slate-600">
              <MarkdownText>{explanation}</MarkdownText>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── Main Results Page ─────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { state } = useAppState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);

  const [activeCard, setActiveCard] = useState<RecommendCard | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);

  const isCompareMode = state.comparisonMode === "COMPARE";

  useEffect(() => {
    async function load() {
      if (Object.keys(state.spendingData).length === 0) return;

      try {
        setLoading(true);
        setError(null);

        if (isCompareMode && state.selectedCurrentCard?.id) {
          const res = await fetchComparison(state);
          setCompareData(res);
        } else {
          const res = await fetchRecommendations(state);
          setData(res);
        }
      } catch (err: any) {
        setError(err.message || "정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [state]);

  const handleAdvisorQuery = async (queryType: AdvisorQueryType, label: string) => {
    if (!activeCard || qaLoading) return;
    try {
      setQaLoading(true);
      const res = await fetchAdvisorAnswer({ card_name: activeCard.card_name, query_type: queryType });
      setChat(prev => [...prev, { q: label, a: res.answer }]);
    } catch {
      setChat(prev => [...prev, { q: label, a: "죄송합니다. 답변을 가져오는 중 오류가 발생했습니다." }]);
    } finally {
      setQaLoading(false);
    }
  };

  const categories = useMemo(() => Object.keys(state.spendingData), [state.spendingData]);
  const recommendations = data?.recommended_cards || [];

  if (loading) return <main className="min-h-screen bg-[#f4f7fa] px-6 py-24"><LoadingSkeleton /></main>;

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fa] p-10">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-white">
          다시 시도
        </button>
      </main>
    );
  }

  // ── COMPARE 모드 ──
  if (isCompareMode && compareData) {
    return (
      <>
        <CompareView
          data={compareData}
          userName={state.userName}
          onAskCard={(card) => { setActiveCard(card); setChat([]); }}
        />
        {/* Side Sheet (공용) */}
        {activeCard && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setActiveCard(null)} />
            <aside role="dialog" aria-modal="true" className="absolute right-0 top-0 h-full w-[450px] bg-white p-8 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Card Assistant</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{activeCard.card_name}</h2>
                </div>
                <button onClick={() => setActiveCard(null)} className="rounded-full bg-slate-100 p-2 text-slate-500">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {chat.length === 0 && (
                  <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
                    <MarkdownText>{activeCard.explanation || "이 카드에 대해 궁금한 점을 물어보세요!"}</MarkdownText>
                  </div>
                )}
                {chat.map((m, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-tr-sm bg-[#625BF5] px-4 py-2 text-sm text-white max-w-[80%]">{m.q}</div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm text-slate-800 max-w-[80%]">
                        <MarkdownText>{m.a}</MarkdownText>
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
        )}
      </>
    );
  }

  // ── NEW 모드 (기존 추천 UI) ──
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-start gap-12">
          {/* [A] Category Indicators */}
          <div
            className="flex flex-col shrink-0"
            style={{ marginTop: UI_CONSTANTS.RESULTS.HEADER_OFFSET, width: UI_CONSTANTS.RESULTS.SIDEBAR_WIDTH }}
          >
            {categories.map((catKey) => (
              <div key={catKey} className="flex items-center justify-center" style={{ height: UI_CONSTANTS.RESULTS.ROW_HEIGHT }}>
                <div
                  className="flex w-full items-center justify-center rounded-lg bg-[#F2F4F7] px-2 text-center font-semibold text-[#2D333F]"
                  style={{ height: UI_CONSTANTS.RESULTS.SIDEBAR_INDICATOR_HEIGHT, fontSize: UI_CONSTANTS.RESULTS.FONT.SIDEBAR_LABEL }}
                >
                  {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                </div>
              </div>
            ))}
          </div>

          {/* [B] Horizontal Recommendation Scroll */}
          <div className="flex-1 overflow-x-auto pb-24 scrollbar-hide scroll-smooth -mx-6 px-6 lg:mx-0 lg:px-0">
            <div className="flex gap-10 min-w-max pr-12 pt-10">
              {recommendations
                .filter(card => card.expected_monthly_benefit > 0)
                .map((card, idx) => {
                  const isBest = idx === 0;
                  return (
                    <div key={card.card_id} className="relative w-[320px] shrink-0">
                      <div className={`flex flex-col rounded-[32px] px-[24px] py-[40px] transition-all h-full border box-border ${isBest ? "bg-[#EFEEFF] shadow-[0_20px_50px_rgba(98,91,245,0.15)] border-[#625BF5] z-10" : "bg-white shadow-sm border-slate-100 z-0"}`}>
                        <div className="h-[28px] mb-0 flex flex-col justify-start">
                          <div className={`inline-block rounded-full px-4 py-1 self-start text-[11px] font-bold text-white ${isBest ? "bg-[#625BF5]" : "bg-slate-400"}`}>
                            {idx + 1}순위 추천
                          </div>
                        </div>
                        <div className="h-[32px] mt-[12px] flex items-center">
                          <h2 className={`text-[22px] font-bold tracking-[-0.02em] leading-tight truncate ${isBest ? "text-[#2D333F]" : "text-slate-900"}`} title={card.card_name}>
                            {card.card_name}
                          </h2>
                        </div>
                        <div className="h-[32px] mt-1 mb-[18px] flex items-center">
                          <p className="text-[14px] font-medium text-slate-500">{card.card_company}</p>
                        </div>
                        <div className="h-[80px] flex flex-col justify-center">
                          <div className={`flex items-baseline gap-1 text-[13px] font-normal ${isBest ? "text-slate-500" : "text-slate-600"}`}>
                            <span>예상 월별 혜택</span>
                            <span className="font-bold tabular-nums text-[#625BF5]">{card.expected_monthly_benefit.toLocaleString()}원</span>
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
                              <div
                                key={catKey}
                                className={`flex items-center justify-between box-border ${isBest ? "" : "border-b last:border-0 border-slate-50"}`}
                                style={{ height: UI_CONSTANTS.RESULTS.ROW_HEIGHT }}
                              >
                                <span className={`font-medium leading-[1.6] ${isNot ? "text-slate-400" : isBest ? "text-slate-600" : "text-slate-500"}`} style={{ fontSize: UI_CONSTANTS.RESULTS.FONT.CARD_CATEGORY_LABEL }}>
                                  {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                                </span>
                                <span className={`font-bold tabular-nums leading-[1.6] ${isNot ? "text-slate-300" : isBest ? "text-[#625BF5]" : "text-slate-900"}`} style={{ fontSize: UI_CONSTANTS.RESULTS.FONT.CARD_CATEGORY_LABEL }}>
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
                              onClick={() => { setActiveCard(card); setChat([]); }}
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
        <div className="mt-12 ml-[148px]">
          <header className="mb-6 flex items-center gap-2 text-base font-bold text-[#2D333F]">
            <span className="text-[#625BF5]">✦</span>
            <span>{state.userName || "은정"}님을 위한 맞춤 큐레이션</span>
          </header>
          <div className="rounded-[24px] bg-white p-[32px] shadow-sm ring-1 ring-[#F2F4F7]">
            <div className="text-[16px] font-medium leading-[1.7] text-slate-600">
              <MarkdownText>{data?.explanation || "분석 결과를 생성 중입니다..."}</MarkdownText>
            </div>
          </div>
        </div>
      </section>

      {/* Side Sheet */}
      {activeCard ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActiveCard(null)} />
          <aside role="dialog" aria-modal="true" className="absolute right-0 top-0 h-full w-[450px] bg-white p-8 shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Card Assistant</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{activeCard.card_name}</h2>
              </div>
              <button onClick={() => setActiveCard(null)} className="rounded-full bg-slate-100 p-2 text-slate-500">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {chat.length === 0 && (
                <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
                  <MarkdownText>{activeCard.explanation || "이 카드에 대해 궁금한 점을 물어보세요!"}</MarkdownText>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm bg-[#625BF5] px-4 py-2 text-sm text-white max-w-[80%]">{m.q}</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm text-slate-800 max-w-[80%]">
                      <MarkdownText>{m.a}</MarkdownText>
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
