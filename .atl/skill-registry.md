# Skill Registry — plataforma-calendario

## User Skills

| Skill | Trigger | Path |
|-------|---------|------|
| branch-pr | PR creation, branch management | `~/.claude/skills/branch-pr/SKILL.md` |
| issue-creation | GitHub issue creation | `~/.claude/skills/issue-creation/SKILL.md` |
| judgment-day | Code review, audit | `~/.claude/skills/judgment-day/SKILL.md` |
| go-testing | Go tests, Bubbletea TUI | `~/.claude/skills/go-testing/SKILL.md` |
| skill-creator | Creating new AI skills | `~/.claude/skills/skill-creator/SKILL.md` |

## Project Skills

| Skill | Trigger | Path |
|-------|---------|------|
| vercel-react-best-practices | React/Next.js components, performance, data fetching | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| web-design-guidelines | UI review, accessibility, design audit | `.agents/skills/web-design-guidelines/SKILL.md` |

## Project Conventions

| File | Scope |
|------|-------|
| `CLAUDE.md` | Root — stack, commands, critical rules |
| `frontend/CLAUDE.md` | Frontend — Next.js conventions, imports, testing |
| `backend/CLAUDE.md` | Backend — Laravel conventions |

## Compact Rules

### vercel-react-best-practices
- Eliminate waterfalls (parallel data fetching)
- Use Suspense boundaries for streaming
- Prefer useTransition for non-blocking updates
- Smart (containers with hooks) vs Dumb (pure presentational)

### web-design-guidelines
- Semantic tokens for colors (error-*, warning-*, success-*, primary-*, neutral-*)
- Icons from lucide-react, not inline SVGs
- Prefer gap-* over space-x-*

### project-conventions
- NEVER commit with Co-Authored-By or AI attribution
- ALWAYS use conventional commits: type(scope): description
- TypeScript strict, no `any`, use `@/` path aliases
- Smart/Dumb component separation in features/
- Jest + Testing Library for unit, Playwright for E2E
