/**
 * EMRegion.ts
 *
 * The named regions of the electromagnetic spectrum, by wavelength. The boundaries are conventions
 * (real usage overlaps); these follow OpenStax Chemistry 2e, Figure 6.3, with the infrared–
 * microwave boundary at 1 mm and the microwave–radio boundary at 1 m.
 */

import { VISIBLE_MAX_NM, VISIBLE_MIN_NM } from "../../LightAndAtomsConstants.js";

export type EMRegionId = "gamma" | "xRay" | "ultraviolet" | "visible" | "infrared" | "microwave" | "radio";

export type EMRegion = {
  readonly id: EMRegionId;
  /** Shortest wavelength in the region, m. */
  readonly minWavelength: number;
  /** Longest wavelength in the region, m. */
  readonly maxWavelength: number;
};

/** Regions in order of increasing wavelength; together they tile 0 to ∞. */
export const EM_REGIONS: readonly EMRegion[] = [
  { id: "gamma", minWavelength: 0, maxWavelength: 1e-11 },
  { id: "xRay", minWavelength: 1e-11, maxWavelength: 1e-8 },
  { id: "ultraviolet", minWavelength: 1e-8, maxWavelength: VISIBLE_MIN_NM * 1e-9 },
  { id: "visible", minWavelength: VISIBLE_MIN_NM * 1e-9, maxWavelength: VISIBLE_MAX_NM * 1e-9 },
  { id: "infrared", minWavelength: VISIBLE_MAX_NM * 1e-9, maxWavelength: 1e-3 },
  { id: "microwave", minWavelength: 1e-3, maxWavelength: 1 },
  { id: "radio", minWavelength: 1, maxWavelength: Number.POSITIVE_INFINITY },
];

/** The region containing wavelength λ (m). */
export function regionOf(wavelength: number): EMRegion {
  const region = EM_REGIONS.find((r) => wavelength >= r.minWavelength && wavelength < r.maxWavelength);
  if (!region) {
    throw new Error(`no region for wavelength ${wavelength}`);
  }
  return region;
}

export type EMExampleId =
  | "cobalt60"
  | "medicalXRay"
  | "germicidalUV"
  | "sunburnUV"
  | "blackLight"
  | "violetLaser"
  | "greenLaser"
  | "sodiumLamp"
  | "redLaser"
  | "tvRemote"
  | "bodyHeat"
  | "microwaveOven"
  | "fmRadio"
  | "amRadio";

export type EMExample = {
  readonly id: EMExampleId;
  /** Wavelength, m. */
  readonly wavelength: number;
};

/**
 * Everyday sources, short to long wavelength. Values are typical: Co-60's 1.33 MeV gamma ray, a
 * ~50 keV diagnostic X-ray, the 254 nm mercury line of a germicidal lamp, UV-B at 300 nm, a 365 nm
 * black light, 405/532/650 nm laser pointers, the 589 nm sodium D line, a 940 nm remote-control LED,
 * ~10 µm thermal emission from skin at 310 K (Wien), a 2.45 GHz microwave oven, 100 MHz FM and
 * 1000 kHz AM radio.
 */
export const EM_EXAMPLES: readonly EMExample[] = [
  { id: "cobalt60", wavelength: 9.32e-13 },
  { id: "medicalXRay", wavelength: 2.5e-11 },
  { id: "germicidalUV", wavelength: 254e-9 },
  { id: "sunburnUV", wavelength: 300e-9 },
  { id: "blackLight", wavelength: 365e-9 },
  { id: "violetLaser", wavelength: 405e-9 },
  { id: "greenLaser", wavelength: 532e-9 },
  { id: "sodiumLamp", wavelength: 589e-9 },
  { id: "redLaser", wavelength: 650e-9 },
  { id: "tvRemote", wavelength: 940e-9 },
  { id: "bodyHeat", wavelength: 9.3e-6 },
  { id: "microwaveOven", wavelength: 0.122 },
  { id: "fmRadio", wavelength: 3.0 },
  { id: "amRadio", wavelength: 300 },
];
