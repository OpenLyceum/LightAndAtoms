/**
 * formatNumber.test.ts
 *
 * Significant figures, scientific notation and readable wavelength units.
 */

import { describe, expect, it } from "vitest";
import {
  readableLength,
  toScientificMarkup,
  toScientificParts,
  toSignificantFigures,
} from "../../src/common/model/formatNumber.js";

describe("formatNumber", () => {
  it("writes scientific notation with a true minus sign", () => {
    expect(toScientificMarkup(5.996e14)).toBe("6.00 × 10<sup>14</sup>");
    expect(toScientificMarkup(3.973e-19)).toBe("3.97 × 10<sup>−19</sup>");
    expect(toScientificMarkup(-2.179e-18)).toBe("−2.18 × 10<sup>−18</sup>");
  });

  it("carries a mantissa that rounds up to 10", () => {
    expect(toScientificParts(9.996e3, 3)).toEqual({ mantissa: "1.00", exponent: 4 });
  });

  it("rounds to significant figures in fixed notation", () => {
    expect(toSignificantFigures(656.47, 3)).toBe("656");
    expect(toSignificantFigures(0.012345, 3)).toBe("0.0123");
    expect(toSignificantFigures(12.2449, 3)).toBe("12.2");
  });

  it("picks a readable wavelength unit", () => {
    expect(readableLength(500e-9)).toMatchObject({ unit: "nm" });
    expect(readableLength(500e-9).value).toBeCloseTo(500, 9);
    expect(readableLength(0.122)).toMatchObject({ unit: "cm" });
    expect(readableLength(9.3e-6)).toMatchObject({ unit: "µm" });
    expect(readableLength(9.32e-13)).toMatchObject({ unit: "pm" });
    expect(readableLength(300)).toMatchObject({ unit: "m" });
    expect(readableLength(1e-6)).toMatchObject({ unit: "µm", value: 1 });
  });
});
