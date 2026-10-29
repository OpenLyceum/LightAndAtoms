/**
 * LightAndAtomsScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen, drawn on the standard PhET
 * 548 × 373 canvas.
 *
 *  - EM Spectrum: the region bands with the rainbow, under a wave that shortens left to right.
 *  - Hydrogen Atom: Bohr orbits with an electron dropping and emitting a red (Hα) photon.
 *  - Line Spectra: the Balmer lines of hydrogen, bright on black.
 */

import { Shape } from "scenerystack/kite";
import { Circle, LinearGradient, Node, Path, Rectangle } from "scenerystack/scenery";
import { VisibleColor } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import LightAndAtomsColors from "../LightAndAtomsColors.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: LightAndAtomsColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: LightAndAtomsColors.backgroundColorProperty,
  });
}

/** A rainbow gradient from 380 to 750 nm across [x0, x1]. */
function rainbow(x0: number, x1: number): LinearGradient {
  const gradient = new LinearGradient(x0, 0, x1, 0);
  const stops = 20;
  for (let i = 0; i <= stops; i++) {
    gradient.addColorStop(i / stops, VisibleColor.wavelengthToColor(380 + (370 * i) / stops));
  }
  return gradient;
}

export function createEMSpectrumIcon(): ScreenIcon {
  const bandTop = 200;
  const bandHeight = 90;
  const bands = [
    { width: 80, fill: LightAndAtomsColors.gammaRegionColorProperty },
    { width: 80, fill: LightAndAtomsColors.xRayRegionColorProperty },
    { width: 70, fill: LightAndAtomsColors.ultravioletRegionColorProperty },
    { width: 60, fill: null },
    { width: 80, fill: LightAndAtomsColors.infraredRegionColorProperty },
    { width: 70, fill: LightAndAtomsColors.microwaveRegionColorProperty },
    { width: 68, fill: LightAndAtomsColors.radioRegionColorProperty },
  ];
  const children: Node[] = [background()];
  let x = 30;
  for (const band of bands) {
    children.push(new Rectangle(x, bandTop, band.width, bandHeight, { fill: band.fill ?? rainbow(x, x + band.width) }));
    x += band.width;
  }

  // A chirp: the wavelength grows from left to right, like the spectrum.
  const wave = new Shape();
  for (let px = 30; px <= W - 30; px += 1) {
    const t = (px - 30) / (W - 60);
    const phase = 2 * Math.PI * (60 * t - 25 * t * t) * 0.35;
    const y = 120 - 55 * Math.sin(phase);
    if (px === 30) {
      wave.moveTo(px, y);
    } else {
      wave.lineTo(px, y);
    }
  }
  children.push(new Path(wave, { stroke: LightAndAtomsColors.photon1ColorProperty, lineWidth: 6 }));
  return iconFrom(new Node({ children }));
}

export function createHydrogenAtomIcon(): ScreenIcon {
  const cx = 230;
  const cy = H / 2;
  const children: Node[] = [background()];
  for (const n of [1, 2, 3]) {
    children.push(
      new Circle(18 * n * n, {
        x: cx,
        y: cy,
        stroke: LightAndAtomsColors.orbitColorProperty,
        lineWidth: 4,
        lineDash: n === 1 ? [] : [10, 8],
      }),
    );
  }
  children.push(new Circle(14, { x: cx, y: cy, fill: LightAndAtomsColors.nucleusColorProperty }));
  children.push(
    new Circle(16, {
      x: cx + 72 * Math.cos(-0.5),
      y: cy + 72 * Math.sin(-0.5),
      fill: LightAndAtomsColors.electronColorProperty,
    }),
  );

  // An Hα photon leaving to the right.
  const photon = new Shape().moveTo(330, cy - 40);
  for (let px = 330; px <= 480; px += 2) {
    const envelope = Math.exp(-(((px - 405) / 45) ** 2));
    photon.lineTo(px, cy - 40 - 30 * envelope * Math.sin((2 * Math.PI * (px - 330)) / 30));
  }
  const red = VisibleColor.wavelengthToColor(656);
  children.push(new Path(photon, { stroke: red, lineWidth: 7 }));
  children.push(
    new Path(
      new Shape()
        .moveTo(510, cy - 40)
        .lineTo(480, cy - 58)
        .lineTo(480, cy - 22)
        .close(),
      { fill: red },
    ),
  );
  return iconFrom(new Node({ children }));
}

export function createLineSpectraIcon(): ScreenIcon {
  const stripLeft = 40;
  const stripWidth = W - 80;
  const children: Node[] = [
    background(),
    new Rectangle(stripLeft, 70, stripWidth, 90, { fill: rainbow(stripLeft, stripLeft + stripWidth) }),
    new Rectangle(stripLeft, 200, stripWidth, 110, { fill: LightAndAtomsColors.spectrumStripColorProperty }),
  ];
  // Hydrogen's Balmer lines: bright in emission (bottom), and as dark gaps in the rainbow (top).
  for (const nm of [410, 434, 486, 656]) {
    const x = stripLeft + ((nm - 380) / 370) * stripWidth;
    children.push(new Rectangle(x - 4, 200, 8, 110, { fill: VisibleColor.wavelengthToColor(nm) }));
    children.push(new Rectangle(x - 3, 70, 6, 90, { fill: "black" }));
  }
  return iconFrom(new Node({ children }));
}
