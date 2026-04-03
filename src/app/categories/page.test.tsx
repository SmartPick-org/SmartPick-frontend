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

    const nextButton = screen.getByRole("button", { name: /다음/ });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /식비/ }));
    expect(nextButton).toBeDisabled();
  });

  it("2개 선택 시 다음 버튼 활성화", async () => {
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /식비/ }));
    await user.click(screen.getByRole("button", { name: /교통/ }));

    expect(screen.getByRole("button", { name: /다음/ })).toBeEnabled();
  });

  it("최대 5개까지만 선택된다", async () => {
    renderWithProviders(<CategoriesPage />);
    const user = userEvent.setup();

    const items = ["식비", "교통", "쇼핑", "통신", "카페", "영화"];
    for (const name of items) {
      await user.click(screen.getByRole("button", { name: name }));
    }

    expect(screen.getByText("선택 5/5")).toBeInTheDocument();
  });
});
