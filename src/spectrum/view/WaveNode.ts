/**
 * WaveNode.ts
 *
 * A travelling sine wave for one photon, in a box. Every wave moves at the same speed on screen,
 * because all light travels at c; so a shorter on-screen wavelength makes the wave oscillate faster
 * at any fixed point, which is ν = c / λ seen directly.
 *
 * Real wavelengths span sixteen decades. A single wave uses a logarithmic map (gamma rays a few
 * pixels, radio waves a few hundred), so it is not to scale. When two photons are compared, the
 * owner draws both at one common linear scale instead (see {@link sharedScreenWavelengths}), so a
 * photon of one fifth the wavelength really shows five times as many crests.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { linear } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Node, Path, Rectangle, RichText, type TColor } from "scenerystack/scenery";
import { PhetFont, VisibleColor } from "scenerystack/scenery-phet";
import { metersToNm } from "../../common/model/PhotonUtils.js";
import { formatWavelength } from "../../common/view/formatReadouts.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE, LOG_WAVELENGTH_RANGE } from "../../LightAndAtomsConstants.js";
import type { PhotonState } from "../model/EMSpectrumModel.js";

/** On-screen wavelength at the gamma and radio ends of the bar, px. */
const MIN_SCREEN_WAVELENGTH = 9;
const MAX_SCREEN_WAVELENGTH = 260;

/** On-screen wavelength of the longer photon when two are drawn to the same scale, px. */
const SHARED_SCALE_LONGER_WAVELENGTH = 200;

/** Shortest wavelength drawn, px; anything shorter would alias on the 1.5 px sampling. */
const MIN_DRAWN_WAVELENGTH = 4;

/** On-screen speed of every wave, px/s. */
const SCREEN_WAVE_SPEED = 70;

/** Horizontal sample spacing of the drawn curve, px. */
const SAMPLE_SPACING = 1.5;

const PADDING = 8;

/** On-screen wavelength (px) of a lone wave: logarithmic in the real wavelength. */
export function logScreenWavelength(logWavelength: number): number {
  return linear(
    LOG_WAVELENGTH_RANGE.min,
    LOG_WAVELENGTH_RANGE.max,
    MIN_SCREEN_WAVELENGTH,
    MAX_SCREEN_WAVELENGTH,
    logWavelength,
  );
}

/**
 * On-screen wavelengths (px) of two waves drawn at one linear scale: the longer gets
 * SHARED_SCALE_LONGER_WAVELENGTH and the other is in proportion, down to MIN_DRAWN_WAVELENGTH.
 */
export function sharedScreenWavelengths(wavelength1: number, wavelength2: number): [number, number] {
  const scale = SHARED_SCALE_LONGER_WAVELENGTH / Math.max(wavelength1, wavelength2);
  return [Math.max(MIN_DRAWN_WAVELENGTH, wavelength1 * scale), Math.max(MIN_DRAWN_WAVELENGTH, wavelength2 * scale)];
}

export class WaveNode extends Node {
  private readonly wavePath: Path;
  private readonly boxWidth: number;
  private readonly amplitude: number;
  private readonly disposeWaveNode: () => void;

  public constructor(
    photon: PhotonState,
    titleProperty: TReadOnlyProperty<string>,
    markerColor: TColor,
    width: number,
    height: number,
  ) {
    super();
    this.boxWidth = width;
    this.amplitude = (height - 2 * PADDING - 18) / 2;

    const box = new Rectangle(0, 0, width, height, {
      fill: LightAndAtomsColors.chartBackgroundColorProperty,
      stroke: markerColor,
      lineWidth: 1.5,
      cornerRadius: 4,
    });
    this.wavePath = new Path(null, { lineWidth: 2.5, y: height / 2 + 9 });
    const caption = new RichText("", {
      font: new PhetFont(FONT_SIZE.small),
      fill: LightAndAtomsColors.textColorProperty,
      left: PADDING,
      top: PADDING - 2,
      maxWidth: width - 2 * PADDING,
    });

    const multilink = Multilink.multilink([titleProperty, photon.wavelengthProperty], (title, wavelength) => {
      caption.string = `${title}: ${formatWavelength(wavelength)}`;
      const nm = metersToNm(wavelength);
      this.wavePath.stroke = VisibleColor.isVisibleWavelength(nm)
        ? VisibleColor.wavelengthToColor(nm)
        : LightAndAtomsColors.invisibleWaveColorProperty;
    });

    this.children = [box, this.wavePath, caption];
    this.clipArea = Shape.rect(0, 0, width, height);
    this.update(0, logScreenWavelength(photon.logWavelengthProperty.value));

    this.disposeWaveNode = () => multilink.dispose();
  }

  /** Redraws the wave at time t (s) with the given on-screen wavelength (px). */
  public update(time: number, screenWavelength: number): void {
    const k = (2 * Math.PI) / screenWavelength;
    const phase = k * SCREEN_WAVE_SPEED * time;
    const shape = new Shape();
    for (let x = PADDING; x <= this.boxWidth - PADDING; x += SAMPLE_SPACING) {
      const y = -this.amplitude * Math.sin(k * x - phase);
      if (x === PADDING) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    this.wavePath.shape = shape;
  }

  public override dispose(): void {
    this.disposeWaveNode();
    super.dispose();
  }
}
