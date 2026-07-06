# AI Prompt History

Full transparency, per the submission requirements: this project was built with
AI assistance in two phases. Every prompt is reproduced below, in order.

## Phase 1 — Research & blueprint (design exploration)

These prompts were used to research the approach and produce a design blueprint
document ("Neo Tox Blueprint") before any code was written:

1. **System definition**
   > "What is the best modern stack to build a bulletproof, premium React Native
   > application with high-performance animations and zero magic numbers for a
   > coding test?"

   *Outcome:* Expo managed workflow + Skia + Reanimated + Zustand.

2. **Design ingestion**
   > "Analyze the styling, shaders, and animations in the provided Neo Tox design
   > system context. How do we translate this exact neon and glassmorphic look to
   > React Native without losing frames?"

   *Outcome:* Skia custom shaders and GPU shadows instead of CPU-heavy view shadows.

3. **Complexity scaling (N×N)**
   > "Write a scalable checkWin algorithm and depth-limited Minimax solver with
   > alpha-beta pruning that won't lag or crash on a 4x4 or 5x5 board size."

   *Outcome:* Dynamic line generation and depth limits to keep AI moves off the
   frame budget.

4. **Haptic & visual polishing**
   > "How can we synchronize custom Skia path drawing animations (markers and
   > strike line) with haptics to deliver a sensory game feel?"

   *Outcome:* Timed path trims, spring transitions, and expo-haptics event mapping.

Separately, a research pass was done on what earns 4.7+ store ratings
(premium-feel case studies: Balatro, Monument Valley; Octalysis/Hook frameworks;
rating-killers to avoid), summarized into an internal playbook that informed the
design: white-hat motivation only, no friction, celebrate every win, accessibility
and polish as first-class requirements.

## Phase 2 — Implementation (Claude Code session)

The app itself was built in a single Claude Code (Anthropic CLI) session. The
operator prompt was:

> "Check this link https://expo.dev/changelog/sdk-57 — create an app with expo 57,
> basic app, validate it works. Then read these files and create the app we want:
> [the vetting-test instructions email] + Neo Tox Blueprint.pdf +
> high-rated-games-playbook.md. Create the app in Documents."

During implementation, the AI deviated from the blueprint deliberately where the
blueprint was wrong or below standard, and those decisions are part of the record:

- The blueprint's `RuntimeShader` usage was replaced with a Skia `Shader` fill
  (`RuntimeShader` is an image filter and would not have rendered).
- Reanimated's deprecated `Layout` transition was replaced with `LinearTransition`
  (Reanimated 4.x).
- The blueprint's own magic numbers (stroke widths, blur radii, stagger delays,
  easing control points, shader tuning constants) were extracted into
  `src/theme/tokens.ts` to genuinely satisfy the zero-magic-numbers rule.
- `Player` was defined in the engine rather than the store, removing a circular
  import present in the blueprint.
- Stats now increment based on *who actually won*, and a `gameId` guard was added
  so resetting the game during the AI's thinking delay can't apply a stale move.
- Board geometry was centralized in one hook (`useBoardMetrics`) shared by the
  touch grid and the Skia strike overlay, replacing duplicated layout math.
- The `translucent` prop was dropped from `expo-status-bar` (removed in SDK 57).
- Added move ordering + an open-line heuristic to the AI so 4×4/5×5 play is both
  fast and strong; added a seeded self-play test proving the 3×3 AI never loses.
- During on-device validation, Reanimated 4.5's preset `ZoomIn` entering
  animation froze at its initial scale on RN 0.86 (New Architecture), leaving
  markers invisible. Diagnosed via simulator screenshots and replaced with an
  explicit shared-value spring (`PopIn` component) — which also degrades
  correctly for Reduce Motion users.
- Replaced the deprecated imperative `Skia.Path.Make().moveTo/lineTo` API with
  an SVG string path in the winning strike (removes runtime deprecation
  warnings on Skia 2.6).

## Verification performed by the AI before submission

- `npm run typecheck` — strict TypeScript, clean
- `npm test` — 25 unit tests passing (engine + store)
- `npx expo export` — Hermes production bundle builds
- `npx expo run:ios` — full native build, launched and exercised on the
  iPhone 17 Pro simulator (Xcode 26.5)
