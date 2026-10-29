/**
 * HydrogenAtomModel.test.ts
 *
 * Emission and absorption by the Bohr atom, driven through the model's public API.
 */

import { describe, expect, it } from "vitest";
import { HydrogenAtomModel } from "../../src/hydrogen-atom/model/HydrogenAtomModel.js";
import { HydrogenMode } from "../../src/hydrogen-atom/model/HydrogenMode.js";
import { PhotonRegion } from "../../src/hydrogen-atom/model/PhotonRegion.js";

/** Steps the model until no photons are in flight (or a time limit passes). */
function runUntilQuiet(model: HydrogenAtomModel, maxTime = 5): void {
  for (let t = 0; t < maxTime && model.photons.length > 0; t += 1 / 60) {
    model.step(1 / 60);
  }
}

describe("HydrogenAtomModel", () => {
  it("emits a 656 nm Balmer photon on 3 → 2 and records the line", () => {
    const model = new HydrogenAtomModel();
    model.autoRelaxProperty.value = false;
    model.moveElectronTo(3);
    expect(model.levelProperty.value).toBe(3);
    model.moveElectronTo(2);
    expect(model.levelProperty.value).toBe(2);
    expect(model.recordedLines.length).toBe(1);
    expect((model.recordedLines[0]?.wavelength ?? 0) * 1e9).toBeCloseTo(656.5, 0);
    expect(model.photons.length).toBe(1);
  });

  it("does not let the student lift the electron in absorption mode", () => {
    const model = new HydrogenAtomModel();
    model.modeProperty.value = HydrogenMode.ABSORPTION;
    model.moveElectronTo(3);
    expect(model.levelProperty.value).toBe(1);
  });

  it("absorbs a Lyman-α photon and passes a visible one", () => {
    const model = new HydrogenAtomModel();
    model.modeProperty.value = HydrogenMode.ABSORPTION;
    model.autoRelaxProperty.value = false;

    model.photonRegionProperty.value = PhotonRegion.VISIBLE;
    model.firePhoton();
    runUntilQuiet(model);
    expect(model.levelProperty.value).toBe(1);
    expect(model.recordedLines.length).toBe(0);

    model.photonRegionProperty.value = PhotonRegion.ULTRAVIOLET;
    model.ultravioletWavelengthProperty.value = 121.6;
    model.firePhoton();
    runUntilQuiet(model);
    expect(model.levelProperty.value).toBe(2);
    expect(model.recordedLines.length).toBe(1);
  });

  it("ionises with a photon beyond the Lyman limit and recaptures", () => {
    const model = new HydrogenAtomModel();
    model.modeProperty.value = HydrogenMode.ABSORPTION;
    model.photonRegionProperty.value = PhotonRegion.ULTRAVIOLET;
    model.ultravioletWavelengthProperty.value = 90;
    model.firePhoton();
    runUntilQuiet(model);
    expect(model.ionizedProperty.value).toBe(true);
    model.recaptureElectron();
    expect(model.ionizedProperty.value).toBe(false);
    expect(model.levelProperty.value).toBe(1);
  });

  it("relaxes on its own to a lower level", () => {
    const model = new HydrogenAtomModel();
    model.moveElectronTo(4);
    for (let t = 0; t < 10; t += 0.1) {
      model.step(0.1);
    }
    expect(model.levelProperty.value).toBe(1);
    expect(model.recordedLines.length).toBeGreaterThan(0);
  });

  it("starts a fresh experiment when the mode changes", () => {
    const model = new HydrogenAtomModel();
    model.autoRelaxProperty.value = false;
    model.moveElectronTo(3);
    model.moveElectronTo(1);
    model.modeProperty.value = HydrogenMode.ABSORPTION;
    expect(model.recordedLines.length).toBe(0);
    expect(model.photons.length).toBe(0);
  });
});
