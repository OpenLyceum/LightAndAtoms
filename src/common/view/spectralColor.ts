/**
 * spectralColor.ts
 *
 * Colours of light.
 *
 *  - A single wavelength (a spectral line, a monochromatic photon) uses scenery-phet's VisibleColor,
 *    the table every PhET-style sim uses, so lines look the same here as elsewhere.
 *  - A mixture (the glow of a discharge tube, a flame, a filament) is computed the way the eye
 *    adds light: integrate the spectrum against the CIE 1931 colour matching functions to get XYZ,
 *    convert once to linear sRGB, white-balance to an equal-energy white, scale the brightest
 *    channel to 1, and gamma-encode last. Adding per-wavelength sRGB triples instead gives the
 *    wrong hue (gamma-encoded values do not add) and a yellow-green "white".
 *
 * The matching functions are the multi-lobe Gaussian fits of Wyman, Sloan & Shirley, "Simple
 * Analytic Approximations to the CIE XYZ Color Matching Functions", JCGT 2(2), 2013, adapted from
 * InterferometryLab's spectralColor.ts.
 */

import { Color } from "scenerystack/scenery";
import { VisibleColor } from "scenerystack/scenery-phet";

/** A single Gaussian lobe with a different width on each side. */
function lobe(x: number, alpha: number, mu: number, sigma1: number, sigma2: number): number {
  const t = (x - mu) / (x < mu ? sigma1 : sigma2);
  return alpha * Math.exp(-0.5 * t * t);
}

/** CIE 1931 x̄ colour matching function. */
function xBar(nm: number): number {
  return lobe(nm, 1.056, 599.8, 37.9, 31.0) + lobe(nm, 0.362, 442.0, 16.0, 26.7) + lobe(nm, -0.065, 501.1, 20.4, 26.2);
}

/** CIE 1931 ȳ colour matching function. */
function yBar(nm: number): number {
  return lobe(nm, 0.821, 568.8, 46.9, 40.5) + lobe(nm, 0.286, 530.9, 16.3, 31.1);
}

/** CIE 1931 z̄ colour matching function. */
function zBar(nm: number): number {
  return lobe(nm, 1.217, 437.0, 11.8, 36.0) + lobe(nm, 0.681, 459.0, 26.0, 13.8);
}

/** Linear sRGB of an equal-energy spectrum, used to white-balance (see InterferometryLab). */
const EQUAL_ENERGY_RGB = [1.2044, 0.9484, 0.9088] as const;

/** sRGB transfer function: linear 0–1 to an encoded 0–255 byte. */
function encodeSrgb(linear: number): number {
  const clamped = Math.min(1, Math.max(0, linear));
  const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(255 * encoded);
}

/**
 * Perceived colour of a spectrum sampled at `wavelengths` (nm), at full brightness: only the hue
 * and saturation of the mixture matter. Out-of-gamut components are clipped; an all-dark spectrum
 * gives black.
 */
export function perceivedColor(wavelengths: ArrayLike<number>, values: ArrayLike<number>): Color {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < wavelengths.length; i++) {
    const nm = wavelengths[i] ?? 0;
    const value = values[i] ?? 0;
    x += value * xBar(nm);
    y += value * yBar(nm);
    z += value * zBar(nm);
  }
  const r = Math.max(0, 3.2406 * x - 1.5372 * y - 0.4986 * z) / EQUAL_ENERGY_RGB[0];
  const g = Math.max(0, -0.9689 * x + 1.8758 * y + 0.0415 * z) / EQUAL_ENERGY_RGB[1];
  const b = Math.max(0, 0.0557 * x - 0.204 * y + 1.057 * z) / EQUAL_ENERGY_RGB[2];
  const max = Math.max(r, g, b);
  if (max <= 0) {
    return new Color(0, 0, 0);
  }
  return new Color(encodeSrgb(r / max), encodeSrgb(g / max), encodeSrgb(b / max));
}

/**
 * Display colour of a single wavelength (nm). Outside the visible band it returns `invisibleColor`
 * (UV and IR have no colour of their own).
 */
export function wavelengthColor(nm: number, invisibleColor: Color | string = "white"): Color {
  if (nm < VisibleColor.MIN_WAVELENGTH || nm > VisibleColor.MAX_WAVELENGTH) {
    return Color.toColor(invisibleColor);
  }
  return VisibleColor.wavelengthToColor(nm);
}

/** Whether the eye can see this wavelength (nm). */
export function isVisible(nm: number): boolean {
  return nm >= VisibleColor.MIN_WAVELENGTH && nm <= VisibleColor.MAX_WAVELENGTH;
}

export type ColorName = "ultraviolet" | "violet" | "blue" | "cyan" | "green" | "yellow" | "orange" | "red" | "infrared";

/** A plain colour name for a wavelength (nm), for screen-reader descriptions. */
export function colorName(nm: number): ColorName {
  if (nm < 380) {
    return "ultraviolet";
  } else if (nm < 450) {
    return "violet";
  } else if (nm < 490) {
    return "blue";
  } else if (nm < 520) {
    return "cyan";
  } else if (nm < 565) {
    return "green";
  } else if (nm < 590) {
    return "yellow";
  } else if (nm < 625) {
    return "orange";
  } else if (nm <= 750) {
    return "red";
  }
  return "infrared";
}
