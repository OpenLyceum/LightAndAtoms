/**
 * formatNumber.ts
 *
 * Number formatting for readouts. Gen Chem works in scientific notation with significant figures,
 * so values like 3.97 × 10⁻¹⁹ J are written as RichText markup ("3.97 × 10<sup>−19</sup>").
 * Wavelengths are written in the most readable SI unit (pm, nm, µm, mm, cm, m, km).
 *
 * Uses dot's toFixed rather than Number.prototype.toFixed, which rounds inconsistently.
 */

import { toFixed } from "scenerystack/dot";

const MINUS = "−";

/** Replaces an ASCII hyphen-minus with a true minus sign. */
function withMinus(text: string): string {
  return text.replace("-", MINUS);
}

/** Mantissa and exponent of `value` rounded to `sigFigs` significant figures. */
export function toScientificParts(value: number, sigFigs: number): { mantissa: string; exponent: number } {
  if (value === 0 || !Number.isFinite(value)) {
    return { mantissa: toFixed(0, sigFigs - 1), exponent: 0 };
  }
  let exponent = Math.floor(Math.log10(Math.abs(value)));
  let mantissa = value / 10 ** exponent;

  // Rounding can carry the mantissa up to 10 (9.996 → 10.0); renormalise.
  if (Math.abs(Number(toFixed(mantissa, sigFigs - 1))) >= 10) {
    exponent += 1;
    mantissa = value / 10 ** exponent;
  }
  return { mantissa: withMinus(toFixed(mantissa, sigFigs - 1)), exponent };
}

/** RichText markup for `value` in scientific notation, e.g. "6.00 × 10<sup>14</sup>". */
export function toScientificMarkup(value: number, sigFigs = 3): string {
  const { mantissa, exponent } = toScientificParts(value, sigFigs);
  return `${mantissa} × 10<sup>${withMinus(String(exponent))}</sup>`;
}

/** Plain-text scientific notation for screen readers, e.g. "6.00 times 10 to the 14". */
export function toScientificPlain(value: number, sigFigs: number, timesTenTo: string): string {
  const { mantissa, exponent } = toScientificParts(value, sigFigs);
  return `${mantissa} ${timesTenTo} ${withMinus(String(exponent))}`;
}

/**
 * `value` to `sigFigs` significant figures in fixed notation (no exponent), e.g. 656.47 → "656"
 * and 0.0123 → "0.0123". For numbers whose magnitude is roughly 0.001–99 999.
 */
export function toSignificantFigures(value: number, sigFigs: number): string {
  if (value === 0 || !Number.isFinite(value)) {
    return toFixed(0, Math.max(0, sigFigs - 1));
  }
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const decimals = Math.max(0, sigFigs - 1 - magnitude);
  return withMinus(toFixed(value, decimals));
}

/** An SI length unit with its size in metres. */
export type LengthUnit = "pm" | "nm" | "µm" | "mm" | "cm" | "m" | "km";

const LENGTH_UNITS: readonly { unit: LengthUnit; meters: number }[] = [
  { unit: "pm", meters: 1e-12 },
  { unit: "nm", meters: 1e-9 },
  { unit: "µm", meters: 1e-6 },
  { unit: "mm", meters: 1e-3 },
  { unit: "cm", meters: 1e-2 },
  { unit: "m", meters: 1 },
  { unit: "km", meters: 1e3 },
];

/**
 * The unit a wavelength reads most naturally in, and the value in that unit: the largest unit in
 * which the value is at least 1. (Below 1 pm, picometres anyway.)
 */
export function readableLength(meters: number): { value: number; unit: LengthUnit } {
  let chosen = LENGTH_UNITS[0] ?? { unit: "m" as const, meters: 1 };
  for (const candidate of LENGTH_UNITS) {
    // A small tolerance keeps 1.000 µm from reading as 1000 nm through floating-point noise.
    if (meters >= candidate.meters * (1 - 1e-9)) {
      chosen = candidate;
    }
  }
  return { value: meters / chosen.meters, unit: chosen.unit };
}
