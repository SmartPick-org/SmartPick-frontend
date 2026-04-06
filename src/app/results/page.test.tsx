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
          { category: "외식/배달", monthly_discount_krw: 20000 },
          { category: "교통", monthly_discount_krw: 10000 }
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
          { category: "외식/배달", monthly_discount_krw: 15000 }
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
    renderWithProviders(<ResultsPage />);

    // Wait for the loading skeleton to disappear and cards to appear
    const cardTitle = await screen.findByText("모니모카드");
    expect(cardTitle).toBeInTheDocument();

    expect(screen.getByText("하나하나카드")).toBeInTheDocument();
    expect(screen.getByText("국민국민카드")).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: /더 물어보기/ })).toHaveLength(3);
  });

  it("사이드 패널(QA)이 정상적으로 열리고 질문이 가능하다", async () => {
    renderWithProviders(<ResultsPage />);
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
