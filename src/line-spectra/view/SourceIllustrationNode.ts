import { SOURCE_ILLUSTRATION_NODE_SETTINGS } from "../../LightAndAtomsConstants.js";
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
const SOURCE_WIDTH: number = SOURCE_ILLUSTRATION_NODE_SETTINGS.SOURCE_WIDTH;
const SOURCE_HEIGHT: number = SOURCE_ILLUSTRATION_NODE_SETTINGS.SOURCE_HEIGHT;
/** Length of the beam to the spectroscope, px. */
const BEAM_LENGTH: number = SOURCE_ILLUSTRATION_NODE_SETTINGS.BEAM_LENGTH;

export class SourceIllustrationNode extends Node {
  public constructor(model: LineSpectraModel) {
    super();
    const strings = StringManager.getInstance().getLineSpectraStrings();
    const cx = SOURCE_WIDTH / 2;
    const cy = SOURCE_HEIGHT / 2;
    const housing = LightAndAtomsColors.lampHousingColorProperty;
    const housingStroke = LightAndAtomsColors.lampHousingStrokeColorProperty;

    // ── Discharge tube (also the mystery tube) ───────────────────────────────
    const tubeGlass = new Rectangle(
      cx - 70,
      cy - 12,
      SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_GLASS_WIDTH,
      SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_GLASS_HEIGHT,
      {
        cornerRadius: SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_GLASS_CORNER_RADIUS,
        lineWidth: SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_GLASS_LINE_WIDTH,
      },
    );
    const tube = new Node({
      children: [
        new Rectangle(
          cx - 84,
          cy - 9,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_WIDTH,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_HEIGHT,
          { fill: housing, stroke: housingStroke },
        ),
        new Rectangle(
          cx + 68,
          cy - 9,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_WIDTH,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.TUBE_HEIGHT,
          { fill: housing, stroke: housingStroke },
        ),
        tubeGlass,
      ],
    });
    const mysteryLabel = new Text(strings.hiddenGasStringProperty, {
      font: new PhetFont({ size: SOURCE_ILLUSTRATION_NODE_SETTINGS.MYSTERY_LABEL_FONT_SIZE, weight: "bold" }),
      fill: "black",
      center: tubeGlass.center,
    });

    // ── Flame on a burner ────────────────────────────────────────────────────
    const flameShape = new Shape()
      .moveTo(cx, cy - 48)
      .cubicCurveTo(cx + 26, cy - 14, cx + 28, cy + 22, cx, cy + 30)
      .cubicCurveTo(cx - 28, cy + 22, cx - 26, cy - 14, cx, cy - 48)
      .close();
    const flameOuter = new Path(flameShape, { opacity: SOURCE_ILLUSTRATION_NODE_SETTINGS.FLAME_OUTER_OPACITY });
    const flameCore = new Path(flameShape, {
      scale: SOURCE_ILLUSTRATION_NODE_SETTINGS.FLAME_CORE_SCALE,
      centerX: cx,
      bottom: cy + SOURCE_ILLUSTRATION_NODE_SETTINGS.FLAME_CORE_BOTTOM_OFFSET,
      fill: LightAndAtomsColors.flameCoreColorProperty,
      opacity: SOURCE_ILLUSTRATION_NODE_SETTINGS.FLAME_CORE_OPACITY,
    });
    const flame = new Node({
      children: [
        new Rectangle(
          cx - 10,
          cy + 30,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.FLAME_WIDTH,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.FLAME_HEIGHT,
          { fill: housing, stroke: housingStroke },
        ),
        flameOuter,
        flameCore,
      ],
    });

    // ── Light bulb ───────────────────────────────────────────────────────────
    const bulbGlass = new Circle(SOURCE_ILLUSTRATION_NODE_SETTINGS.BULB_GLASS_RADIUS, {
      centerX: cx,
      centerY: cy - SOURCE_ILLUSTRATION_NODE_SETTINGS.BULB_GLASS_CENTER_Y_OFFSET,
    });
    const bulb = new Node({
      children: [
        new Rectangle(
          cx - 14,
          cy + 20,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.BULB_WIDTH,
          SOURCE_ILLUSTRATION_NODE_SETTINGS.BULB_HEIGHT,
          { fill: housing, stroke: housingStroke, cornerRadius: SOURCE_ILLUSTRATION_NODE_SETTINGS.BULB_CORNER_RADIUS },
        ),
        bulbGlass,
      ],
    });

    // ── Sun ──────────────────────────────────────────────────────────────────
    const sunDisk = new Circle(SOURCE_ILLUSTRATION_NODE_SETTINGS.SUN_DISK_RADIUS, { centerX: cx, centerY: cy });
    const rays = new Path(
      Array.from({ length: 12 }, (_, i) => i).reduce((shape, i) => {
        const angle = (i * Math.PI) / 6;
        return shape
          .moveTo(cx + 40 * Math.cos(angle), cy + 40 * Math.sin(angle))
          .lineTo(cx + 52 * Math.cos(angle), cy + 52 * Math.sin(angle));
      }, new Shape()),
      { lineWidth: SOURCE_ILLUSTRATION_NODE_SETTINGS.RAYS_LINE_WIDTH },
    );
    const sun = new Node({ children: [rays, sunDisk] });

    // ── White light through a gas cell ───────────────────────────────────────
    const cellGlass = new Rectangle(
      cx - 10,
      cy - 20,
      SOURCE_ILLUSTRATION_NODE_SETTINGS.CELL_GLASS_WIDTH,
      SOURCE_ILLUSTRATION_NODE_SETTINGS.CELL_GLASS_HEIGHT,
      {
        cornerRadius: SOURCE_ILLUSTRATION_NODE_SETTINGS.CELL_GLASS_CORNER_RADIUS,
        lineWidth: SOURCE_ILLUSTRATION_NODE_SETTINGS.CELL_GLASS_LINE_WIDTH,
        stroke: housingStroke,
      },
    );
    const whiteLamp = new Circle(SOURCE_ILLUSTRATION_NODE_SETTINGS.WHITE_LAMP_RADIUS, {
      centerX: cx - SOURCE_ILLUSTRATION_NODE_SETTINGS.WHITE_LAMP_CENTER_X_OFFSET,
      centerY: cy,
      fill: "white",
      stroke: housingStroke,
    });
    const absorptionSetup = new Node({
      children: [
        whiteLamp,
        new Path(Shape.lineSegment(cx - 34, cy, cx - 10, cy), {
          stroke: "white",
          lineWidth: SOURCE_ILLUSTRATION_NODE_SETTINGS.ABSORPTION_SETUP_LINE_WIDTH,
          opacity: SOURCE_ILLUSTRATION_NODE_SETTINGS.ABSORPTION_SETUP_OPACITY,
        }),
        cellGlass,
      ],
    });

    // Beam to the spectroscope and the spectroscope itself.
    const beam = new Path(Shape.lineSegment(SOURCE_WIDTH + 4, cy, SOURCE_WIDTH + BEAM_LENGTH, cy), {
      lineWidth: SOURCE_ILLUSTRATION_NODE_SETTINGS.BEAM_LINE_WIDTH,
      opacity: SOURCE_ILLUSTRATION_NODE_SETTINGS.BEAM_OPACITY,
    });
    const spectroscope = new Rectangle(
      SOURCE_WIDTH + BEAM_LENGTH,
      cy - 16,
      SOURCE_ILLUSTRATION_NODE_SETTINGS.SPECTROSCOPE_WIDTH,
      SOURCE_ILLUSTRATION_NODE_SETTINGS.SPECTROSCOPE_HEIGHT,
      {
        fill: housing,
        stroke: housingStroke,
        cornerRadius: SOURCE_ILLUSTRATION_NODE_SETTINGS.SPECTROSCOPE_CORNER_RADIUS,
      },
    );
    const spectroscopeLabel = new Text(strings.spectroscopeStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: "white",
      maxWidth: SOURCE_ILLUSTRATION_NODE_SETTINGS.SPECTROSCOPE_LABEL_MAX_WIDTH,
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
