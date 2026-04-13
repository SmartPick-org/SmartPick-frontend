import { AppState } from "./appState";
import { RecommendRequest, RecommendResponse, QARequest, QAResponse, AdvisorRequest, AdvisorResponse, CompareRequest, CompareResponse } from "./api";
import { SUB_CATEGORY_KEY_MAP } from "./categories";

import { API_V1, buildDefaultHeaders } from "./config";

export function transformStateToRecommendRequest(state: AppState): RecommendRequest {
    const category_spending: RecommendRequest["category_spending"] = {};

    Object.entries(state.spendingData).forEach(([top, total]) => {
        // [수정] 금액이 0원 이하인 카테고리는 서버 연산 오류(Division by zero 등) 방지를 위해 제외합니다.
        if (total <= 0) return;

        const subs = state.subCategoryRatios[top];
        if (subs && Object.keys(subs).length > 0) {
            const subObj: { total: number } & Record<string, number | string> = { total };
            Object.entries(subs).forEach(([subName, ratio]) => {
                const englishKey = SUB_CATEGORY_KEY_MAP[subName] || subName;
                subObj[englishKey] = `${ratio}%`;
            });
            category_spending[top] = subObj;
        } else {
            category_spending[top] = total;
        }
    });

    return {
        total_budget: state.totalBudget,
        category_spending,
    };
}

export async function fetchRecommendations(state: AppState): Promise<RecommendResponse> {
    const payload = transformStateToRecommendRequest(state);

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

export async function fetchComparison(state: AppState): Promise<CompareResponse> {
    if (!state.selectedCurrentCard?.id) {
        throw new Error("선택된 카드가 없습니다.");
    }
    const base = transformStateToRecommendRequest(state);
    const payload: CompareRequest = {
        ...base,
        current_card_id: state.selectedCurrentCard.id,
    };

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
