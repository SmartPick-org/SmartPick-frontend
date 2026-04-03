import React from "react";
import { render } from "@testing-library/react";
import { AppState, AppStateProvider } from "@/state/appState";

type Options = Parameters<typeof render>[1] & {
  initialState?: Partial<AppState>;
};

export function renderWithProviders(ui: React.ReactElement, options?: Options) {
  const { initialState, ...renderOptions } = options ?? {};
  return render(
    <AppStateProvider initial={initialState}>{ui}</AppStateProvider>,
    renderOptions
  );
}
