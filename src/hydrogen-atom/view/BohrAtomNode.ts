/**
 * BohrAtomNode.ts
 *
 * The Bohr picture of hydrogen: a nucleus, circular orbits with radius ∝ n² (the Bohr radius
 * scaling), the electron circling in its current orbit, the photons in flight, and, in absorption
 * mode, the lamp at the left edge. The node's origin is the nucleus, matching the model's photon
 * coordinates.
 *
 * The electron's angular speed falls with n (∝ 1/n^1.5 here, gentler than Bohr's 1/n³ so the outer
 * orbits still visibly move); it is decoration, not part of the model.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { isVisible, wavelengthColor } from "../../common/view/spectralColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE, MAX_LEVEL } from "../../LightAndAtomsConstants.js";
import {
  ATOM_VIEW_HALF_HEIGHT,
  ATOM_VIEW_HALF_WIDTH,
  type HydrogenAtomModel,
  type Photon,
} from "../model/HydrogenAtomModel.js";
import { HydrogenMode } from "../model/HydrogenMode.js";
import { PhotonNode } from "./PhotonNode.js";

/** Radius of the outermost (n = MAX_LEVEL) orbit, px. */
const OUTER_ORBIT_RADIUS = 142;
/** Angular speed of the electron in n = 1, rad/s. */
const GROUND_ANGULAR_SPEED = 5;

/** Orbit radius of level n, px. */
export function orbitRadius(n: number): number {
  return (OUTER_ORBIT_RADIUS * n * n) / (MAX_LEVEL * MAX_LEVEL);
}

export class BohrAtomNode extends Node {
  private readonly model: HydrogenAtomModel;
  private readonly electron: Circle;
  private readonly photonLayer = new Node();
  private readonly photonNodes = new Map<Photon, PhotonNode>();
  private angle = 0;

  public constructor(model: HydrogenAtomModel) {
    super();
    this.model = model;
    const strings = StringManager.getInstance().getHydrogenAtomStrings();

    const frame = new Rectangle(
      -ATOM_VIEW_HALF_WIDTH,
      -ATOM_VIEW_HALF_HEIGHT,
      2 * ATOM_VIEW_HALF_WIDTH,
      2 * ATOM_VIEW_HALF_HEIGHT,
      {
        fill: LightAndAtomsColors.chartBackgroundColorProperty,
        stroke: LightAndAtomsColors.panelBorderColorProperty,
        cornerRadius: 6,
      },
    );
    const caption = new Text(strings.bohrModelStringProperty, {
      font: new PhetFont(FONT_SIZE.small),
      fill: LightAndAtomsColors.mutedTextColorProperty,
      maxWidth: 2 * ATOM_VIEW_HALF_WIDTH - 16,
    });
    caption.boundsProperty.link(() => {
      caption.left = -ATOM_VIEW_HALF_WIDTH + 8;
      caption.top = -ATOM_VIEW_HALF_HEIGHT + 6;
    });

    const orbits = new Node();
    const orbitLabels = new Node();
    for (let n = 1; n <= MAX_LEVEL; n++) {
      const radius = orbitRadius(n);
      orbits.addChild(
        new Circle(radius, { stroke: LightAndAtomsColors.orbitColorProperty, lineDash: n === 1 ? [] : [3, 3] }),
      );
      if (n >= 3) {
        orbitLabels.addChild(
          new Text(String(n), {
            font: new PhetFont(FONT_SIZE.tiny),
            fill: LightAndAtomsColors.mutedTextColorProperty,
            centerX: radius * Math.cos(-Math.PI / 4) + 6,
            centerY: radius * Math.sin(-Math.PI / 4) - 6,
          }),
        );
      }
    }
    const nucleus = new Circle(4, { fill: LightAndAtomsColors.nucleusColorProperty });
    this.electron = new Circle(5, { fill: LightAndAtomsColors.electronColorProperty, stroke: "white", lineWidth: 0.5 });

    // Highlight the occupied orbit.
    const occupiedOrbit = new Circle(orbitRadius(1), {
      stroke: LightAndAtomsColors.occupiedLevelColorProperty,
      lineWidth: 2,
    });
    Multilink.multilink([model.levelProperty, model.ionizedProperty], (level, ionized) => {
      occupiedOrbit.radius = orbitRadius(level);
      occupiedOrbit.visible = !ionized;
      this.electron.visible = !ionized;
    });

    const ionizedText = new Text(strings.ionizedStringProperty, {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: LightAndAtomsColors.electronColorProperty,
      maxWidth: 2 * ATOM_VIEW_HALF_WIDTH - 20,
      visibleProperty: model.ionizedProperty,
    });
    ionizedText.boundsProperty.link(() => {
      ionizedText.centerX = 0;
      ionizedText.bottom = ATOM_VIEW_HALF_HEIGHT - 10;
    });

    // The lamp, shown in absorption mode: a housing with a lens in the colour of its photons.
    const lens = new Rectangle(0, -12, 6, 24, { cornerRadius: 2 });
    const lamp = new Node({
      children: [
        new Rectangle(-24, -14, 24, 28, {
          fill: LightAndAtomsColors.lampHousingColorProperty,
          stroke: LightAndAtomsColors.lampHousingStrokeColorProperty,
          cornerRadius: 3,
        }),
        lens,
      ],
      x: -ATOM_VIEW_HALF_WIDTH + 26,
      visibleProperty: new DerivedProperty([model.modeProperty], (mode) => mode === HydrogenMode.ABSORPTION),
    });
    model.photonWavelengthProperty.link((nm) => {
      lens.fill = isVisible(nm) ? wavelengthColor(nm) : LightAndAtomsColors.invisibleLineColorProperty;
    });
    const beamGuide = new Path(Shape.lineSegment(-ATOM_VIEW_HALF_WIDTH + 32, 0, ATOM_VIEW_HALF_WIDTH, 0), {
      stroke: LightAndAtomsColors.orbitColorProperty,
      lineDash: [2, 6],
      visibleProperty: lamp.visibleProperty,
    });

    this.children = [
      frame,
      caption,
      beamGuide,
      orbits,
      orbitLabels,
      occupiedOrbit,
      nucleus,
      this.electron,
      this.photonLayer,
      lamp,
      ionizedText,
    ];
    this.clipArea = Shape.rect(
      -ATOM_VIEW_HALF_WIDTH,
      -ATOM_VIEW_HALF_HEIGHT,
      2 * ATOM_VIEW_HALF_WIDTH,
      2 * ATOM_VIEW_HALF_HEIGHT,
    );

    // Photon nodes follow the model's array.
    model.photons.addItemAddedListener((photon) => {
      const node = new PhotonNode(photon.wavelength, photon.direction);
      node.translation = photon.position;
      this.photonNodes.set(photon, node);
      this.photonLayer.addChild(node);
    });
    model.photons.addItemRemovedListener((photon) => {
      const node = this.photonNodes.get(photon);
      if (node) {
        this.photonLayer.removeChild(node);
        node.dispose();
        this.photonNodes.delete(photon);
      }
    });
    this.step(0);
  }

  /** Moves the electron round its orbit and the photon nodes to their model positions. */
  public step(dt: number): void {
    const level = this.model.levelProperty.value;
    this.angle += (GROUND_ANGULAR_SPEED / level ** 1.5) * dt;
    const radius = orbitRadius(level);
    this.electron.setTranslation(radius * Math.cos(this.angle), radius * Math.sin(this.angle));
    for (const [photon, node] of this.photonNodes) {
      node.translation = photon.position;
    }
  }
}
