/**
 * formatReadouts.ts
 *
 * Localised readout text built from the number formatters in common/model/formatNumber.ts and the
 * unit strings. Each returns plain or RichText markup for the value at the moment it is called;
 * callers wrap them in a DerivedProperty over the model value and the strings they read, so the
 * text follows both the model and the locale.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { StringManager } from "../../i18n/StringManager.js";
import { readableLength, toScientificMarkup, toScientificPlain, toSignificantFigures } from "../model/formatNumber.js";

const units = StringManager.getInstance().getUnitStrings();

/** "value unit", in the locale's order. */
export function valueWithUnit(value: string, unit: string): string {
  return StringUtils.fillIn(units.valueUnitStringProperty.value, { value, unit });
}

/** A wavelength in its most readable unit to three significant figures, e.g. "500 nm" or "12.2 cm". */
export function formatWavelength(meters: number): string {
  const { value, unit } = readableLength(meters);
  return valueWithUnit(toSignificantFigures(value, 3), unit);
}

/** Frequency in scientific notation (RichText), e.g. "6.00 × 10<sup>14</sup> Hz". */
export function formatFrequencyMarkup(hertz: number, inverseSeconds: boolean): string {
  return valueWithUnit(toScientificMarkup(hertz), frequencyUnit(inverseSeconds));
}

/** The frequency unit symbol: Hz, or s⁻¹ when the preference asks for it. */
export function frequencyUnit(inverseSeconds: boolean): string {
  return inverseSeconds ? units.inverseSecondsStringProperty.value : units.hertzStringProperty.value;
}

/** Energy in joules, scientific notation (RichText). */
export function formatJoulesMarkup(joules: number, sigFigs = 3): string {
  return valueWithUnit(toScientificMarkup(joules, sigFigs), units.joulesStringProperty.value);
}

/** A number for display: fixed notation from 0.01 to 99 999, scientific (RichText) outside that. */
export function formatNumberMarkup(value: number, sigFigs = 3): string {
  const magnitude = Math.abs(value);
  return magnitude >= 0.01 && magnitude < 1e5
    ? toSignificantFigures(value, sigFigs)
    : toScientificMarkup(value, sigFigs);
}

/** A number read aloud: fixed notation from 0.01 to 99 999, "6.00 times ten to the 14" outside that. */
export function formatNumberPlain(value: number, sigFigs = 3): string {
  const magnitude = Math.abs(value);
  return magnitude >= 0.01 && magnitude < 1e5
    ? toSignificantFigures(value, sigFigs)
    : toScientificPlain(value, sigFigs, StringManager.getInstance().getTimesTenToStringProperty().value);
}

/** The string Properties every formatter above reads, for use as DerivedProperty dependencies. */
export const UNIT_STRING_DEPENDENCIES: TReadOnlyProperty<string>[] = [
  units.valueUnitStringProperty,
  units.hertzStringProperty,
  units.inverseSecondsStringProperty,
  units.joulesStringProperty,
  StringManager.getInstance().getTimesTenToStringProperty(),
];
