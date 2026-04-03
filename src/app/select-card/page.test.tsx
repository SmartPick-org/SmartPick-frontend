import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectCardPage from "./page";
import { renderWithProviders } from "@/test/render";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("Select card flow", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("선택 전에는 다음 버튼이 비활성화된다", () => {
    renderWithProviders(<SelectCardPage />);
    expect(screen.getByRole("button", { name: /다음/ })).toBeDisabled();
  });

  it("카드 선택 후 다음 버튼이 활성화되고 /categories로 이동한다", async () => {
    renderWithProviders(<SelectCardPage />);
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText("카드 선택"), "card_001");
    expect(screen.getByRole("button", { name: /다음/ })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /다음/ }));
    expect(pushMock).toHaveBeenCalledWith("/categories");
  });

  it("드롭다운에서 카드 선택이 가능하다", async () => {
    renderWithProviders(<SelectCardPage />);
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText("카드 선택"), "card_002");
    expect(screen.getByText(/알뜰 체크 카드/)).toBeInTheDocument();
  });
});
