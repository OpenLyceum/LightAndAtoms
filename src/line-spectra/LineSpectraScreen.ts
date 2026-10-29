/**
 * LineSpectraScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createLineSpectraIcon() in src/common/LightAndAtomsScreenIcons.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createLineSpectraIcon } from "../common/LightAndAtomsScreenIcons.js";
import LightAndAtomsColors from "../LightAndAtomsColors.js";
import { LineSpectraModel } from "./model/LineSpectraModel.js";
import { LineSpectraKeyboardHelpContent } from "./view/LineSpectraKeyboardHelpContent.js";
import { LineSpectraScreenView } from "./view/LineSpectraScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type LineSpectraScreenOptions = ScreenOptions & { tandem: Tandem };

export class LineSpectraScreen extends Screen<LineSpectraModel, LineSpectraScreenView> {
  public constructor(options: LineSpectraScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new LineSpectraModel(),
      // View factory — receives the model instance
      (model) =>
        new LineSpectraScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<LineSpectraScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LightAndAtomsColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new LineSpectraKeyboardHelpContent(),
          homeScreenIcon: createLineSpectraIcon(),
          navigationBarIcon: createLineSpectraIcon(),
        },
        options,
      ),
    );
  }
}
