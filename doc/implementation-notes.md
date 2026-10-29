# Implementation Notes - Light and Atoms

For developers. The physics and data are in [model.md](./model.md); the file map is in
[`AGENTS.md`](../AGENTS.md).

## Architecture overview

Standard SceneryStack layout: `src/main.ts` (after the `brand → splash → assert → init` chain)
builds three Screens, each with a `model/` and `view/` package. Shared code lives in
`src/common/`:

```
common/model/   PhotonUtils, Bohr, Planck, SpectrumSynthesis, formatNumber   (no Scenery imports)
common/view/    spectralColor, SpectrumStripNode, SpectrumMarkerNode, EquationsPanel,
                ControlFactory, formatReadouts
spectrum/       EM Spectrum screen
hydrogen-atom/  Hydrogen Atom screen
line-spectra/   Line Spectra screen
```

The EM Spectrum screen needs the sim preferences (frequency in s⁻¹), so `EMSpectrumScreen` takes
the `LightAndAtomsPreferencesModel` built in `main.ts` as its first argument.

## Design decisions

**Log wavelength as the EM marker's value.** `PhotonState.logWavelengthProperty` is
log₁₀(λ / m); λ, ν, E and the region derive from it. The marker is an `AccessibleSlider` over that
value, so keyboard steps are fractions of a decade (0.02, Shift 0.002, Page 1) and are the same
everywhere on the bar. Short wavelengths are on the left so the visible band reads violet → red in
every screen.

**One marker class for two jobs.** `SpectrumMarkerNode` takes `valueToX` / `xToValue` from its
owner, so the EM bar (log scale) and the Line Spectra cursor (linear, nm) share it. It mixes in
`AccessibleSlider` and adds a plain `DragListener`, following Oscilloscope's
`MeasurementCursorNode`; a `RichDragListener` would add a second arrow-key binding.

**Shared spectrum grid.** Every Line Spectra source is a `Float64Array` on
`SPECTRUM_WAVELENGTHS` (380–780 nm, 0.25 nm). `SpectrumStripNode` (a `CanvasNode`, one fillRect
per pixel column, repainted only on change) and `IntensityChartNode` (bamboo `LinePlot`) draw the
same array at the same x scale, so the cursor line can run straight through the strips and the
chart. `SpectrumStripNode` also draws the flat rainbows on the EM bar zoom and the Hydrogen
absorption panel.

**Colours from spectra.** `spectralColor.perceivedColor` integrates a spectrum against CIE XYZ
(adapted from InterferometryLab). Tube glow, flame, bulb and Sun colours therefore follow the line
data; to change a flame colour, change `AtomicLines.ts`.

**Hydrogen events.** `HydrogenAtomModel.atomEventEmitter` reports every emission, absorption,
excitation, pass-through, ionisation and recapture. The view turns them into
`addAccessibleResponse` announcements; pass-throughs are muted during a steady stream so the
screen reader is not flooded. Photons live in a model `ObservableArray`; `BohrAtomNode` keeps a
`Map<Photon, PhotonNode>` in sync through the add/remove listeners and moves the nodes in `step`.

**Mode switch resets the atom.** Changing Emission ↔ Absorption calls `resetAtom()` (ground state,
no photons, empty spectrum), because bright and dark lines mean different things.

**Mystery randomness.** `MysteryTube` takes an injectable `random` (default `dotRandom`, which
`?randomSeed` makes repeatable); tests pass a seeded LCG.

## Layout

All three screens use fixed layout constants at the top of each ScreenView (strip and chart sizes,
column widths). Panels that change height (the Hydrogen control panel when the absorption hint or
Recapture button appears; the Line Spectra source panel) are re-pinned from a `localBoundsProperty`
Multilink rather than placed once.

## Testing

Vitest unit tests cover the pure model (`tests/common/*`, `tests/spectrum`, `tests/hydrogen-atom`,
`tests/line-spectra`) and the leak suite lists `SpectrumStripNode`, `SpectrumMarkerNode`,
`WaveNode` and `TimeModel`. `npm run test:fuzz` runs the optional Playwright fuzz smoke.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
