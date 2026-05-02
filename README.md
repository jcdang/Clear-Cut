# ClearCut

Privacy-first background removal that runs entirely in your browser. Drop in an image, get a clean cutout — no uploads, no servers, no data leaves your device.

[![CI](https://github.com/jcdang/clear-cut/actions/workflows/ci.yml/badge.svg)](https://github.com/jcdang/clear-cut/actions/workflows/ci.yml)
[![Deploy](https://github.com/jcdang/clear-cut/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/jcdang/clear-cut/actions/workflows/deploy.yml)
[![Live demo](https://img.shields.io/badge/demo-jcdang.com%2Fclear--cut-2563eb)](https://jcdang.com/clear-cut/)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](#license)
[![Last commit](https://img.shields.io/github/last-commit/jcdang/clear-cut)](https://github.com/jcdang/clear-cut/commits/main)

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

## Try it

→ **[jcdang.com/clear-cut](https://jcdang.com/clear-cut/)**

## Features

- Drop, click, or paste images (JPEG, PNG, WEBP)
- Batch processing — queue up many files at once
- Composite the cutout onto a solid color or your own background image
- Side-by-side comparison slider for the before/after
- Export individual PNGs or download the whole batch as a zip
- Works offline once loaded

Your images never leave your device — inference happens locally in the browser.

## How it works

Background removal is handled by [@imgly/background-removal](https://github.com/imgly/background-removal-js), which runs an ONNX segmentation model directly in the browser. It uses WebGPU when available and falls back to threaded WebAssembly.

For the WASM path to actually use multiple threads, the page needs `SharedArrayBuffer`, which requires the document to be cross-origin isolated (`COOP: same-origin` + `COEP: require-corp` response headers). GitHub Pages can't set custom response headers, so [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) installs a tiny service worker that intercepts every response and rewrites the headers. The same SW also adds `CORP: cross-origin` to all responses, which lets the cross-origin model fetches from imgly's CDN keep working.

## Local development

Requires Node.js 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

### Scripts

| Command              | What it does                         |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start the Vite dev server            |
| `pnpm build`         | Production build to `dist/`          |
| `pnpm preview`       | Preview the production build locally |
| `pnpm typecheck`     | TypeScript type-check                |
| `pnpm test`          | Run Vitest tests once                |
| `pnpm test:watch`    | Vitest watch mode                    |
| `pnpm test:coverage` | Tests + v8 coverage report           |
| `pnpm lint`          | ESLint                               |
| `pnpm format`        | Prettier write                       |
| `pnpm format:check`  | Prettier check (used in CI)          |

## Tech stack

- **UI**: React 19, Vite 7, Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com) on Radix UI, Lucide icons
- **Inference**: @imgly/background-removal, [ONNX Runtime Web](https://onnxruntime.ai)
- **Tooling**: TypeScript 5.9, Vitest + happy-dom + @testing-library/react, ESLint 9 (flat config), Prettier
- **Hosting**: GitHub Pages via GitHub Actions, served from `jcdang.com/clear-cut/`
- **Supply-chain hardening**: pnpm with `minimum-release-age=1440` (24h quarantine on new npm releases) — defense against shai-hulud-style attacks

## CI/CD

Pushes to `main` run `.github/workflows/deploy.yml`: the full check suite (format → lint → typecheck → test → build) gates the GitHub Pages publish step. PRs run the same suite via `.github/workflows/ci.yml`, and branch protection on `main` requires it to pass before any PR can merge.

Dependabot runs weekly against npm and GitHub Actions. Patch and minor updates auto-merge once CI passes; major bumps queue up for human review.

## Acknowledgments

Initial scaffolding generated with [Replit](https://replit.com). Refactor, deployment pipeline, and ongoing iteration built with [Claude Code](https://claude.com/claude-code) (Anthropic).

## License

MIT
