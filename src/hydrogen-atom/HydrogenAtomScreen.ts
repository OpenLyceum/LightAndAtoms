/**
 * HydrogenAtomScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createHydrogenAtomIcon() in src/common/LightAndAtomsScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createHydrogenAtomIcon } from "../common/LightAndAtomsScreenIcons.js";
import LightAndAtomsColors from "../LightAndAtomsColors.js";
import { HydrogenAtomModel } from "./model/HydrogenAtomModel.js";
import { HydrogenAtomKeyboardHelpContent } from "./view/HydrogenAtomKeyboardHelpContent.js";
import { HydrogenAtomScreenView } from "./view/HydrogenAtomScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type HydrogenAtomScreenOptions = ScreenOptions & { tandem: Tandem };

export class HydrogenAtomScreen extends Screen<HydrogenAtomModel, HydrogenAtomScreenView> {
  public constructor(options: HydrogenAtomScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new HydrogenAtomModel(),
      // View factory — receives the model instance
      (model) =>
        new HydrogenAtomScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<HydrogenAtomScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LightAndAtomsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new HydrogenAtomKeyboardHelpContent(),
          homeScreenIcon: createHydrogenAtomIcon(),
          navigationBarIcon: createHydrogenAtomIcon(),
        },
        options,
      ),
    );
  }
}
