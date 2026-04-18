"use client";

import React, { useState, useMemo } from "react";
import { RecommendCard } from "@/state/api";
import { roundTo500 } from "@/utils/finance";
import { filterWarnings } from "@/utils/filterWarnings";
import { CATEGORY_KEY_TO_LABEL } from "@/state/categories";

interface Props {
    card: RecommendCard;
    onClose: () => void;
    onReRecommend: (excludedIds: string[]) => void;
    isLoading?: boolean;
    initialExcludedIds?: string[];
}

export default function BenefitReceipt({ card, onClose, onReRecommend, isLoading, initialExcludedIds = [] }: Props) {
    const initialIds = useMemo(() =>
        card.applied_benefits_trace?.map(b => b.benefit_id) || [],
        [card.applied_benefits_trace]
    );

    // 이전에 해제한 항목은 비활성 상태로 초기화
    const [checkedIds, setCheckedIds] = useState<Set<string>>(
        new Set(initialIds.filter(id => !initialExcludedIds.includes(id)))
    );

    // 열릴 때 기준으로 정렬 고정 (활성 → 비활성 순, 세션 내 위치 안 바뀜)
    const sortedItems = useMemo(() => {
        const items = card.applied_benefits_trace ?? [];
        const active = items.filter(b => !initialExcludedIds.includes(b.benefit_id));
        const inactive = items.filter(b => initialExcludedIds.includes(b.benefit_id));
        return [...active, ...inactive];
    }, [card.applied_benefits_trace, initialExcludedIds]);

    const toggleBenefit = (id: string) => {
        const next = new Set(checkedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCheckedIds(next);
    };

    const currentTotal = useMemo(() => {
        if (!card.applied_benefits_trace) return 0;
        const sum = card.applied_benefits_trace
            .filter(b => checkedIds.has(b.benefit_id))
            .reduce((acc, b) => acc + b.yielded_discount, 0);
        return roundTo500(sum);
    }, [card.applied_benefits_trace, checkedIds]);

    const excludedIds = useMemo(() => {
        return initialIds.filter(id => !checkedIds.has(id));
    }, [initialIds, checkedIds]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-[420px] animate-in fade-in zoom-in duration-300">
                {/* Receipt Paper UI */}
                <div className="bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
                    style={{
                        clipPath: "polygon(0 0, 100% 0, 100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0% 100%)"
                    }}>

                    {/* Header */}
                    <div className="relative px-8 pt-8 pb-4 flex flex-col items-center text-center">
                        <button
                            aria-label="닫기"
                            onClick={onClose}
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors text-[16px]"
                        >
                            ✕
                        </button>
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">예상 최대 혜택 영수증</h3>
                        <h2 className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight">{card.card_name}</h2>
                        <p className="text-[11px] text-slate-400 mt-3">원하는 혜택만 선택하여 다시 추천받을 수 있어요</p>
                    </div>

                    {/* Column labels + Divider (non-scroll) */}
                    <div className="px-8 pb-3">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[11px] font-medium text-slate-400 tracking-wide">상세 혜택</p>
                            <p className="text-[11px] font-medium text-slate-400 tracking-wide">최대 혜택 금액</p>
                        </div>
                        <div className="border-b-2 border-dashed border-slate-100" />
                    </div>

                    {/* Body — 혜택 목록만 스크롤 */}
                    <div className="flex-1 overflow-y-auto px-8 pt-4 pb-2 scrollbar-hide">
                        <div className="space-y-4">
                            {sortedItems.length > 0 ? (
                                sortedItems.map((item) => (
                                    <div key={item.benefit_id} className="flex items-start gap-4 group cursor-pointer" onClick={() => toggleBenefit(item.benefit_id)}>
                                        <div className="pt-0.5">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${checkedIds.has(item.benefit_id)
                                                ? "bg-[#625BF5] border-[#625BF5] text-white"
                                                : "bg-white border-slate-200"
                                                }`}>
                                                {checkedIds.has(item.benefit_id) && <span className="text-[12px] font-bold">✓</span>}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-baseline gap-2">
                                                <span className={`text-[13px] font-semibold transition-colors ${checkedIds.has(item.benefit_id) ? "text-slate-600" : "text-slate-300 line-through"
                                                    }`}>
                                                    {CATEGORY_KEY_TO_LABEL.get(item.category as any) || item.category || "기본/전체"}
                                                </span>
                                                <span className={`tabular-nums font-extrabold text-[15px] transition-colors ${checkedIds.has(item.benefit_id) ? "text-[#625BF5]" : "text-slate-300"
                                                    }`}>
                                                    {roundTo500(item.yielded_discount).toLocaleString()}원
                                                </span>
                                            </div>
                                            <p className={`text-[12px] leading-relaxed transition-colors ${checkedIds.has(item.benefit_id) ? "text-slate-500" : "text-slate-300"
                                                }`}>
                                                {item.content}
                                            </p>
                                            {checkedIds.has(item.benefit_id) && filterWarnings(item.warnings).map((w, idx) => (
                                                <p key={idx} className="text-[10px] text-[#9B96F8] leading-[1.15] mt-0.5">
                                                    {w}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm">확인 가능한 상세 데이터가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* Action Footer — 비스크롤 */}
                    <div className="px-8 pt-3 pb-8 bg-white flex flex-col gap-2">
                        {/* Checked Total */}
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Checked Total</span>
                            <span className="text-[28px] font-extrabold text-slate-900 tabular-nums tracking-tighter">
                                {currentTotal.toLocaleString()}원
                            </span>
                        </div>
                        <button
                            onClick={() => onReRecommend(excludedIds)}
                            disabled={isLoading || checkedIds.size === 0}
                            className="w-full h-11 rounded-2xl bg-[#625BF5] text-white font-bold text-[16px] shadow-xl shadow-[#625BF5]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "분석 중..." : "선택한 혜택으로 다시 추천받기"}
                        </button>
                        <p className="text-[8px] text-slate-400 text-center leading-snug mt-0.5">
                            입력하신 소비 예산 기반으로 계산된 최대 혜택입니다. 실제 소비액에 따라 달라질 수 있습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
