/**
 * EMSpectrumKeyboardHelpContent.ts
 *
 * Keyboard-help dialog for the EM Spectrum screen: the spectrum markers on the left, combo box and
 * basic actions (checkboxes, Reset All) on the right.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import LightAndAtomsHotkeyData from "../../common/LightAndAtomsHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class EMSpectrumKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();
    const markerSection = new KeyboardHelpSection(keyboardHelp.spectrumMarkerStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(LightAndAtomsHotkeyData.MOVE_MARKER),
      KeyboardHelpSectionRow.fromHotkeyData(LightAndAtomsHotkeyData.MOVE_MARKER_FINE),
      KeyboardHelpSectionRow.fromHotkeyData(LightAndAtomsHotkeyData.JUMP_DECADE),
    ]);
    super(
      [markerSection],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
