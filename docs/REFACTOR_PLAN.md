# Refactoring Plan: Result Page UI Core Consolidation

To prevent UI regressions and ensure consistent behavior (like the 500-won rounding or side-sheet styling), we should extract shared elements into dedicated components.

## 1. Extract `CardAdvisorSheet.tsx`
Currently, the side-sheet code is duplicated twice in `src/app/results/page.tsx` (Compare mode block and Default mode block).
- **Goal:** Move this to `src/components/results/CardAdvisorSheet.tsx`.
- **Benfit:** Fixes once, applies everywhere. Guarantees that the "gray box" and `:)` emoji stay synchronized.

## 2. Extract `BenefitCard.tsx`
The card UI (Existing vs Recommended) shares 90% of its structure, including the complex yearly benefit breakdown logic.
- **Goal:** Create a reusable `BenefitCard` component that accepts props for `isBest`, `badgeText`, and `showAskButton`.
- **Benefit:** Centralizes the `roundTo500` logic and the `X만 Y천원` formatting.

## 3. Move Logic to `src/utils/finance.ts`
Move `roundTo500` and `calcYearlyNetBenefit` to a utility file.
- **Benefit:** Makes these rules available for tests and other pages (e.g., the recommendation list).

## 4. Shared `CategoryRow.tsx`
Unify how categories and their discounts are rendered in both Compare and New views.

---
**Status:** Documenting current "Perfect UI" state in `docs/RESULTS_UI_SPEC.md` was the first step. Refactoring should follow this specification.
