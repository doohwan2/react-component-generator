# AGENTS.md — React Component Generator

## Operational Commands

```bash
bun install          # 의존성 설치
bun run dev          # API 서버(3002) + Vite 개발서버(5173) 동시 실행
bun run server       # Bun API 서버만 실행 (--watch 자동 재시작)
bun run build        # TypeScript 컴파일 + Vite 프로덕션 빌드
bun run lint         # ESLint 검사
bun run preview      # 프로덕션 빌드 미리보기
```

**런타임 고정: `bun` 전용 — npm / yarn / pnpm 절대 사용 금지.**

환경변수 변경 시 `.env` 수정 후 서버를 반드시 재시작해야 적용된다.

## Golden Rules

### Immutable (절대 타협 불가)

- API 키를 소스 코드에 하드코딩하지 마라. `.env` 또는 런타임 입력만 허용한다.
- `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`를 로그에 출력하거나 응답 바디에 포함하지 마라.
- `SYSTEM_PROMPT`를 수정할 때는 반드시 두 프로바이더(Anthropic, Google) 모두 테스트한다.
- react-live 샌드박스 제약을 어기는 코드를 생성하지 마라 (아래 항목 참조).

### react-live 샌드박스 제약 (AI가 생성하는 코드에 적용)

생성된 컴포넌트 코드는 다음 조건을 충족해야 react-live에서 렌더링된다:

- `import` 문 없음 — React는 전역으로 제공됨
- TypeScript 문법 없음 — 순수 JavaScript만 허용
- 훅은 `React.useState`, `React.useEffect` 형태로 사용 (구조 분해 금지)
- 파일 마지막에 반드시 `render(<ComponentName />)` 호출 포함
- 인라인 스타일만 사용 (CSS imports, CSS modules 금지)

### Do's

- `bun` CLI와 `Bun.serve()` API만 사용한다.
- 모든 API 응답에 `CORS_HEADERS`를 포함한다.
- API 키 우선순위를 지킨다: 클라이언트 입력 → `.env`
- 에러 처리 시 503 / 429를 별도로 구분하여 사용자 친화적 메시지를 반환한다.

### Don'ts

- Express, Hono, Fastify 등 외부 HTTP 프레임워크를 도입하지 마라.
- CSS 프레임워크(Tailwind, styled-components 등)를 추가하지 마라.
- Context API, Redux 등 전역 상태관리 라이브러리를 추가하지 마라.
- 테스트 없이 `SYSTEM_PROMPT`를 커밋하지 마라.

## Project Context

AI 프롬프트로 React 컴포넌트를 실시간 생성·미리보기하는 웹 워크벤치. Anthropic Claude와 Google Gemini를 듀얼 프로바이더로 지원한다.

Tech Stack: React 19, TypeScript 5.9, Vite 8, Bun, react-live 4, ESLint 9

## Standards

**커밋 메시지:** `feat:`, `fix:`, `chore:`, `refactor:`, `docs:` 접두사 사용.

**타입:** `src/types/index.ts`에서 공유 타입(`Provider`, `GeneratedComponent`)을 중앙 관리한다. 로컬 타입을 새로 만들기 전에 이 파일을 먼저 확인한다.

**린트:** PR 전에 `bun run lint`를 실행하여 ESLint 오류가 없는지 확인한다.

**Maintenance Policy:** 이 파일의 규칙이 실제 코드와 괴리가 생기면 즉시 업데이트를 제안한다.

## Context Map

- **[프론트엔드 (React/Vite)](./src/AGENTS.md)** — UI 컴포넌트, 훅, 타입, 스타일 수정 시.
- **[백엔드 (Bun API 서버)](./server/AGENTS.md)** — API 라우트, AI 프로바이더 통합, SYSTEM_PROMPT 수정 시.
