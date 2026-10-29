/**
 * EMSpectrumModel.test.ts
 *
 * Region boundaries, the everyday examples, and the derived quantities of a photon.
 */

import { describe, expect, it } from "vitest";
import { LOG_WAVELENGTH_RANGE } from "../../src/LightAndAtomsConstants.js";
import { EM_EXAMPLES, regionOf } from "../../src/spectrum/model/EMRegion.js";
import { EMSpectrumModel } from "../../src/spectrum/model/EMSpectrumModel.js";

describe("EM regions", () => {
  it("classifies familiar wavelengths", () => {
    expect(regionOf(1e-12).id).toBe("gamma");
    expect(regionOf(1e-10).id).toBe("xRay");
    expect(regionOf(254e-9).id).toBe("ultraviolet");
    expect(regionOf(589e-9).id).toBe("visible");
    expect(regionOf(940e-9).id).toBe("infrared");
    expect(regionOf(0.122).id).toBe("microwave");
    expect(regionOf(3).id).toBe("radio");
  });

  it("keeps every example on the bar", () => {
    for (const example of EM_EXAMPLES) {
      expect(LOG_WAVELENGTH_RANGE.contains(Math.log10(example.wavelength))).toBe(true);
    }
  });
});

describe("EMSpectrumModel", () => {
  it("derives frequency and energy from the marker", () => {
    const model = new EMSpectrumModel();
    model.photon1.setWavelength(500e-9);
    expect(model.photon1.frequencyProperty.value).toBeCloseTo(5.996e14, -11);
    expect(model.photon1.molarEnergyProperty.value).toBeCloseTo(239.3, 1);
    expect(model.photon1.regionProperty.value.id).toBe("visible");
  });

  it("clamps wavelengths to the bar and resets", () => {
    const model = new EMSpectrumModel();
    model.photon1.setWavelength(1e6);
    expect(model.photon1.logWavelengthProperty.value).toBe(LOG_WAVELENGTH_RANGE.max);
    model.compareProperty.value = true;
    model.reset();
    expect(model.photon1.wavelengthProperty.value).toBeCloseTo(500e-9, 15);
    expect(model.compareProperty.value).toBe(false);
  });
});
