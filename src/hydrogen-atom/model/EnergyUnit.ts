/**
 * EnergyUnit.ts
 *
 * Units for the energy-level diagram: joules per atom (what Gen Chem textbooks use, with
 * E_n = −2.18 × 10⁻¹⁸ J / n²) or electronvolts (−13.6 eV / n², common in physics).
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class EnergyUnit extends EnumerationValue {
  public static readonly JOULES = new EnergyUnit();
  public static readonly ELECTRONVOLTS = new EnergyUnit();

  public static readonly enumeration = new Enumeration(EnergyUnit);
}
