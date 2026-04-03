# Worklog: Frontend-only Vercel setup

## 왜 이렇게 했나요
- monorepo에서 프론트만 먼저 배포하려면 Vercel에 프론트 경로를 명확히 지정해야 합니다.
- 백엔드/데이터 폴더를 배포 대상에서 제외해 빌드 용량과 속도를 줄이기 위함입니다.

## 무엇을 수정했나요
- `vercel.json`을 추가해 `frontend/package.json`을 빌드 대상으로 지정했습니다.
- `.vercelignore`로 백엔드/데이터/스크립트 폴더를 배포에서 제외했습니다.
- `frontend/DEPLOYMENT.md`에 배포 요약을 기록했습니다.

## 확인 방법
- Vercel에서 root repository를 연결한 뒤 배포
- 환경변수 `NEXT_PUBLIC_API_BASE` 설정

## 참조 주석
- monorepo: 하나의 저장소 안에 여러 프로젝트가 함께 있는 구조
- Vercel ignore: 배포 대상에서 제외할 파일/폴더 목록
