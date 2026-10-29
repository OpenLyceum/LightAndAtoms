/**
 * LightAndAtomsConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Physics / model values use SI units (metres, seconds, joules, …), except
 *    where a quantity is named for another unit (`…_NM` is nanometres).
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in LightAndAtomsColors.ts, not here.
 *
 * Physical constants are the exact 2019 SI defining values (h, c, N_A, e) and
 * CODATA 2018 for the hydrogen Rydberg constant. Sources are in doc/model.md.
 */

import { Range } from "scenerystack/dot";
import LightAndAtomsNamespace from "./LightAndAtomsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Vertical spacing between rows inside a control panel. */
export const PANEL_ROW_SPACING = 8;

/** Font sizes (px) shared by labels, readouts and titles. */
export const FONT_SIZE = {
  title: 16,
  label: 14,
  small: 12,
  tiny: 10,
} as const;

// ── Physical constants (SI) ───────────────────────────────────────────────────

/** Planck constant h, J·s (exact). */
export const PLANCK_CONSTANT = 6.62607015e-34;

/** Speed of light in vacuum c, m/s (exact). */
export const SPEED_OF_LIGHT = 2.99792458e8;

/** Avogadro constant N_A, 1/mol (exact). */
export const AVOGADRO_CONSTANT = 6.02214076e23;

/** Elementary charge, which is also the number of joules in one electronvolt (exact). */
export const JOULES_PER_ELECTRONVOLT = 1.602176634e-19;

/** Boltzmann constant k_B, J/K (exact). */
export const BOLTZMANN_CONSTANT = 1.380649e-23;

/**
 * Rydberg constant for hydrogen R_H, 1/m. This is R_∞ (10 973 731.6 m⁻¹) corrected for the
 * proton's finite mass, R_H = R_∞ / (1 + mₑ/mₚ). It reproduces the measured vacuum Balmer
 * wavelengths (656.47 nm for 3 → 2) to better than 0.01 nm.
 */
export const RYDBERG_HYDROGEN = 1.0967758e7;

/** Ionisation energy of hydrogen h·c·R_H, J (≈ 2.18 × 10⁻¹⁸ J, the textbook value). */
export const HYDROGEN_IONIZATION_ENERGY = PLANCK_CONSTANT * SPEED_OF_LIGHT * RYDBERG_HYDROGEN;

/** Metres per nanometre. */
export const METERS_PER_NANOMETER = 1e-9;

/** Joules per kilojoule. */
export const JOULES_PER_KILOJOULE = 1e3;

// ── Electromagnetic spectrum (EM Spectrum screen) ─────────────────────────────

/** Range of log₁₀(λ / m) covered by the spectrum bar: 0.1 pm (gamma) to 1 km (radio). */
export const LOG_WAVELENGTH_RANGE = new Range(-13, 3);

/** Initial wavelength of the first and second photons, m (500 nm green, 100 nm UV). */
export const INITIAL_WAVELENGTH = 500e-9;
export const INITIAL_WAVELENGTH_2 = 100e-9;

/** Arrow-key steps of the spectrum marker, in decades of wavelength. */
export const MARKER_KEYBOARD_STEP = 0.02;
export const MARKER_SHIFT_KEYBOARD_STEP = 0.002;
export const MARKER_PAGE_KEYBOARD_STEP = 1;

/**
 * Bond energy of a C–C single bond, kJ/mol: a reference for whether a photon carries enough
 * energy per mole to break a typical bond. Average bond enthalpy (OpenStax Chemistry 2e, Table 7.2).
 */
export const C_C_BOND_ENERGY_KJ_PER_MOL = 348;

/** Bounds of the visible band used by every screen, nm. */
export const VISIBLE_MIN_NM = 380;
export const VISIBLE_MAX_NM = 750;

// ── Hydrogen atom (Bohr) ──────────────────────────────────────────────────────

/** Highest Bohr level shown. Six covers Lyman, Balmer and Paschen lines in or near the visible. */
export const MAX_LEVEL = 6;

/**
 * Fractional mismatch |λ − λ_transition| / λ_transition within which an incoming photon is
 * absorbed. Real lines are far narrower; this is wide enough to hit with the arrow buttons
 * (0.1 nm steps) and narrow enough that neighbouring lines (n ≤ 6) never overlap.
 */
export const ABSORPTION_TOLERANCE = 0.0025;

/** Ranges of the photon-source wavelength control in each region, nm. */
export const PHOTON_UV_RANGE_NM = new Range(90, 380);
export const PHOTON_VISIBLE_RANGE_NM = new Range(380, 750);
export const PHOTON_IR_RANGE_NM = new Range(750, 2000);

/** Initial photon-source wavelengths in each region, nm. */
export const INITIAL_PHOTON_UV_NM = 121.6;
export const INITIAL_PHOTON_VISIBLE_NM = 500;
export const INITIAL_PHOTON_IR_NM = 1000;

/** Arrow-button step of the photon wavelength control, nm. */
export const PHOTON_WAVELENGTH_DELTA_NM = 0.1;

/** Photon speed across the atom view, model units (view px) per second. */
export const PHOTON_SPEED = 220;

/** Time between photons while the source is switched on, s. */
export const PHOTON_EMISSION_INTERVAL = 0.6;

/** Seconds an excited electron stays up before it falls back on its own, when "Auto relax" is on. */
export const AUTO_RELAX_DELAY = 1.5;

// ── Line spectra ──────────────────────────────────────────────────────────────

/** Wavelength range of the spectroscope and its chart, nm (the eye's full visible window). */
export const SPECTROSCOPE_MIN_NM = 380;
export const SPECTROSCOPE_MAX_NM = 780;

/** Sample spacing of computed spectra, nm. */
export const SPECTRUM_SAMPLE_STEP_NM = 0.25;

/** Instrumental line width (Gaussian σ) of the hand spectroscope, nm. */
export const INSTRUMENT_SIGMA_NM = 0.8;

/** Fraction of the background removed at the centre of the strongest absorption line. */
export const MAX_ABSORPTION_DEPTH = 0.9;

/** Light-bulb filament temperature range and default, K. */
export const BULB_TEMPERATURE_RANGE = new Range(1500, 3500);
export const INITIAL_BULB_TEMPERATURE = 2800;

/** Effective temperature of the Sun's photosphere, K. */
export const SUN_TEMPERATURE = 5772;

/** Arrow-key steps of the spectroscope wavelength cursor, nm. */
export const CURSOR_KEYBOARD_STEP_NM = 1;
export const CURSOR_SHIFT_KEYBOARD_STEP_NM = 0.1;
export const CURSOR_PAGE_KEYBOARD_STEP_NM = 20;

LightAndAtomsNamespace.register("LightAndAtomsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLANCK_CONSTANT,
  SPEED_OF_LIGHT,
  AVOGADRO_CONSTANT,
  RYDBERG_HYDROGEN,
  MAX_LEVEL,
});
