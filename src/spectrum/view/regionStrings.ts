/**
 * regionStrings.ts
 *
 * The localised name of each EM region.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { StringManager } from "../../i18n/StringManager.js";
import type { EMRegionId } from "../model/EMRegion.js";

/** The display name of a region. */
export function regionStringProperty(id: EMRegionId): TReadOnlyProperty<string> {
  const regions = StringManager.getInstance().getEMSpectrumStrings().regions;
  return {
    gamma: regions.gammaStringProperty,
    xRay: regions.xRayStringProperty,
    ultraviolet: regions.ultravioletStringProperty,
    visible: regions.visibleStringProperty,
    infrared: regions.infraredStringProperty,
    microwave: regions.microwaveStringProperty,
    radio: regions.radioStringProperty,
  }[id];
}
