/**
 * SpectrumSynthesis.test.ts
 *
 * Emission, continuous and absorption spectra on the spectroscope grid.
 */

import { describe, expect, it } from "vitest";
import { planckRadiance, wienPeakWavelength } from "../../src/common/model/Planck.js";
import {
  absorptionSpectrum,
  continuousSpectrum,
  emissionSpectrum,
  SPECTRUM_WAVELENGTHS,
  sampleAt,
} from "../../src/common/model/SpectrumSynthesis.js";
import { TUBE_ELEMENTS } from "../../src/line-spectra/model/AtomicLines.js";

const hydrogen = TUBE_ELEMENTS.find((element) => element.id === "hydrogen");
if (!hydrogen) {
  throw new Error("hydrogen missing");
}

/** Wavelength (nm) of the largest sample. */
function peakWavelength(spectrum: Float64Array): number {
  let best = 0;
  spectrum.forEach((value, i) => {
    if (value > (spectrum[best] ?? 0)) {
      best = i;
    }
  });
  return SPECTRUM_WAVELENGTHS[best] ?? Number.NaN;
}

describe("SpectrumSynthesis", () => {
  it("normalises an emission spectrum and peaks at Hα for hydrogen", () => {
    const spectrum = emissionSpectrum(hydrogen.features);
    expect(Math.max(...spectrum)).toBeCloseTo(1, 12);
    expect(peakWavelength(spectrum)).toBeCloseTo(656.25, 0);
    expect(sampleAt(spectrum, 550)).toBeLessThan(1e-6);
  });

  it("puts absorption dips at the emission wavelengths", () => {
    const spectrum = absorptionSpectrum(hydrogen.features);
    expect(sampleAt(spectrum, 656.28)).toBeLessThan(0.2);
    expect(sampleAt(spectrum, 550)).toBeCloseTo(1, 6);
  });

  it("follows Wien's law for the Planck curve", () => {
    expect(wienPeakWavelength(5772) * 1e9).toBeCloseTo(502, 0);
    // The radiance is largest at the Wien peak.
    const peak = wienPeakWavelength(3000);
    expect(planckRadiance(peak, 3000)).toBeGreaterThan(planckRadiance(peak * 1.05, 3000));
    expect(planckRadiance(peak, 3000)).toBeGreaterThan(planckRadiance(peak * 0.95, 3000));
  });

  it("makes a 2800 K filament brighter in the red than in the blue", () => {
    const bulb = continuousSpectrum(2800);
    expect(sampleAt(bulb, 700)).toBeGreaterThan(3 * sampleAt(bulb, 420));
  });

  it("interpolates and returns 0 off the grid", () => {
    const spectrum = emissionSpectrum(hydrogen.features);
    expect(sampleAt(spectrum, 300)).toBe(0);
    expect(sampleAt(spectrum, 900)).toBe(0);
  });
});
