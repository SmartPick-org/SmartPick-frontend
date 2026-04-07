import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsPage from "./page";
import { renderWithProviders } from "@/test/render";

const pushMock = vi.fn();

vi.mock("@/state/apiService", () => ({
  fetchRecommendations: vi.fn().mockResolvedValue({
    recommended_cards: [
      {
        card_id: "rec_01",
        card_name: "모니모카드",
        card_company: "삼성카드",
        expected_monthly_benefit: 30000,
        annual_fee: 10000,
        minimum_performance: 500000,
        category_breakdown: [
          { category: "Food", monthly_discount_krw: 20000 },
          { category: "Traffic", monthly_discount_krw: 10000 }
        ],
        explanation: "테스트용 설명입니다."
      },
      {
        card_id: "rec_02",
        card_name: "하나하나카드",
        card_company: "하나카드",
        expected_monthly_benefit: 20000,
        annual_fee: 10000,
        minimum_performance: 500000,
        category_breakdown: [
          { category: "Food", monthly_discount_krw: 15000 }
        ]
      },
      {
        card_id: "rec_03",
        card_name: "국민국민카드",
        card_company: "국민카드",
        expected_monthly_benefit: 15000,
        annual_fee: 5000,
        minimum_performance: 300000,
        category_breakdown: []
      }
    ],
    explanation: "전반적인 추천 사유입니다."
  }),
  askQuestion: vi.fn().mockResolvedValue({ answer: "AI 답변입니다." })
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
    expect(screen.getByText("20,000원")).toBeInTheDocument();
    expect(screen.getByText("10,000원")).toBeInTheDocument();

    // Check for badges
    expect(screen.getByText("1순위 추천")).toBeInTheDocument();
    expect(screen.getByText("2순위 추천")).toBeInTheDocument();
    expect(screen.getByText("3순위 추천")).toBeInTheDocument();

    // Check for Translated Labels (Food -> 식비)
    expect(screen.getByText("식비")).toBeInTheDocument();
    expect(screen.getByText("교통")).toBeInTheDocument();

    expect(screen.getByText("하나하나카드")).toBeInTheDocument();
    expect(screen.getByText("국민국민카드")).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: /더 물어보기/ })).toHaveLength(3);
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
    const qBtn = screen.getByText("연회비 대비 혜택이 충분한가?");
    await user.click(qBtn);

    // AI 답변 확인 (findBy 사용)
    const answer = await screen.findByText("AI 답변입니다.");
    expect(answer).toBeInTheDocument();
  });
});
