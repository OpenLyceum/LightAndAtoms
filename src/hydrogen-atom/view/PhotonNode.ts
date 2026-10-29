/**
 * PhotonNode.ts
 *
 * A photon drawn as a short wave packet with an arrowhead, pointing along its direction of travel,
 * in the colour of its wavelength (grey for ultraviolet and infrared, which have none).
 */

import { Shape } from "scenerystack/kite";
import { Node, Path } from "scenerystack/scenery";
import { metersToNm } from "../../common/model/PhotonUtils.js";
import { isVisible, wavelengthColor } from "../../common/view/spectralColor.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";

/** Packet length, crest spacing and amplitude, px. */
const PACKET_LENGTH = 26;
const PACKET_WAVELENGTH = 7;
const PACKET_AMPLITUDE = 4;

const PACKET_SHAPE = (() => {
  const shape = new Shape().moveTo(-PACKET_LENGTH, 0);
  for (let x = -PACKET_LENGTH; x <= 0; x += 1) {
    // A Gaussian envelope makes it read as a packet rather than a wave train.
    const envelope = Math.exp(-(((x + PACKET_LENGTH / 2) / (PACKET_LENGTH / 3)) ** 2));
    shape.lineTo(x, PACKET_AMPLITUDE * envelope * Math.sin((2 * Math.PI * x) / PACKET_WAVELENGTH));
  }
  return shape;
})();

const HEAD_SHAPE = new Shape().moveTo(6, 0).lineTo(-1, -4).lineTo(-1, 4).close();

export class PhotonNode extends Node {
  public constructor(wavelength: number, direction: { x: number; y: number }) {
    const nm = metersToNm(wavelength);
    const color = isVisible(nm) ? wavelengthColor(nm) : LightAndAtomsColors.invisibleWaveColorProperty;
    super({
      children: [new Path(PACKET_SHAPE, { stroke: color, lineWidth: 2.5 }), new Path(HEAD_SHAPE, { fill: color })],
      rotation: Math.atan2(direction.y, direction.x),
      pickable: false,
    });
  }
}
