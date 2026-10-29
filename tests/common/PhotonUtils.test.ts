/**
 * PhotonUtils.test.ts
 *
 * c = λν and E = hν against values a Gen Chem student would compute by hand.
 */

import { describe, expect, it } from "vitest";
import {
  energyToWavelength,
  frequencyToWavelength,
  joulesToElectronvolts,
  molarPhotonEnergy,
  photonEnergy,
  wavelengthToFrequency,
} from "../../src/common/model/PhotonUtils.js";

describe("PhotonUtils", () => {
  it("converts 500 nm to frequency, energy per photon and per mole", () => {
    const wavelength = 500e-9;
    expect(wavelengthToFrequency(wavelength)).toBeCloseTo(5.996e14, -11);
    expect(photonEnergy(wavelength)).toBeCloseTo(3.973e-19, 21);
    expect(molarPhotonEnergy(wavelength)).toBeCloseTo(239.3, 1);
    expect(joulesToElectronvolts(photonEnergy(wavelength))).toBeCloseTo(2.48, 2);
  });

  it("round-trips wavelength through frequency and energy", () => {
    for (const wavelength of [1e-12, 589e-9, 0.122, 300]) {
      expect(frequencyToWavelength(wavelengthToFrequency(wavelength)) / wavelength).toBeCloseTo(1, 12);
      expect(energyToWavelength(photonEnergy(wavelength)) / wavelength).toBeCloseTo(1, 12);
    }
  });

  it("gives a 2.45 GHz microwave a wavelength of 12.2 cm", () => {
    expect(frequencyToWavelength(2.45e9)).toBeCloseTo(0.1224, 4);
  });
});
