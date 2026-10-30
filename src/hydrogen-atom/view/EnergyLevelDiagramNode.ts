/**
 * EnergyLevelDiagramNode.ts
 *
 * The energy-level diagram of hydrogen drawn to scale: E_n = −2.18 × 10⁻¹⁸ J / n² on a linear
 * vertical axis, so the levels crowd together towards n = ∞ (E = 0, the free electron). Labels that
 * would collide are fanned upward with leader lines. The occupied level is highlighted, and the
 * last transition is drawn as an arrow, coloured like its photon (down) or green (up).
 *
 * Clicking a level asks the model to move the electron there (the level buttons in the control
 * panel do the same from the keyboard).
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { StringUtils } from "scenerystack/phetcommon";
import { Circle, Line, Node, Path, Rectangle, RichText, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import { levelEnergy } from "../../common/model/Bohr.js";
import { toScientificMarkup, toSignificantFigures } from "../../common/model/formatNumber.js";
import { joulesToElectronvolts, metersToNm } from "../../common/model/PhotonUtils.js";
import { isVisible, wavelengthColor } from "../../common/view/spectralColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE, HYDROGEN_IONIZATION_ENERGY, MAX_LEVEL } from "../../LightAndAtomsConstants.js";
import { EnergyUnit } from "../model/EnergyUnit.js";
import type { HydrogenAtomModel } from "../model/HydrogenAtomModel.js";

/** Width of a level line, px. */
const LEVEL_WIDTH = 120;
/** Minimum vertical spacing between labels, px. */
const LABEL_SPACING = 15;
/** Horizontal offset of a fanned label from the line end, px. */
const LABEL_GAP = 6;
/** Pointer target height around each level, px. */
const HIT_HEIGHT = 8;

const LABEL_FONT = new PhetFont(FONT_SIZE.small);
const VALUE_FONT = new PhetFont(FONT_SIZE.small);

export class EnergyLevelDiagramNode extends Node {
  /**
   * @param model - the atom
   * @param height - px from E₁ (bottom) to E = 0 (top)
   */
  public constructor(model: HydrogenAtomModel, height: number) {
    super();
    const strings = StringManager.getInstance().getHydrogenAtomStrings();
    const units = StringManager.getInstance().getUnitStrings();

    /** y of energy E (J); 0 J at y = 0, E₁ at y = height. */
    const energyToY = (energy: number): number => (-energy / HYDROGEN_IONIZATION_ENERGY) * height;
    const levelY = (n: number): number => energyToY(levelEnergy(n));

    // Fan labels upward so none is closer than LABEL_SPACING to the one below; n = ∞ goes last.
    const labelY: number[] = [];
    for (let n = 1; n <= MAX_LEVEL; n++) {
      const below = labelY[n - 1];
      labelY[n] = below === undefined ? levelY(n) : Math.min(levelY(n), below - LABEL_SPACING);
    }
    const infinityLabelY = Math.min(0, (labelY[MAX_LEVEL] ?? 0) - LABEL_SPACING);

    // Axis.
    const axisX = -18;
    this.addChild(
      new ArrowNode(axisX, height + 6, axisX, Math.min(-10, infinityLabelY - 10), {
        headHeight: 8,
        headWidth: 8,
        tailWidth: 1,
        fill: LightAndAtomsColors.mutedTextColorProperty,
        stroke: null,
      }),
    );
    const axisTitle = new Text(strings.energyAxisStringProperty, {
      font: LABEL_FONT,
      fill: LightAndAtomsColors.mutedTextColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: height,
    });
    axisTitle.boundsProperty.link(() => {
      axisTitle.right = axisX - 4;
      axisTitle.centerY = height / 2;
    });
    this.addChild(axisTitle);

    // n = ∞ (ionisation) line.
    this.addChild(
      new Line(0, 0, LEVEL_WIDTH, 0, { stroke: LightAndAtomsColors.energyLevelColorProperty, lineDash: [4, 3] }),
    );
    this.addChild(
      new Text(strings.ionizationLevelStringProperty, {
        font: LABEL_FONT,
        fill: LightAndAtomsColors.textColorProperty,
        left: LEVEL_WIDTH + LABEL_GAP,
        centerY: infinityLabelY,
        maxWidth: 150,
      }),
    );

    // Levels with their labels and energies.
    const levelLines: Line[] = [];
    const valueTexts: RichText[] = [];
    for (let n = 1; n <= MAX_LEVEL; n++) {
      const y = levelY(n);
      const ly = labelY[n] ?? y;
      const line = new Line(0, y, LEVEL_WIDTH, y, {
        stroke: LightAndAtomsColors.energyLevelColorProperty,
        lineWidth: 2,
      });
      levelLines.push(line);
      this.addChild(line);
      if (Math.abs(ly - y) > 0.5) {
        this.addChild(
          new Path(new Shape().moveTo(LEVEL_WIDTH, y).lineTo(LEVEL_WIDTH + LABEL_GAP - 1, ly), {
            stroke: LightAndAtomsColors.mutedTextColorProperty,
            lineWidth: 0.5,
          }),
        );
      }
      const nLabel = new Text("", { font: LABEL_FONT, fill: LightAndAtomsColors.textColorProperty, maxWidth: 50 });
      strings.levelLabelStringProperty.link((pattern) => {
        nLabel.string = StringUtils.fillIn(pattern, { n });
        nLabel.left = LEVEL_WIDTH + LABEL_GAP;
        nLabel.centerY = ly;
      });
      this.addChild(nLabel);
      const valueText = new RichText("", {
        font: VALUE_FONT,
        fill: LightAndAtomsColors.mutedTextColorProperty,
        maxWidth: 120,
      });
      valueText.left = LEVEL_WIDTH + LABEL_GAP + 48;
      valueText.centerY = ly;
      valueTexts.push(valueText);
      this.addChild(valueText);

      // Split crowded targets at the midpoint between levels so a higher level cannot steal a click.
      const hitTop = n < MAX_LEVEL ? Math.max(y - HIT_HEIGHT / 2, (y + levelY(n + 1)) / 2) : y - HIT_HEIGHT / 2;
      const hitBottom = n > 1 ? Math.min(y + HIT_HEIGHT / 2, (y + levelY(n - 1)) / 2) : y + HIT_HEIGHT / 2;
      const hit = new Rectangle(0, hitTop, LEVEL_WIDTH, hitBottom - hitTop, {
        fill: "transparent",
        cursor: "pointer",
      });
      hit.addInputListener({ down: () => model.moveElectronTo(n) });
      this.addChild(hit);
    }

    Multilink.multilink(
      [model.energyUnitProperty, units.joulesStringProperty, units.electronvoltsStringProperty],
      (unit, joules, electronvolts) => {
        valueTexts.forEach((text, i) => {
          const energy = levelEnergy(i + 1);
          text.string =
            unit === EnergyUnit.JOULES
              ? `${toScientificMarkup(energy)} ${joules}`
              : `${toSignificantFigures(joulesToElectronvolts(energy), 3)} ${electronvolts}`;
          text.left = LEVEL_WIDTH + LABEL_GAP + 48;
        });
      },
    );

    // Occupied level and electron dot.
    const electron = new Circle(5, {
      fill: LightAndAtomsColors.electronColorProperty,
      stroke: "white",
      lineWidth: 0.5,
    });
    this.addChild(electron);
    Multilink.multilink([model.levelProperty, model.ionizedProperty], (level, ionized) => {
      levelLines.forEach((line, i) => {
        line.stroke =
          !ionized && i + 1 === level
            ? LightAndAtomsColors.occupiedLevelColorProperty
            : LightAndAtomsColors.energyLevelColorProperty;
        line.lineWidth = !ionized && i + 1 === level ? 3 : 2;
      });
      electron.center = ionized
        ? electron.center.setXY(LEVEL_WIDTH / 2, -12)
        : electron.center.setXY(LEVEL_WIDTH / 2, levelY(level));
    });

    // Last transition arrow, offset to the left of the electron.
    const arrowLayer = new Node();
    this.addChild(arrowLayer);
    model.lastTransitionProperty.link((transition) => {
      for (const child of arrowLayer.children) {
        child.dispose();
      }
      arrowLayer.removeAllChildren();
      if (transition) {
        const nm = metersToNm(transition.wavelength);
        const color =
          transition.to < transition.from
            ? isVisible(nm)
              ? wavelengthColor(nm)
              : LightAndAtomsColors.invisibleLineColorProperty
            : LightAndAtomsColors.upArrowColorProperty;
        arrowLayer.addChild(
          new ArrowNode(LEVEL_WIDTH / 4, levelY(transition.from), LEVEL_WIDTH / 4, levelY(transition.to), {
            fill: color,
            stroke: null,
            headHeight: 7,
            headWidth: 9,
            tailWidth: 3,
          }),
        );
      }
    });
  }
}
