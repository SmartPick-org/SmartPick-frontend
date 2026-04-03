import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesPage from "./page";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

describe("Category selection flow", () => {
  it("2개 미만 선택 시 다음 버튼 비활성화", async () => {
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();

    const nextButton = screen.getByRole("button", { name: /다음 카테고리/ });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Food/ }));
    await user.click(screen.getByRole("button", { name: "외식" }));

    expect(nextButton).toBeDisabled();
  });

  it("2개 선택 시 다음 버튼 활성화", async () => {
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Food/ }));
    await user.click(screen.getByRole("button", { name: "외식" }));

    await user.click(screen.getByRole("button", { name: /Traffic/ }));
    await user.click(screen.getByRole("button", { name: "택시" }));

    expect(screen.getByRole("button", { name: /다음 카테고리/ })).toBeEnabled();
  });

  it("최대 5개까지만 선택된다", async () => {
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();

    const items = [
      { name: /Food/, sub: "외식" },
      { name: /Traffic/, sub: "택시" },
      { name: /Shopping/, sub: "편의점" },
      { name: /Coffee/, sub: "카페" },
      { name: /Cultural/, sub: "영화" },
      { name: /Travel/, sub: "항공" },
    ];
    for (const item of items) {
      await user.click(screen.getByRole("button", { name: item.name }));
      await user.click(screen.getByRole("button", { name: item.sub }));
    }

    expect(screen.getByText("선택 5/5")).toBeInTheDocument();
  });
});
