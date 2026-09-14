# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responde siempre en español en este proyecto, sin importar el idioma en el que esté escrita la solicitud.

## Project status

The game is implemented and playable (`index.html`, `css/style.css`, `js/game.js`), built entirely through the spec-driven workflow described below — every feature currently in the code traces back to an approved spec in `specs/`. There is no build system, package manager, test runner, or lint config in this repo (no `package.json`); it's static HTML/CSS/JS served or opened directly.

## Goal

Arkanoid/Breakout game using plain **HTML, CSS, and JavaScript with zero dependencies** — no frameworks, no npm packages, no bundler. Playable directly (opening `index.html` / serving the static files). New features and changes keep following the spec-driven process, not ad hoc edits.

## Available assets

- `assets/spritesheet-breakout.png` — sprite sheet for paddle, ball, and colored blocks.
- `assets/spritesheet.js` — plain JS module that loads the sprite sheet onto an offscreen canvas and exposes `drawSprite(ctx, name, x, y, w, h)` / `drawFrame(ctx, frame, x, y, w, h)` helpers. Sprite coordinates (paddle, ball, `block_<color>`, explosion animation frames per color) are already defined in the `SPRITES` / `EXPLOSION_FRAMES` constants in this file — reuse these instead of redefining sprite regions.
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — sound effects for ball bounces and block breaks.

When implementing the game, load and reuse `assets/spritesheet.js` rather than re-deriving sprite sheet coordinates from the PNG.

## Required workflow: spec-driven development

This repo uses a two-step, skill-driven workflow instead of ad hoc implementation. **Do not start writing game code directly** — follow this process:

1. **`/spec <description>`** — Guided spec creation (skill source at `.agents/skills/spec/SKILL.md`, symlinked from `.claude/skills/spec`; both skills are pinned via `skills-lock.json` from the `Klerith/fernando-skills` repo). Reads project context, asks clarifying questions in Phase 2, then writes a numbered spec file to `specs/NN-slug.md` following the structure in `.agents/skills/spec/template.md`. Every new spec starts in `Draft` state (this repo's specs use the Spanish label `Borrador`/`Implementado`/etc. — match the existing wording). It also seeds `specs/.spec-config.yml` the first time it runs.
2. **`/spec-impl NN-slug`** — Implements an approved spec (skill at `.agents/skills/spec-impl/SKILL.md`, symlinked the same way). It will **refuse to run unless the spec's state means "Approved"** (`Aprobado` in this repo's convention — the human sets this manually after reviewing the draft). On success it creates a git branch `spec-NN-slug`, shows the objective/scope/plan/acceptance criteria, and then implements the plan **one step at a time, pausing for review after each step**. It never commits automatically.

Existing specs in `specs/` (numbered, chronological, each building on the previous game state): `01-mvp-jugable.md` (core playable loop: paddle, ball physics, blocks, lives/score, screens), `02-explosion-bloques-y-boton-sonido.md` (block explosion animation + sound toggle), `03-niveles-procedurales.md` (5 procedurally generated levels with increasing difficulty). All three are marked `Implementado` — read them before adding a related feature to avoid re-deciding things already settled there (e.g. data model fields, file names, out-of-scope items deferred to a future spec).

Key rules enforced by these skills (respect them even if invoked manually rather than via the slash commands):

- Never propose or start implementation while writing a spec — spec writing and coding are separate phases.
- Never implement a spec that isn't `Approved`/`Aprobado` (or an equivalent word in another language) — stop and ask the human to change the state.
- Implement exactly what the spec says; if something looks suboptimal, raise it as an observation but don't silently deviate. Spec changes go in the spec, not as a surprise in the code.
- Never commit changes automatically during implementation — that's the user's explicit call.
- Branch creation behavior is controlled by `specs/.spec-config.yml` (`AutoCreateBranch: true` by default); this file is seeded by `/spec` the first time it runs and should not be overwritten afterward.
- After finishing a spec's implementation plan, verify its acceptance criteria one by one before considering it done, then update the spec's state to `Implementado` and let the user make the final commit/merge.

Given this, when asked to add or change a game feature, prefer running `/spec` first (or ask whether a spec already exists/should be created) rather than jumping straight to code, unless the user explicitly asks you to skip the process for a small, low-risk change.
