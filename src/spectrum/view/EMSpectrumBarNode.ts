/**
 * EMSpectrumBarNode.ts
 *
 * The electromagnetic spectrum as a logarithmic bar, short wavelengths (gamma rays) on the left
 * and long ones (radio) on the right, with a wavelength axis above and a frequency axis below.
 * Because ν = c / λ, the frequency axis runs the other way: every decade of wavelength to the right
 * is a decade of frequency lower. The visible band, a sliver at this scale, is magnified underneath.
 *
 * The bar's top-left corner is the node's origin; owners place markers with {@link logToX}.
 */

import { Multilink, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { linear, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Line, LinearGradient, Node, Path, Rectangle, RichText, type TColor, Text } from "scenerystack/scenery";
import { PhetFont, VisibleColor } from "scenerystack/scenery-phet";
import { flatSpectrum } from "../../common/model/SpectrumSynthesis.js";
import { SpectrumStripNode } from "../../common/view/SpectrumStripNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import {
  FONT_SIZE,
  LOG_WAVELENGTH_RANGE,
  SPEED_OF_LIGHT,
  VISIBLE_MAX_NM,
  VISIBLE_MIN_NM,
} from "../../LightAndAtomsConstants.js";
import { EM_REGIONS, type EMRegionId } from "../model/EMRegion.js";

/** Bar size, px. */
export const BAR_WIDTH = 884;
export const BAR_HEIGHT = 48;

/** Magnified visible strip: size and its top relative to the bar's top, px. */
export const ZOOM_WIDTH = 420;
export const ZOOM_HEIGHT = 26;
export const ZOOM_TOP = 122;

const TICK_LENGTH = 6;
const TICK_FONT = new PhetFont(FONT_SIZE.tiny);
const AXIS_TITLE_FONT = new PhetFont(FONT_SIZE.small);
const REGION_FONT = new PhetFont({ size: FONT_SIZE.small, weight: "bold" });

/** Number of gradient stops across the visible band of the bar. */
const VISIBLE_GRADIENT_STOPS = 24;

const MINUS = "−";

/** "10<sup>−6</sup>" */
function powerOfTen(exponent: number): string {
  return `10<sup>${String(exponent).replace("-", MINUS)}</sup>`;
}

export class EMSpectrumBarNode extends Node {
  /** x of the magnified strip's left edge, in this node's frame. */
  public readonly zoomLeft: number;

  public constructor() {
    super();
    const strings = StringManager.getInstance().getEMSpectrumStrings();
    const regionStrings: Record<EMRegionId, TReadOnlyProperty<string>> = {
      gamma: strings.regions.gammaStringProperty,
      xRay: strings.regions.xRayStringProperty,
      ultraviolet: strings.regions.ultravioletStringProperty,
      visible: strings.regions.visibleStringProperty,
      infrared: strings.regions.infraredStringProperty,
      microwave: strings.regions.microwaveStringProperty,
      radio: strings.regions.radioStringProperty,
    };
    const regionFills: Record<Exclude<EMRegionId, "visible">, TColor> = {
      gamma: LightAndAtomsColors.gammaRegionColorProperty,
      xRay: LightAndAtomsColors.xRayRegionColorProperty,
      ultraviolet: LightAndAtomsColors.ultravioletRegionColorProperty,
      infrared: LightAndAtomsColors.infraredRegionColorProperty,
      microwave: LightAndAtomsColors.microwaveRegionColorProperty,
      radio: LightAndAtomsColors.radioRegionColorProperty,
    };

    // ── Region bands ──────────────────────────────────────────────────────────
    const minLog = LOG_WAVELENGTH_RANGE.min;
    const maxLog = LOG_WAVELENGTH_RANGE.max;
    const regionLayer = new Node();
    for (const region of EM_REGIONS) {
      const left = this.logToX(Math.max(minLog, region.minWavelength > 0 ? Math.log10(region.minWavelength) : minLog));
      const right = this.logToX(Math.min(maxLog, Math.log10(region.maxWavelength)));
      const width = right - left;
      if (region.id === "visible") {
        const gradient = new LinearGradient(left, 0, right, 0);
        for (let i = 0; i <= VISIBLE_GRADIENT_STOPS; i++) {
          const nm = linear(0, VISIBLE_GRADIENT_STOPS, VISIBLE_MIN_NM, VISIBLE_MAX_NM, i);
          gradient.addColorStop(i / VISIBLE_GRADIENT_STOPS, VisibleColor.wavelengthToColor(nm));
        }
        regionLayer.addChild(new Rectangle(left, 0, width, BAR_HEIGHT, { fill: gradient }));
      } else {
        regionLayer.addChild(new Rectangle(left, 0, width, BAR_HEIGHT, { fill: regionFills[region.id] }));
        const label = new Text(regionStrings[region.id], {
          font: REGION_FONT,
          fill: LightAndAtomsColors.textColorProperty,
          maxWidth: width - 6,
        });
        label.boundsProperty.link(() => {
          label.center = this.bandCenter(left, width);
        });
        regionLayer.addChild(label);
      }
    }
    this.addChild(regionLayer);
    this.addChild(new Rectangle(0, 0, BAR_WIDTH, BAR_HEIGHT, { stroke: LightAndAtomsColors.chartAxisColorProperty }));

    // ── Wavelength axis (above) ───────────────────────────────────────────────
    const axisLayer = new Node();
    for (let exponent = Math.ceil(minLog); exponent <= maxLog; exponent++) {
      const x = this.logToX(exponent);
      axisLayer.addChild(new Line(x, -TICK_LENGTH, x, 0, { stroke: LightAndAtomsColors.chartAxisColorProperty }));
      axisLayer.addChild(
        new RichText(powerOfTen(exponent), {
          font: TICK_FONT,
          fill: LightAndAtomsColors.textColorProperty,
          centerX: x,
          bottom: -TICK_LENGTH - 1,
        }),
      );
    }
    const wavelengthTitle = new Text(strings.wavelengthAxisStringProperty, {
      font: AXIS_TITLE_FONT,
      fill: LightAndAtomsColors.mutedTextColorProperty,
    });
    wavelengthTitle.boundsProperty.link(() => {
      wavelengthTitle.centerX = BAR_WIDTH / 2;
      wavelengthTitle.bottom = -TICK_LENGTH - 18;
    });
    axisLayer.addChild(wavelengthTitle);

    // ── Frequency axis (below): ν = c / λ, so log ν = log c − log λ ──────────
    const logC = Math.log10(SPEED_OF_LIGHT);
    const minLogF = logC - maxLog;
    const maxLogF = logC - minLog;
    for (let exponent = Math.ceil(minLogF); exponent <= maxLogF; exponent++) {
      const x = this.logToX(logC - exponent);
      axisLayer.addChild(
        new Line(x, BAR_HEIGHT, x, BAR_HEIGHT + TICK_LENGTH, { stroke: LightAndAtomsColors.chartAxisColorProperty }),
      );
      if (exponent % 2 === 0) {
        axisLayer.addChild(
          new RichText(powerOfTen(exponent), {
            font: TICK_FONT,
            fill: LightAndAtomsColors.textColorProperty,
            centerX: x,
            top: BAR_HEIGHT + TICK_LENGTH + 1,
          }),
        );
      }
    }
    const frequencyTitle = new Text(strings.frequencyAxisStringProperty, {
      font: AXIS_TITLE_FONT,
      fill: LightAndAtomsColors.mutedTextColorProperty,
    });
    frequencyTitle.boundsProperty.link(() => {
      frequencyTitle.centerX = BAR_WIDTH / 2;
      frequencyTitle.top = BAR_HEIGHT + TICK_LENGTH + 18;
    });
    axisLayer.addChild(frequencyTitle);

    // "← Higher energy" under the left end: gamma rays carry the most energy per photon.
    const energyArrowText = new Text(strings.increasingEnergyStringProperty, {
      font: AXIS_TITLE_FONT,
      fill: LightAndAtomsColors.mutedTextColorProperty,
    });
    const energyArrow = new Path(new Shape().moveTo(0, 0).lineTo(9, -5).lineTo(9, 5).close(), {
      fill: LightAndAtomsColors.mutedTextColorProperty,
    });
    const energyLabel = new Node({ children: [energyArrow, energyArrowText] });
    energyArrowText.boundsProperty.link(() => {
      energyArrowText.left = energyArrow.right + 4;
      energyArrowText.centerY = energyArrow.centerY;
      energyLabel.left = 0;
      energyLabel.top = BAR_HEIGHT + TICK_LENGTH + 18;
    });
    axisLayer.addChild(energyLabel);
    this.addChild(axisLayer);

    // ── Magnified visible strip ───────────────────────────────────────────────
    const visibleLeft = this.logToX(Math.log10(VISIBLE_MIN_NM * 1e-9));
    const visibleRight = this.logToX(Math.log10(VISIBLE_MAX_NM * 1e-9));
    this.zoomLeft = Math.min(BAR_WIDTH - ZOOM_WIDTH, Math.max(0, (visibleLeft + visibleRight) / 2 - ZOOM_WIDTH / 2));
    const zoomRight = this.zoomLeft + ZOOM_WIDTH;

    this.addChild(
      new Path(
        new Shape()
          .moveTo(visibleLeft, BAR_HEIGHT)
          .lineTo(this.zoomLeft, ZOOM_TOP)
          .moveTo(visibleRight, BAR_HEIGHT)
          .lineTo(zoomRight, ZOOM_TOP),
        { stroke: LightAndAtomsColors.mutedTextColorProperty, lineDash: [3, 3] },
      ),
    );
    const zoomStrip = new SpectrumStripNode(new Property(flatSpectrum()), ZOOM_WIDTH, ZOOM_HEIGHT, {
      minWavelength: VISIBLE_MIN_NM,
      maxWavelength: VISIBLE_MAX_NM,
      x: this.zoomLeft,
      y: ZOOM_TOP,
    });
    this.addChild(zoomStrip);
    this.addChild(
      new Rectangle(this.zoomLeft, ZOOM_TOP, ZOOM_WIDTH, ZOOM_HEIGHT, {
        stroke: LightAndAtomsColors.chartAxisColorProperty,
      }),
    );
    for (let nm = 400; nm <= VISIBLE_MAX_NM; nm += 50) {
      const x = this.nmToZoomX(nm);
      this.addChild(
        new Line(x, ZOOM_TOP + ZOOM_HEIGHT, x, ZOOM_TOP + ZOOM_HEIGHT + TICK_LENGTH, {
          stroke: LightAndAtomsColors.chartAxisColorProperty,
        }),
      );
      if (nm % 100 === 0) {
        this.addChild(
          new Text(String(nm), {
            font: TICK_FONT,
            fill: LightAndAtomsColors.textColorProperty,
            centerX: x,
            top: ZOOM_TOP + ZOOM_HEIGHT + TICK_LENGTH + 1,
          }),
        );
      }
    }
    const zoomTitle = new Text(strings.visibleZoomStringProperty, {
      font: AXIS_TITLE_FONT,
      fill: LightAndAtomsColors.textColorProperty,
      maxWidth: 140,
    });
    const nmLabel = new Text(StringManager.getInstance().getCommonStrings().wavelengthNmStringProperty, {
      font: TICK_FONT,
      fill: LightAndAtomsColors.mutedTextColorProperty,
      maxWidth: 140,
    });
    Multilink.multilink([zoomTitle.boundsProperty, nmLabel.boundsProperty], () => {
      zoomTitle.right = this.zoomLeft - 10;
      zoomTitle.centerY = ZOOM_TOP + ZOOM_HEIGHT / 2;
      nmLabel.left = zoomRight + 10;
      nmLabel.centerY = ZOOM_TOP + ZOOM_HEIGHT + TICK_LENGTH + 6;
    });
    this.addChild(zoomTitle);
    this.addChild(nmLabel);
  }

  /** x of log₁₀(λ / m) on the bar. */
  public logToX(log: number): number {
    return linear(LOG_WAVELENGTH_RANGE.min, LOG_WAVELENGTH_RANGE.max, 0, BAR_WIDTH, log);
  }

  /** log₁₀(λ / m) at x on the bar. */
  public xToLog(x: number): number {
    return linear(0, BAR_WIDTH, LOG_WAVELENGTH_RANGE.min, LOG_WAVELENGTH_RANGE.max, x);
  }

  /** x of a visible wavelength (nm) on the magnified strip. */
  public nmToZoomX(nm: number): number {
    return linear(VISIBLE_MIN_NM, VISIBLE_MAX_NM, this.zoomLeft, this.zoomLeft + ZOOM_WIDTH, nm);
  }

  /** Centre of a region band. */
  private bandCenter(left: number, width: number): Vector2 {
    return new Vector2(left + width / 2, BAR_HEIGHT / 2);
  }
}
