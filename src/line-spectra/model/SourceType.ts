/**
 * SourceType.ts
 *
 * What the spectroscope is pointed at on the Line Spectra screen.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class SourceType extends EnumerationValue {
  /** A gas discharge tube: hot, low-pressure gas gives bright lines. */
  public static readonly DISCHARGE_TUBE = new SourceType();

  /** A metal salt in a flame: the flame colour comes from the metal's lines and bands. */
  public static readonly FLAME_TEST = new SourceType();

  /** White light through a cell of gas: dark lines on a continuous spectrum. */
  public static readonly ABSORPTION = new SourceType();

  /** An incandescent filament: a continuous spectrum. */
  public static readonly LIGHT_BULB = new SourceType();

  /** Sunlight: a continuous spectrum crossed by Fraunhofer lines. */
  public static readonly SUN = new SourceType();

  /** A tube of unknown gas (or two) to identify. */
  public static readonly MYSTERY = new SourceType();

  public static readonly enumeration = new Enumeration(SourceType);
}
