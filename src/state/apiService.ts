import { AppState } from "./appState";
import { RecommendRequest, RecommendResponse, QARequest, QAResponse, AdvisorRequest, AdvisorResponse, CompareRequest, CompareResponse, RecalculateRequest, RecalculateResponse } from "./api";
import { SUB_CATEGORY_KEY_MAP } from "./categories";

import { API_V1, buildDefaultHeaders } from "./config";

export function transformStateToRecommendRequest(state: AppState): RecommendRequest {
    const category_spending: RecommendRequest["category_spending"] = {};

    Object.entries(state.spendingData).forEach(([top, total]) => {
        if (total <= 0) return;

        const subs = state.subCategoryRatios[top];
        const subObj: { total: number } & Record<string, number | string> = { total };

        if (subs && Object.keys(subs).length > 0) {
            Object.entries(subs).forEach(([subName, ratio]) => {
                const englishKey = SUB_CATEGORY_KEY_MAP[subName] || subName;
                subObj[englishKey] = `${ratio}%`;
            });
        }

        // [수정] Recommend API는 항상 객체 형태(CategoryBreakdown)를 기대합니다.
        category_spending[top] = subObj;
    });

    return {
        total_budget: state.totalBudget,
        category_spending,
    };
}

export async function fetchRecommendations(
    state: AppState,
    excluded_benefit_ids?: string[] | null,
    top_n?: number
): Promise<RecommendResponse> {
    const payload: RecommendRequest = {
        ...transformStateToRecommendRequest(state),
        top_n
    };

    console.log("🚀 API Request Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_V1}/cards/recommend`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...buildDefaultHeaders(API_V1)
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error Detail:", errorData);

        // 에러 메시지를 좀 더 자세하게 가공하여 표시
        const firstDetail = errorData.detail?.[0];
        const errorMsg = firstDetail
            ? `[${firstDetail.loc?.join('.') || 'Unknown'}] ${firstDetail.msg || 'Validation Error'}`
            : "Failed to fetch recommendations";

        throw new Error(errorMsg);
    }

    return response.json();
}

export async function askQuestion(recommendJson: string, question: string): Promise<QAResponse> {
    const payload: QARequest = {
        raw_data: recommendJson,
        question,
    };

    const response = await fetch(`${API_V1}/cards/qa`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...buildDefaultHeaders(API_V1)
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to get answer");
    }

    return response.json();
}

export async function fetchComparison(
    state: AppState,
    _excluded_benefit_ids?: string[] | null, // 사용되지 않는 파라미터임을 명시
    _top_n?: number
): Promise<CompareResponse> {
    if (!state.selectedCurrentCard?.id) {
        throw new Error("선택된 카드가 없습니다.");
    }
    const base = transformStateToRecommendRequest(state);

    const payload: CompareRequest = {
        ...base,
        current_card_id: state.selectedCurrentCard.id,
    };

    // [수정] Compare 명세에는 top_n과 excluded_benefit_ids가 없습니다.
    // 만약 미래에 지원될 예정이라면 API 문서를 확인 후 추가해야 합니다.

    console.log("🚀 Compare Request Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_V1}/cards/compare`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...buildDefaultHeaders(API_V1)
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Compare API Error:", errorData);
        throw new Error(errorData.detail?.[0]?.msg || "비교 정보를 가져오는 데 실패했습니다.");
    }

    return response.json();
}

export async function fetchAdvisorAnswer(req: AdvisorRequest): Promise<AdvisorResponse> {
    const url = `${API_V1}/advisor/ask`;
    console.log("🚀 Advisor Request URL:", url);
    console.log("🚀 Advisor Request Payload:", JSON.stringify(req, null, 2));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...buildDefaultHeaders(API_V1)
        },
        body: JSON.stringify(req),
    });

    if (!response.ok) {
        throw new Error("Failed to get advisor answer");
    }

    return response.json();
}

/** [추가] 혜택 토글(체크박스) 시 빠른 재계산을 위한 API */
export async function fetchRecalculate(
    state: AppState,
    recommendedCards: RecalculateRequest["recommended_cards"],
    excludedBenefitIds: string[]
): Promise<RecalculateResponse> {
    const base = transformStateToRecommendRequest(state);
    const payload: RecalculateRequest = {
        total_budget: base.total_budget,
        category_spending: base.category_spending,
        recommended_cards: recommendedCards,
        excluded_benefit_ids: excludedBenefitIds,
    };

    const response = await fetch(`${API_V1}/cards/recalculate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...buildDefaultHeaders(API_V1)
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("재계산에 실패했습니다.");
    }

    return response.json();
}
