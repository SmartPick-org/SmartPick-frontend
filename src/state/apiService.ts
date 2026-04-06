import { AppState } from "./appState";
import { RecommendRequest, RecommendResponse, QARequest, QAResponse } from "./api";

const BASE_URL = "https://5293-211-171-73-131.ngrok-free.app";

export function transformStateToRecommendRequest(state: AppState): RecommendRequest {
    const category_spending: RecommendRequest["category_spending"] = {};

    Object.entries(state.spendingData).forEach(([top, total]) => {
        const subs = state.subCategoryRatios[top];
        if (subs && Object.keys(subs).length > 0) {
            const subObj: any = { total };
            Object.entries(subs).forEach(([subName, ratio]) => {
                // API expects "percentage%" format as per examples
                subObj[subName] = `${ratio}%`;
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

    const response = await fetch(`${BASE_URL}/cards/recommend`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail?.[0]?.msg || "Failed to fetch recommendations");
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
