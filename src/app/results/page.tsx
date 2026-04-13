"use client";

import React, { useEffect, useState, useMemo, Fragment } from "react";
import { useAppState } from "@/state/appState";
import { fetchRecommendations, fetchComparison, fetchAdvisorAnswer } from "@/state/apiService";
import type { AdvisorQueryType } from "@/state/api";
import { UI_CONSTANTS } from "@/constants/ui";

// 마크다운 렌더러 (외부 라이브러리 불필요)
function renderInline(text: string): React.ReactNode[] {
  // Split on **bold**, *italic*, [link](url), and bare URLs
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 underline break-all">
          {linkMatch[1]}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 underline break-all">
          {part}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function MarkdownText({ children, className }: { children?: string; className?: string }) {
  if (!children) return null;
  const lines = children.split("\n");
  return (
    <div className={className}>
      {lines.map((line, li) => {
        const trimmed = line.trim();
        if (trimmed === "") return <div key={li} className="h-2" />;

        // Numbered section header: starts with digit(s) followed by . or ..
        if (/^\d+\.\.?\s/.test(trimmed)) {
          const text = trimmed.replace(/^\d+\.\.?\s*/, "");
          return (
            <p key={li} className="font-semibold mt-3 mb-1">
              {renderInline(text)}
            </p>
          );
        }

        // Bullet point: • or - at start
        if (trimmed.startsWith("•") || trimmed.startsWith("- ")) {
          const text = trimmed.replace(/^[•-]\s*/, "");
          return (
            <div key={li} className="flex gap-1.5 ml-2 my-0.5">
              <span className="shrink-0 mt-0.5 text-slate-500">•</span>
              <span>{renderInline(text)}</span>
            </div>
          );
        }

        // Note lines starting with ※
        if (trimmed.startsWith("※")) {
          return (
            <p key={li} className="text-xs text-slate-500 mt-1">
              {renderInline(trimmed)}
            </p>
          );
        }

        return <p key={li} className="my-0.5">{renderInline(trimmed)}</p>;
      })}
    </div>
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
import { RecommendCard, RecommendResponse, CompareResponse, CategoryComparison } from "@/state/api";
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

const roundTo500 = (val: number) => Math.round(val / 500) * 500;

const calcYearlyNetBenefit = (card: RecommendCard) => {
  const monthly = roundTo500(card.expected_monthly_benefit);
  const annual = monthly * 12 - card.annual_fee;
  return roundTo500(Math.max(0, annual));
};

// ─── Compare View ──────────────────────────────────────────────────────────────
const COMPARE_ROW_H = 56;
const COMPARE_HEADER_H = 220;

function benefitText(amount: number): string {
  if (amount <= 0) return "해당사항 없음";
  const rounded = roundTo500(amount);
  const man = Math.floor(rounded / 10000);
  return man > 0 ? `최대 ${man}만원 할인` : `최대 ${rounded.toLocaleString()}원 할인`;
}

function diffText(diff: number): { text: string; cls: string } {
  const rounded = roundTo500(diff);
  if (rounded === 0) return { text: "해당없음", cls: "text-slate-300" };
  const sign = rounded > 0 ? "+" : "-";
  const abs = Math.abs(rounded);
  // 모든 카테고리 동일하게 "± X,XXX원" 형식으로 통일
  const label = `${sign} ${abs.toLocaleString()}원`;
  return { text: label, cls: rounded > 0 ? "text-[#625BF5]" : "text-rose-400" };
}

/** current_card와 선택된 추천 카드의 category_breakdown으로 diff 동적 계산 */
function calcCategoryComparison(
  current: RecommendCard,
  recommended: RecommendCard
): CategoryComparison[] {
  const allCats = new Set([
    ...current.category_breakdown.map((c) => c.category),
    ...recommended.category_breakdown.map((c) => c.category),
  ]);
  return Array.from(allCats).map((cat) => {
    const currRaw = current.category_breakdown.find((c) => c.category === cat)?.monthly_discount_krw ?? 0;
    const recRaw = recommended.category_breakdown.find((c) => c.category === cat)?.monthly_discount_krw ?? 0;
    const curr = roundTo500(currRaw);
    const rec = roundTo500(recRaw);
    return { category: cat, current_discount: curr, recommended_discount: rec, diff: rec - curr };
  });
}

function CompareView({
  data,
  userName,
  userCategories,
  onAskCard,
}: {
  data: CompareResponse;
  userName?: string;
  userCategories: string[];
  onAskCard: (card: RecommendCard) => void;
}) {
  // [디버깅용 로그] 현재 카드 및 전체 데이터 계산 내역을 브라우저 콘솔에 먼저 출력합니다.
  useEffect(() => {
    console.log("=== [DEBUG] COMPARE VIEW 백엔드 응답 데이터 ===");
    console.log("1. 프론트에 전달받은 유저의 전체 데이터 (CompareResponse):", data);
    console.log("2. 현재 사용자의 기존 카드 (current_card) 객체 상태:", data.current_card);
    console.log("3. 유저가 최초에 선택한 상위 카테고리 목록:", userCategories);
    console.log("4. 백엔드가 계산해서 준 양쪽 카드 비교 결과 (category_comparison):", data.category_comparison);
    console.log("=============================================");
  }, [data, userCategories]);

  const { current_card, explanation } = data;

  // 백엔드 신규 형태(recommended_cards 배열) 우선, 없으면 단일 카드로 폴백
  const allRecommended = useMemo(() => {
    const list = data.recommended_cards ?? [data.recommended_card];
    return list
      .filter((c) => c.expected_monthly_benefit > 0 && c.expected_monthly_benefit > current_card.expected_monthly_benefit)
      .sort((a, b) => calcYearlyNetBenefit(b) - calcYearlyNetBenefit(a));
  }, [data, current_card]);

  const [selectedIdx, setSelectedIdx] = useState(0);

  const selectedCard = allRecommended[selectedIdx] ?? allRecommended[0];

  // 선택된 추천 카드 기준으로 diff 동적 계산
  const activeCategoryComparison = useMemo(
    () => (selectedCard ? calcCategoryComparison(current_card, selectedCard) : data.category_comparison),
    [selectedCard, current_card, data.category_comparison]
  );

  const activeMonthlyDiff = selectedCard
    ? selectedCard.expected_monthly_benefit - current_card.expected_monthly_benefit
    : data.monthly_diff;
  const activeYearlyDiff = selectedCard
    ? calcYearlyNetBenefit(selectedCard) - calcYearlyNetBenefit(current_card)
    : data.yearly_diff;

  // allCategories는 유저가 입력한(선택한) 카테고리를 그대로 사용합니다.
  const allCategories = userCategories;

  const formatRoundedDiff = (val: number) => {
    const rounded = roundTo500(Math.abs(val));
    const man = Math.floor(rounded / 10000);
    const cheon = Math.floor((rounded % 10000) / 1000);
    if (man > 0) return cheon > 0 ? `${man}만 ${cheon}천` : `${man}만`;
    return `${cheon}천`;
  };

  const yearlyDiffStr = formatRoundedDiff(activeYearlyDiff);
  const monthlyDiffStr = formatRoundedDiff(activeMonthlyDiff);
  const isGain = activeYearlyDiff >= 0;

  if (!selectedCard) {
    return (
      <main className="min-h-screen bg-white px-6 py-12 md:px-12 flex flex-col items-center justify-center">
        <div className="text-center bg-slate-50 p-12 rounded-[32px] max-w-2xl mx-auto shadow-sm border border-slate-100">
          <span className="text-5xl block mb-6">🏆</span>
          <h2 className="text-2xl font-bold text-slate-900 leading-snug">현재 카드가 최상의 효율입니다!</h2>
          <p className="mt-4 text-slate-500 leading-relaxed">
            분석 결과, 현재 사용 중인 <span className="font-semibold text-slate-700">{current_card.card_name}</span>의 <br />
            예상 혜택(<span className="font-semibold text-[#625BF5]">{formatKoreanAmount(calcYearlyNetBenefit(current_card))}</span>/연)보다 더 좋은 대안을 찾지 못했습니다. <br />
            지금처럼 슬기로운 소비 생활을 계속 유지해 주세요!
          </p>
          <div className="mt-8">
            <button onClick={() => window.location.href = "/"} className="rounded-xl bg-[#625BF5] px-8 py-3 font-bold text-white transition-all hover:bg-[#5148e0] shadow-md shadow-[#625BF5]/20">
              홈으로 가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12">
      <section className="mx-auto max-w-7xl">

        {/* ── 4단 비교 레이아웃 ── */}
        <div className="flex justify-start items-start gap-3 lg:gap-5 pb-12 overflow-x-auto min-w-[max-content]">

          {/* 카테고리 라벨 컬럼 */}
          <div className="flex flex-col w-[110px] shrink-0">
            <div className="h-10 mb-2" /> {/* alignment spacer for top */}
            <div className="h-[292px] w-full" /> {/* card border(2px)+padding(40px)+header(250px) */}
            <div className="flex flex-col w-full">
              {allCategories.map((catKey) => (
                <div
                  key={catKey}
                  className="flex items-center justify-end pr-2 border-b last:border-0 border-transparent box-border"
                  style={{ height: UI_CONSTANTS.RESULTS.ROW_HEIGHT }}
                >
                  <div className="flex w-[90px] h-[34px] items-center justify-center rounded-lg bg-[#F2F4F7] text-center text-[13px] font-semibold text-[#515767]">
                    {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 현재 카드 Column */}
          <div className="flex flex-col">
            <div className="h-10 mb-2" /> {/* alignment spacer */}
            <div className="relative w-[320px] shrink-0">
              <div className="flex flex-col rounded-[32px] px-[24px] py-[40px] transition-all h-full border box-border bg-white shadow-sm border-slate-100 z-0">
                <div className="h-[250px] flex flex-col justify-start">
                  <div className="h-[28px] mb-0 flex flex-col justify-start">
                    <div className="inline-block rounded-full px-4 py-1 self-start text-[11px] font-bold text-white bg-slate-400">
                      기존 카드
                    </div>
                  </div>
                  <div className="h-[32px] mt-[12px] flex items-center">
                    <h2 className="text-[22px] font-bold tracking-[-0.02em] leading-tight truncate text-slate-900" title={current_card.card_name}>
                      {current_card.card_name}
                    </h2>
                  </div>
                  <div className="h-[32px] mt-1 mb-[18px] flex items-center">
                    <p className="text-[14px] font-medium text-slate-500">{current_card.card_company}</p>
                  </div>
                  <div className="h-[80px] flex flex-col justify-center">
                    <div className="flex items-baseline gap-1 text-[13px] font-normal text-slate-600">
                      <span>예상 월별 혜택</span>
                      <span className="font-bold tabular-nums text-[#625BF5]">{roundTo500(current_card.expected_monthly_benefit).toLocaleString()}원</span>
                    </div>
                    <div className="mt-1">
                      <p className="text-[13px] font-bold text-slate-900">1년 예상 혜택</p>
                      <div className="leading-tight tabular-nums font-extrabold text-slate-900">
                        <span className="text-[32px]">{Math.floor(calcYearlyNetBenefit(current_card) / 10000)}</span>
                        <span className="text-[18px]">만</span>
                        {(calcYearlyNetBenefit(current_card) % 10000) >= 1000 && (
                          <>
                            <span className="ml-1 text-[32px]">{Math.floor((calcYearlyNetBenefit(current_card) % 10000) / 1000)}</span>
                            <span className="text-[18px]">천</span>
                          </>
                        )}
                        {(calcYearlyNetBenefit(current_card) % 1000) > 0 && (
                          <span className="ml-1 text-[24px]">{calcYearlyNetBenefit(current_card) % 1000}</span>
                        )}
                        <span className="text-[18px]">원</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full">
                  {allCategories.map((catKey) => {
                    const b = activeCategoryComparison.find(item => item.category === catKey);
                    const val = b?.current_discount ?? 0;
                    const isNot = val <= 0;
                    return (
                      <div key={catKey} className="flex items-center justify-between box-border border-b last:border-0 border-slate-50" style={{ height: UI_CONSTANTS.RESULTS.ROW_HEIGHT }}>
                        <span className={`font-medium leading-[1.6] ${isNot ? "text-slate-400" : "text-slate-500"}`} style={{ fontSize: UI_CONSTANTS.RESULTS.FONT.CARD_CATEGORY_LABEL }}>
                          {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                        </span>
                        <span className={`font-bold tabular-nums leading-[1.6] ${isNot ? "text-slate-300" : "text-slate-900"}`} style={{ fontSize: UI_CONSTANTS.RESULTS.FONT.CARD_CATEGORY_LABEL }}>
                          {isNot ? "0원" : `${roundTo500(val).toLocaleString()}원`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <footer className="mt-auto pt-6 flex flex-col">
                  <div className="flex flex-col gap-1 text-[12px] font-normal text-slate-400">
                    <p>연회비 : <span className="tabular-nums">{current_card.annual_fee.toLocaleString()}원</span></p>
                    <p>전월실적 : <span className="tabular-nums">{current_card.minimum_performance.toLocaleString()}원</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAskCard(current_card)}
                    className="mt-[24px] flex h-[52px] w-full items-center justify-center rounded-[12px] text-[16px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#1e69ff] text-white shadow-md shadow-blue-500/10"
                  >
                    더 물어보기
                  </button>
                </footer>
              </div>
            </div>
          </div>

          {/* diff 열 */}
          <div className="flex flex-col">
            <div className="h-10 mb-2" /> {/* alignment spacer */}
            <div className="flex w-[260px] shrink-0 flex-col items-center">
              <div className="h-[250px] flex flex-col items-center justify-center text-center mt-[40px]">
                <p className="text-sm text-slate-500 leading-snug">새로운 카드로 바꾸시면</p>
                <p className="mt-1 text-[22px] font-extrabold leading-tight text-[#2D333F]">
                  연간 최대{" "}
                  <span className={isGain ? "text-[#625BF5]" : "text-rose-500"}>
                    {yearlyDiffStr}원
                  </span>{" "}
                  정도
                </p>
                <p className="text-[22px] font-extrabold text-[#2D333F]">혜택을 더 받을 수 있어요!</p>
              </div>

              <div className="w-full flex flex-col">
                {allCategories.map((catKey) => {
                  const item = activeCategoryComparison.find((c) => c.category === catKey);
                  const { text, cls } = diffText(item?.diff ?? 0);
                  return (
                    <div
                      key={catKey}
                      className={`flex items-center justify-center border-t border-transparent text-[14px] font-bold tabular-nums ${cls}`}
                      style={{ height: UI_CONSTANTS.RESULTS.ROW_HEIGHT }}
                    >
                      {text}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <span className={`text-[14px] font-bold ${isGain ? "text-[#625BF5]" : "text-rose-500"}`}>
                  {isGain ? "+" : "-"} 월 최대 {monthlyDiffStr}원 이득
                </span>
              </div>
            </div>
          </div>

          {/* 추천 카드 영역 (스와이프 네비게이션) */}
          <div className="flex flex-col">
            <div className="h-10 mb-2 flex items-center justify-between px-4">
              {allRecommended.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedIdx((i) => Math.max(0, i - 1))}
                    disabled={selectedIdx === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-400 disabled:opacity-30"
                    aria-label="이전 카드"
                  >
                    ←
                  </button>
                  <div className="flex gap-1.5">
                    {allRecommended.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedIdx(i)}
                        className={`h-2 rounded-full transition-all ${i === selectedIdx ? "w-6 bg-[#625BF5]" : "w-2 bg-slate-200"}`}
                        aria-label={`${i + 1}번 카드`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIdx((i) => Math.min(allRecommended.length - 1, i + 1))}
                    disabled={selectedIdx === allRecommended.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-400 disabled:opacity-30"
                    aria-label="다음 카드"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className="relative w-[320px] shrink-0">
              <div className="flex flex-col rounded-[32px] px-[24px] py-[40px] transition-all h-full border-2 box-border bg-[#EFEEFF] shadow-[0_20px_50px_rgba(98,91,245,0.15)] border-[#625BF5] z-10">
                <div className="h-[250px] flex flex-col justify-start">
                  <div className="h-[28px] mb-0 flex flex-col justify-start">
                    <div className="inline-block rounded-full px-4 py-1 self-start text-[11px] font-bold text-white bg-[#625BF5]">
                      {selectedIdx + 1}순위 추천
                    </div>
                  </div>
                  <div className="h-[32px] mt-[12px] flex items-center">
                    <h2 className="text-[22px] font-bold tracking-[-0.02em] leading-tight truncate text-[#2D333F]" title={selectedCard.card_name}>
                      {selectedCard.card_name}
                    </h2>
                  </div>
                  <div className="h-[32px] mt-1 mb-[18px] flex items-center">
                    <p className="text-[14px] font-medium text-slate-500">{selectedCard.card_company}</p>
                  </div>
                  <div className="h-[80px] flex flex-col justify-center">
                    <div className="flex items-baseline gap-1 text-[13px] font-normal text-slate-500">
                      <span>예상 월별 혜택</span>
                      <span className="font-bold tabular-nums text-[#625BF5]">{roundTo500(selectedCard.expected_monthly_benefit).toLocaleString()}원</span>
                    </div>
                    <div className="mt-1">
                      <p className="text-[13px] font-bold text-[#2D333F]">1년 예상 혜택</p>
                      <div className="leading-tight tabular-nums font-extrabold text-[#2D333F]">
                        <span className="text-[32px] text-[#625BF5]">{Math.floor(calcYearlyNetBenefit(selectedCard) / 10000)}</span>
                        <span className="text-[18px]">만</span>
                        {(calcYearlyNetBenefit(selectedCard) % 10000) >= 1000 && (
                          <>
                            <span className="ml-1 text-[32px] text-[#625BF5]">{Math.floor((calcYearlyNetBenefit(selectedCard) % 10000) / 1000)}</span>
                            <span className="text-[18px]">천</span>
                          </>
                        )}
                        {(calcYearlyNetBenefit(selectedCard) % 1000) > 0 && (
                          <span className="ml-1 text-[24px] text-[#625BF5]">{calcYearlyNetBenefit(selectedCard) % 1000}</span>
                        )}
                        <span className="text-[18px]">원</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full">
                  {allCategories.map((catKey) => {
                    const b = activeCategoryComparison.find(item => item.category === catKey);
                    const val = b?.recommended_discount ?? 0;
                    const isNot = val <= 0;
                    return (
                      <div key={catKey} className="flex items-center justify-between box-border border-b last:border-0 border-indigo-100/50" style={{ height: UI_CONSTANTS.RESULTS.ROW_HEIGHT }}>
                        <span className={`font-medium leading-[1.6] ${isNot ? "text-slate-400" : "text-slate-600"}`} style={{ fontSize: UI_CONSTANTS.RESULTS.FONT.CARD_CATEGORY_LABEL }}>
                          {CATEGORY_KEY_TO_LABEL.get(catKey as any) || catKey}
                        </span>
                        <span className={`font-bold tabular-nums leading-[1.6] ${isNot ? "text-slate-300" : "text-[#625BF5]"}`} style={{ fontSize: UI_CONSTANTS.RESULTS.FONT.CARD_CATEGORY_LABEL }}>
                          {isNot ? "0원" : `${val.toLocaleString()}원`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <footer className="mt-auto pt-6 flex flex-col">
                  <div className="flex flex-col gap-1 text-[12px] font-normal text-slate-500">
                    <p>연회비 : <span className="tabular-nums">{selectedCard.annual_fee.toLocaleString()}원</span></p>
                    <p>전월실적 : <span className="tabular-nums">{selectedCard.minimum_performance.toLocaleString()}원</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAskCard(selectedCard)}
                    className="mt-[24px] flex h-[52px] w-full items-center justify-center rounded-[12px] text-[16px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#625BF5] text-white shadow-md shadow-[#625BF5]/20"
                  >
                    더 물어보기
                  </button>
                </footer>
              </div>
            </div>
          </div>
        </div>

        {/* 큐레이션 */}
        <div className="mt-10 ml-[124px]">
          <header className="mb-4 flex items-center gap-2 text-base font-bold text-[#2D333F]">
            <span className="text-[#625BF5]">✦</span>
            <span>{userName || "고객"}님을 위한 맞춤 큐레이션</span>
          </header>
          <div className="rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
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
    // spendingData가 아직 없으면 hydration 대기
    if (Object.keys(state.spendingData).length === 0) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (isCompareMode) {
          if (!state.selectedCurrentCard?.id) {
            setError("선택된 카드 정보가 없습니다. 카드를 다시 선택해주세요.");
            return;
          }
          const res = await fetchComparison(state);
          setCompareData(res);
        } else {
          const res = await fetchRecommendations(state);
          setData(res);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
    // 실제로 결과에 영향을 주는 값만 의존성으로 지정 (state 전체 X)
  }, [state.spendingData, state.subCategoryRatios, state.totalBudget, state.comparisonMode, state.selectedCurrentCard]);

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
  const recommendations = useMemo(
    () =>
      (data?.recommended_cards || [])
        .filter((c) => c.expected_monthly_benefit > 0)
        .slice()
        .sort((a, b) => calcYearlyNetBenefit(b) - calcYearlyNetBenefit(a)),
    [data]
  );

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
          userCategories={categories}
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
              <p className="mt-4 text-xs text-slate-400">아래 버튼을 눌러 원하시는 정보를 확인해보세요.</p>
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
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
                            <span className="font-bold tabular-nums text-[#625BF5]">{roundTo500(card.expected_monthly_benefit).toLocaleString()}원</span>
                          </div>
                          <div className="mt-1">
                            <p className={`text-[13px] font-bold ${isBest ? "text-[#2D333F]" : "text-slate-900"}`}>1년 예상 혜택</p>
                            <div className={`leading-tight tabular-nums font-extrabold ${isBest ? "text-[#2D333F]" : "text-slate-900"}`}>
                              <span className={`text-[32px] ${isBest ? "text-[#625BF5]" : ""}`}>{Math.floor(calcYearlyNetBenefit(card) / 10000)}</span>
                              <span className="text-[18px]">만</span>
                              {(calcYearlyNetBenefit(card) % 10000) >= 1000 && (
                                <>
                                  <span className={`ml-1 text-[32px] ${isBest ? "text-[#625BF5]" : ""}`}>{Math.floor((calcYearlyNetBenefit(card) % 10000) / 1000)}</span>
                                  <span className="text-[18px]">천</span>
                                </>
                              )}
                              {(calcYearlyNetBenefit(card) % 1000) > 0 && (
                                <span className={`ml-1 text-[24px] ${isBest ? "text-[#625BF5]" : ""}`}>{calcYearlyNetBenefit(card) % 1000}</span>
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
                                  {isNot ? "0원" : `${roundTo500(b.monthly_discount_krw).toLocaleString()}원`}
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
                          <button
                            type="button"
                            onClick={() => { setActiveCard(card); setChat([]); }}
                            className={`mt-[24px] flex h-[52px] w-full items-center justify-center rounded-[12px] text-[16px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${isBest ? "bg-[#625BF5] text-white shadow-md shadow-[#625BF5]/20" : "bg-[#1e69ff] text-white shadow-md shadow-blue-500/10"}`}
                          >
                            더 물어보기
                          </button>
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
          <div className="rounded-[24px] bg-white p-[32px] shadow-sm ring-1 ring-slate-200">
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
            <p className="mt-4 text-xs text-slate-400">아래 버튼을 눌러 원하시는 정보를 확인해보세요.</p>
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
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
