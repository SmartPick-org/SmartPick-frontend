# Worklog 018: 카드 비교 기능 연결 및 UI 통일

## Date: 2026-04-13
## Status: Done

## 문제
1. `GET /cards` 404 오류 — 백엔드 라우터가 `/api/v1` prefix로 등록되어 있었으나 프론트는 prefix 없이 호출 중이었음.
2. COMPARE 모드 소비 입력 화면에서 세부 카테고리 슬라이더가 미표시 — Next.js router cache로 인해 컴포넌트가 remount 없이 재사용될 때 `ratios` useState가 stale 값 유지.
3. COMPARE 모드에서도 `/cards/recommend`를 호출하고 있어 비교 기능이 실제 연결되지 않은 상태.
4. 홈 화면이 다크 테마(`bg-slate-950`)로 다른 페이지들의 라이트 테마와 색감·분위기 불일치. 두 서비스 선택 카드 비율도 `1.1fr : 0.9fr`로 비대칭.

## 조치

### API prefix 수정
- `config.ts`: `API_V1` 상수 추가 (`API_BASE_URL + /api/v1`)
- `config.ts`: 기본 fallback을 ngrok URL → `http://localhost:8000` 변경 (EC2 미설정 사고 방지, `.env.example` 기준과 일치)
- `select-card/page.tsx`, `apiService.ts`: 모든 엔드포인트에 `/api/v1` prefix 적용

### 세부 카테고리 슬라이더 수정
- `input-spending/page.tsx`: `useEffect` 추가 — `state.selectedCategories` 변경 시 ratios가 누락되거나 불일치하는 항목만 재초기화 (사용자 드래그 값 보존)

### 카드 비교 기능 연결
- `api.ts`: `CompareRequest`, `CompareResponse`, `CategoryComparison` 타입 추가
- `apiService.ts`: `fetchComparison` 함수 추가 (`POST /api/v1/cards/compare`, `current_card_id` 포함)
- `results/page.tsx`: `comparisonMode === "COMPARE"` 분기 처리
  - COMPARE 모드: `fetchComparison` 호출 후 3단 비교 UI 렌더링 (현재 카드 | 카테고리별 diff + 연간 혜택 차이 배너 | 추천 카드)
  - NEW 모드: 기존 추천 UI 유지

### 홈 화면 UI 통일
- `page.tsx`만 수정 (다른 페이지 변경 없음)
- 배경: `bg-slate-950` → `bg-slate-50`
- 컨테이너: 글래스모피즘 → `rounded-[32px] bg-white border border-slate-100 shadow-sm`
- Step 1 인디케이터 및 헤더 스타일을 다른 페이지와 동일하게 적용
- 카드 그리드: `lg:grid-cols-[1.1fr_0.9fr]` → `grid-cols-2` (동일 비율)

## 확인 방법
- 홈에서 "사용 중인 카드와 비교해서 추천받기" 선택 → 카드 선택 → 카테고리/소비 입력 → `/results`에서 3단 비교 UI 확인
- 홈에서 "새로운 카드 중에서 추천받기" 선택 시 기존 추천 UI 정상 동작 확인
- 홈 화면 색감이 다른 페이지와 통일되어 있는지 확인
