"use client";

import React, { useState, useMemo } from "react";
import { RecommendCard, BenefitReceiptItem } from "@/state/api";
import { roundTo500 } from "@/utils/finance";
import { CATEGORY_KEY_TO_LABEL } from "@/state/categories";

interface Props {
    card: RecommendCard;
    onClose: () => void;
    onReRecommend: (excludedIds: string[]) => void;
    isLoading?: boolean;
}

export default function BenefitReceipt({ card, onClose, onReRecommend, isLoading }: Props) {
    // 체크된 혜택 ID 세트 (기본값: 전체 체크)
    const initialIds = useMemo(() =>
        card.benefit_receipt?.map(b => b.benefit_id) || [],
        [card.benefit_receipt]
    );

    const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialIds));

    const toggleBenefit = (id: string) => {
        const next = new Set(checkedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCheckedIds(next);
    };

    const currentTotal = useMemo(() => {
        if (!card.benefit_receipt) return 0;
        const sum = card.benefit_receipt
            .filter(b => checkedIds.has(b.benefit_id))
            .reduce((acc, b) => acc + b.amount_krw, 0);
        return roundTo500(sum);
    }, [card.benefit_receipt, checkedIds]);

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
                <div className="bg-white shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                    style={{
                        clipPath: "polygon(0 0, 100% 0, 100% 98%, 97% 100%, 94% 98%, 91% 100%, 88% 98%, 85% 100%, 82% 98%, 79% 100%, 76% 98%, 73% 100%, 70% 98%, 67% 100%, 64% 98%, 61% 100%, 58% 98%, 55% 100%, 52% 98%, 49% 100%, 46% 98%, 43% 100%, 40% 98%, 37% 100%, 34% 98%, 31% 100%, 28% 98%, 25% 100%, 22% 98%, 19% 100%, 16% 98%, 13% 100%, 10% 98%, 7% 100%, 4% 98%, 0% 100%)"
                    }}>

                    {/* Header */}
                    <div className="p-8 border-b-2 border-dashed border-slate-100 flex flex-col items-center text-center">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">SmartPick Receipt</h3>
                        <h2 className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight">{card.card_name}</h2>
                        <p className="text-[14px] font-medium text-slate-500 mt-1">{card.card_company}</p>
                        <div className="mt-5 text-[11px] text-slate-300 font-mono tracking-tighter">
                            {new Date().toISOString().replace('T', ' ').slice(0, 19)} #0042
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                        <div className="space-y-4">
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Benefits Breakdown</p>

                            {card.benefit_receipt && card.benefit_receipt.length > 0 ? (
                                card.benefit_receipt.map((item) => (
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
                                                    {CATEGORY_KEY_TO_LABEL.get(item.category as any) || item.category}
                                                </span>
                                                <span className={`tabular-nums font-extrabold text-[15px] transition-colors ${checkedIds.has(item.benefit_id) ? "text-[#625BF5]" : "text-slate-300"
                                                    }`}>
                                                    {roundTo500(item.amount_krw).toLocaleString()}원
                                                </span>
                                            </div>
                                            <p className={`text-[12px] leading-relaxed transition-colors ${checkedIds.has(item.benefit_id) ? "text-slate-500" : "text-slate-300"
                                                }`}>
                                                {item.content}
                                            </p>
                                            {checkedIds.has(item.benefit_id) && item.warnings.map((w, idx) => (
                                                <p key={idx} className="text-[11px] text-indigo-400 font-medium leading-tight">{w}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-400 text-sm">확인 가능한 상세 데이터가 없습니다.</div>
                            )}
                        </div>

                        {/* Subtotal Preview */}
                        <div className="pt-6 border-t-2 border-dashed border-slate-100">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Checked Total</span>
                                <span className="text-[32px] font-extrabold text-slate-900 tabular-nums tracking-tighter">
                                    {currentTotal.toLocaleString()}원
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-8 pt-2 pb-12 bg-white flex flex-col gap-3">
                        <button
                            onClick={() => onReRecommend(excludedIds)}
                            disabled={isLoading || checkedIds.size === 0}
                            className="w-full h-14 rounded-2xl bg-[#625BF5] text-white font-bold text-[16px] shadow-xl shadow-[#625BF5]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "분석 중..." : "선택한 혜택 기반 재추천"}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 text-slate-400 font-bold text-[14px] transition-colors hover:text-slate-600"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
