export interface CategoryBreakdown {
    category: string;
    monthly_discount_krw: number;
    discount_info: Record<string, number>;
    warnings: string[] | null; // 백엔드 optional 대응
}

export interface BenefitReceiptItem {
    benefit_id: string;
    content: string;
    category: string;
    sub_category: string | null;
    amount_krw: number;
    warnings: string[];
}

export interface BenefitTraceItem {
    benefit_id: string;
    content: string;
    applied_budget: number;
    yielded_discount: number;
    user_choice: boolean;
    warnings: string[] | null;
}

export interface RecommendCard {
    card_name: string;
    card_company: string;
    card_id: string;
    annual_fee: number;
    minimum_performance: number;
    expected_monthly_benefit: number;
    category_breakdown: CategoryBreakdown[];
    applied_benefits_trace: BenefitTraceItem[];
    explanation?: string;
}

export interface RecommendResponse {
    recommended_cards: RecommendCard[];
    explanation: string;
}

export interface RecommendRequest {
    total_budget: number;
    category_spending: Record<string, any>;
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

export interface AdvisorResponse {
    answer: string;
    query_used: string; // 백엔드 실제 필드 추가
}

export interface CompareRequest {
    total_budget: number;
    category_spending: Record<string, number | { total: number;[key: string]: number | string }>;
    current_card_id: string;
}

export interface CategoryComparison {
    category: string;
    current_benefit: number;   // current_discount -> current_benefit
    recommended_benefit: number; // recommended_discount -> recommended_benefit
    diff: number;
}

export interface CompareResponse {
    current_card: RecommendCard;
    /** 백엔드 신규 형태: 여러 추천 카드 */
    recommended_cards: RecommendCard[];
    /** 백엔드 구 형태: 단일 추천 카드 */
    recommended_card: RecommendCard;
    monthly_diff: number;
    yearly_diff: number;
    category_comparison: CategoryComparison[];
    explanation: string;
}

export interface RecalculateRequest {
    total_budget?: number | null;
    category_spending?: Record<string, any> | null;
    recommended_cards: RecommendCard[];
    excluded_benefit_ids: string[];
}

export interface RecalculateResponse {
    recommended_cards: RecommendCard[];
}
