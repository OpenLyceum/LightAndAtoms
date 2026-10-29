/**
 * SpectrumSynthesis.ts
 *
 * Turns line lists and temperatures into sampled spectra on the spectroscope's wavelength grid
 * (380–780 nm). Every spectrum is normalised so its brightest sample is 1, because a hand
 * spectroscope shows relative brightness, not radiance.
 *
 *  - Emission (hot gas): each line is a Gaussian of the instrument's width; a molecular band adds
 *    its own width in quadrature.
 *  - Continuous (hot solid): a Planck curve at the filament temperature.
 *  - Absorption (white light through a cooler gas): a flat continuum multiplied by
 *    1 − depth × line profile. The dark lines sit at the same wavelengths as the gas's bright lines
 *    (Kirchhoff's second and third laws, as Gen Chem states them).
 *  - The Sun: a 5772 K Planck curve with the Fraunhofer lines the caller supplies.
 */

import {
  INSTRUMENT_SIGMA_NM,
  MAX_ABSORPTION_DEPTH,
  SPECTROSCOPE_MAX_NM,
  SPECTROSCOPE_MIN_NM,
  SPECTRUM_SAMPLE_STEP_NM,
  SUN_TEMPERATURE,
} from "../../LightAndAtomsConstants.js";
import { planckRadiance } from "./Planck.js";

/** One emission line (width 0) or molecular band. */
export type SpectralFeature = {
  /** Centre wavelength, nm. */
  readonly wavelength: number;
  /** Relative intensity (emission) or depth (absorption), 0–1. */
  readonly intensity: number;
  /** Gaussian σ of a molecular band, nm; 0 for an atomic line. */
  readonly width: number;
};

/** A spectrum sampled on {@link SPECTRUM_WAVELENGTHS}; values 0–1. */
export type SampledSpectrum = Float64Array;

/** The shared wavelength grid, nm. */
export const SPECTRUM_WAVELENGTHS: Float64Array = (() => {
  const count = Math.round((SPECTROSCOPE_MAX_NM - SPECTROSCOPE_MIN_NM) / SPECTRUM_SAMPLE_STEP_NM) + 1;
  const grid = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    grid[i] = SPECTROSCOPE_MIN_NM + i * SPECTRUM_SAMPLE_STEP_NM;
  }
  return grid;
})();

/** Scales a spectrum in place so its maximum is 1 (a spectrum that is all zero stays zero). */
function normalize(spectrum: Float64Array): Float64Array {
  let max = 0;
  for (const value of spectrum) {
    max = Math.max(max, value);
  }
  if (max > 0) {
    for (let i = 0; i < spectrum.length; i++) {
      spectrum[i] = (spectrum[i] ?? 0) / max;
    }
  }
  return spectrum;
}

/** Sum of the features' profiles (peak height = intensity), unnormalised. */
function lineProfile(features: readonly SpectralFeature[]): Float64Array {
  const profile = new Float64Array(SPECTRUM_WAVELENGTHS.length);
  for (const feature of features) {
    const sigma = Math.hypot(INSTRUMENT_SIGMA_NM, feature.width);
    const reach = 5 * sigma;
    const first = Math.max(0, Math.ceil((feature.wavelength - reach - SPECTROSCOPE_MIN_NM) / SPECTRUM_SAMPLE_STEP_NM));
    const last = Math.min(
      SPECTRUM_WAVELENGTHS.length - 1,
      Math.floor((feature.wavelength + reach - SPECTROSCOPE_MIN_NM) / SPECTRUM_SAMPLE_STEP_NM),
    );
    for (let i = first; i <= last; i++) {
      const t = ((SPECTRUM_WAVELENGTHS[i] ?? 0) - feature.wavelength) / sigma;
      profile[i] = (profile[i] ?? 0) + feature.intensity * Math.exp(-0.5 * t * t);
    }
  }
  return profile;
}

/** Bright-line spectrum of a hot gas (or several gases mixed in equal amounts). */
export function emissionSpectrum(...lineLists: (readonly SpectralFeature[])[]): SampledSpectrum {
  // Each gas is normalised on its own first, so a mixture shows both gases at comparable brightness.
  const total = new Float64Array(SPECTRUM_WAVELENGTHS.length);
  for (const features of lineLists) {
    const single = normalize(lineProfile(features));
    for (let i = 0; i < total.length; i++) {
      total[i] = (total[i] ?? 0) + (single[i] ?? 0);
    }
  }
  return normalize(total);
}

/** Continuous spectrum of a blackbody at temperature T (K). */
export function continuousSpectrum(temperature: number): SampledSpectrum {
  return normalize(SPECTRUM_WAVELENGTHS.map((nm) => planckRadiance(nm * 1e-9, temperature)));
}

/** Multiplies a continuum by 1 − depth × (line profile scaled so its deepest line has depth MAX_ABSORPTION_DEPTH). */
function absorb(continuum: Float64Array, features: readonly SpectralFeature[]): SampledSpectrum {
  const profile = normalize(lineProfile(features));
  return continuum.map((value, i) => value * Math.max(0, 1 - MAX_ABSORPTION_DEPTH * (profile[i] ?? 0)));
}

/** White light (flat continuum) after passing through a gas with these lines. */
export function absorptionSpectrum(features: readonly SpectralFeature[]): SampledSpectrum {
  return absorb(new Float64Array(SPECTRUM_WAVELENGTHS.length).fill(1), features);
}

/** The visible solar spectrum: a photosphere-temperature blackbody crossed by these dark lines. */
export function solarSpectrum(fraunhoferLines: readonly SpectralFeature[]): SampledSpectrum {
  return absorb(continuousSpectrum(SUN_TEMPERATURE), fraunhoferLines);
}

/** A flat spectrum (equal brightness at every wavelength): the eyepiece view of ideal white light. */
export function flatSpectrum(): SampledSpectrum {
  return new Float64Array(SPECTRUM_WAVELENGTHS.length).fill(1);
}

/** Linear interpolation of a sampled spectrum at wavelength nm (0 outside the grid). */
export function sampleAt(spectrum: SampledSpectrum, nm: number): number {
  const position = (nm - SPECTROSCOPE_MIN_NM) / SPECTRUM_SAMPLE_STEP_NM;
  const i = Math.floor(position);
  if (i < 0 || i >= spectrum.length - 1) {
    return i === spectrum.length - 1 ? (spectrum[i] ?? 0) : 0;
  }
  const f = position - i;
  return (spectrum[i] ?? 0) * (1 - f) + (spectrum[i + 1] ?? 0) * f;
}
