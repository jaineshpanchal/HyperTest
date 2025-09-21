# Contributing to HyperTest

Thanks for helping! Please follow these basics:

## Workflow
1. Fork & branch from `main`.
2. `pnpm install`, `pnpm -r build`, `pnpm lint`.
3. Add tests/docs when relevant.
4. Open a PR (template below) — 1 reviewer minimum; CI must pass.

## Commit messages (Conventional Commits)
Use: `type(scope): short description`

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`, `ci`.  
Breaking changes: add `!` _or_ a `BREAKING CHANGE:` footer.  
Examples:
- `feat(agent): plan → record/script/run orchestration`
- `fix(cli): handle empty prompt`
- `refactor(web-runner)!: drop Node 16 support`

Why: Enables clean history and automated releases. :contentReference[oaicite:1]{index=1}

## PR expectations
- Describe _what_ & _why_. Link issues.
- Include screenshots for UX changes.
- Keep PRs small and focused.

## Code style
- TypeScript strict.
- `pnpm lint` must be clean (no warnings).
- `pnpm format:write` before pushing.

## Changelog
We maintain a human-readable `CHANGELOG.md` per [Keep a Changelog]. New entries land via release PRs. :contentReference[oaicite:2]{index=2}

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
