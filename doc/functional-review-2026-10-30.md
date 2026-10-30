# Light and Atoms functional review

Reviewed 2026-10-30 at commit `43468f483477e39368abd550ff6f1f8e259d5122`.
Repository: `/home/veillette/OpenLyceum/LightAndAtoms`.
Environment: Ubuntu 26.04.1 LTS, registered in Windows as `Ubuntu-24.04`; Node v26.13.0.

## Scope and outcome

Reviewed all three screens, the photon/Bohr/Planck/spectrum model paths, hydrogen state changes, mystery scoring, spectrum controls, and relevant lifecycle code. Ran the existing automated gates and exercised the app in headless Chromium with assertions enabled. This is a functional source review, not a complete release certification.

The initial review found two reproducible issues, documented below. Both are now resolved by the follow-up changes described in the Resolution section. The initial review itself made no application-source changes and created no commits, pushes, or GitHub issues.

## Findings

### P2: Clicking the n = 5 energy line selects n = 6

Location: `src/hydrogen-atom/view/EnergyLevelDiagramNode.ts:136`.

Each level receives an 8 px tall hit rectangle centered on its true energy. At the 250 px diagram height, n = 5 is at y = 10 and n = 6 is at y = 6.944. The later-added n = 6 target covers y = 2.944 through 10.944, including the n = 5 line. Clicking directly on the n = 5 line therefore excites the electron to n = 6, producing the wrong starting level for a student's transition experiment.

Reproduction: open Hydrogen Atom in emission mode, disable auto relax, reset the atom, and click the center of the n = 5 horizontal energy line. In Chromium at a 1440 x 1000 viewport, the diagram's local point (60, 10) maps to (725.625, 123.59375); the resulting model level is 6. Control clicks on the n = 4 and n = 6 lines select their expected levels. The numbered control-panel buttons offer a working alternative.

Suggested correction: divide pointer regions at midpoints between adjacent levels, or provide separate targets at the fanned labels, while preserving the physical spacing of the lines. Add a pointer regression that asserts the selected level for each line.

### P2: Compare mode promises a common scale after the drawing has been clamped

Locations: `src/spectrum/view/WaveNode.ts:58`, `src/spectrum/view/EMSpectrumScreenView.ts` (wave caption), and `src/i18n/strings_en.json:70`.

The longer wave is drawn with a 200 px wavelength and the shorter is clamped to at least 4 px. Consequently, all wavelength ratios greater than 50:1 are drawn as 50:1. The caption still states "Both waves drawn to the same scale". Because the wave speed is shared, the animation's apparent frequency ratio is also capped, contradicting the numerical readouts and the screen's stated teaching purpose.

Reproduction: set photon 1 to 500 nm and photon 2 to 5 nm, and enable comparison. The real wavelength ratio is 100:1; `sharedScreenWavelengths(500e-9, 5e-9)` returns `[200, 4]`, a 50:1 drawing. The rendered caption continues to claim a common scale. The clamp is documented in the model notes, but its activation is not communicated in the interface.

Suggested correction: show a resolution-limit warning or switch the caption to "not to scale" whenever clamping occurs; alternatively constrain the comparison to ratios the display can represent. Cover both unclamped and clamped cases, including the caption.

## Validation

- `npm run lint`: passed; 92 files checked, no fixes applied.
- `npm run check`: passed for app, scripts, and tests.
- `npm test`: 67 tests passed across 10 files, including the existing 11 memory-harness tests. The mocked environment emitted its expected text-bounds warning.
- `npm run build`: passed, including PWA generation; main JavaScript bundle 2,691.44 kB, 874.99 kB gzip.
- `FUZZ_PORT=5197 npm run test:fuzz:quick`: pointer and keyboard modes passed, 10 seconds of fuzz input each, with assertions enabled.
- Baton repository compliance: passed, including the available remote security-setting probes.
- Baton template drift: passed.
- Development browser smoke: all three screens opened; default EM layout, hydrogen absorption controls, and mystery-tube layout inspected in screenshots at 1440 x 1000. No page exceptions occurred in the deterministic probes.
- Production preview smoke: all three screens opened with `?ea`, no page exceptions. Port 5199 was occupied, so the successful preview used port 5217.
- French and Spanish startup probes completed without page exceptions; this was not a comprehensive translation/layout review.
- A 20-cycle photon/reset check returned model photons and the view's photon-node map to zero. This does not establish heap-level leak freedom. Disposing a standalone PhotonNode leaves its child Paths undisposed, but the available probe did not establish retained growth; no memory-leak finding is claimed.

## Limits and follow-up

The memory suite covers TimeModel, SpectrumStripNode, SpectrumMarkerNode, and WaveNode; it does not establish cleanup for all screen views or PhotonNode descendants. Full heap comparisons, sustained performance testing, touch/mobile layout, projector mode, long-string/RTL tests, listener-order randomization, manual screen-reader use, and educator/data-source sign-off remain outside this review. Atomic-line data were not independently revalidated against NIST.

Mystery scoring was checked against its existing test contract: incorrect submissions count as attempts and a solved tube cannot earn repeated credit. The documentation's phrase "counts each tube once" is less precise than that contract, but was not treated as a functional defect.

## Resolution

Both P2 findings were addressed on 2026-10-30:

- Crowded energy-level hit rectangles end at the midpoints between neighboring levels. Clicking the n = 5 line now selects n = 5; the lines themselves retain their physical spacing.
- The EM comparison caption depends on both wavelengths and reports "Wave not to scale" when the shorter wave is clamped. The shared-scale caption is restored when the ratio fits the drawing, using the existing localized strings.
- `tests/browser/review-regressions.spec.ts` exercises actual pointer clicks on all six energy lines and the displayed caption at representable, limiting, and clamped ratios, including reversed photon order and leaving compare mode. Both tests failed against the reviewed code, then passed with the fixes.

Follow-up validation passed: lint, app/scripts/test type checks, all 67 unit tests, both browser regressions, the production build, 10-second pointer and keyboard fuzz, repository compliance, and template drift. The fixes preserve the underlying energy and photon calculations. The remaining review limitations above still apply.
