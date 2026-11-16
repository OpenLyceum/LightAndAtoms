import { HYDROGEN_SPECTRUM_NODE_SETTINGS } from "../../LightAndAtomsConstants.js";
/**
 * HydrogenSpectrumNode.ts
 *
 * The spectrum the atom has built up, in three panels: ultraviolet (90–130 nm, where the Lyman
 * series lies), visible (380–750 nm, the Balmer lines) and infrared (750–8000 nm on a log scale, so
 * Paschen, Brackett and Pfund all fit). In emission mode the lines are bright on black; in absorption
 * mode they are dark gaps in the lamp's light. Each line is labelled with its wavelength when there
 * is room.
 */

import { DerivedProperty, Multilink, Property } from "scenerystack/axon";
import { linear } from "scenerystack/dot";
import { Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { toSignificantFigures } from "../../common/model/formatNumber.js";
import { metersToNm } from "../../common/model/PhotonUtils.js";
import { flatSpectrum } from "../../common/model/SpectrumSynthesis.js";
import { SpectrumStripNode } from "../../common/view/SpectrumStripNode.js";
import { wavelengthColor } from "../../common/view/spectralColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE, VISIBLE_MAX_NM, VISIBLE_MIN_NM } from "../../LightAndAtomsConstants.js";
import type { HydrogenAtomModel, RecordedLine } from "../model/HydrogenAtomModel.js";
import { HydrogenMode } from "../model/HydrogenMode.js";

const STRIP_HEIGHT: number = HYDROGEN_SPECTRUM_NODE_SETTINGS.STRIP_HEIGHT;
const SECTION_GAP: number = HYDROGEN_SPECTRUM_NODE_SETTINGS.SECTION_GAP;
const LABEL_FONT = new PhetFont(FONT_SIZE.tiny);
/** Minimum spacing between line labels, px. */
const LABEL_MIN_SPACING: number = HYDROGEN_SPECTRUM_NODE_SETTINGS.LABEL_MIN_SPACING;

type Section = {
  readonly minNm: number;
  readonly maxNm: number;
  readonly width: number;
  readonly logScale: boolean;
  readonly visible: boolean;
};

const SECTIONS: readonly Section[] = [
  { minNm: 90, maxNm: 130, width: HYDROGEN_SPECTRUM_NODE_SETTINGS.SECTIONS_WIDTH, logScale: false, visible: false },
  {
    minNm: VISIBLE_MIN_NM,
    maxNm: VISIBLE_MAX_NM,
    width: HYDROGEN_SPECTRUM_NODE_SETTINGS.SECTIONS_ITEM_2_WIDTH,
    logScale: false,
    visible: true,
  },
  {
    minNm: VISIBLE_MAX_NM,
    maxNm: 8000,
    width: HYDROGEN_SPECTRUM_NODE_SETTINGS.SECTIONS_ITEM_3_WIDTH,
    logScale: true,
    visible: false,
  },
];

export class HydrogenSpectrumNode extends Node {
  /**
   * @param model - the atom whose recorded lines are drawn
   * @param clearButton - placed at the right end of the title row
   */
  public constructor(model: HydrogenAtomModel, clearButton: Node) {
    super();
    const strings = StringManager.getInstance().getHydrogenAtomStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const isAbsorption = new DerivedProperty([model.modeProperty], (mode) => mode === HydrogenMode.ABSORPTION);

    const title = new Text(
      new DerivedProperty(
        [isAbsorption, strings.emissionSpectrumStringProperty, strings.absorptionSpectrumStringProperty],
        (absorption, emission, absorptionTitle) => (absorption ? absorptionTitle : emission),
      ),
      {
        font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }),
        fill: LightAndAtomsColors.textColorProperty,
        maxWidth: HYDROGEN_SPECTRUM_NODE_SETTINGS.TITLE_MAX_WIDTH,
      },
    );
    this.addChild(title);
    const top: number = HYDROGEN_SPECTRUM_NODE_SETTINGS.TOP;

    // Section backgrounds and their x offsets.
    const sectionLefts: number[] = [];
    let x = 0;
    const sectionNames = [
      common.ultravioletStringProperty,
      StringManager.getInstance().getEMSpectrumStrings().regions.visibleStringProperty,
      common.infraredStringProperty,
    ];
    SECTIONS.forEach((section, i) => {
      sectionLefts.push(x);
      if (section.visible) {
        // A rainbow behind the visible panel in absorption mode; black in emission mode.
        const rainbow = new SpectrumStripNode(new Property(flatSpectrum()), section.width, STRIP_HEIGHT, {
          minWavelength: section.minNm,
          maxWavelength: section.maxNm,
          x,
          y: top,
          visibleProperty: isAbsorption,
        });
        this.addChild(
          new Rectangle(x, top, section.width, STRIP_HEIGHT, { fill: LightAndAtomsColors.spectrumStripColorProperty }),
        );
        this.addChild(rainbow);
      } else {
        const background = new Rectangle(x, top, section.width, STRIP_HEIGHT);
        isAbsorption.link((absorption) => {
          background.fill = absorption
            ? LightAndAtomsColors.invisibleLineColorProperty
            : LightAndAtomsColors.spectrumStripColorProperty;
        });
        this.addChild(background);
      }
      this.addChild(
        new Rectangle(x, top, section.width, STRIP_HEIGHT, { stroke: LightAndAtomsColors.chartAxisColorProperty }),
      );
      const nameProperty = sectionNames[i];
      if (nameProperty) {
        this.addChild(
          new Text(nameProperty, {
            font: LABEL_FONT,
            fill: LightAndAtomsColors.mutedTextColorProperty,
            centerX: x + section.width / 2,
            top: top + STRIP_HEIGHT + 2,
            maxWidth: section.width,
          }),
        );
      }
      // End labels of each panel's range, nm.
      for (const [nm, align] of [
        [section.minNm, "left"],
        [section.maxNm, "right"],
      ] as const) {
        const label = new Text(String(nm), {
          font: LABEL_FONT,
          fill: LightAndAtomsColors.mutedTextColorProperty,
          top: top + STRIP_HEIGHT + 2,
        });
        if (align === "left") {
          label.left = x;
        } else {
          label.right = x + section.width;
        }
        this.addChild(label);
      }
      x += section.width + SECTION_GAP;
    });
    this.addChild(
      new Text(common.wavelengthNmStringProperty, {
        font: LABEL_FONT,
        fill: LightAndAtomsColors.mutedTextColorProperty,
        left: x - SECTION_GAP + HYDROGEN_SPECTRUM_NODE_SETTINGS.CONSTRUCTOR_LEFT_OFFSET,
        top: top + STRIP_HEIGHT + 2,
        maxWidth: HYDROGEN_SPECTRUM_NODE_SETTINGS.CONSTRUCTOR_MAX_WIDTH,
      }),
    );

    const lineLayer = new Node();
    this.addChild(lineLayer);

    /** x of a wavelength (nm), or null when it falls in no panel. */
    const nmToX = (nm: number): number | null => {
      for (let i = 0; i < SECTIONS.length; i++) {
        const section = SECTIONS[i];
        const left = sectionLefts[i];
        if (section && left !== undefined && nm >= section.minNm && nm <= section.maxNm) {
          return section.logScale
            ? left + linear(Math.log(section.minNm), Math.log(section.maxNm), 0, section.width, Math.log(nm))
            : left + linear(section.minNm, section.maxNm, 0, section.width, nm);
        }
      }
      return null;
    };

    const redraw = (): void => {
      for (const child of lineLayer.children) {
        child.dispose();
      }
      lineLayer.removeAllChildren();
      const absorption = isAbsorption.value;
      const lines: RecordedLine[] = [...model.recordedLines].sort((a, b) => a.wavelength - b.wavelength);
      let lastLabelX = Number.NEGATIVE_INFINITY;
      for (const recorded of lines) {
        const nm = metersToNm(recorded.wavelength);
        const lineX = nmToX(nm);
        if (lineX === null) {
          continue;
        }
        const color = absorption ? "black" : wavelengthColor(nm, "white");
        lineLayer.addChild(
          new Line(lineX, top, lineX, top + STRIP_HEIGHT, {
            stroke: color,
            lineWidth: HYDROGEN_SPECTRUM_NODE_SETTINGS.REDRAW_LINE_WIDTH,
          }),
        );
        if (lineX - lastLabelX >= LABEL_MIN_SPACING) {
          lineLayer.addChild(
            new Text(toSignificantFigures(nm, 3), {
              font: LABEL_FONT,
              fill: LightAndAtomsColors.textColorProperty,
              centerX: lineX,
              bottom: top - 2,
            }),
          );
          lastLabelX = lineX;
        }
      }
    };
    model.recordedLines.addItemAddedListener(redraw);
    model.recordedLines.addItemRemovedListener(redraw);
    Multilink.multilink([isAbsorption], redraw);

    // The title row sits above the line labels, with Clear at its right end.
    title.bottom = top - HYDROGEN_SPECTRUM_NODE_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;
    this.addChild(clearButton);
    clearButton.right = x - SECTION_GAP;
    clearButton.centerY = title.centerY;
  }
}
