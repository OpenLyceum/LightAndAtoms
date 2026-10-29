# Light and Atoms

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

Light and the atom for introductory (General) chemistry: the electromagnetic spectrum with
c = λν and E = hν, the Bohr hydrogen atom emitting and absorbing photons, and the line spectra of
real gases and flames through a spectroscope. Built with [SceneryStack](https://scenerystack.org/);
runs offline as a Progressive Web App.

## Features

- **EM Spectrum.** Drag a photon from gamma rays to radio waves along a logarithmic spectrum
  bar with wavelength and frequency axes and a magnified visible band. Read its wavelength,
  frequency, energy per photon and per mole (compared with a C–C bond), and watch its wave: every
  wave moves at c, so shorter waves oscillate faster. Jump to 14 everyday sources (a microwave
  oven, a TV remote, a sodium lamp, a medical X-ray…). Compare two photons with both waves drawn to
  the same scale and the ratios λ₂/λ₁, ν₂/ν₁, E₂/E₁.
- **Hydrogen Atom.** A Bohr atom with orbits ∝ n² beside its energy-level diagram drawn to scale.
  In emission mode, lift the electron and drop it: each drop emits a photon of λ = hc/|ΔE| and adds
  a line to a UV / visible / IR spectrum (Lyman, Balmer, Paschen and beyond). In absorption mode,
  fire photons from a lamp: only those whose energy matches a jump are absorbed, others pass
  through, and short enough ones ionise the atom.
- **Line Spectra.** A spectroscope pointed at gas discharge tubes (H, He, Ne, Na, Hg, Ar, Kr),
  flame tests (Li, Na, K, Ca, Sr, Ba, Cu), white light through a gas, a light bulb (filament
  temperature slider) and the Sun with its Fraunhofer lines. The eyepiece strip, the intensity chart
  and a wavelength cursor line up, a reference gas can be shown underneath, and a mystery tube (one
  or two gases) is to be identified. Source colours are computed from the spectra, not picked.
- **Show equations** on every screen: c = λν, E = hν, E × N_A, E_n = −2.18 × 10⁻¹⁸ J / n²,
  ΔE, λ = hc/|ΔE| and the Rydberg equation, with the current numbers substituted.
- **Accessible:** keyboard operation throughout, spoken descriptions of every emission and
  absorption, live screen summaries, keyboard-help dialogs.
- English, French and Spanish; default and projector colour profiles; installable PWA. A
  preference (or `?inverseSeconds`) writes frequency in s⁻¹ instead of Hz.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
