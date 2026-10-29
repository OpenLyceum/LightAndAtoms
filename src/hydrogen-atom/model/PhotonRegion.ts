/**
 * PhotonRegion.ts
 *
 * The part of the spectrum the lamp's wavelength control covers: ultraviolet (where the Lyman
 * series lies), visible (Balmer) or infrared (Paschen). Splitting the range keeps each slider fine
 * enough to land on a line with the arrow buttons.
 */

import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export class PhotonRegion extends EnumerationValue {
  public static readonly ULTRAVIOLET = new PhotonRegion();
  public static readonly VISIBLE = new PhotonRegion();
  public static readonly INFRARED = new PhotonRegion();

  public static readonly enumeration = new Enumeration(PhotonRegion);
}
