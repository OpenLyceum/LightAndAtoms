import { CONTROL_FACTORY_SETTINGS } from "../../LightAndAtomsConstants.js";
/**
 * ControlFactory.ts
 *
 * Themed builders for panel controls (copied from SpectroscopyLab, which copied it from MolScope). `accessibleName` is a required
 * argument, so a control without one is a compile error rather than a silent gap.
 */

import type { PhetioProperty, Property, TReadOnlyProperty } from "scenerystack/axon";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, Checkbox, ComboBox, type ComboBoxItem, TextPushButton } from "scenerystack/sun";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  LIGHT_AND_ATOMS_COMBO_BOX_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../LightAndAtomsButtonOptions.js";
import { LIGHT_AND_ATOMS_CHECKBOX_OPTIONS } from "../LightAndAtomsControlOptions.js";

const CONTROL_FONT = new PhetFont(CONTROL_FACTORY_SETTINGS.CONTROL_FONT_SIZE);
const HEADING_FONT = new PhetFont({ size: CONTROL_FACTORY_SETTINGS.HEADING_FONT_SIZE, weight: "bold" });

export function heading(text: TReadOnlyProperty<string>, maxWidth: number): Text {
  return new Text(text, { font: HEADING_FONT, fill: LightAndAtomsColors.textColorProperty, maxWidth });
}

export function label(text: TReadOnlyProperty<string> | string, maxWidth: number): Text {
  return new Text(text, { font: CONTROL_FONT, fill: LightAndAtomsColors.textColorProperty, maxWidth });
}

export type ComboChoice<T> = { readonly value: T; readonly label: TReadOnlyProperty<string> };

export function comboBox<T>(
  property: PhetioProperty<T>,
  choices: readonly ComboChoice<T>[],
  listParent: Node,
  accessibleName: TReadOnlyProperty<string>,
  maxWidth: number,
): ComboBox<T> {
  const items: ComboBoxItem<T>[] = choices.map((choice) => ({
    value: choice.value,
    createNode: () =>
      new Text(choice.label, {
        font: CONTROL_FONT,
        fill: LIGHT_SURFACE_TEXT_FILL,
        maxWidth: maxWidth - CONTROL_FACTORY_SETTINGS.ITEMS_MAX_WIDTH_OFFSET,
      }),
    accessibleName: choice.label,
  }));
  return new ComboBox(property, items, listParent, {
    ...LIGHT_AND_ATOMS_COMBO_BOX_OPTIONS,
    xMargin: CONTROL_FACTORY_SETTINGS.COMBO_BOX_X_MARGIN,
    yMargin: CONTROL_FACTORY_SETTINGS.COMBO_BOX_Y_MARGIN,
    cornerRadius: CONTROL_FACTORY_SETTINGS.COMBO_BOX_CORNER_RADIUS,
    accessibleName,
  });
}

/** A label above a control, left-aligned. */
export function labeled(text: TReadOnlyProperty<string>, control: Node, maxWidth: number): VBox {
  return new VBox({
    align: "left",
    spacing: CONTROL_FACTORY_SETTINGS.LABELED_SPACING,
    children: [label(text, maxWidth), control],
  });
}

export function checkbox(property: Property<boolean>, text: TReadOnlyProperty<string>, maxWidth: number): Checkbox {
  return new Checkbox(property, label(text, maxWidth), {
    ...LIGHT_AND_ATOMS_CHECKBOX_OPTIONS,
    accessibleName: text,
  });
}

export function pushButton(
  text: TReadOnlyProperty<string>,
  listener: () => void,
  accessibleName = text,
): TextPushButton {
  return new TextPushButton(text, {
    ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
    font: CONTROL_FONT,
    textFill: LIGHT_SURFACE_TEXT_FILL,
    xMargin: CONTROL_FACTORY_SETTINGS.PUSH_BUTTON_X_MARGIN,
    yMargin: CONTROL_FACTORY_SETTINGS.PUSH_BUTTON_Y_MARGIN,
    maxTextWidth: 180,
    listener,
    accessibleName,
  });
}

export function radioGroup<T>(
  property: PhetioProperty<T>,
  choices: readonly ComboChoice<T>[],
  accessibleName: TReadOnlyProperty<string>,
  maxWidth: number,
  orientation: "vertical" | "horizontal" = "vertical",
): AquaRadioButtonGroup<T> {
  return new AquaRadioButtonGroup(
    property,
    choices.map((choice) => ({
      value: choice.value,
      createNode: () => label(choice.label, maxWidth),
      options: { accessibleName: choice.label },
    })),
    {
      orientation,
      spacing: orientation === "vertical" ? CONTROL_FACTORY_SETTINGS.RADIO_GROUP_SPACING : 10,
      radioButtonOptions: {
        radius: CONTROL_FACTORY_SETTINGS.RADIO_GROUP_RADIUS,
        selectedColor: LightAndAtomsColors.accentColorProperty,
      },
      accessibleName,
    },
  );
}
