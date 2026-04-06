import { AppState } from "./appState";
import { RecommendRequest, RecommendResponse, QARequest, QAResponse } from "./api";
import { SUB_CATEGORY_KEY_MAP } from "./categories";

const BASE_URL = "https://5293-211-171-73-131.ngrok-free.app";

export function transformStateToRecommendRequest(state: AppState): RecommendRequest {
    const category_spending: RecommendRequest["category_spending"] = {};

    Object.entries(state.spendingData).forEach(([top, total]) => {
        const subs = state.subCategoryRatios[top];
        if (subs && Object.keys(subs).length > 0) {
            const subObj: any = { total };
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

    const response = await fetch(`${BASE_URL}/cards/recommend`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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

    const response = await fetch(`${BASE_URL}/cards/qa`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to get answer");
    }

    return response.json();
}
