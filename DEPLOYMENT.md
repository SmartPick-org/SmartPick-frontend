# Frontend Deployment (Vercel)

이 프로젝트는 monorepo 구조이며, Vercel에서는 `frontend/`만 배포합니다.

## 핵심 설정
- `vercel.json`에서 `frontend/package.json`을 빌드 대상으로 지정
- `.vercelignore`로 백엔드/데이터/스크립트 등을 제외

## 환경변수
- `NEXT_PUBLIC_API_BASE` (백엔드 주소)
  - 예: `https://api.example.com`

## 로컬 확인
```bash
cd frontend
npm run build
npm run start
```
