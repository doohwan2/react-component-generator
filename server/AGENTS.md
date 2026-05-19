# AGENTS.md — Backend (server/)

## Module Context

Bun HTTP 서버. Anthropic Claude / Google Gemini API 프록시 역할만 담당한다. 데이터베이스 없음, 세션 없음, 순수 stateless.

두 엔드포인트: `GET /api/config` (환경변수 키 존재 여부 반환), `POST /api/generate` (AI 프로바이더 호출 후 정제된 코드 반환).

## Tech Stack & Constraints

- Bun 런타임, `Bun.serve()` API, 네이티브 `fetch`
- 외부 HTTP 프레임워크(Express 등) 도입 금지
- 외부 라이브러리 추가 금지 — 표준 라이브러리와 Bun 내장 API만 사용

## Implementation Patterns

**API 키 우선순위:** 클라이언트 전달 키 → `.env` 환경변수. `resolveApiKey()` 함수가 이 로직을 담당한다.

**모델 고정값:**
- Anthropic: `claude-haiku-4-5-20251001`
- Google: `gemini-2.5-flash`

**응답 후처리 파이프라인 (순서 고정):**
```
AI 원본 텍스트 → stripCodeFences() → ensureRenderCall() → 클라이언트 반환
```

**에러 응답 패턴:**
- 400: API 키 없음, 프롬프트 없음
- 429: 요청 초과 (`429` 포함 에러 메시지 감지)
- 503: API 과부하 (`503` 포함 에러 메시지 감지)
- 500: 그 외 모든 에러

**CORS:** 모든 `Response` 객체에 `CORS_HEADERS`를 포함한다. 빠뜨리면 프론트엔드에서 요청 실패.

## Local Golden Rules

- `SYSTEM_PROMPT`를 수정할 때는 두 프로바이더 모두 직접 호출하여 react-live에서 렌더링되는지 검증한다.
- `SYSTEM_PROMPT`가 생성하는 코드는 반드시 react-live 샌드박스 제약을 만족해야 한다: import 없음, TypeScript 문법 없음, `render()` 호출 포함, 인라인 스타일만.
- API 키를 `console.log`, 에러 메시지, 응답 바디에 절대 노출하지 마라.
- `Bun.serve()`의 `fetch` 핸들러는 항상 `Response` 객체를 반환해야 한다 — `undefined` 반환 시 서버 크래시.
- 새 엔드포인트 추가 시 `CORS_HEADERS`를 OPTIONS 핸들러와 실제 응답 양쪽에 모두 포함한다.
