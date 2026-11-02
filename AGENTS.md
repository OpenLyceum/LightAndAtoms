# AGENTS.md — Light and Atoms

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Light and the atom for **introductory (General) chemistry**, the "Electronic Structure of Atoms"
chapter: c = λν, E = hν, the Bohr hydrogen atom, and line spectra. It is the Gen Chem companion to
SpectroscopyLab (IR, NMR, UV-Vis for organic / analytical chemistry). Three screens:

| Screen | Folder | Model |
|---|---|---|
| EM Spectrum | `src/spectrum/` | One or two photons placed by log₁₀(λ / m) from 10⁻¹³ to 10³ m; ν, E, E × N_A derived; 14 everyday examples |
| Hydrogen Atom | `src/hydrogen-atom/` | Bohr levels n = 1–6; emission (student-driven drops) and absorption (lamp photons, resonance within 0.25 %); ionisation; optional auto-relax |
| Line Spectra | `src/line-spectra/` | NIST visible lines of 7 tube gases and 7 flame metals (with molecular bands); Planck bulb; Sun with Fraunhofer lines; mystery tube |

Physics, constants and every data source: [`doc/model.md`](doc/model.md). Architecture and
design decisions: [`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Pedagogy over completeness.** Everything is pitched at Gen Chem 1. Equations appear only
  behind "Show equations". Don't add quantum numbers beyond n, fine structure, or line widths
  from physics; SpectroscopyLab is where advanced content goes.
- **Spectra are sampled once and shared.** `common/model/SpectrumSynthesis.ts` puts every Line
  Spectra source on one 380–780 nm grid (0.25 nm). The eyepiece strip (`SpectrumStripNode`, a
  CanvasNode) and the bamboo chart draw the same `Float64Array`, at the same x scale, so a bright
  line sits directly over its chart peak, and the cursor runs through both.
- **Colours are computed.** Single wavelengths use scenery-phet `VisibleColor`; mixtures (tube
  glow, flame, bulb) go through CIE 1931 XYZ in `common/view/spectralColor.ts`. Don't hand-pick a
  flame colour; fix the line data instead.
- **The Hydrogen screen's lines are vacuum wavelengths** (from R_H); Line Spectra's are air
  wavelengths (NIST). Hα is 656.5 nm vs 656.3 nm; both display as "656" at 3 s.f. on the Hydrogen
  screen. See `doc/model.md`.

## Key files

| File | Purpose |
|---|---|
| `src/LightAndAtomsConstants.ts` | Physical constants (SI 2019 exact values, R_H), ranges, steps, tolerances |
| `src/LightAndAtomsColors.ts` | All `ProfileColorProperty` instances, including EM region fills |
| `src/common/model/PhotonUtils.ts` | λ ↔ ν ↔ E conversions |
| `src/common/model/Bohr.ts` | E_n, transitions, Rydberg, series names, absorption matching, ionisation |
| `src/common/model/Planck.ts` | Blackbody radiance and Wien peak |
| `src/common/model/SpectrumSynthesis.ts` | Sampled emission / continuous / absorption / solar spectra on the shared grid |
| `src/common/model/formatNumber.ts` | Sig figs, scientific notation (RichText), readable length units |
| `src/common/view/formatReadouts.ts` | Localised readouts built on formatNumber + unit strings |
| `src/common/view/spectralColor.ts` | VisibleColor for lines; CIE XYZ perceived colour of a spectrum |
| `src/common/view/SpectrumStripNode.ts` | Spectroscope-eyepiece rendering of a sampled spectrum |
| `src/common/view/SpectrumMarkerNode.ts` | AccessibleSlider marker/cursor on a spectrum axis (EM bar, Line Spectra cursor) |
| `src/common/view/ControlFactory.ts` | Themed control builders (copied from SpectroscopyLab ← MolScope) |
| `src/common/view/EquationsPanel.ts` | "Show equations" panel |
| `src/common/LightAndAtomsHotkeyData.ts` | HotkeyData labelling marker/cursor keys in the help dialogs |
| `src/spectrum/model/EMRegion.ts` | Region boundaries and everyday examples |
| `src/spectrum/view/EMSpectrumBarNode.ts` | Log bar, wavelength/frequency axes, magnified visible strip |
| `src/spectrum/view/WaveNode.ts` | Travelling wave; log scale alone, shared linear scale in compare mode |
| `src/hydrogen-atom/model/HydrogenAtomModel.ts` | Atom state, photons in flight, recorded lines, events for announcements |
| `src/hydrogen-atom/view/EnergyLevelDiagramNode.ts` | To-scale level diagram with fanned labels and transition arrow |
| `src/hydrogen-atom/view/HydrogenSpectrumNode.ts` | UV (90–130 nm) / visible / IR (log, 750–8000 nm) line panels |
| `src/line-spectra/model/AtomicLines.ts` | Line and band data for every source, with sources |
| `src/line-spectra/model/MysteryTube.ts` | Identification challenge: seeded picks, checking, score |
| `src/line-spectra/view/SourceIllustrationNode.ts` | Tube / flame / bulb / Sun / gas cell glowing in its computed colour |

## Accessibility

- EM Spectrum markers and the Line Spectra cursor are `AccessibleSlider`s: arrows (Shift for
  fine, Page Up/Down coarse, Home/End) with spoken value text (wavelength + region, or wavelength
  + intensity). Their keys are documented through `LightAndAtomsHotkeyData`.
- Hydrogen Atom announces every emission (with colour and series), absorption, pass-through
  (suppressed during a steady stream), excitation, ionisation and recapture via
  `addAccessibleResponse`. Level buttons 1–6 are the keyboard path for moving the electron.
- Every screen summary has a **live** current-details paragraph. The mystery tube's gas is never
  named in descriptions.

## Compliance carve-outs

- **Hardcoded colors** in `common/view/SpectrumStripNode.ts` (`rgb(…)` built per pixel column from
  spectral data) and `common/view/SpectrumMarkerNode.ts` (`rgba(0,0,0,0.01)` pointer hit area).
  Spectral colours are data, like SpectroscopyLab's CPK colours, so they are not in
  `LightAndAtomsColors.ts`. The emission-strip background stays black in projector mode on purpose.

## Testing

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment; `setupFiles: ["./tests/setup.ts"]`; `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/TimeModel.test.ts` | Play/pause clock (drives the EM Spectrum wave animation) |
| `tests/common/PhotonUtils.test.ts` | c = λν, E = hν, molar energy against hand-computed values |
| `tests/common/Bohr.test.ts` | Bohr energies; Balmer and Lyman lines vs NIST vacuum wavelengths; Rydberg agreement; absorption tolerance |
| `tests/common/formatNumber.test.ts` | Significant figures, scientific notation, readable wavelength units |
| `tests/common/SpectrumSynthesis.test.ts` | Emission, absorption, Planck / Wien, interpolation |
| `tests/spectrum/EMSpectrumModel.test.ts` | Region boundaries, examples on the bar, derived photon quantities |
| `tests/hydrogen-atom/HydrogenAtomModel.test.ts` | Emission records lines; absorption only on resonance; ionisation; auto-relax; mode reset |
| `tests/line-spectra/AtomicLines.test.ts` | Line data in range, normalised, unique; key lines present |
| `tests/line-spectra/MysteryTube.test.ts` | Seeded picks, no repeats, checking and scoring |
| `tests/memory-leak.test.ts` | Lists the sim's disposables for `describeDisposalLeaks()` (collected after dispose, repeated cycles; opt-in double dispose) |
| `tests/helpers/memoryLeak.ts` | Template-owned leak harness: `describeDisposalLeaks`, `forceGC`, `createAndDispose` |
| `tests/fuzz/fuzz.spec.ts` | Optional Playwright fuzz smoke: pointer `?fuzz` + keyboard `?fuzzBoard` (template-owned; add sim-specific specs as separate files) |
| `playwright.config.ts` | Chromium project + Vite webServer for `tests/**/*.spec.ts` (template-owned) |
| `tests/browser/*.spec.ts` | Optional sim-specific Playwright tests (`npx playwright test tests/browser`); `npm run test:fuzz` runs only `tests/fuzz/` |

- Add every model/view object that adds/removes nodes or links Properties at runtime to the
  `describeDisposalLeaks([...])` list in `memory-leak.test.ts`; put sim-specific leak scenarios
  after it using `forceGC()` from `tests/helpers/memoryLeak.ts` (never a local copy).
  Duration is 30s by default; override with `npm run test:fuzz -- 90` or `FUZZ_DURATION=90`.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
