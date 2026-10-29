/**
 * elementNames.ts
 *
 * The localised name of each element on the Line Spectra screen.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElementId } from "../model/AtomicLines.js";

/** The display name of an element. */
export function elementNameProperty(id: ElementId): TReadOnlyProperty<string> {
  const elements = StringManager.getInstance().getLineSpectraStrings().elements;
  return {
    hydrogen: elements.hydrogenStringProperty,
    helium: elements.heliumStringProperty,
    neon: elements.neonStringProperty,
    sodium: elements.sodiumStringProperty,
    mercury: elements.mercuryStringProperty,
    argon: elements.argonStringProperty,
    krypton: elements.kryptonStringProperty,
    lithium: elements.lithiumStringProperty,
    potassium: elements.potassiumStringProperty,
    calcium: elements.calciumStringProperty,
    strontium: elements.strontiumStringProperty,
    barium: elements.bariumStringProperty,
    copper: elements.copperStringProperty,
  }[id];
}
