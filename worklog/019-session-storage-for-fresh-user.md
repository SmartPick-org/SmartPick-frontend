# Worklog 019: 새로고침 시 새 유저로 인식 (sessionStorage 전환)

## Date: 2026-04-13
## Status: Done

## 문제
- 기존에 `localStorage`를 사용해 앱 상태를 저장하고 있었음.
- `localStorage`는 새로고침 후에도 이전 상태가 복원되어, 새로 진입한 유저도 이전 세션 데이터를 그대로 이어받는 문제 발생.
- 요구사항: 같은 탭 내에서 페이지 간 이동 시 상태 유지, 새로고침하면 초기화(새 유저로 인식).

## 조치
- `src/state/appState.tsx`: `localStorage` → `sessionStorage` 전환 (2곳)
  - 마운트 시 상태 복원: `sessionStorage.getItem(STORAGE_KEY)`
  - 상태 변경 시 저장: `sessionStorage.setItem(STORAGE_KEY, ...)`

## 동작 차이

| 상황 | 변경 전 (localStorage) | 변경 후 (sessionStorage) |
|------|----------------------|------------------------|
| 페이지 간 이동 | 유지 | 유지 |
| 새로고침 | 유지 (문제) | 초기화 |
| 탭 닫기 후 재오픈 | 유지 (문제) | 초기화 |

## 확인 방법
- 홈 → 카드 선택 → 카테고리 선택 시 상태 유지되는지 확인
- 중간 단계에서 새로고침 시 홈부터 다시 시작되는지 확인
