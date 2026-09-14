# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responde siempre en español en este proyecto, sin importar el idioma en el que esté escrita la solicitud.

## Project status

This repository currently contains **no game implementation yet** — only the project goal, art/audio assets, and a spec-driven workflow used to plan and build the game. There is no build system, package manager, test runner, or lint config in this repo (no `package.json`, no HTML/JS/CSS source files at this point).

## Goal

Build an Arkanoid/Breakout game using plain **HTML, CSS, and JavaScript with zero dependencies** — no frameworks, no npm packages, no bundler. The finished game must be playable directly (e.g. opening an `index.html` file / serving the static files).

## Available assets

- `assets/spritesheet-breakout.png` — sprite sheet for paddle, ball, and colored blocks.
- `assets/spritesheet.js` — plain JS module that loads the sprite sheet onto an offscreen canvas and exposes `drawSprite(ctx, name, x, y, w, h)` / `drawFrame(ctx, frame, x, y, w, h)` helpers. Sprite coordinates (paddle, ball, `block_<color>`, explosion animation frames per color) are already defined in the `SPRITES` / `EXPLOSION_FRAMES` constants in this file — reuse these instead of redefining sprite regions.
- `assets/sounds/ball-bounce.mp3`, `assets/sounds/break-sound.mp3` — sound effects for ball bounces and block breaks.

When implementing the game, load and reuse `assets/spritesheet.js` rather than re-deriving sprite sheet coordinates from the PNG.

## Required workflow: spec-driven development

This repo uses a two-step, skill-driven workflow instead of ad hoc implementation. **Do not start writing game code directly** — follow this process:

1. **`/spec <description>`** — Guided spec creation (skill at `.claude/skills/spec/SKILL.md`, mirrored in `.agents/skills/spec/SKILL.md`). Asks clarifying questions, then writes a numbered spec file to `specs/NN-slug.md` (this folder doesn't exist yet — the first spec creates it). Every new spec starts in `Draft` state.
2. **`/spec-impl NN-slug`** — Implements an approved spec (skill at `.claude/skills/spec-impl/SKILL.md`). It will **refuse to run unless the spec's state is `Approved`** (the human sets this manually after reviewing the draft). On success it creates a git branch `spec-NN-slug`, shows the objective/scope/plan/acceptance criteria, and then implements the plan **one step at a time, pausing for review after each step**. It never commits automatically.

Key rules enforced by these skills (respect them even if invoked manually rather than via the slash commands):

- Never propose or start implementation while writing a spec — spec writing and coding are separate phases.
- Never implement a spec that isn't `Approved` (or an equivalent word in another language) — stop and ask the human to change the state.
- Implement exactly what the spec says; if something looks suboptimal, raise it as an observation but don't silently deviate. Spec changes go in the spec, not as a surprise in the code.
- Never commit changes automatically during implementation — that's the user's explicit call.
- Branch creation behavior is controlled by `specs/.spec-config.yml` (`AutoCreateBranch: true` by default); this file is seeded by `/spec` the first time it runs and should not be overwritten afterward.

Given this, when asked to "build the game" or add a feature, prefer running `/spec` first (or ask whether a spec already exists/should be created) rather than jumping straight to code, unless the user explicitly asks you to skip the process for a small, low-risk change.
