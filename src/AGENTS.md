# AGENTS.md — Frontend (src/)

## Module Context

React 19 SPA. 사용자 프롬프트를 받아 `/api/generate`를 호출하고, 반환된 코드를 react-live로 실시간 렌더링한다. 전역 상태 없음 — `useComponentGenerator` 훅이 컴포넌트 목록과 로딩/에러 상태를 담당한다.

## Tech Stack & Constraints

- React 19, TypeScript 5.9, Vite 8, react-live 4
- 스타일: `App.css` / `index.css` 전역 CSS만 사용. CSS 모듈, Tailwind, styled-components 금지.
- 상태관리: `useState` + `useCallback` 훅. Context API, Redux 등 추가 금지.

## Implementation Patterns

**컴포넌트 ID 생성:**
```ts
id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
```

**API 호출:** `useComponentGenerator` 훅 내부에서만 수행한다. 컴포넌트에서 직접 `fetch('/api/generate')`를 호출하지 마라.

**타입 참조:** `Provider`, `GeneratedComponent`는 `src/types/index.ts`에서 import한다. 중복 선언 금지.

**파일 네이밍:** 컴포넌트 파일은 PascalCase (`ComponentCard.tsx`), 훅 파일은 camelCase with `use` 접두사 (`useComponentGenerator.ts`).

## Local Golden Rules

- `LivePreview.tsx`는 react-live 샌드박스를 래핑한다. 이 파일을 수정할 때 react-live의 `scope` prop이 렌더링에 필요한 전역을 올바르게 전달하는지 확인한다.
- `PromptInput`에서 `onGenerate`를 호출할 때 빈 문자열을 전달하지 않도록 유효성 검사를 유지한다.
- `ComponentCard`의 `onRegenerate`는 원래 프롬프트를 그대로 재사용한다 — 프롬프트를 임의로 변형하지 마라.
- Provider 타입은 `'anthropic' | 'google'` 리터럴로 고정됨. 새 프로바이더 추가 시 `src/types/index.ts`와 `App.tsx`의 `PROVIDER_CONFIG`를 함께 수정한다.
