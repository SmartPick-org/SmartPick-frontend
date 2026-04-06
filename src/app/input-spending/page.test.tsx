import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputSpendingPage from "./page";
import { renderWithProviders } from "@/test/render";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("Spending input flow", () => {
  it("슬라이더 변경 시 숫자 입력이 동기화된다", async () => {
    renderWithProviders(<InputSpendingPage />, {
      initialState: { selectedCategories: ["식비"] }
    });
    const user = userEvent.setup();

    fireEvent.change(screen.getByLabelText("식비 슬라이더"), {
      target: { value: "300000" }
    });

    expect(screen.getByLabelText("식비 금액")).toHaveValue(300000);
  });

  it("숫자 입력 변경 시 슬라이더가 동기화된다", async () => {
    renderWithProviders(<InputSpendingPage />, {
      initialState: { selectedCategories: ["식비"] }
    });
    const user = userEvent.setup();

    await user.clear(screen.getByLabelText("식비 금액"));
    await user.type(screen.getByLabelText("식비 금액"), "120000");

    expect(screen.getByLabelText("식비 슬라이더")).toHaveValue("120000");
  });

  it("총액이 실시간으로 갱신된다", async () => {
    renderWithProviders(<InputSpendingPage />, {
      initialState: { selectedCategories: ["식비", "교통"] }
    });
    const user = userEvent.setup();

    await user.clear(screen.getByLabelText("식비 금액"));
    await user.type(screen.getByLabelText("식비 금액"), "100000");
    await user.clear(screen.getByLabelText("교통 금액"));
    await user.type(screen.getByLabelText("교통 금액"), "50000");

    expect(screen.getByText("총액 150,000원")).toBeInTheDocument();
  });

  it("상세 토글이 닫히고 다시 열린다", async () => {
    renderWithProviders(<InputSpendingPage />, {
      initialState: { selectedCategories: ["식비"] }
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "식비 접기" }));
    expect(screen.queryByLabelText("식비 슬라이더")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "식비 설정" }));
    expect(screen.getByLabelText("식비 슬라이더")).toBeInTheDocument();
  });

  it("다음 버튼을 누르면 /results로 이동한다", async () => {
    renderWithProviders(<InputSpendingPage />, {
      initialState: { selectedCategories: ["식비"] }
    });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("식비 금액"), "1000");
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(pushMock).toHaveBeenCalledWith("/results");
  });
});
