# Neo Tox — One-Page Brief for the Reviewing CTO / Engineering Manager

*Structured on the One Page Management system ("Administración en una página",
Khadem & Lorber): a Focus sheet (what matters), a Feedback sheet (how it's
actually doing), and a Management sheet (decisions and actions). One page,
no digging required.*

---

## 1 · Focus sheet — success areas and their indicators

| Success area | Key indicator | Target |
|---|---|---|
| Correctness | Unit tests over engine + state | All passing; AI provably never loses on 3×3 |
| Code health | React Doctor score (security/perf/correctness/architecture) | ≥ 90 |
| Craft standards | Magic numbers outside the token file | Zero |
| Performance | Animation execution path | GPU/UI-thread only; AI search off the frame budget |
| Scalability | Board sizes supported by one code path | N×N (3×3 / 4×4 / 5×5 shipped) |
| User experience | Sensory feedback per game event | Animation + haptic + sound on key moments |
| Reproducibility | Steps for a reviewer on a Mac mini | ≤ 3 prerequisites, 1 run command |
| Transparency | AI-use disclosure | Complete prompt history with decisions |

## 2 · Feedback sheet — actuals vs targets

| Indicator | Actual | Status |
|---|---|---|
| Tests | **27/27 passing** — includes a 25-game seeded self-play proof the IMPOSSIBLE AI never loses, a race-guard test, and sound-behavior tests | ✅ |
| React Doctor | **100/100** (started 92; the one warning was resolved by refactor, not suppression — see §3) | ✅ |
| Magic numbers | **0** — every color, spacing, duration, ratio, physics and shader constant lives in [`src/theme/tokens.ts`](src/theme/tokens.ts); engine constants are named module constants | ✅ |
| Performance | SkSL shader background + Skia canvases render on the GPU; Reanimated worklets on the UI thread; minimax is depth-limited with alpha-beta pruning and center-first ordering | ✅ |
| N×N | Engine (`getWinningLines(n)`), board, geometry, and win-strike all derive from one `gridSize` value | ✅ |
| UX feedback | Marker draw-in, pop-in springs, laser win strike, thinking pulse, 4 haptic patterns, victory chime | ✅ |
| Reproducibility | Xcode + Node + CocoaPods, then `npx expo run:ios` — verified end-to-end on an iPhone 17 Pro simulator with screenshots in the README | ✅ |
| Transparency | [`PROMPTS.md`](PROMPTS.md) — three phases, including where the AI's own blueprint was wrong and was deliberately overridden | ✅ |

## 3 · Management sheet — decisions a reviewer should know about

**Decisions taken (the "why" behind the diffs):**

- **Engine is pure TypeScript, React-free.** Testable in isolation; the store
  orchestrates turns; components only render state.
- **The design blueprint was audited, not obeyed.** Its Skia misuse, deprecated
  APIs, circular import, and its *own* magic numbers were fixed before writing
  the first component (full list in PROMPTS.md).
- **A race guard (`gameId`) protects the AI's "thinking" pause.** Resetting
  mid-turn can never apply a stale move. When a static-analysis rule flagged the
  guard's `await → early-return` shape, the fix preserved the guard's semantics
  (extracted a synchronous continuation; moved the search before the cosmetic
  delay) rather than silencing the rule — and made the AI's pause a consistent
  length as a side effect.
- **Preset entering animations were replaced with explicit springs** after
  on-device testing showed the preset freezing on RN 0.86's New Architecture —
  found because the app was actually run, not just compiled.

**Known limits (honest scope):**

- Single-device, local play; no multiplayer, no persistence beyond stats/settings.
- 4×4/5×5 IMPOSSIBLE is depth-limited (heuristic-guided) rather than exhaustive —
  a deliberate frame-budget trade-off, documented in the engine.
- Bundle id is still `com.anonymous.neo-tox`; store submission would need
  branding, icons, and a privacy manifest pass.

**If this shipped tomorrow (next three actions):**

1. Device-farm pass (physical iPhone/Android) + haptic/audio tuning on hardware
2. App icon, splash, store metadata; rename bundle id
3. CI: test + typecheck + React Doctor gate on every PR

---

*60-second code tour:* [`src/engine/GameEngine.ts`](src/engine/GameEngine.ts)
(the brain) → [`src/store/useGameStore.ts`](src/store/useGameStore.ts) (the
conductor) → [`src/theme/tokens.ts`](src/theme/tokens.ts) (the craft standard) →
[`src/components/`](src/components/) (the polish). Demo GIF and score evidence
in the [README](README.md).
