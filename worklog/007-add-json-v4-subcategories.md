# Worklog: Add JSON v4 subcategories

## 왜 이렇게 했나요
- 마크다운 기반 데이터를 더 세밀하게 분류해 사용자 입력(세부 카테고리)과 연결하기 위해서입니다.
- 기존 v3 스키마를 건드리지 않고 v4로 분리해 실험/확장을 안전하게 진행합니다.

## 무엇을 수정했나요
- `generate_json_v4.py`를 추가하고, 출력 경로를 `datasets/json_v4`로 분리했습니다.
- v4 스키마에 `subcategory` 필드를 추가했습니다.
- 카테고리/세부 카테고리 매핑 규칙을 최신 합의(레저는 Cultural 포함)로 반영했습니다.

## 확인 방법
- 실행: `python -m scripts.generate_json_v4`
- 출력: `datasets/json_v4/`

## 참조 주석
- 스키마: 데이터 구조의 규칙(필드와 타입 정의)
- 서브카테고리: 큰 카테고리 아래의 세부 분류
