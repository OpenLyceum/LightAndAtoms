/**
 * Bohr.ts
 *
 * Energy levels and transitions of the Bohr hydrogen atom, E_n = −h·c·R_H / n² (≈ −2.18 × 10⁻¹⁸ J / n²).
 * A transition between levels emits or absorbs one photon of wavelength
 *
 *   1/λ = R_H (1/n_lower² − 1/n_upper²)     (the Rydberg equation)
 *
 * The series is named after its lower level: Lyman (n = 1, ultraviolet), Balmer (n = 2, visible)
 * and Paschen (n = 3, infrared). Pure functions with no Scenery imports.
 */

import { HYDROGEN_IONIZATION_ENERGY, RYDBERG_HYDROGEN } from "../../LightAndAtomsConstants.js";
import { energyToWavelength } from "./PhotonUtils.js";

/** Energy of level n, J (negative: the electron is bound). */
export function levelEnergy(n: number): number {
  return -HYDROGEN_IONIZATION_ENERGY / (n * n);
}

/** Energy difference E_final − E_initial, J. Negative for emission. */
export function transitionEnergy(nInitial: number, nFinal: number): number {
  return levelEnergy(nFinal) - levelEnergy(nInitial);
}

/** Wavelength of the photon emitted or absorbed between two different levels, m. */
export function transitionWavelength(nInitial: number, nFinal: number): number {
  return energyToWavelength(Math.abs(transitionEnergy(nInitial, nFinal)));
}

/** The same wavelength from the Rydberg equation (it agrees with transitionWavelength), m. */
export function rydbergWavelength(nLower: number, nUpper: number): number {
  return 1 / (RYDBERG_HYDROGEN * (1 / (nLower * nLower) - 1 / (nUpper * nUpper)));
}

/** Longest wavelength that ionises an electron in level n, m (the series limit). */
export function ionizationWavelength(n: number): number {
  return energyToWavelength(-levelEnergy(n));
}

/** Named spectral series, by lower level. */
export type SeriesName = "lyman" | "balmer" | "paschen" | "brackett" | "pfund";

const SERIES_BY_LOWER_LEVEL: readonly SeriesName[] = ["lyman", "balmer", "paschen", "brackett", "pfund"];

/** The series a transition with this lower level belongs to. */
export function seriesOf(nLower: number): SeriesName {
  const series = SERIES_BY_LOWER_LEVEL[nLower - 1];
  if (series === undefined) {
    throw new Error(`no named series for lower level ${nLower}`);
  }
  return series;
}

/**
 * The upper level an electron in level n reaches by absorbing a photon of wavelength λ (m), within
 * a fractional tolerance; null when no transition up to maxLevel matches.
 */
export function findAbsorptionTarget(
  n: number,
  wavelength: number,
  maxLevel: number,
  tolerance: number,
): number | null {
  let best: number | null = null;
  let bestMismatch = tolerance;
  for (let upper = n + 1; upper <= maxLevel; upper++) {
    const target = transitionWavelength(n, upper);
    const mismatch = Math.abs(wavelength - target) / target;
    if (mismatch <= bestMismatch) {
      best = upper;
      bestMismatch = mismatch;
    }
  }
  return best;
}

/** Whether a photon of wavelength λ (m) carries enough energy to ionise an electron in level n. */
export function ionizes(n: number, wavelength: number): boolean {
  return wavelength <= ionizationWavelength(n);
}
