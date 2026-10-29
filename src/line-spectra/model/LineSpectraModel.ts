/**
 * LineSpectraModel.ts
 *
 * The Line Spectra screen: a spectroscope pointed at a gas discharge tube, a flame test, white
 * light through a gas cell, a light bulb, the Sun, or a mystery tube. Every source reduces to one
 * sampled spectrum over 380–780 nm ({@link spectrumProperty}), which the view draws twice: as the
 * coloured strip seen in the eyepiece and as an intensity chart.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import {
  absorptionSpectrum,
  continuousSpectrum,
  emissionSpectrum,
  type SampledSpectrum,
  solarSpectrum,
} from "../../common/model/SpectrumSynthesis.js";
import {
  BULB_TEMPERATURE_RANGE,
  INITIAL_BULB_TEMPERATURE,
  SPECTROSCOPE_MAX_NM,
  SPECTROSCOPE_MIN_NM,
} from "../../LightAndAtomsConstants.js";
import { type ElementSpectrum, FLAME_ELEMENTS, FRAUNHOFER_LINES, TUBE_ELEMENTS } from "./AtomicLines.js";
import { MysteryTube } from "./MysteryTube.js";
import { SourceType } from "./SourceType.js";

/** Initial cursor wavelength, nm (the sodium D lines). */
const INITIAL_CURSOR_NM = 589;

const firstOf = (elements: readonly ElementSpectrum[]): ElementSpectrum => {
  const first = elements[0];
  if (!first) {
    throw new Error("empty element list");
  }
  return first;
};

export class LineSpectraModel implements TModel {
  public readonly sourceTypeProperty = new EnumerationProperty(SourceType.DISCHARGE_TUBE);

  /** Gas in the discharge tube (and in the absorption cell). */
  public readonly tubeElementProperty = new Property<ElementSpectrum>(firstOf(TUBE_ELEMENTS), {
    validValues: TUBE_ELEMENTS,
  });

  /** Metal salt in the flame. */
  public readonly flameElementProperty = new Property<ElementSpectrum>(firstOf(FLAME_ELEMENTS), {
    validValues: FLAME_ELEMENTS,
  });

  /** Filament temperature, K. */
  public readonly bulbTemperatureProperty = new NumberProperty(INITIAL_BULB_TEMPERATURE, {
    range: BULB_TEMPERATURE_RANGE,
  });

  /** In absorption mode, also show the same gas's emission spectrum for comparison. */
  public readonly showEmissionComparisonProperty = new BooleanProperty(false);

  /** A reference gas whose lines are drawn under the eyepiece strip, or null for none. */
  public readonly referenceElementProperty = new Property<ElementSpectrum | null>(null, {
    validValues: [null, ...TUBE_ELEMENTS],
  });

  /** The wavelength cursor on the chart, nm. */
  public readonly cursorWavelengthProperty = new NumberProperty(INITIAL_CURSOR_NM, {
    range: new Range(SPECTROSCOPE_MIN_NM, SPECTROSCOPE_MAX_NM),
  });

  /** The identification challenge. */
  public readonly mystery = new MysteryTube();

  /** What the spectroscope sees, normalised to a maximum of 1. */
  public readonly spectrumProperty: TReadOnlyProperty<SampledSpectrum>;

  /** Emission spectrum of the absorption cell's gas, for the comparison strip. */
  public readonly comparisonSpectrumProperty: TReadOnlyProperty<SampledSpectrum>;

  /** Emission spectrum of the reference gas, or null. */
  public readonly referenceSpectrumProperty: TReadOnlyProperty<SampledSpectrum | null>;

  public constructor() {
    // The Sun never changes, so compute it once.
    const sun = solarSpectrum(FRAUNHOFER_LINES);

    this.spectrumProperty = new DerivedProperty(
      [
        this.sourceTypeProperty,
        this.tubeElementProperty,
        this.flameElementProperty,
        this.bulbTemperatureProperty,
        this.mystery.answerProperty,
      ],
      (sourceType, tubeElement, flameElement, temperature, mysteryAnswer) => {
        if (sourceType === SourceType.DISCHARGE_TUBE) {
          return emissionSpectrum(tubeElement.features);
        } else if (sourceType === SourceType.FLAME_TEST) {
          return emissionSpectrum(flameElement.features);
        } else if (sourceType === SourceType.ABSORPTION) {
          return absorptionSpectrum(tubeElement.features);
        } else if (sourceType === SourceType.LIGHT_BULB) {
          return continuousSpectrum(temperature);
        } else if (sourceType === SourceType.SUN) {
          return sun;
        } else {
          return emissionSpectrum(...mysteryAnswer.map((element) => element.features));
        }
      },
    );

    this.comparisonSpectrumProperty = new DerivedProperty([this.tubeElementProperty], (element) =>
      emissionSpectrum(element.features),
    );

    this.referenceSpectrumProperty = new DerivedProperty([this.referenceElementProperty], (element) =>
      element ? emissionSpectrum(element.features) : null,
    );
  }

  public reset(): void {
    this.sourceTypeProperty.reset();
    this.tubeElementProperty.reset();
    this.flameElementProperty.reset();
    this.bulbTemperatureProperty.reset();
    this.showEmissionComparisonProperty.reset();
    this.referenceElementProperty.reset();
    this.cursorWavelengthProperty.reset();
    this.mystery.reset();
  }

  public step(_dt: number): void {
    // Nothing animates; every change is driven by a control.
  }
}
