# PLAN

## 목표
- 데스크탑 웹에서 카드 추천 및 비교 흐름을 완결성 있게 제공한다.
- 사용자가 입력 부담 없이 빠르게 결과를 확인하도록 UX를 최적화한다.

## 핵심 KPI 및 측정 방법

1. 추천 흐름 완료율
- 정의: Entry → 결과 화면 도달 비율
- 측정: 페이지뷰/이벤트 기준으로 `entry_view` 대비 `results_view` 비율

2. 카드 선택 완료율 (COMPARE 모드)
- 정의: 카드 선택 화면에서 카드 선택 후 다음 진행 비율
- 측정: `select_card_view` 대비 `select_card_next_click`

3. 카테고리 선택 완료율
- 정의: 카테고리 2~5개 선택 후 다음 진행 비율
- 측정: `categories_view` 대비 `categories_next_click`

4. 소비 입력 완료율
- 정의: 금액 입력 후 결과로 이동 비율
- 측정: `input_spending_view` 대비 `input_spending_next_click`

5. 상세 질의 패널 오픈율
- 정의: 결과 화면에서 ‘더 물어보기’ 클릭 비율
- 측정: `results_view` 대비 `side_sheet_open`

6. 시간당 흐름 완료 시간
- 정의: Entry 진입부터 결과 도달까지 걸린 시간의 중앙값
- 측정: `entry_view` 타임스탬프와 `results_view` 타임스탬프 차이

7. 추천 카드 상호작용률
- 정의: 추천 카드의 상세 버튼 클릭 비율
- 측정: `results_view` 대비 `card_detail_click`

## 이벤트 명세(초안)
- `entry_view`
- `mode_select_compare`
- `mode_select_new`
- `select_card_view`
- `select_card_search`
- `select_card_pick`
- `select_card_next_click`
- `categories_view`
- `categories_pick`
- `categories_next_click`
- `input_spending_view`
- `input_spending_change`
- `input_spending_next_click`
- `results_view`
- `card_detail_click`
- `side_sheet_open`
- `side_sheet_close`

## 리스크 및 확인 필요
- KPI와 이벤트 명칭은 팀 기준에 맞춰 최종 확정 필요
- 분석 도구(예: GA, Amplitude)와 이벤트 수집 방식 확정 필요
