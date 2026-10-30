# Model - Light and Atoms

This document describes the model (the physics, the data and the simplifications) in terms
appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

Light and Atoms covers the first encounter with light in a General Chemistry course: light is a
wave with a wavelength and a frequency related by c = λν; it comes in photons of energy E = hν; an
atom's electron occupies discrete energy levels, so an atom emits and absorbs only photons whose
energy matches a gap between levels; and that is why each element has its own line spectrum.

- **EM Spectrum** places one photon (or two, to compare) anywhere from gamma rays to radio waves
  and shows its wavelength, frequency and energy.
- **Hydrogen Atom** shows the Bohr atom emitting and absorbing photons one at a time, and builds
  its spectrum.
- **Line Spectra** shows what real sources look like through a spectroscope, and asks students to
  identify a gas from its lines.

## Constants

| Quantity | Symbol | Value | Source |
|---|---|---|---|
| Planck constant | h | 6.626 070 15 × 10⁻³⁴ J·s (exact) | SI 2019 |
| Speed of light | c | 2.997 924 58 × 10⁸ m/s (exact) | SI 2019 |
| Avogadro constant | N_A | 6.022 140 76 × 10²³ mol⁻¹ (exact) | SI 2019 |
| Electronvolt | eV | 1.602 176 634 × 10⁻¹⁹ J (exact) | SI 2019 |
| Boltzmann constant | k_B | 1.380 649 × 10⁻²³ J/K (exact) | SI 2019 |
| Rydberg constant for hydrogen | R_H | 1.096 775 8 × 10⁷ m⁻¹ | CODATA 2018 R_∞ with the reduced-mass correction R_∞ / (1 + mₑ/mₚ) |
| Hydrogen ionisation energy | h c R_H | 2.179 × 10⁻¹⁸ J (13.6 eV) | derived |
| Wien constant | b | 2.897 771 955 × 10⁻³ m·K | CODATA 2018 |
| C–C bond energy (comparison only) | | 348 kJ/mol | OpenStax *Chemistry 2e*, Table 7.2 |

The equations panels show h, c, N_A and R_H to four significant figures and results to three, as
textbooks print them.

## EM Spectrum

**Quantities.** The marker sets log₁₀(λ / m) between −13 (0.1 pm) and 3 (1 km). The screen derives

- ν = c / λ, in Hz (or s⁻¹, a preference),
- E = hν = hc / λ per photon, in J and eV,
- E × N_A, the energy of one mole of photons, in kJ/mol, compared with a C–C bond (348 kJ/mol): a
  UV photon carries more than a bond's worth per mole, a visible or infrared photon less. This is
  the reason UV light damages molecules.

**Regions** (boundaries are conventions; they follow OpenStax *Chemistry 2e*, Figure 6.3): gamma
< 10 pm < X-ray < 10 nm < ultraviolet < 380 nm < visible < 750 nm < infrared < 1 mm < microwave
< 1 m < radio.

**Everyday examples** (typical values): Co-60 gamma ray (1.33 MeV, 0.93 pm), diagnostic X-ray
(~50 keV, 25 pm), germicidal lamp (Hg 254 nm), UV-B sunburn (300 nm), black light (365 nm),
violet / green / red laser pointers (405 / 532 / 650 nm), sodium street lamp (589 nm), TV remote
(940 nm), body heat (Wien peak at 310 K, 9.3 µm), microwave oven (2.45 GHz, 12.2 cm), FM radio
(100 MHz, 3.0 m), AM radio (1000 kHz, 300 m).

**Wave picture.** All waves move across the screen at the same speed (all light travels at c),
so a shorter wave oscillates faster at any fixed point. A single wave's on-screen wavelength is a
logarithmic function of the real one and is **not to scale**. In compare mode both waves are drawn
at **one common linear scale** (the longer one 200 px), so a photon of one fifth the wavelength
really shows five times as many crests; below 4 px a wave is clamped. When clamping is needed, the
caption switches to "Wave not to scale" rather than claiming a common scale.

## Hydrogen Atom

**Levels.** The Bohr energies E_n = −h c R_H / n² = −2.18 × 10⁻¹⁸ J / n² (−13.6 eV / n²), for
n = 1 to 6, plus n = ∞ (E = 0, the free electron). The energy diagram is drawn to scale, so the
upper levels crowd together; labels that would overlap are fanned out with leader lines. Orbits
are drawn with radius ∝ n² (Bohr's r_n = n² a₀). The electron's motion around its orbit is
decoration.

**Transitions.** A transition between n_i and n_f involves one photon of

ΔE = E_f − E_i, λ = hc / |ΔE|, equivalently 1/λ = R_H (1/n_lower² − 1/n_upper²).

The series is named by the lower level: Lyman (1, ultraviolet), Balmer (2, visible), Paschen (3,
infrared), Brackett (4), Pfund (5).

**Emission mode.** The student lifts the electron to any higher level (the energy comes from an
electric discharge, as in a gas tube, and no photon is involved) and drops it to any lower level;
each drop emits a photon in a random direction and records a bright line.

**Absorption mode.** A lamp fires photons of a chosen wavelength along the axis through the atom.
When a photon reaches the nucleus:

1. If |λ − λ_transition| / λ_transition ≤ 0.25 % for a jump up from the current level (to n ≤ 6), the
   photon is absorbed, the electron jumps, and a dark line is recorded. Real lines are far
   narrower; 0.25 % is wide enough to hit with the 0.1 nm arrow buttons and narrower than half the
   gap between any two neighbouring lines with n ≤ 6 (a unit test checks this).
2. Otherwise, if its energy exceeds the ionisation energy from the current level (λ ≤ hc / |E_n|,
   91.2 nm from n = 1), the atom is ionised. "Recapture electron" returns it to n = 1.
3. Otherwise the photon passes through.

The lamp's wavelength control has three ranges (UV 90–380 nm, visible 380–750 nm, IR
750–2000 nm) so the slider is fine enough in each. From the ground state only Lyman (UV) photons
are absorbed; visible Balmer photons are absorbed only by an atom already in n = 2. That surprises
students, and it is true of cool hydrogen.

**Auto relax** (on by default): an excited electron falls after 1.5 s to a lower level chosen
uniformly at random (real branching ratios differ), emitting in a random direction. In absorption
mode this re-emission is **not** recorded: it goes in every direction, so it does not fill in the
dark line an observer looking at the lamp sees.

**Wavelengths here are vacuum wavelengths** (Hα = 656.47 nm). Tables of the Balmer lines usually
give air wavelengths (Hα = 656.28 nm), as the Line Spectra screen does. The screen shows three
significant figures (656 nm), which hides the difference.

**Spectrum display.** Three panels: UV 90–130 nm (linear; the Lyman lines), visible 380–750 nm
(linear), IR 750–8000 nm (logarithmic, so Paschen 1.09–1.88 µm, Brackett 2.63 and 4.05 µm and
Pfund 7.46 µm all fit). Each line is recorded once, however many times it is produced.

## Line Spectra

**Grid.** Every source becomes a spectrum sampled every 0.25 nm from 380 to 780 nm and normalised
so its brightest sample is 1 (a hand spectroscope shows relative brightness).

**Emission (hot, low-pressure gas).** Each line is a Gaussian of σ = 0.8 nm (the instrument);
a molecular band adds its own width in quadrature. A two-gas mystery tube normalises each gas
separately, then adds them.

**Continuous (hot solid).** The Planck curve B(λ, T) = (2hc²/λ⁵) / (e^{hc/λk_BT} − 1), with the
filament temperature 1500–3500 K (default 2800 K). Hotter filaments shift towards the blue (Wien:
λ_max = b / T, still in the infrared for any filament).

**Absorption (white light through a cooler gas).** A flat continuum multiplied by
1 − 0.9 × (the gas's line profile, scaled so its strongest line has depth 0.9). The dark lines sit
at exactly the wavelengths of the bright lines; the "Compare" checkbox shows both. This is
Kirchhoff's picture as Gen Chem states it. **Simplification:** a truly cool gas absorbs only from
its ground state, so cold hydrogen would show no visible (Balmer) absorption. The Hydrogen Atom
screen shows this correctly; here the absorbing gas behaves as if warm enough for every lower level
to be populated.

**The Sun.** A 5772 K Planck curve crossed by Fraunhofer lines: Ca II K and H (393.4, 396.8 nm),
Hδ, the G band (430.8), Hγ, Fe d (438.4), Hβ = F (486.1), Mg b triplet (516.7, 517.3, 518.4),
Fe E (527.0), Na D (589.0, 589.6), Hα = C (656.3), and the telluric O₂ B (686.7) and A (759.4)
bands from Earth's atmosphere. Depths are qualitative.

**Line data.** Atomic lines are air wavelengths from the NIST Atomic Spectra Database
(physics.nist.gov/asd), rounded to 0.01 nm: H (Balmer), He, Ne, Na, Hg, Ar (Ar I red lines plus the
Ar II blue lines that colour the tube), Kr, Li, K. **Relative intensities are approximate**,
chosen to give the appearance of each source through a hand spectroscope (strongest visible line
= 1); NIST intensities depend on the source and are not comparable between elements, so they were
used only to rank lines within an element.

**Flame tests.** Flame colours of Ca, Sr, Ba and Cu come mostly from molecules formed in the flame
(CaOH, SrOH/SrCl, BaOH, CuCl, CuOH), not free atoms. These are modelled as bands with a width at
approximate band-head positions (Pearse & Gaydon, *The Identification of Molecular Spectra*), plus
the atomic resonance lines (Ca 422.7, Sr 460.7, Ba 553.5 nm, Cu 510.6/515.3/521.8 nm). They are
qualitative. Potassium's lilac is its 766.5/769.9 nm doublet at the red edge of vision plus a weak
violet pair at 404.4/404.7 nm.

**Perceived colour.** The glow of a tube, flame, bulb or the Sun is computed from its spectrum:
integrate against the CIE 1931 colour-matching functions (Wyman, Sloan & Shirley 2013 fits), convert
to linear sRGB, white-balance to an equal-energy white, scale the brightest channel to 1, and
gamma-encode. Out-of-gamut colours are clipped. A single line's colour uses scenery-phet's
VisibleColor table.

**Mystery tube.** One gas (or two distinct gases, at the harder level) drawn at random from the
seven tube gases; a new tube never repeats the previous set. The answer is correct when the ticked
gases equal the set exactly. The score counts each tube once.

## Simplifications at a glance

- Bohr model only: no fine structure, no Zeeman effect, no line widths from physics.
- Absorption tolerance of 0.25 % instead of the true natural width.
- Random (uniform) decay branching instead of real transition probabilities.
- Line Spectra absorption uses every emission line (warm gas), not ground-state lines only.
- Relative line intensities and molecular band positions are approximate.
