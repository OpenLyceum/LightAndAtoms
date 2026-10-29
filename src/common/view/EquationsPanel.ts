/**
 * EquationsPanel.ts
 *
 * A titled panel of worked equations with the current numbers substituted, shown when "Show
 * equations" is checked. The owner supplies the lines as RichText markup (one Property per line),
 * so the panel follows both the model and the locale.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE } from "../../LightAndAtomsConstants.js";
import { LightAndAtomsPanel } from "../LightAndAtomsPanel.js";

export class EquationsPanel extends LightAndAtomsPanel {
  public constructor(
    lineProperties: readonly TReadOnlyProperty<string>[],
    visibleProperty: TReadOnlyProperty<boolean>,
    maxWidth: number,
  ) {
    const title = new Text(StringManager.getInstance().getCommonStrings().equationsStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: LightAndAtomsColors.textColorProperty,
      maxWidth,
    });
    const lines = lineProperties.map(
      (lineProperty) =>
        new RichText(lineProperty, {
          font: new PhetFont(FONT_SIZE.label),
          fill: LightAndAtomsColors.textColorProperty,
          maxWidth,
          leading: 4,
        }),
    );
    super(new VBox({ align: "left", spacing: 8, children: [title, ...lines] }), { visibleProperty });
  }
}
