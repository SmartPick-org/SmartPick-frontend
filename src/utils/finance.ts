import { RecommendCard } from "@/state/api";

/** 
 * SmartPick 금융 계산 규칙: 500원 단위 반올림
 */
export const roundTo500 = (val: number) => Math.round(val / 500) * 500;

/**
 * 1년 예상 혜택 계산 (연회비 차감 전)
 * - 백엔드가 내려주는 `expected_yearly_benefit`를 우선 사용합니다.
 * - 프론트에서 월*12 등으로 재계산하지 않습니다(정의 불일치 방지).
 */
export const calcExpectedYearlyBenefit = (card: RecommendCard) => {
    const yearly = card.expected_yearly_benefit;
    if (typeof yearly !== "number" || Number.isNaN(yearly)) return 0;
    return roundTo500(Math.max(0, yearly));
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
