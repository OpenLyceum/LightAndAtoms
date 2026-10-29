/**
 * HydrogenMode.ts
 *
 * Whether the Hydrogen Atom screen is watching the atom give out light (emission, as in a gas
 * discharge tube) or take it in (absorption, white light shining through the gas).
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class HydrogenMode extends EnumerationValue {
  /** The electron is excited by a discharge and emits photons as it falls. */
  public static readonly EMISSION = new HydrogenMode();

  /** A lamp fires photons; only those matching a level gap are absorbed. */
  public static readonly ABSORPTION = new HydrogenMode();

  public static readonly enumeration = new Enumeration(HydrogenMode);
}
