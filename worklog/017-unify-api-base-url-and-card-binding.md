# Worklog 017: 기존 카드 선택 데이터 연동 (API 베이스 단일화)

## Date: 2026-04-10
## Status: Done

## 문제
- “기존 카드 선택” 화면의 선택 값이 실제 카드 정보와 완전히 연동되지 않음.
- 카드 목록 호출은 `NEXT_PUBLIC_API_BASE`(기본 `http://localhost:8000`)를 쓰고,
  추천/QA 호출은 `NEXT_PUBLIC_BASE_URL`(기본 ngrok)을 써서 **환경변수가 분리**되어 있었음.

## 조치
- API 베이스를 `NEXT_PUBLIC_BASE_URL`로 단일화 (`src/state/config.ts` 추가)
  - ngrok 도메인이면 `ngrok-skip-browser-warning` 헤더 자동 포함
- Step2 카드 목록도 동일 베이스로 호출하도록 수정 (`GET {BASE}/cards`)
  - 응답이 `[{...}]` 또는 `{ cards: [...] }` 형태 모두 처리
- 선택한 카드의 상세 정보(연회비/전월실적/카테고리/요약)를 AppState에 저장하도록 확장
- 로컬 백엔드 연결을 위한 `.env.local` 가이드 추가 (`.env.example`, `README.md`)

## 확인 방법
- `.env.local`에 `NEXT_PUBLIC_BASE_URL=http://localhost:8000` 설정 후
- `/select-card`에서 실제 카드 목록이 뜨는지 확인
- 카드 선택 후 다음 단계로 이동했을 때 선택 카드 정보가 상태에 유지되는지 확인

