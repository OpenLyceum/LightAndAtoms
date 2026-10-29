/**
 * LineSpectraKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the Line Spectra screen: the wavelength cursor and the temperature
 * slider on the left; combo boxes, radio buttons, checkboxes and buttons on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import LightAndAtomsHotkeyData from "../../common/LightAndAtomsHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class LineSpectraKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    const cursorSection = new KeyboardHelpSection(keyboardHelp.wavelengthCursorStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(LightAndAtomsHotkeyData.MOVE_CURSOR),
      KeyboardHelpSectionRow.fromHotkeyData(LightAndAtomsHotkeyData.MOVE_CURSOR_FINE),
      KeyboardHelpSectionRow.fromHotkeyData(LightAndAtomsHotkeyData.JUMP_CURSOR),
    ]);
    super(
      [cursorSection, new SliderControlsKeyboardHelpSection()],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
