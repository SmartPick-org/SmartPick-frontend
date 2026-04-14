# Results Page UI Specification (as of 2026-04-13)

This document locks in the "Golden Ratios" and design aesthetics of the SmartPick Result pages (Compare & New Recommendation) to ensure consistency in future updates.

## 1. Global Financial Logic
- **Precision (500-won Rule):** All financial values (Monthly Benefit, Annual Benefit, Category Discounts, Diffs) MUST be rounded to the nearest 500 won using the `roundTo500` helper.
- **Rounding Logic:** `Math.round(val / 500) * 500`.

## 2. Layout & Spacing
- **Base Grid:** Based on `UI_CONSTANTS`.
- **Card Width:** `320px`.
- **Row Height:** `64px` consistent across category labels, card rows, and diff rows.
- **Card Border Radius:** `32px`.
- **Compare Mode Layout:** 4-column structure (Category Chips | Current Card | Diff Zone | Recommended Card).
  - Alignment: Left-aligned (`justify-start`) with high-fidelity spacing.
- **New Mode Layout:** Sidebar + Horizontal Scroll.
  - Sidebar Width: `100px`.
  - Column Gap: `40px` (utilizing `gap-10`).

## 3. Component Styles

### 3.1 Card Advisor Side-Sheet
- **Background:** `bg-black/40` overlay.
- **Panel Width:** `450px`.
- **Initial State:** 
  - Centered box UI: `bg-slate-50`, `border-slate-100`, `p-6`.
  - Guidance text: `아래 버튼을 눌러 이 카드에 대해 궁금한 점을 바로 확인해보세요 :)` (color: `slate-500`, center-aligned).
- **Secondary Guidance:** Gray text above scroll area: `아래 버튼을 눌러 원하시는 정보를 확인해보세요.` (color: `slate-400`, size: `xs`).
- **Chat Bubbles:**
  - User: `bg-[#625BF5]`, `text-white`, `rounded-tr-sm` (top-right sharp corner).
  - Bot: `bg-slate-100`, `text-slate-800`, `rounded-tl-sm` (top-left sharp corner).

### 3.2 Comparison Cards
- **Recommended Card (Primary):** `bg-[#EFEEFF]`, `border-[#625BF5]` (2px border), shadow indigo.
- **Default/Current Card:** `bg-white`, `border-slate-100`, shadow subtle.
- **1-Year Benefit Format:** `X만 Y천 Z원`
  - Big number (`32px`) - Unit Label (`18px`).
  - Remainders (500원) must be visible if they exist (`24px`).

### 3.3 Diff Zone (Compare View)
- **Formatting:** `± X,XXX원` (commas and rounded to 500).
- **Coloring:**
  - Gain: `#625BF5` (SmartPick Purple).
  - Loss/Less: `text-rose-400/500`.
- **Empty State:** `해당없음` in `text-slate-300`.

## 4. Typography
- **Primary Font:** Inter / System Sans-serif.
- **Card Title:** `22px` Bold.
- **Category Labels:** `13px` Semibold.
- **Big Numbers:** `32px` Extrabold (tabular-nums).

## 5. Maintenance Rules
1. **No Duplication:** Shared UI like `SideSheet` or `SharedCard` should ideally be extracted into components.
2. **Consult Constants:** Always refer to `src/constants/ui.ts` before hardcoding pixel values.
3. **Verified Rounding:** Never display raw backend numbers; always wrap in `roundTo500()`.
