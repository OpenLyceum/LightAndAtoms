/**
 * Bohr.test.ts
 *
 * The Bohr energies and the Rydberg wavelengths against measured hydrogen lines (vacuum
 * wavelengths, NIST ASD).
 */

import { describe, expect, it } from "vitest";
import {
  findAbsorptionTarget,
  ionizationWavelength,
  ionizes,
  levelEnergy,
  rydbergWavelength,
  seriesOf,
  transitionEnergy,
  transitionWavelength,
} from "../../src/common/model/Bohr.js";
import { ABSORPTION_TOLERANCE, MAX_LEVEL } from "../../src/LightAndAtomsConstants.js";

const NM = 1e-9;

describe("Bohr hydrogen atom", () => {
  it("has E1 = −2.18 × 10⁻¹⁸ J (−13.6 eV)", () => {
    expect(levelEnergy(1)).toBeCloseTo(-2.179e-18, 21);
    expect(levelEnergy(2)).toBeCloseTo(levelEnergy(1) / 4, 30);
  });

  it("reproduces the Balmer lines", () => {
    const measured: [number, number][] = [
      [3, 656.47],
      [4, 486.27],
      [5, 434.17],
      [6, 410.29],
    ];
    for (const [upper, nm] of measured) {
      expect(transitionWavelength(upper, 2) / NM).toBeCloseTo(nm, 1);
    }
  });

  it("gives Lyman-α at 121.6 nm and the Lyman limit at 91.2 nm", () => {
    expect(transitionWavelength(2, 1) / NM).toBeCloseTo(121.57, 1);
    expect(ionizationWavelength(1) / NM).toBeCloseTo(91.18, 1);
  });

  it("agrees with the Rydberg equation for every pair of levels", () => {
    for (let lower = 1; lower < MAX_LEVEL; lower++) {
      for (let upper = lower + 1; upper <= MAX_LEVEL; upper++) {
        expect(rydbergWavelength(lower, upper) / transitionWavelength(upper, lower)).toBeCloseTo(1, 10);
      }
    }
  });

  it("signs energy changes: negative for emission, positive for absorption", () => {
    expect(transitionEnergy(3, 2)).toBeLessThan(0);
    expect(transitionEnergy(2, 3)).toBeGreaterThan(0);
  });

  it("absorbs only matching photons, within tolerance", () => {
    expect(findAbsorptionTarget(1, 121.6 * NM, MAX_LEVEL, ABSORPTION_TOLERANCE)).toBe(2);
    expect(findAbsorptionTarget(2, 656.3 * NM, MAX_LEVEL, ABSORPTION_TOLERANCE)).toBe(3);
    expect(findAbsorptionTarget(1, 656.3 * NM, MAX_LEVEL, ABSORPTION_TOLERANCE)).toBeNull();
    expect(findAbsorptionTarget(2, 500 * NM, MAX_LEVEL, ABSORPTION_TOLERANCE)).toBeNull();
  });

  it("keeps neighbouring lines (n ≤ 6) further apart than the absorption tolerance", () => {
    for (let lower = 1; lower < MAX_LEVEL; lower++) {
      for (let upper = lower + 1; upper < MAX_LEVEL; upper++) {
        const a = transitionWavelength(upper, lower);
        const b = transitionWavelength(upper + 1, lower);
        expect(Math.abs(a - b) / b).toBeGreaterThan(2 * ABSORPTION_TOLERANCE);
      }
    }
  });

  it("ionises with photons shorter than the series limit", () => {
    expect(ionizes(1, 90 * NM)).toBe(true);
    expect(ionizes(1, 95 * NM)).toBe(false);
    expect(ionizes(2, 360 * NM)).toBe(true);
  });

  it("names series by lower level", () => {
    expect(seriesOf(1)).toBe("lyman");
    expect(seriesOf(2)).toBe("balmer");
    expect(seriesOf(3)).toBe("paschen");
  });
});
