# SmartPick Frontend Work Log

---

## 2026-04-13

### 1. API 엔드포인트 prefix 수정 (`/api/v1`)
**문제**: 백엔드 라우터가 `/api/v1` prefix로 등록되어 있어 `GET /cards` 호출 시 404 발생. 프론트는 prefix 없이 호출 중이었음.

**수정 내용**:
- `config.ts`: `API_V1` 상수 추가 (`API_BASE_URL + /api/v1`)
- `config.ts`: 기본값 ngrok URL → `http://localhost:8000` 변경 (.env.example 기준과 일치, EC2 배포 안전성 향상)
- `select-card/page.tsx`: `GET /cards` → `GET /api/v1/cards`
- `apiService.ts`: `/cards/recommend`, `/cards/qa`, `/advisor/ask` 모두 `/api/v1` prefix 적용

**커밋**: `fix: API 엔드포인트 경로를 /api/v1 prefix로 수정`

---

### 2. COMPARE 모드 세부 카테고리 슬라이더 미표시 수정
**문제**: "기존 카드와 비교해 추천받기" 흐름에서 소비 입력 화면의 세부 카테고리 슬라이더(SegmentedSlider)가 표시되지 않음.

**원인**: Next.js App Router의 router cache로 인해 input-spending 컴포넌트가 remount 없이 재사용될 때, `ratios` useState 초기화 함수가 재실행되지 않아 stale 값 유지. `currentSubs`는 context에서 최신값을 읽어 표시되지만 `ratios`는 빈 `{}`로 남아 SegmentedSlider가 `null` 반환.

**수정 내용**:
- `input-spending/page.tsx`: `useEffect` 추가 — `state.selectedCategories` 변경 시 ratios가 없거나 불일치하는 항목만 재초기화 (사용자 드래그 값 보존)

**커밋**: `fix: COMPARE 모드에서 세부 카테고리 슬라이더 미표시 문제 수정`

---

### 3. 카드 비교 기능 연결 및 비교 UI 구현
**배경**: 백엔드 `POST /api/v1/cards/compare` 완성. 프론트는 COMPARE 모드에서도 `/cards/recommend`를 호출하고 있었음.

**수정 내용**:
- `api.ts`: `CompareRequest`, `CompareResponse`, `CategoryComparison` 타입 추가
- `apiService.ts`: `fetchComparison` 함수 추가 (`POST /api/v1/cards/compare`, `current_card_id` 포함)
- `results/page.tsx`:
  - `state.comparisonMode === "COMPARE"` 분기 처리
  - COMPARE 모드: `fetchComparison` 호출, 3단 비교 UI 렌더링
    - 좌: 현재 카드 / 중앙: 카테고리별 diff + 연간 혜택 차이 배너 / 우: 추천 카드
  - NEW 모드: 기존 추천 UI 유지

**커밋**: `feat: 비교 API 연결 및 홈 화면 UI 통일` (일부)

---

### 4. 홈 화면 UI 통일 및 카드 비율 수정
**문제**:
1. 홈 화면이 다크 테마(`bg-slate-950`)로 다른 페이지들(라이트 테마)과 색감·분위기 불일치
2. 두 서비스 선택 카드 비율이 `1.1fr : 0.9fr`로 비대칭

**수정 내용** (`src/app/page.tsx` 만 수정):
- 배경: `bg-slate-950` → `bg-slate-50`
- 컨테이너: 글래스모피즘 → `rounded-[32px] bg-white border border-slate-100 shadow-sm` (다른 페이지와 동일 패턴)
- 헤더: Step 1 인디케이터 추가, 폰트·색상 통일 (`text-slate-900`, `text-slate-500`)
- 카드 그리드: `lg:grid-cols-[1.1fr_0.9fr]` → `grid-cols-2` (동일 비율)
- 카드 스타일: 다크 글래스 → `border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md`

**커밋**: `feat: 비교 API 연결 및 홈 화면 UI 통일`
