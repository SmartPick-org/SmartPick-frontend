"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";

export type ComparisonMode = "COMPARE" | "NEW" | null;

export type CardSummary = {
  id: string;
  name: string;
  company: string;
  imageUrl?: string;
  type?: "CREDIT" | "CHECK";
};

export type AppState = {
  comparisonMode: ComparisonMode;
  selectedCurrentCard: CardSummary | null;
  selectedCategories: string[];
  spendingData: Record<string, number>;
};

type AppAction =
  | { type: "SET_COMPARISON_MODE"; payload: ComparisonMode }
  | { type: "SET_CURRENT_CARD"; payload: CardSummary | null }
  | { type: "SET_CATEGORIES"; payload: string[] }
  | { type: "SET_SPENDING"; payload: Record<string, number> };

export const initialState: AppState = {
  comparisonMode: null,
  selectedCurrentCard: null,
  selectedCategories: [],
  spendingData: {}
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_COMPARISON_MODE":
      return { ...state, comparisonMode: action.payload };
    case "SET_CURRENT_CARD":
      return { ...state, selectedCurrentCard: action.payload };
    case "SET_CATEGORIES":
      return { ...state, selectedCategories: action.payload };
    case "SET_SPENDING":
      return { ...state, spendingData: action.payload };
    default:
      return state;
  }
}

type AppStateContextValue = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({
  children,
  initial
}: {
  children: React.ReactNode;
  initial?: Partial<AppState>;
}) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, ...initial });
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
