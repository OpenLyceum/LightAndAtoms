/**
 * HydrogenAtomScreenSummaryContent.ts
 *
 * The accessible screen summary for the Hydrogen Atom screen. Its current-details paragraph is live:
 * the electron's level and energy (or that the atom is ionised) and how many lines are recorded.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { levelEnergy } from "../../common/model/Bohr.js";
import { toSignificantFigures } from "../../common/model/formatNumber.js";
import { joulesToElectronvolts } from "../../common/model/PhotonUtils.js";
import { formatNumberPlain, UNIT_STRING_DEPENDENCIES, valueWithUnit } from "../../common/view/formatReadouts.js";
import { StringManager } from "../../i18n/StringManager.js";
import { EnergyUnit } from "../model/EnergyUnit.js";
import type { HydrogenAtomModel } from "../model/HydrogenAtomModel.js";

export class HydrogenAtomScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: HydrogenAtomModel) {
    const a11y = StringManager.getInstance().getHydrogenAtomA11yStrings();
    const units = StringManager.getInstance().getUnitStrings();

    // The ObservableArray's own length Property tracks the recorded-line count.
    const lineCountProperty = model.recordedLines.lengthProperty;

    // Lives as long as the screen; never disposed.
    const currentDetailsProperty: TReadOnlyProperty<string> = DerivedProperty.deriveAny(
      [
        model.levelProperty,
        model.ionizedProperty,
        model.energyUnitProperty,
        lineCountProperty,
        a11y.currentDetailsStringProperty,
        a11y.currentDetailsIonizedStringProperty,
        units.electronvoltsStringProperty,
        ...UNIT_STRING_DEPENDENCIES,
      ],
      () => {
        const lines = lineCountProperty.value;
        if (model.ionizedProperty.value) {
          return StringUtils.fillIn(a11y.currentDetailsIonizedStringProperty.value, { lines });
        }
        const n = model.levelProperty.value;
        const energy = levelEnergy(n);
        const energyText =
          model.energyUnitProperty.value === EnergyUnit.JOULES
            ? valueWithUnit(formatNumberPlain(energy), units.joulesStringProperty.value)
            : valueWithUnit(
                toSignificantFigures(joulesToElectronvolts(energy), 3),
                units.electronvoltsStringProperty.value,
              );
        return StringUtils.fillIn(a11y.currentDetailsStringProperty.value, { n, energy: energyText, lines });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
