# AI Prompt History

Full transparency, per the submission requirements: this project was built with
AI assistance in three phases. Every prompt is reproduced below, in order,
together with what each one produced.

---

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

   *Outcome:* Timed path trims, spring transitions, and haptic event mapping.

Separately, a research pass was done on what earns 4.7+ store ratings
(premium-feel case studies: Balatro, Monument Valley; Octalysis/Hook frameworks;
rating-killers to avoid), summarized into an internal playbook that informed the
design: white-hat motivation only, no friction, celebrate every win, accessibility
and polish as first-class requirements.

---

## Phase 2 — Implementation (AI pair-programming session)

The app itself was built in a terminal-based AI coding session. The operator
prompt was:

> "Check the Expo SDK 57 changelog — create an app with expo 57, basic app,
> validate it works. Then read these files and create the app we want:
> [the vetting-test instructions email] + Neo Tox Blueprint.pdf +
> high-rated-games-playbook.md. Create the app in Documents."

### Deliberate deviations from the blueprint

The blueprint was treated as a starting hypothesis, not gospel. Where it was
wrong or below standard, the implementation deviates — and those decisions are
part of the record:

| Blueprint issue | What shipped instead |
|---|---|
| `RuntimeShader` used as a fill (it's an image filter — would not render) | Skia `Shader` fill driven by a GPU clock |
| Deprecated `Layout` transition (Reanimated 4.x) | `LinearTransition` |
| Magic numbers inside its own components (stroke widths, blur radii, stagger delays, easing points, shader constants) | All extracted into `src/theme/tokens.ts` |
| Circular import between store and engine | `Player` type lives in the engine |
| Stats incremented by code path, not by winner | Winner-checked stat updates |
| No protection against resets during the AI's thinking delay | `gameId` race guard |
| Board geometry duplicated in two components | One shared `useBoardMetrics` hook |
| `translucent` prop on the status bar (removed in SDK 57) | Dropped |

### Issues found only by running the app

- The animation library's preset `ZoomIn` entering animation froze at its
  initial scale on React Native 0.86 (New Architecture), leaving markers
  invisible. Diagnosed via simulator screenshots and replaced with an explicit
  shared-value spring (`PopIn` component) — which also degrades correctly for
  Reduce Motion users.
- The deprecated imperative Skia path API (`Path.Make().moveTo/lineTo`) was
  replaced with an SVG string path in the winning strike, removing runtime
  deprecation warnings.

### Engine upgrades beyond the blueprint

Center-first move ordering (better alpha-beta pruning), an open-line heuristic
at the depth cutoff (strong 4×4/5×5 play), and a seeded self-play test proving
the 3×3 AI never loses.

---

## Phase 3 — Quality passes

1. **Static health scan.** A React-focused code scanner (React Doctor) scored
   the codebase 92/100, flagging one `async-defer-await` warning in the game
   store — an `await` followed by an early-return race guard. The guard was
   intentionally placed *after* the await (it detects resets that happen during
   the AI's thinking pause), so instead of hoisting it — which would have broken
   the race protection — the AI-reply logic was extracted into a synchronous
   `applyAiReply` continuation and the minimax search was moved *before* the
   presentational delay. Behavior unchanged (verified by the full test suite),
   the perceived AI pause is now a consistent length, and the score is
   **100/100**.

2. **Sensory polish.** A victory chime (C5–E5–G5 arpeggio, generated
   programmatically, bundled at ~10 KB) plays on human wins only, wired through
   a `sound.ts` utility that mirrors the haptics contract: failures are
   swallowed, audio can never crash or block gameplay. Covered by unit tests
   (plays on win, silent on loss/draw).

---

## Verification performed before submission

- `npm test` — 27 unit tests passing (engine + store, including race-guard and
  sound-behavior tests)
- `npm run typecheck` — strict TypeScript, clean
- React Doctor — 100/100, no issues
- `npx expo export` — Hermes production bundle builds
- `npx expo run:ios` — full native build, launched and exercised on the
  iPhone 17 Pro simulator (Xcode 26.5); gameplay, win flow, N×N switching, and
  the refactored AI turn verified with screenshots
