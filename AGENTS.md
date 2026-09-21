<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## How to work in this repo

- Always run from the repo root. Never launch in $HOME and ask the human to describe the repo.
- Read this file at session start. Don't ask the human to re-explain the stack.
- Reference files with @path, like @src/lib/deals.ts. Never paste whole files into chat.
- Multi-file work: use /plan first, get approval, then write code.
- Don't invent APIs, props, or file paths. Verify against the repo and node_modules before writing code.
- Don't paste session transcripts into Notion or anywhere else to "recover" context. If context is lost, re-read the repo.
- Product decisions live in the Notion Projects pages. This file is for how to work, not what to build.
- The agent should never need a Notion transcript or chat history to do its job. If it does, the repo docs are incomplete. Fix them here.
- Explain everything in plain human language. No jargon, no code dumps unless asked.

## Jev decision layer

- Routing, scoring, risk-checking, and "which approach" decisions go to Jev via the API, not frontier reasoning. Jev proposes, code disposes.
- Endpoint: POST https://api.typesafe.ai/v1/systemone. Key comes from the environment. Never hardcode it.
- Dev calls: is this diff risky, which implementation approach, does this need human review, is this tool call necessary.

## Prox launch - anti-loop rules (Mr.Silver / captain standing order)

These override the "/plan first" habit when it causes retries. Prefer implement-or-blocker over plan-mode loops.

1. **One try then ask.** First auth/env/tool failure -> STOP. Name the exact secret or decision. No second script. No "clearer purpose" retry after a Jev/PreToolUse deny.
2. **One path only.** Default: this repo root on the branch the human named (usually `mordecai/prox-launch-fixes`). Do not open `C:\Users\oldpi\prox` or any `.grok\worktrees\*` unless the human says so.
3. **No plan-mode loops.** Do not rewrite the plan, do not spam `exit_plan_mode`. Implement the asked change or return a 5-line blocker.
4. **No live side effects** unless the human writes `apply` / `deploy` / `listen` / `dev`. No `stripe listen`, no extra `next dev`, no seed SQL, no Vercel env writes.
5. **Budget:** max ~8 tool calls per turn. If you need more: 5-line blocker and wait.
6. **Secrets:** Never treat `SUPABASE_SERVICE_ROLE_KEY` as valid until the JWT `role` is `service_role` (not `anon`). Missing Stripe keys -> stop and ask; do not invent workarounds.
