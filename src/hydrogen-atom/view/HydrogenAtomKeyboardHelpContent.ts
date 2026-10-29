/**
 * HydrogenAtomKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Hydrogen Atom screen: the lamp's wavelength slider on the left, and
 * the buttons, radio buttons and checkboxes of the control panel on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class HydrogenAtomKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    super(
      [new SliderControlsKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
