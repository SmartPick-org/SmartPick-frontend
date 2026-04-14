import { RecommendCard } from "@/state/api";

/** 
 * SmartPick 금융 계산 규칙: 500원 단위 반올림
 */
export const roundTo500 = (val: number) => Math.round(val / 500) * 500;

/**
 * 1년 예상 순혜택 계산
 * (월 혜택 * 12) - 연회비
 */
export const calcYearlyNetBenefit = (card: RecommendCard) => {
    const monthly = roundTo500(card.expected_monthly_benefit);
    const annual = monthly * 12 - card.annual_fee;
    return roundTo500(Math.max(0, annual));
};

/**
 * 한국어 금액 포맷 (X만 Y천원)
 */
export const formatKoreanAmount = (amount: number) => {
    const rounded = roundTo500(amount);
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
