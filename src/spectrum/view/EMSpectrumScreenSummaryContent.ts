/**
 * EMSpectrumScreenSummaryContent.ts
 *
 * The accessible screen summary for the EM Spectrum screen. Its current-details paragraph is live:
 * it reads photon 1's wavelength, region, frequency and energy (and, in compare mode, photon 2 and
 * the energy ratio), and updates as the markers move or the locale changes.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { formatNumberPlain, formatWavelength, UNIT_STRING_DEPENDENCIES } from "../../common/view/formatReadouts.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { EMSpectrumModel } from "../model/EMSpectrumModel.js";
import { regionStringProperty } from "./regionStrings.js";

export class EMSpectrumScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: EMSpectrumModel) {
    const strings = StringManager.getInstance().getEMSpectrumStrings();
    const a11y = StringManager.getInstance().getEMSpectrumA11yStrings();
    const { photon1, photon2 } = model;

    // The ScreenView lives for the whole sim, so this Property is never disposed.
    const currentDetailsProperty: TReadOnlyProperty<string> = DerivedProperty.deriveAny(
      [
        photon1.wavelengthProperty,
        photon2.wavelengthProperty,
        model.compareProperty,
        a11y.currentDetailsStringProperty,
        a11y.currentDetailsCompareStringProperty,
        ...Object.values(strings.regions),
        ...UNIT_STRING_DEPENDENCIES,
      ],
      () => {
        const details = StringUtils.fillIn(a11y.currentDetailsStringProperty.value, {
          wavelength: formatWavelength(photon1.wavelengthProperty.value),
          region: regionStringProperty(photon1.regionProperty.value.id).value,
          frequency: formatNumberPlain(photon1.frequencyProperty.value),
          energy: formatNumberPlain(photon1.energyProperty.value),
          molar: formatNumberPlain(photon1.molarEnergyProperty.value),
        });
        if (!model.compareProperty.value) {
          return details;
        }
        const compare = StringUtils.fillIn(a11y.currentDetailsCompareStringProperty.value, {
          wavelength: formatWavelength(photon2.wavelengthProperty.value),
          region: regionStringProperty(photon2.regionProperty.value.id).value,
          energyRatio: formatNumberPlain(photon1.wavelengthProperty.value / photon2.wavelengthProperty.value),
        });
        return `${details} ${compare}`;
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
