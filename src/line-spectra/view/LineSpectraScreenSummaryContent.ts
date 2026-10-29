/**
 * LineSpectraScreenSummaryContent.ts
 *
 * The accessible screen summary for the Line Spectra screen. Its current-details paragraph is live:
 * the source, the wavelength of the brightest line, and the cursor's wavelength and intensity. The
 * mystery tube is described without naming its gas.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { SPECTRUM_WAVELENGTHS, sampleAt } from "../../common/model/SpectrumSynthesis.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { LineSpectraModel } from "../model/LineSpectraModel.js";
import { SourceType } from "../model/SourceType.js";
import { elementNameProperty } from "./elementNames.js";

export class LineSpectraScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: LineSpectraModel) {
    const strings = StringManager.getInstance().getLineSpectraStrings();
    const a11y = StringManager.getInstance().getLineSpectraA11yStrings();

    const sourceName = (): string => {
      const sourceType = model.sourceTypeProperty.value;
      const sources = strings.sources;
      if (sourceType === SourceType.DISCHARGE_TUBE || sourceType === SourceType.ABSORPTION) {
        const source =
          sourceType === SourceType.DISCHARGE_TUBE
            ? sources.dischargeTubeStringProperty
            : sources.absorptionStringProperty;
        return `${source.value}, ${elementNameProperty(model.tubeElementProperty.value.id).value}`;
      } else if (sourceType === SourceType.FLAME_TEST) {
        return `${sources.flameTestStringProperty.value}, ${elementNameProperty(model.flameElementProperty.value.id).value}`;
      } else if (sourceType === SourceType.LIGHT_BULB) {
        return `${sources.lightBulbStringProperty.value}, ${model.bulbTemperatureProperty.value} K`;
      } else if (sourceType === SourceType.SUN) {
        return sources.sunStringProperty.value;
      }
      return a11y.mysterySourceStringProperty.value;
    };

    // Lives as long as the screen; never disposed.
    const currentDetailsProperty: TReadOnlyProperty<string> = DerivedProperty.deriveAny(
      [
        model.sourceTypeProperty,
        model.tubeElementProperty,
        model.flameElementProperty,
        model.bulbTemperatureProperty,
        model.spectrumProperty,
        model.cursorWavelengthProperty,
        a11y.currentDetailsStringProperty,
        a11y.mysterySourceStringProperty,
        ...Object.values(strings.sources),
        ...Object.values(strings.elements),
      ],
      () => {
        const spectrum = model.spectrumProperty.value;
        let peakIndex = 0;
        spectrum.forEach((value, i) => {
          if (value > (spectrum[peakIndex] ?? 0)) {
            peakIndex = i;
          }
        });
        const cursor = model.cursorWavelengthProperty.value;
        return StringUtils.fillIn(a11y.currentDetailsStringProperty.value, {
          source: sourceName(),
          peak: toFixed(SPECTRUM_WAVELENGTHS[peakIndex] ?? 0, 1),
          cursor: toFixed(cursor, 1),
          intensity: Math.round(100 * sampleAt(spectrum, cursor)),
        });
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
