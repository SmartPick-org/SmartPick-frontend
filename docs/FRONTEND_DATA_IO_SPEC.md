# Frontend Data I/O Spec (Draft)

이 문서는 화면별 입력/출력 데이터와 API 연동 흐름을 정리한 초안입니다.
확정 전까지는 변경될 수 있습니다.

## 전역 상태 (AppState)
- comparisonMode: "COMPARE" | "NEW" | null
- selectedCurrentCard:
  - id: string
  - name: string
  - company: string
  - imageUrl?: string (추후)
  - type?: "CREDIT" | "CHECK" (추후)
- selectedCategories: string[] (서버 카테고리/서브카테고리 기준 키)
- spendingData: Record<string, number>

## Step 1. Entry ("/")
### 입력
- 유저 선택: COMPARE | NEW

### 출력/상태 변화
- comparisonMode 설정
- 라우팅:
  - COMPARE -> /select-card
  - NEW -> /categories

## Step 2. 기존 카드 선택 ("/select-card")
### 입력
- 카드 드롭다운 선택

### 데이터 소스
- GET /cards
  - 응답(요약):
    - card_id, card_name, card_company, annual_fee, minimum_performance, categories[], digest_summary

### 출력/상태 변화
- selectedCurrentCard 설정
- 다음 버튼 활성화

## Step 3. 카테고리 선택 ("/categories")
### 입력
- 2~5개 카테고리 선택

### 출력/상태 변화
- selectedCategories 저장
  - 현재 UI는 한글 라벨 표시
  - 저장은 서버 키(영문 Enum) 사용

## Step 4. 소비 입력 ("/input-spending")
### 입력
- 선택된 카테고리별 금액 입력

### 출력/상태 변화
- spendingData 갱신
- total_budget = sum(spendingData)
- 다음 버튼 활성화

## Step 5. 결과 ("/results")
### 입력
- API 요청: POST /cards/recommend
  - body:
    - total_budget: int
    - category_spending: { [categoryKey]: int }

### 출력
- recommended_cards[]
- explanation

### UI 반영
- NEW: 1~3순위 카드 그리드
- COMPARE: 기존 카드 요약 + 추천 카드 캐러셀
- 연간 차액(프론트 계산) 표시

## Side Sheet (결과 화면 내)
### 입력
- 유저 질문 텍스트
- raw_data: 추천 결과 원본 JSON 문자열

### API
- POST /cards/qa
  - body:
    - raw_data: string
    - question: string

### 출력
- answer: string

## 미확정/확인 필요
- /cards/recommend 응답 스키마에 서브카테고리 포함 여부
- selectedCategories는 대분류/세부분류 중 어떤 기준으로 저장하는지 확정 필요
- 카드 이미지 필드 제공 여부
