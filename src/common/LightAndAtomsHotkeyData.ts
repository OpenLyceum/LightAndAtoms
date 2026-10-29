/**
 * LightAndAtomsHotkeyData.ts
 *
 * Keys of the spectrum markers (EM Spectrum) and the wavelength cursor (Line Spectra). Both are
 * AccessibleSlider nodes, so the keys are handled by the slider itself; this HotkeyData exists to
 * label those keys in the keyboard-help dialog with the sim's own wording.
 */

import { HotkeyData } from "scenerystack/scenery";
import { StringManager } from "../i18n/StringManager.js";

const REPO_NAME = "light-and-atoms";
const keyboardHelp = StringManager.getInstance().getKeyboardHelpStrings();

const LightAndAtomsHotkeyData = {
  MOVE_MARKER: new HotkeyData({
    keys: ["arrowLeft", "arrowRight"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.moveMarkerStringProperty,
  }),
  MOVE_MARKER_FINE: new HotkeyData({
    keys: ["shift+arrowLeft", "shift+arrowRight"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.moveMarkerFineStringProperty,
  }),
  JUMP_DECADE: new HotkeyData({
    keys: ["pageUp", "pageDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.jumpDecadeStringProperty,
  }),
  MOVE_CURSOR: new HotkeyData({
    keys: ["arrowLeft", "arrowRight"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.moveCursorStringProperty,
  }),
  MOVE_CURSOR_FINE: new HotkeyData({
    keys: ["shift+arrowLeft", "shift+arrowRight"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.moveCursorFineStringProperty,
  }),
  JUMP_CURSOR: new HotkeyData({
    keys: ["pageUp", "pageDown"],
    repoName: REPO_NAME,
    keyboardHelpDialogLabelStringProperty: keyboardHelp.jumpCursorStringProperty,
  }),
};

export default LightAndAtomsHotkeyData;
