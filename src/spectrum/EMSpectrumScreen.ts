/**
 * EMSpectrumScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createEMSpectrumIcon() in src/common/LightAndAtomsScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createEMSpectrumIcon } from "../common/LightAndAtomsScreenIcons.js";
import LightAndAtomsColors from "../LightAndAtomsColors.js";
import type { LightAndAtomsPreferencesModel } from "../preferences/LightAndAtomsPreferencesModel.js";
import { EMSpectrumModel } from "./model/EMSpectrumModel.js";
import { EMSpectrumKeyboardHelpContent } from "./view/EMSpectrumKeyboardHelpContent.js";
import { EMSpectrumScreenView } from "./view/EMSpectrumScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type EMSpectrumScreenOptions = ScreenOptions & { tandem: Tandem };

export class EMSpectrumScreen extends Screen<EMSpectrumModel, EMSpectrumScreenView> {
  public constructor(preferences: LightAndAtomsPreferencesModel, options: EMSpectrumScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new EMSpectrumModel(),
      // View factory — receives the model instance
      (model) =>
        new EMSpectrumScreenView(model, preferences, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<EMSpectrumScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LightAndAtomsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new EMSpectrumKeyboardHelpContent(),
          homeScreenIcon: createEMSpectrumIcon(),
          navigationBarIcon: createEMSpectrumIcon(),
        },
        options,
      ),
    );
  }
}
