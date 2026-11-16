import { LIGHT_AND_ATOMS_PREFERENCES_NODE_SETTINGS } from "../LightAndAtomsConstants.js";
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
      font: new PhetFont({ size: LIGHT_AND_ATOMS_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: LightAndAtomsColors.controlSurfaceTextColorProperty,
    });

    const inverseSecondsCheckbox = new Checkbox(
      preferencesModel.inverseSecondsProperty,
      new Text(prefStrings.inverseSecondsStringProperty, {
        font: new PhetFont(LIGHT_AND_ATOMS_PREFERENCES_NODE_SETTINGS.INVERSE_SECONDS_CHECKBOX_FONT_SIZE),
        fill: LightAndAtomsColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: LightAndAtomsColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: LightAndAtomsColors.controlSurfaceColorProperty,
        spacing: LIGHT_AND_ATOMS_PREFERENCES_NODE_SETTINGS.INVERSE_SECONDS_CHECKBOX_SPACING,
        ...(tandem && { tandem: tandem.createTandem("inverseSecondsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: LIGHT_AND_ATOMS_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_SPACING,
      children: [header, inverseSecondsCheckbox],
    });
  }
}

LightAndAtomsNamespace.register("LightAndAtomsPreferencesNode", LightAndAtomsPreferencesNode);
