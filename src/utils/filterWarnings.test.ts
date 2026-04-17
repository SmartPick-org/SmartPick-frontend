import { describe, it, expect } from "vitest";
import { filterWarnings } from "./filterWarnings";

describe("filterWarnings", () => {
    it("빈 배열은 빈 배열을 반환한다", () => {
        expect(filterWarnings([])).toEqual([]);
    });

    it("null/undefined는 빈 배열을 반환한다", () => {
        expect(filterWarnings(null as any)).toEqual([]);
        expect(filterWarnings(undefined as any)).toEqual([]);
    });

    // --- 제거 대상 (내부 약관·실적 산정 규칙) ---

    it("'전월 실적 산정에서 제외되는 혜택'은 제거된다", () => {
        expect(filterWarnings(["전월 실적 산정에서 제외되는 혜택"])).toEqual([]);
    });

    it("'전월 실적 산정에서 제외되는 카테고리 제외'는 제거된다", () => {
        expect(filterWarnings(["전월 실적 산정에서 제외되는 카테고리 제외"])).toEqual([]);
    });

    it("'할인 받은 이용 건 취소 시 할인한도가 즉시 복원되지 않을 수 있음'은 제거된다", () => {
        expect(filterWarnings(["할인 받은 이용 건 취소 시 할인한도가 즉시 복원되지 않을 수 있음"])).toEqual([]);
    });

    it("'상환 잔액은 현금 청구될 수 있음'은 제거된다", () => {
        expect(filterWarnings(["상환 잔액은 현금 청구될 수 있음"])).toEqual([]);
    });

    it("'상환 잔액은 현금 청구될 수 있으며...' 는 제거된다", () => {
        expect(filterWarnings(["상환 잔액은 현금 청구될 수 있으며, 1 M포인트 = 1원으로 환산 적용"])).toEqual([]);
    });

    it("'단기카드대출(현금서비스), 장기카드대출...'으로 시작하는 긴 약관 문구는 제거된다", () => {
        const longText = "단기카드대출(현금서비스), 장기카드대출(카드론), 연회비, 각종 수수료 및 이자, 거래 취소금액...";
        expect(filterWarnings([longText])).toEqual([]);
    });

    it("'할인 적용 제외 대상: 무이자할부...'로 시작하는 긴 약관 문구는 제거된다", () => {
        const longText = "할인 적용 제외 대상: 무이자할부(부분 무이자 포함) 이용거래, 기프트카드/선불카드 구매...";
        expect(filterWarnings([longText])).toEqual([]);
    });

    it("'장기카드대출(카드론), 단기카드대출...'로 시작하는 긴 약관 문구는 제거된다", () => {
        const longText = "장기카드대출(카드론), 단기카드대출(현금서비스), 연회비, 제수수료, 이자...";
        expect(filterWarnings([longText])).toEqual([]);
    });

    // --- 유지 대상 (유저 행동에 직접 영향을 주는 조건) ---

    it("오프라인 결제 조건 경고는 유지된다", () => {
        const w = "오프라인 매장 이용 시에만 적립";
        expect(filterWarnings([w])).toEqual([w]);
    });

    it("이용 횟수/한도 조건은 유지된다", () => {
        const w = "각 영역별 일 1회, 월 10회 할인 적용 (1회 승인금액 1만원까지 할인, 1회 최대 1천원 할인)";
        expect(filterWarnings([w])).toEqual([w]);
    });

    it("전월 실적 조건 경고는 유지된다", () => {
        const w = "전월 실적 50만원 미만 시 적립 불가 (신규 발급 시 카드 수령 등록월 다음 달 이용 건까지는 예외)";
        expect(filterWarnings([w])).toEqual([w]);
    });

    it("배달앱 제외 경고는 유지된다", () => {
        const w = "배달앱을 통한 거래는 적립되지 않음";
        expect(filterWarnings([w])).toEqual([w]);
    });

    it("알뜰폰 제외 경고는 유지된다", () => {
        const w = "알뜰폰 제외";
        expect(filterWarnings([w])).toEqual([w]);
    });

    // --- 혼합 케이스 ---

    it("제거 대상과 유지 대상이 섞인 배열에서 제거 대상만 필터링한다", () => {
        const input = [
            "전월 실적 산정에서 제외되는 혜택",           // 제거
            "오프라인 매장 이용 시에만 적립",              // 유지
            "할인 받은 이용 건 취소 시 할인한도가 즉시 복원되지 않을 수 있음", // 제거
            "배달앱을 통한 거래는 적립되지 않음",          // 유지
        ];
        expect(filterWarnings(input)).toEqual([
            "오프라인 매장 이용 시에만 적립",
            "배달앱을 통한 거래는 적립되지 않음",
        ]);
    });

    it("제거 대상이 없으면 원본 배열과 동일하게 반환한다", () => {
        const input = ["알뜰폰 제외", "오프라인 현장 결제 건에 한함"];
        expect(filterWarnings(input)).toEqual(input);
    });
});
