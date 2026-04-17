const BLOCKED_EXACT = new Set([
    "전월 실적 산정에서 제외되는 혜택",
    "전월 실적 산정에서 제외되는 카테고리 제외",
    "할인 받은 이용 건 취소 시 할인한도가 즉시 복원되지 않을 수 있음",
    "상환 잔액은 현금 청구될 수 있음",
]);

const BLOCKED_PREFIX = [
    "상환 잔액은 현금 청구될 수 있으며",
    "단기카드대출(현금서비스), 장기카드대출",
    "장기카드대출(카드론), 단기카드대출",
    "할인 적용 제외 대상: 무이자할부",
];

export function filterWarnings(warnings: string[] | null | undefined): string[] {
    if (!warnings) return [];
    return warnings.filter(
        (w) => !BLOCKED_EXACT.has(w) && !BLOCKED_PREFIX.some((p) => w.startsWith(p))
    );
}
