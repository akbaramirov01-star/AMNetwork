# Working in this repo — read this first

This repository is actively worked on by more than one AI assistant (Claude
Code and Codex, at least). There is no human reviewing every change before
it lands on `main`, so these rules exist to keep the two from clobbering
each other's work.

For full project context (what AM Network is, tech stack, business model,
what's built), read `CLAUDE.md` first — this file only covers how to work
safely in a repo with multiple agents.

## Before you start

- `git pull` (or fetch + check `origin/main`) before making any change.
  Don't assume the working tree reflects the latest state — another
  assistant may have pushed since your last session.
- Run `git log -10` and skim recent commits, especially before touching a
  shared file like `index.html`. If a recent commit added something you
  don't recognize, that's not dead code to clean up — find out what it's
  for before changing or removing it.

## Scope discipline

- Change only what was explicitly asked. Do not make broad, sweeping edits
  to solve a narrow request.
  - Concrete example of what went wrong once: asked to reduce some
    animation, one assistant added a global
    `*{animation:none!important;transition:none!important}` rule that
    silently killed every animation on the site — the scroll-reveal
    effects, the live ledger, the Zakat countdown, the score ticker. The
    fix took a separate session to track down and reverse.
- If a request is ambiguous about scope ("less flashy", "cleaner",
  "simplify"), ask what specifically should change rather than guessing
  wide.
- Don't refactor, rename, or "clean up" code you weren't asked to touch,
  even if it looks messy — a later session may be relying on it as-is.

## Before you push

- Summarize in plain language (in the commit message, and to the owner if
  you're relaying a summary) exactly what changed and why — not just that
  something changed.
- Keep commits scoped to one logical change so a later revert (by a human
  or another assistant) doesn't have to untangle unrelated edits.

## Working branches

- Direct commits to `main` are the norm here (see CLAUDE.md — no PR
  workflow). That makes the rules above more important, not less: there is
  no review step to catch a scope-creeping change before it's live.
