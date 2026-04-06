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
  selectedCategories: string[] | Record<string, string[]>;
  subCategoryRatios: Record<string, Record<string, number>>;
  spendingData: Record<string, number>;
  totalBudget: number;
};

type AppAction =
  | { type: "SET_COMPARISON_MODE"; payload: ComparisonMode }
  | { type: "SET_CURRENT_CARD"; payload: CardSummary | null }
  | { type: "SET_CATEGORIES"; payload: string[] | Record<string, string[]> }
  | { type: "SET_SUBCATEGORY_RATIOS"; payload: Record<string, Record<string, number>> }
  | { type: "SET_SPENDING"; payload: Record<string, number> }
  | { type: "SET_TOTAL_BUDGET"; payload: number };

export const initialState: AppState = {
  comparisonMode: null,
  selectedCurrentCard: null,
  selectedCategories: [],
  subCategoryRatios: {},
  spendingData: {},
  totalBudget: 1000000
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_COMPARISON_MODE":
      return { ...state, comparisonMode: action.payload };
    case "SET_CURRENT_CARD":
      return { ...state, selectedCurrentCard: action.payload };
    case "SET_CATEGORIES":
      return { ...state, selectedCategories: action.payload };
    case "SET_SUBCATEGORY_RATIOS":
      return { ...state, subCategoryRatios: action.payload };
    case "SET_SPENDING":
      return { ...state, spendingData: action.payload };
    case "SET_TOTAL_BUDGET":
      return { ...state, totalBudget: action.payload };
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

export function getSelectTopCategories(categories: string[] | Record<string, string[]>): string[] {
  if (Array.isArray(categories)) {
    return categories;
  }
  return Object.keys(categories);
}
