import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import { renderWithProviders } from "@/test/render";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("Entry flow", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("COMPARE 선택 시 /select-card로 이동한다", async () => {
    renderWithProviders(<Home />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /사용 중인 카드와 비교해서 추천받기/ })
    );

    expect(pushMock).toHaveBeenCalledWith("/select-card");
  });

  it("NEW 선택 시 /categories로 이동한다", async () => {
    renderWithProviders(<Home />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /새로운 카드 중에서 추천받기/ })
    );

    expect(pushMock).toHaveBeenCalledWith("/categories");
  });
});
