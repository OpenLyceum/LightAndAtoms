/**
 * AtomicLines.test.ts
 *
 * Sanity checks on the line data: every feature in the spectroscope's window, intensities in
 * range, and a strongest line of 1 for each element.
 */

import { describe, expect, it } from "vitest";
import { SPECTROSCOPE_MAX_NM, SPECTROSCOPE_MIN_NM } from "../../src/LightAndAtomsConstants.js";
import { FLAME_ELEMENTS, FRAUNHOFER_LINES, TUBE_ELEMENTS } from "../../src/line-spectra/model/AtomicLines.js";

describe("AtomicLines", () => {
  const elements = [...new Set([...TUBE_ELEMENTS, ...FLAME_ELEMENTS])];

  it.each(elements.map((element) => [element.id, element] as const))("%s has valid features", (_id, element) => {
    expect(element.features.length).toBeGreaterThan(0);
    for (const feature of element.features) {
      expect(feature.wavelength).toBeGreaterThanOrEqual(SPECTROSCOPE_MIN_NM);
      expect(feature.wavelength).toBeLessThanOrEqual(SPECTROSCOPE_MAX_NM);
      expect(feature.intensity).toBeGreaterThan(0);
      expect(feature.intensity).toBeLessThanOrEqual(1);
      expect(feature.width).toBeGreaterThanOrEqual(0);
    }
    expect(Math.max(...element.features.map((feature) => feature.intensity))).toBe(1);
  });

  it("uses unique ids and symbols", () => {
    expect(new Set(elements.map((element) => element.id)).size).toBe(elements.length);
    expect(new Set(elements.map((element) => element.symbol)).size).toBe(elements.length);
  });

  it("includes the sodium D doublet and the hydrogen Balmer lines", () => {
    const wavelengths = (id: string) =>
      elements.find((element) => element.id === id)?.features.map((feature) => feature.wavelength) ?? [];
    expect(wavelengths("sodium")).toEqual(expect.arrayContaining([589.0, 589.59]));
    expect(wavelengths("hydrogen")).toEqual(expect.arrayContaining([656.28, 486.13, 434.05, 410.17]));
  });

  it("lists Fraunhofer lines in the window", () => {
    for (const line of FRAUNHOFER_LINES) {
      expect(line.wavelength).toBeGreaterThan(SPECTROSCOPE_MIN_NM);
      expect(line.wavelength).toBeLessThan(SPECTROSCOPE_MAX_NM);
    }
  });
});
