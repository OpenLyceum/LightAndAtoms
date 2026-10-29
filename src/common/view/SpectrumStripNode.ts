/**
 * SpectrumStripNode.ts
 *
 * A sampled spectrum drawn the way it looks through a spectroscope: each pixel column is the colour
 * of its wavelength at the brightness of the spectrum there, on black. A bright-line spectrum
 * becomes coloured lines on black; a continuous spectrum becomes a rainbow; an absorption spectrum
 * becomes a rainbow crossed by dark lines.
 *
 * Drawn on a canvas, one fillRect per pixel column, and repainted only when the spectrum changes.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { optionize } from "scenerystack/phet-core";
import { CanvasNode, type CanvasNodeOptions } from "scenerystack/scenery";
import { VisibleColor } from "scenerystack/scenery-phet";
import { type SampledSpectrum, sampleAt } from "../model/SpectrumSynthesis.js";

type SelfOptions = {
  /** Wavelength at the left and right edges, nm. */
  minWavelength: number;
  maxWavelength: number;
};

export type SpectrumStripNodeOptions = SelfOptions & CanvasNodeOptions;

/** Display gamma: VisibleColor values are already encoded, so scale them by brightness^(1/γ). */
const DISPLAY_GAMMA = 2.2;

export class SpectrumStripNode extends CanvasNode {
  private readonly stripWidth: number;
  private readonly stripHeight: number;
  private readonly minWavelength: number;
  private readonly maxWavelength: number;
  private readonly spectrumProperty: TReadOnlyProperty<SampledSpectrum | null>;
  private readonly columnColors: readonly (readonly [number, number, number])[];
  private readonly invalidate: () => void;

  public constructor(
    spectrumProperty: TReadOnlyProperty<SampledSpectrum | null>,
    width: number,
    height: number,
    providedOptions: SpectrumStripNodeOptions,
  ) {
    const options = optionize<SpectrumStripNodeOptions, SelfOptions, CanvasNodeOptions>()(
      { canvasBounds: new Bounds2(0, 0, width, height) },
      providedOptions,
    );
    super(options);

    this.stripWidth = width;
    this.stripHeight = height;
    this.minWavelength = options.minWavelength;
    this.maxWavelength = options.maxWavelength;
    this.spectrumProperty = spectrumProperty;

    // Colour of each column's wavelength at full brightness.
    this.columnColors = Array.from({ length: Math.ceil(width) }, (_, column) => {
      const color = VisibleColor.wavelengthToColor(this.columnWavelength(column));
      return [color.red, color.green, color.blue] as const;
    });

    this.invalidate = () => this.invalidatePaint();
    spectrumProperty.link(this.invalidate);
  }

  /** Wavelength at the centre of a pixel column, nm. */
  private columnWavelength(column: number): number {
    return this.minWavelength + ((column + 0.5) / this.stripWidth) * (this.maxWavelength - this.minWavelength);
  }

  public override paintCanvas(context: CanvasRenderingContext2D): void {
    context.fillStyle = "black";
    context.fillRect(0, 0, this.stripWidth, this.stripHeight);
    const spectrum = this.spectrumProperty.value;
    if (!spectrum) {
      return;
    }
    this.columnColors.forEach(([r, g, b], column) => {
      const brightness = Math.min(1, sampleAt(spectrum, this.columnWavelength(column))) ** (1 / DISPLAY_GAMMA);
      if (brightness > 0.01) {
        context.fillStyle = `rgb(${Math.round(r * brightness)},${Math.round(g * brightness)},${Math.round(b * brightness)})`;
        // Overlap by a pixel fraction so antialiasing leaves no seams between columns.
        context.fillRect(column, 0, 1.5, this.stripHeight);
      }
    });
  }

  public override dispose(): void {
    this.spectrumProperty.unlink(this.invalidate);
    super.dispose();
  }
}
