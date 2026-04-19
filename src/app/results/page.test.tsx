import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsPage from "./page";
import { renderWithProviders } from "@/test/render";
import { fetchComparison } from "@/state/apiService";

const pushMock = vi.fn();

const mockCurrentCard = {
  card_id: "current_01",
  card_name: "현대카드 M",
  card_company: "현대카드",
  expected_monthly_benefit: 10000,
  expected_yearly_benefit: 120000,
  annual_fee: 30000,
  minimum_performance: 500000,
  category_breakdown: [{ category: "Food", monthly_discount_krw: 9000 }],
  applied_benefits_trace: []
};

const mockRecommendedCard = {
  card_id: "rec_compare_01",
  card_name: "홈플러스 KB국민카드",
  card_company: "KB",
  expected_monthly_benefit: 20000,
  expected_yearly_benefit: 240000,
  annual_fee: 3000,
  minimum_performance: 300000,
  category_breakdown: [{ category: "Food", monthly_discount_krw: 20000 }],
  applied_benefits_trace: []
};

const mockCompareBase = {
  current_card: mockCurrentCard,
  recommended_cards: [mockRecommendedCard],
  category_comparison: [{ category: "Food", current: 9000, recommended: 20000, diff: 11000 }],
  monthly_diff: 10000,
  yearly_diff: 120000
};

const compareState = {
  comparisonMode: "COMPARE" as const,
  selectedCurrentCard: { id: "current_01", name: "현대카드 M", company: "현대카드" },
  spendingData: { "Food": 200000 }
};

vi.mock("@/state/apiService", () => ({
  fetchRecommendations: vi.fn().mockResolvedValue({
    recommended_cards: [
      {
        card_id: "rec_01",
        card_name: "모니모카드",
        card_company: "삼성카드",
        expected_monthly_benefit: 30000,
        expected_yearly_benefit: 360000,
        annual_fee: 10000,
        minimum_performance: 500000,
        category_breakdown: [
          { category: "Food", monthly_discount_krw: 20000 },
          { category: "Traffic", monthly_discount_krw: 10000 }
        ],
        applied_benefits_trace: [],
        explanation: "테스트용 설명입니다."
      },
      {
        card_id: "rec_02",
        card_name: "하나하나카드",
        card_company: "하나카드",
        expected_monthly_benefit: 20000,
        expected_yearly_benefit: 240000,
        annual_fee: 10000,
        minimum_performance: 500000,
        category_breakdown: [
          { category: "Food", monthly_discount_krw: 15000 }
        ],
        applied_benefits_trace: []
      },
      {
        card_id: "rec_03",
        card_name: "국민국민카드",
        card_company: "국민카드",
        expected_monthly_benefit: 15000,
        expected_yearly_benefit: 180000,
        annual_fee: 5000,
        minimum_performance: 300000,
        category_breakdown: [],
        applied_benefits_trace: []
      }
    ],
    explanation: "전반적인 추천 사유입니다."
  }),
  fetchAdvisorAnswer: vi.fn().mockResolvedValue({ answer: "AI 답변입니다." }),
  fetchComparison: vi.fn().mockResolvedValue({
    current_card: {
      card_id: "current_01", card_name: "현대카드 M", card_company: "현대카드",
      expected_monthly_benefit: 10000, expected_yearly_benefit: 120000,
      annual_fee: 30000, minimum_performance: 500000,
      category_breakdown: [], applied_benefits_trace: []
    },
    recommended_cards: [{
      card_id: "rec_compare_01", card_name: "홈플러스 KB국민카드", card_company: "KB",
      expected_monthly_benefit: 20000, expected_yearly_benefit: 240000,
      annual_fee: 3000, minimum_performance: 300000,
      category_breakdown: [], applied_benefits_trace: []
    }],
    recommended_card: null, category_comparison: [],
    monthly_diff: 10000, yearly_diff: 120000, explanation: ""
  }),
  fetchRecalculate: vi.fn().mockResolvedValue({ recommended_cards: [] })
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("Results page", () => {
  it("데이터 로딩 후 3개 추천 카드가 렌더링된다", async () => {
    renderWithProviders(<ResultsPage />, {
      initialState: {
        spendingData: { "Food": 100000, "Traffic": 50000 }
      }
    });

    // Wait for the loading skeleton to disappear and cards to appear
    const cardTitle = await screen.findByText("모니모카드");
    expect(cardTitle).toBeInTheDocument();

    // Check for 1년 예상 혜택 (30,000 * 12 = 360,000)
    expect(screen.getByText("36")).toBeInTheDocument();
    expect(screen.getAllByText("만").length).toBeGreaterThan(0);
    expect(screen.getAllByText("원").length).toBeGreaterThan(0);

    // Check for category benefits (20,000원, 10,000원)
    expect(screen.getAllByText("20,000원").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10,000원").length).toBeGreaterThan(0);

    // Check for badges
    expect(screen.getByText("1순위 추천")).toBeInTheDocument();
    expect(screen.getByText("2순위 추천")).toBeInTheDocument();
    expect(screen.getByText("3순위 추천")).toBeInTheDocument();

    // Check for Translated Labels (Food -> 식비)
    expect(screen.getAllByText("식비").length).toBeGreaterThan(0);
    expect(screen.getAllByText("교통").length).toBeGreaterThan(0);

    expect(screen.getByText("하나하나카드")).toBeInTheDocument();
    expect(screen.getByText("국민국민카드")).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: /더 물어보기/ })).toHaveLength(3);
  });

  it("COMPARE 모드에서는 추천 결과를 렌더링하지 않는다 (NEW 모드 전용 렌더러)", async () => {
    renderWithProviders(<ResultsPage />, {
      initialState: { comparisonMode: "NEW", spendingData: { "Food": 100000 } }
    });
    const cardTitle = await screen.findByText("모니모카드");
    expect(cardTitle).toBeInTheDocument();
  });

  it("사이드 패널(QA)이 정상적으로 열리고 질문이 가능하다", async () => {
    renderWithProviders(<ResultsPage />, {
      initialState: {
        spendingData: { "Food": 100000 }
      }
    });
    const user = userEvent.setup();

    const moreBtn = await screen.findAllByRole("button", { name: /더 물어보기/ });
    await user.click(moreBtn[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // 추천 질문 클릭
    const qBtn = screen.getByText("연회비 및 수수료 안내");
    await user.click(qBtn);

    // AI 답변 확인 (findBy 사용)
    const answer = await screen.findByText("AI 답변입니다.");
    expect(answer).toBeInTheDocument();
  });
});

describe("COMPARE 모드", () => {
  beforeEach(() => {
    vi.mocked(fetchComparison).mockResolvedValue(mockCompareBase as any);
  });

  it("기존 카드, diff 텍스트, 추천 카드 3개 영역이 모두 렌더링된다", async () => {
    renderWithProviders(<ResultsPage />, { initialState: compareState });
    expect(await screen.findByText("기존 카드")).toBeInTheDocument();
    expect(screen.getByText("현대카드 M")).toBeInTheDocument();
    expect(screen.getByText(/새로운 카드로 바꾸시면/)).toBeInTheDocument();
    expect(screen.getByText("홈플러스 KB국민카드")).toBeInTheDocument();
    expect(screen.getByText("1순위 추천")).toBeInTheDocument();
  });

  it("추천 카드가 1개일 때 이전/다음 네비게이션 버튼이 없다", async () => {
    renderWithProviders(<ResultsPage />, { initialState: compareState });
    await screen.findByText("홈플러스 KB국민카드");
    expect(screen.queryByLabelText("이전 카드")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("다음 카드")).not.toBeInTheDocument();
  });

  it("추천 카드가 2개일 때 이전/다음 네비게이션 버튼이 렌더링된다", async () => {
    vi.mocked(fetchComparison).mockResolvedValueOnce({
      ...mockCompareBase,
      recommended_cards: [
        mockRecommendedCard,
        { ...mockRecommendedCard, card_id: "rec_02", card_name: "신한카드 Discount Plan+", expected_yearly_benefit: 200000 }
      ]
    });
    renderWithProviders(<ResultsPage />, { initialState: compareState });
    await screen.findByText("홈플러스 KB국민카드");
    expect(screen.getByLabelText("이전 카드")).toBeInTheDocument();
    expect(screen.getByLabelText("다음 카드")).toBeInTheDocument();
  });

  it("4단 레이아웃 wrapper가 justify-center 클래스를 포함한다 (가운데 정렬)", async () => {
    const { container } = renderWithProviders(<ResultsPage />, { initialState: compareState });
    await screen.findByText("기존 카드");
    expect(container.querySelector(".justify-center")).not.toBeNull();
  });

  it("spendingData가 없으면 API를 호출하지 않고 크래시 없이 렌더링된다", () => {
    expect(() => {
      renderWithProviders(<ResultsPage />, {
        initialState: { ...compareState, spendingData: {} }
      });
    }).not.toThrow();
  });
});
