/**
 * LightAndAtomsPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to LightAndAtomsPreferencesModel Properties (whose initial values come from
 * lightAndAtomsQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import LightAndAtomsColors from "../LightAndAtomsColors.js";
import LightAndAtomsNamespace from "../LightAndAtomsNamespace.js";
import type { LightAndAtomsPreferencesModel } from "./LightAndAtomsPreferencesModel.js";

export class LightAndAtomsPreferencesNode extends VBox {
  public constructor(preferencesModel: LightAndAtomsPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // The Preferences dialog is always white, so use the dark "light control surface"
    // colors (readable on white in both default and projector profiles), not textColorProperty
    // (which is near-white in default mode and would be invisible on the white dialog).
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: LightAndAtomsColors.controlSurfaceTextColorProperty,
    });

    const inverseSecondsCheckbox = new Checkbox(
      preferencesModel.inverseSecondsProperty,
      new Text(prefStrings.inverseSecondsStringProperty, {
        font: new PhetFont(14),
        fill: LightAndAtomsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: LightAndAtomsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: LightAndAtomsColors.controlSurfaceColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("inverseSecondsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, inverseSecondsCheckbox],
    });
  }
}

LightAndAtomsNamespace.register("LightAndAtomsPreferencesNode", LightAndAtomsPreferencesNode);
