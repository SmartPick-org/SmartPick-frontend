import { CategoryKey } from "./categories";

export interface CategoryBreakdown {
    category: string;
    monthly_discount_krw: number;
    discount_info: Record<string, number>;
    warnings?: string[] | null;
}

export interface BenefitReceiptItem {
    benefit_id: string;
    content: string;
    category: string;
    sub_category: string | null;
    amount_krw: number;
    warnings: string[];
}

export interface RecommendCard {
    card_name: string;
    card_company: string;
    card_id: string;
    annual_fee: number;
    minimum_performance: number;
    expected_monthly_benefit: number;
    category_breakdown: CategoryBreakdown[];
    explanation: string;
    benefit_receipt?: BenefitReceiptItem[];
}

export interface RecommendResponse {
    recommended_cards: RecommendCard[];
    explanation: string;
}

export interface RecommendRequest {
    total_budget: number;
    category_spending: Record<string, number | { total: number;[key: string]: number | string }>;
    excluded_benefit_ids?: string[] | null;
    top_n?: number;
}

export interface QARequest {
    raw_data: string;
    question: string;
}

export interface QAResponse {
    answer: string;
}

export type AdvisorQueryType =
    | "credit_fees"
    | "international_fees"
    | "reviews"
    | "how_to_apply"
    | "late_payment"
    | "revolving";

export interface AdvisorRequest {
    card_name: string;
    query_type: AdvisorQueryType;
}

export type AdvisorResponse = QAResponse;

export interface CompareRequest {
    total_budget: number;
    category_spending: Record<string, number | { total: number;[key: string]: number | string }>;
    current_card_id: string;
    excluded_benefit_ids?: string[] | null;
    top_n?: number;
}

export interface CategoryComparison {
    category: string;
    current_discount: number;
    recommended_discount: number;
    diff: number;
}

export interface CompareResponse {
    current_card: RecommendCard;
    /** 백엔드 신규 형태: 여러 추천 카드 (혜택 내림차순) */
    recommended_cards?: RecommendCard[];
    /** 백엔드 구 형태: 단일 추천 카드 (하위호환) */
    recommended_card: RecommendCard;
    monthly_diff: number;
    yearly_diff: number;
    category_comparison: CategoryComparison[];
    explanation: string;
}
