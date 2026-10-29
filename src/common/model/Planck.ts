/**
 * Planck.ts
 *
 * Blackbody (thermal) radiation: the continuous spectrum of a hot filament or of the Sun.
 *
 *   B(λ, T) = (2hc² / λ⁵) / (exp(hc / λk_BT) − 1)
 *
 * Only the shape matters to the sim, so callers normalise. Wien's law λ_max = b / T locates the peak.
 */

import { BOLTZMANN_CONSTANT, PLANCK_CONSTANT, SPEED_OF_LIGHT } from "../../LightAndAtomsConstants.js";

/** Wien displacement constant b, m·K (CODATA 2018). */
export const WIEN_CONSTANT = 2.897771955e-3;

/** Spectral radiance per unit wavelength, W·sr⁻¹·m⁻³, at wavelength λ (m) and temperature T (K). */
export function planckRadiance(wavelength: number, temperature: number): number {
  const exponent = (PLANCK_CONSTANT * SPEED_OF_LIGHT) / (wavelength * BOLTZMANN_CONSTANT * temperature);
  return (2 * PLANCK_CONSTANT * SPEED_OF_LIGHT * SPEED_OF_LIGHT) / wavelength ** 5 / Math.expm1(exponent);
}

/** Peak wavelength of a blackbody at temperature T (K), m. */
export function wienPeakWavelength(temperature: number): number {
  return WIEN_CONSTANT / temperature;
}
