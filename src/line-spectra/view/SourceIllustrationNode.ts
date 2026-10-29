/**
 * SourceIllustrationNode.ts
 *
 * A picture of the current light source, glowing in the colour its spectrum looks to the eye
 * (computed from the spectrum with the CIE matching functions, not chosen by hand), with a beam to
 * the spectroscope. A discharge tube, a flame, a light bulb, the Sun, white light through a gas
 * cell, or the mystery tube (labelled "?"; its glow is the first clue).
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, type Color, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { emissionSpectrum, flatSpectrum, SPECTRUM_WAVELENGTHS } from "../../common/model/SpectrumSynthesis.js";
import { perceivedColor } from "../../common/view/spectralColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE } from "../../LightAndAtomsConstants.js";
import type { LineSpectraModel } from "../model/LineSpectraModel.js";
import { SourceType } from "../model/SourceType.js";

/** Size of the area the source is drawn in, px. */
const SOURCE_WIDTH = 170;
const SOURCE_HEIGHT = 110;
/** Length of the beam to the spectroscope, px. */
const BEAM_LENGTH = 90;

export class SourceIllustrationNode extends Node {
  public constructor(model: LineSpectraModel) {
    super();
    const strings = StringManager.getInstance().getLineSpectraStrings();
    const cx = SOURCE_WIDTH / 2;
    const cy = SOURCE_HEIGHT / 2;
    const housing = LightAndAtomsColors.lampHousingColorProperty;
    const housingStroke = LightAndAtomsColors.lampHousingStrokeColorProperty;

    // ── Discharge tube (also the mystery tube) ───────────────────────────────
    const tubeGlass = new Rectangle(cx - 70, cy - 12, 140, 24, { cornerRadius: 12, lineWidth: 1.5 });
    const tube = new Node({
      children: [
        new Rectangle(cx - 84, cy - 9, 16, 18, { fill: housing, stroke: housingStroke }),
        new Rectangle(cx + 68, cy - 9, 16, 18, { fill: housing, stroke: housingStroke }),
        tubeGlass,
      ],
    });
    const mysteryLabel = new Text(strings.hiddenGasStringProperty, {
      font: new PhetFont({ size: 22, weight: "bold" }),
      fill: "black",
      center: tubeGlass.center,
    });

    // ── Flame on a burner ────────────────────────────────────────────────────
    const flameShape = new Shape()
      .moveTo(cx, cy - 48)
      .cubicCurveTo(cx + 26, cy - 14, cx + 28, cy + 22, cx, cy + 30)
      .cubicCurveTo(cx - 28, cy + 22, cx - 26, cy - 14, cx, cy - 48)
      .close();
    const flameOuter = new Path(flameShape, { opacity: 0.9 });
    const flameCore = new Path(flameShape, {
      scale: 0.45,
      centerX: cx,
      bottom: cy + 30,
      fill: LightAndAtomsColors.flameCoreColorProperty,
      opacity: 0.8,
    });
    const flame = new Node({
      children: [
        new Rectangle(cx - 10, cy + 30, 20, 22, { fill: housing, stroke: housingStroke }),
        flameOuter,
        flameCore,
      ],
    });

    // ── Light bulb ───────────────────────────────────────────────────────────
    const bulbGlass = new Circle(32, { centerX: cx, centerY: cy - 8 });
    const bulb = new Node({
      children: [
        new Rectangle(cx - 14, cy + 20, 28, 22, { fill: housing, stroke: housingStroke, cornerRadius: 3 }),
        bulbGlass,
      ],
    });

    // ── Sun ──────────────────────────────────────────────────────────────────
    const sunDisk = new Circle(34, { centerX: cx, centerY: cy });
    const rays = new Path(
      Array.from({ length: 12 }, (_, i) => i).reduce((shape, i) => {
        const angle = (i * Math.PI) / 6;
        return shape
          .moveTo(cx + 40 * Math.cos(angle), cy + 40 * Math.sin(angle))
          .lineTo(cx + 52 * Math.cos(angle), cy + 52 * Math.sin(angle));
      }, new Shape()),
      { lineWidth: 3 },
    );
    const sun = new Node({ children: [rays, sunDisk] });

    // ── White light through a gas cell ───────────────────────────────────────
    const cellGlass = new Rectangle(cx - 10, cy - 20, 60, 40, {
      cornerRadius: 4,
      lineWidth: 1.5,
      stroke: housingStroke,
    });
    const whiteLamp = new Circle(18, { centerX: cx - 52, centerY: cy, fill: "white", stroke: housingStroke });
    const absorptionSetup = new Node({
      children: [
        whiteLamp,
        new Path(Shape.lineSegment(cx - 34, cy, cx - 10, cy), { stroke: "white", lineWidth: 6, opacity: 0.6 }),
        cellGlass,
      ],
    });

    // Beam to the spectroscope and the spectroscope itself.
    const beam = new Path(Shape.lineSegment(SOURCE_WIDTH + 4, cy, SOURCE_WIDTH + BEAM_LENGTH, cy), {
      lineWidth: 8,
      opacity: 0.7,
    });
    const spectroscope = new Rectangle(SOURCE_WIDTH + BEAM_LENGTH, cy - 16, 90, 32, {
      fill: housing,
      stroke: housingStroke,
      cornerRadius: 4,
    });
    const spectroscopeLabel = new Text(strings.spectroscopeStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: "white",
      maxWidth: 82,
    });
    spectroscopeLabel.boundsProperty.link(() => {
      spectroscopeLabel.center = spectroscope.center;
    });

    this.children = [tube, flame, bulb, sun, absorptionSetup, mysteryLabel, beam, spectroscope, spectroscopeLabel];

    // Glow colour of the source itself (for absorption, the gas's own emission colour tints the cell).
    const glowColorProperty = new DerivedProperty(
      [model.sourceTypeProperty, model.spectrumProperty, model.tubeElementProperty],
      (sourceType, spectrum, tubeElement): Color =>
        sourceType === SourceType.ABSORPTION
          ? perceivedColor(SPECTRUM_WAVELENGTHS, emissionSpectrum(tubeElement.features))
          : perceivedColor(SPECTRUM_WAVELENGTHS, spectrum),
    );
    // The beam reaching the spectroscope is the transmitted light.
    const beamColorProperty = new DerivedProperty([model.spectrumProperty], (spectrum) =>
      perceivedColor(SPECTRUM_WAVELENGTHS, spectrum),
    );
    const white = perceivedColor(SPECTRUM_WAVELENGTHS, flatSpectrum());

    Multilink.multilink(
      [model.sourceTypeProperty, glowColorProperty, beamColorProperty],
      (sourceType, glow, beamColor) => {
        tube.visible = sourceType === SourceType.DISCHARGE_TUBE || sourceType === SourceType.MYSTERY;
        mysteryLabel.visible = sourceType === SourceType.MYSTERY;
        flame.visible = sourceType === SourceType.FLAME_TEST;
        bulb.visible = sourceType === SourceType.LIGHT_BULB;
        sun.visible = sourceType === SourceType.SUN;
        absorptionSetup.visible = sourceType === SourceType.ABSORPTION;

        tubeGlass.fill = glow;
        tubeGlass.stroke = glow.colorUtilsBrighter(0.4);
        flameOuter.fill = glow;
        bulbGlass.fill = glow;
        sunDisk.fill = glow;
        rays.stroke = glow;
        cellGlass.fill = glow.withAlpha(0.35);
        whiteLamp.fill = white;
        beam.stroke = beamColor;
      },
    );
  }
}
