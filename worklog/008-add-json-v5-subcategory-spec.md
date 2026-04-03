# Worklog: Add JSON v5 subcategory spec

## 왜 이렇게 했나요
- 제공하신 최종 sub_category 표를 기준으로 v5 스키마를 맞추기 위함입니다.
- v4의 PascalCase/카멜 규칙을 v5에서는 snake_case로 통일했습니다.

## 무엇을 수정했나요
- `generate_json_v5.py`를 새로 추가했습니다.
- v5 프롬프트에 sub_category 목록을 snake_case로 반영했습니다.
- Reserved 항목을 명시해 향후 확장 여지를 남겼습니다.

## 확인 방법
- 실행: `python -m scripts.generate_json_v5`
- 출력: `datasets/json_v5/`

## 참조 주석
- snake_case: 단어를 밑줄로 연결하는 표기 방식 (예: `fast_food`)
- Reserved: 현재는 사용하지 않지만 미래 확장용으로 남겨둔 항목
