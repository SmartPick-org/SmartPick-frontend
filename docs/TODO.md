# TODO

## 진행 원칙
- TODO 단위로 구현한다.
- TODO 완료마다 `worklog/`에 결과 기록 후 확인을 받고 다음으로 진행한다.
- 외부 의존성이 없는 비즈니스 로직은 TDD로 진행한다.
- 사용자 관점에서 의문이 들면 개발자에게 질문한다.
- 명령이 모호하거나 용어가 불명확하면 질문하거나 대안을 제안한다.

## 백로그 (우선순위 재정렬)

### P0. 선행/의존성 정리 (먼저 해야 하는 것)
- [ ] 화면별 데이터 입출력 명세서 확정
- [ ] 카테고리/서브카테고리 사전 버전 관리 규칙 확정 (v5 기준)
- [v] 백엔드 API 계약 정의 (요청/응답 스키마)
  - [v] /cards/recommend 요청/응답 매핑 확정
  - [v] /cards/qa 요청/응답 매핑 확정

### P1. 데이터 파이프라인 (v5) 확정
- [ ] json_v5 샘플 2건 생성 및 검수
- [ ] json_v5 전체 변환 실행
- [ ] v5 스키마 검증 스크립트 추가
- [ ] 카테고리/서브카테고리 v5 스키마 적용

### P2. 결과/질의 기능 연결 (핵심 가치)
- [v] 추천 결과 API 연결 (/cards/recommend)
- [v] Step5: 추천 카드 상세 영역(카테고리별 혜택 리스트) 연결
- [v] Step5: COMPARE 모드 "연간 차액" 및 전역 500원 반올림 로직 적용
- [v] Step5: 기존 카드와 새로운 카드의 4열 배치 비교 레이아웃 완성 (차액 변화량 시각화)
- [v] Side Sheet: 질문 칩 데이터 연결 (Advisor API 기반)
- [v] Side Sheet: QA API 연결 (/cards/advisor) 및 UI 양식 통일 (박스형 안내)

### P3. UI 디테일 보완 (기획 대비 미적용 보완)
- [ ] Step1: Entry 화면 마이크로 카피 정리 (CTA/보조 설명)
- [ ] Step1: 상단 헤더(로고/뒤로가기) 고정 레이아웃 반영
- [ ] Step2: 드롭다운 검색 기능(타이핑 필터) 추가
- [ ] Step2: 카드 이미지 영역(옵션) 자리 확보
- [ ] Step3: 카테고리 아이콘 셋 적용
- [ ] Step3: 2~5개 선택 안내 문구 위치/강조 조정
- [ ] Step4: 도넛 차트 실제 렌더링 연결
- [ ] Step4: 카테고리별 상세 설명 콘텐츠 연결

### P4. 안정성/품질
- [v] 에러/로딩 상태 처리
  - [v] 로딩 스켈레톤 기본 컴포넌트
  - [v] 네트워크 오류 메시지 표준화
- [ ] 테스트 커버리지 기준 설정
  - [ ] Step2/3/4/5 스냅샷/상호작용 테스트 정리
- [ ] 접근성(ARIA/키보드) 점검
  - [ ] 드롭다운 키보드 네비게이션
  - [ ] Side Sheet 포커스 트랩
- [ ] 성능 측정 및 개선
  - [ ] 초기 로딩 번들 점검
  - [ ] 이미지/아이콘 최적화

### P5. UI/UX 디자인 고도화 (전문가 피드백 반영)
- [v] **1순위: 정보 계층 구조 및 시각적 대비**
  - [v] 카드 상품명 폰트 가중치(Bold) 강화 및 상하 여백 확보
  - [v] 핵심 금액 대비 보조 텍스트 가독성 개선 (12-13px 이상, 명도 대비 향상)
  - [v] 1~3순위 카드 타이틀 수직 시작점(Baseline) 통일
- [v] **2순위: 레이아웃 정렬 및 영역 침범 (UI 부채)**
  - [v] 좌측 카테고리 태그와 카드 간 간격 조정 (margin-right 40px 이상)
  - [v] '더 물어보기' 버튼을 카드 컴포넌트 내부(연회비 아래)로 이동
  - [v] 하단 맞춤 큐레이션 박스 내 여백(Padding) 균등 배분 (40px)
- [v] **3순위: 타이포그래피 및 세부 스타일링**
  - [v] 큐레이션 텍스트 행간(Line-height) 1.5-1.6배로 조정
  - [v] 금액 숫자에 `font-variant-numeric: tabular-nums` 적용
  - [v] '더 물어보기' 버튼 폰트 크기 확대 및 스타일링(그림자 효과 등) 개선

### P6. 혜택 영수증 (Benefit Receipt) 고도화
- [v] **[Infra] API 및 데이터 모델 최신화** (현행 스펙 기준 완료)
  - [v] `applied_benefits_trace` 기반으로 영수증 렌더링 전환 (`benefit_receipt` → 삭제됨)
  - [v] `RecalculateResponse`에 `explanation` 필드 추가 반영
  - ~~`BenefitReceiptItem` 인터페이스 추가~~ ← 현행 스펙에서 삭제된 타입 (§4-❶ 참고)
  - ~~`excluded_benefit_ids` 반영~~ ← `/recommend` 요청에서 제거된 필드 (§2-1 참고)
- [v] **[Component] 영수증 모달 UI/UX 구현**
  - [v] `BenefitReceipt.tsx` 컴포넌트 구현 (지그재그 테두리, 체크박스, 합산 금액)
  - [v] 카드 섹션 내 '혜택 영수증' 진입점 및 애니메이션
  - [v] `MarkdownText` 기반 `explanation` 렌더링
- [v] **[Logic] 체크박스 필터링 및 실시간 인터랙션**
  - [v] `applied_benefits_trace` + `user_choice` 기반 개별 혜택 렌더링
  - [v] 체크박스 상태 관리 및 하단 합계 금액 실시간 갱신
- [v] **[Feature] 최적화 재추천(Re-rank) 엔진 연결**
  - [v] `POST /cards/recalculate` 연동 및 전체 카드 순위 재정렬
  - [v] 재추천 후 큐레이션 텍스트(`explanation`) 갱신

### P7. API 변경 반영 정리 (2026-04-17 점검 결과, §4 기준)

> 기능 동작에 영향 없는 코드 정리 항목. 우선순위대로 하나씩 완료 후 v 표시.

- [v] **[P7-1] `recomputeCategoryBreakdown` 제거** ← 가장 중요
  - 위치: `src/app/results/page.tsx:689-704` (함수 정의) 및 호출부 (`.map(recomputeCategoryBreakdown)` 2곳)
  - 이유: 백엔드가 이미 `category_breakdown.monthly_discount_krw`를 계산해서 내려줌. 프론트 재계산이 서버 계산 규칙 변경 시 표시값을 덮어씌울 위험 존재.
  - 조치: 함수 삭제 + `.map(recomputeCategoryBreakdown)` → `res.recommended_cards` 그대로 사용

- [v] **[P7-2] `BenefitReceiptItem` 타입 삭제 및 미사용 import 제거**
  - 위치: `src/state/api.ts:8-15` (타입 정의), `src/components/results/BenefitReceipt.tsx:4` (import)
  - 이유: 현행 스펙에서 `benefit_receipt` 필드 삭제됨. 타입과 import 모두 데드 코드.
  - 조치: 타입 정의 삭제 + import 구문 제거

- [v] **[P7-3] `fetchRecommendations` 데드 파라미터 제거**
  - 위치: `src/state/apiService.ts:35` 시그니처의 `excluded_benefit_ids?: string[] | null`
  - 이유: 페이로드에 포함되지 않고(`/recommend` 스펙에서 제거됨), 호출부에서도 인자를 전달하지 않음.
  - 조치: 시그니처에서 `excluded_benefit_ids` 파라미터 삭제

- [v] **[P7-4] `docs/TODO.md` P6 내 오래된 항목 정리** ← 이 작업 완료됨 (위 P6 섹션 갱신)

### 완료된 항목 (참고)
#### 기획/설계
- [v] KPI 정의와 측정 이벤트 설계 (PLAN.md 반영)
- [v] 유저 플로우/정보 구조 정리 (Entry → 결과까지)

#### 프론트 구현 (TDD)
- [v] Step1 Entry 화면 시각 디자인 고도화
- [v] Step2 카드 선택 드롭다운 적용 (검색/선택 UI 유지)
  - [v] 카드 목록 API 연동 (GET /cards) + 폴백 처리
  - [v] 선택 카드 요약 노출
  - [v] API Base URL 단일화 + 선택 카드 상세 정보 바인딩
- [v] Step3 카테고리 선택 화면 정돈 (타일/아이콘 정리)
  - [v] 한글 라벨 ↔ 영문 Enum 매핑 적용
- [v] Step4 소비 입력 화면 레이아웃/차트 기본형
  - [v] 도넛 차트 placeholder 영역 확보
  - [v] 영문 Enum 기준 입력 + 한글 라벨 표시
- [v] Step5 결과 화면 (NEW/COMPARE) 기본 레이아웃
  - [v] 1순위 카드 시각 강조
- [v] Side Sheet 질의 패널 UI/열림/닫힘 흐름
  - [v] Dim 클릭 닫기 동작
