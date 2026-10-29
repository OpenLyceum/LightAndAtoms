/**
 * IntensityChartNode.ts
 *
 * Intensity against wavelength (380–780 nm) for the spectroscope's current spectrum, on bamboo. The
 * x scale matches the eyepiece strip above it pixel for pixel, so a bright line in the strip sits
 * directly over its peak in the chart.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { ChartRectangle, ChartTransform, GridLineSet, LinePlot, TickLabelSet, TickMarkSet } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Orientation } from "scenerystack/phet-core";
import { Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { type SampledSpectrum, SPECTRUM_WAVELENGTHS } from "../../common/model/SpectrumSynthesis.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE, SPECTROSCOPE_MAX_NM, SPECTROSCOPE_MIN_NM } from "../../LightAndAtomsConstants.js";

/** Headroom above the tallest peak, as a fraction of it. */
const Y_HEADROOM = 1.08;

export class IntensityChartNode extends Node {
  public constructor(spectrumProperty: TReadOnlyProperty<SampledSpectrum>, width: number, height: number) {
    super();
    const common = StringManager.getInstance().getCommonStrings();

    const chartTransform = new ChartTransform({
      viewWidth: width,
      viewHeight: height,
      modelXRange: new Range(SPECTROSCOPE_MIN_NM, SPECTROSCOPE_MAX_NM),
      modelYRange: new Range(0, Y_HEADROOM),
    });
    const tickFont = new PhetFont(FONT_SIZE.tiny);
    const plot = new LinePlot(chartTransform, [], {
      stroke: LightAndAtomsColors.chartCurveColorProperty,
      lineWidth: 1.5,
    });
    spectrumProperty.link((spectrum) => {
      plot.setDataSet(Array.from(spectrum, (value, i) => new Vector2(SPECTRUM_WAVELENGTHS[i] ?? 0, value)));
    });

    const xLabel = new Text(common.wavelengthNmStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: LightAndAtomsColors.mutedTextColorProperty,
      maxWidth: width,
    });
    xLabel.boundsProperty.link(() => {
      xLabel.centerX = width / 2;
      xLabel.top = height + 18;
    });
    const yLabel = new Text(common.intensityStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: LightAndAtomsColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: height,
    });
    yLabel.boundsProperty.link(() => {
      yLabel.right = -6;
      yLabel.centerY = height / 2;
    });

    this.children = [
      new ChartRectangle(chartTransform, {
        fill: LightAndAtomsColors.chartBackgroundColorProperty,
        stroke: LightAndAtomsColors.chartAxisColorProperty,
      }),
      new GridLineSet(chartTransform, Orientation.HORIZONTAL, 50, {
        stroke: LightAndAtomsColors.chartGridColorProperty,
      }),
      plot,
      new TickMarkSet(chartTransform, Orientation.HORIZONTAL, 50, {
        edge: "min",
        stroke: LightAndAtomsColors.chartAxisColorProperty,
      }),
      new TickLabelSet(chartTransform, Orientation.HORIZONTAL, 50, {
        edge: "min",
        createLabel: (value: number) =>
          new Text(String(Math.round(value)), { font: tickFont, fill: LightAndAtomsColors.textColorProperty }),
      }),
      xLabel,
      yLabel,
    ];
    this.clipArea = null;
  }
}
