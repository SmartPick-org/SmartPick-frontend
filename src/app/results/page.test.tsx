import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsPage from "./page";
import { renderWithProviders } from "@/test/render";

const baseCard = {
  id: "card_001",
  name: "스마트 프라임 카드",
  company: "SmartPick",
  type: "CREDIT" as const
};

describe("Results page", () => {
  it("NEW 모드에서 3개 카드가 렌더링된다", () => {
    renderWithProviders(<ResultsPage />, {
      initialState: { comparisonMode: "NEW" }
    });

    expect(screen.getAllByRole("button", { name: /더 물어보기/ })).toHaveLength(3);
  });

  it("COMPARE 모드에서 기존 카드 요약이 표시된다", () => {
    renderWithProviders(<ResultsPage />, {
      initialState: { comparisonMode: "COMPARE", selectedCurrentCard: baseCard }
    });

    expect(screen.getAllByText(/스마트 프라임 카드/).length).toBeGreaterThan(0);
    expect(screen.getByText(/바꾸면 연간/)).toBeInTheDocument();
  });

  it("더 물어보기 클릭 시 사이드 패널이 열리고 닫힌다", async () => {
    renderWithProviders(<ResultsPage />, {
      initialState: { comparisonMode: "NEW" }
    });
    const user = userEvent.setup();

    await user.click(screen.getAllByRole("button", { name: /더 물어보기/ })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
