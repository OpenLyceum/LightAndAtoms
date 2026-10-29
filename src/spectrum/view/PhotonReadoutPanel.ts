/**
 * PhotonReadoutPanel.ts
 *
 * The numbers for one photon: its region, wavelength, frequency, energy per photon and per mole,
 * and how that molar energy compares with a C–C bond. For the second photon in compare mode, it
 * adds the ratios to photon 1, which make the proportionalities ν ∝ 1/λ and E ∝ ν visible.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, type Node, Rectangle, RichText, type TColor, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { LightAndAtomsPanel } from "../../common/LightAndAtomsPanel.js";
import {
  formatFrequencyMarkup,
  formatJoulesMarkup,
  formatNumberMarkup,
  formatWavelength,
  UNIT_STRING_DEPENDENCIES,
  valueWithUnit,
} from "../../common/view/formatReadouts.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { C_C_BOND_ENERGY_KJ_PER_MOL, FONT_SIZE } from "../../LightAndAtomsConstants.js";
import type { PhotonState } from "../model/EMSpectrumModel.js";
import { regionStringProperty } from "./regionStrings.js";

const LABEL_FONT = new PhetFont(FONT_SIZE.small);
const VALUE_FONT = new PhetFont({ size: FONT_SIZE.label, weight: "bold" });
const PANEL_CONTENT_WIDTH = 210;

/** A "label / value" pair stacked vertically, so long localised labels never squeeze the value. */
function readout(labelProperty: TReadOnlyProperty<string>, valueProperty: TReadOnlyProperty<string>): VBox {
  return new VBox({
    align: "left",
    spacing: 1,
    children: [
      new Text(labelProperty, {
        font: LABEL_FONT,
        fill: LightAndAtomsColors.mutedTextColorProperty,
        maxWidth: PANEL_CONTENT_WIDTH,
      }),
      new RichText(valueProperty, {
        font: VALUE_FONT,
        fill: LightAndAtomsColors.textColorProperty,
        maxWidth: PANEL_CONTENT_WIDTH,
      }),
    ],
  });
}

export class PhotonReadoutPanel extends LightAndAtomsPanel {
  private readonly disposePhotonReadoutPanel: () => void;

  /**
   * @param photon - the photon to describe
   * @param titleProperty - "Photon 1" / "Photon 2"
   * @param color - the photon's marker colour, shown as a swatch
   * @param inverseSecondsProperty - write frequency in s⁻¹ instead of Hz
   * @param reference - photon 1, when this panel should also show ratios to it
   */
  public constructor(
    photon: PhotonState,
    titleProperty: TReadOnlyProperty<string>,
    color: TColor,
    inverseSecondsProperty: TReadOnlyProperty<boolean>,
    reference: PhotonState | null,
  ) {
    const strings = StringManager.getInstance().getEMSpectrumStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const units = StringManager.getInstance().getUnitStrings();

    const title = new HBox({
      spacing: 6,
      justify: "left",
      children: [
        new Rectangle(0, 0, 12, 12, { fill: color, stroke: "black" }),
        new Text(titleProperty, {
          font: new PhetFont({ size: FONT_SIZE.title, weight: "bold" }),
          fill: LightAndAtomsColors.textColorProperty,
          maxWidth: PANEL_CONTENT_WIDTH - 20,
        }),
      ],
    });

    const regionProperty = DerivedProperty.deriveAny(
      [photon.regionProperty, ...Object.values(strings.regions)],
      () => regionStringProperty(photon.regionProperty.value.id).value,
    );
    const wavelengthProperty = DerivedProperty.deriveAny([photon.wavelengthProperty, ...UNIT_STRING_DEPENDENCIES], () =>
      formatWavelength(photon.wavelengthProperty.value),
    );
    const frequencyProperty = DerivedProperty.deriveAny(
      [photon.frequencyProperty, inverseSecondsProperty, ...UNIT_STRING_DEPENDENCIES],
      () => formatFrequencyMarkup(photon.frequencyProperty.value, inverseSecondsProperty.value),
    );
    const energyProperty = DerivedProperty.deriveAny([photon.energyProperty, ...UNIT_STRING_DEPENDENCIES], () =>
      formatJoulesMarkup(photon.energyProperty.value),
    );
    const molarProperty = DerivedProperty.deriveAny(
      [photon.molarEnergyProperty, units.kilojoulesPerMoleStringProperty, ...UNIT_STRING_DEPENDENCIES],
      () =>
        valueWithUnit(
          formatNumberMarkup(photon.molarEnergyProperty.value),
          units.kilojoulesPerMoleStringProperty.value,
        ),
    );
    const bondProperty = new DerivedProperty(
      [photon.molarEnergyProperty, strings.bondComparisonStringProperty],
      (molar, pattern) =>
        StringUtils.fillIn(pattern, { ratio: formatNumberMarkup(molar / C_C_BOND_ENERGY_KJ_PER_MOL, 2) }),
    );
    const derived = [
      regionProperty,
      wavelengthProperty,
      frequencyProperty,
      energyProperty,
      molarProperty,
      bondProperty,
    ];

    const children: Node[] = [
      title,
      readout(strings.regionStringProperty, regionProperty),
      readout(common.wavelengthStringProperty, wavelengthProperty),
      readout(common.frequencyStringProperty, frequencyProperty),
      readout(common.photonEnergyStringProperty, energyProperty),
      readout(common.molarEnergyStringProperty, molarProperty),
      new RichText(bondProperty, {
        font: LABEL_FONT,
        fill: LightAndAtomsColors.mutedTextColorProperty,
        maxWidth: PANEL_CONTENT_WIDTH,
      }),
    ];

    const disposers: (() => void)[] = [];
    if (reference) {
      // Ratios photon 2 ÷ photon 1. λ₂/λ₁ is the reciprocal of the other two.
      const ratioText = new RichText("", {
        font: LABEL_FONT,
        fill: LightAndAtomsColors.textColorProperty,
        maxWidth: PANEL_CONTENT_WIDTH,
      });
      const ratioMultilink = Multilink.multilink(
        [photon.wavelengthProperty, reference.wavelengthProperty],
        (wavelength2, wavelength1) => {
          const lambdaRatio = formatNumberMarkup(wavelength2 / wavelength1);
          const inverseRatio = formatNumberMarkup(wavelength1 / wavelength2);
          ratioText.string = `λ₂ / λ₁ = ${lambdaRatio}<br>ν₂ / ν₁ = ${inverseRatio}<br>E₂ / E₁ = ${inverseRatio}`;
        },
      );
      disposers.push(() => ratioMultilink.dispose());
      children.push(
        new Text(strings.ratiosTitleStringProperty, {
          font: new PhetFont({ size: FONT_SIZE.small, weight: "bold" }),
          fill: LightAndAtomsColors.textColorProperty,
          maxWidth: PANEL_CONTENT_WIDTH,
        }),
        ratioText,
      );
    }

    super(new VBox({ align: "left", spacing: 6, children, minContentWidth: PANEL_CONTENT_WIDTH }));

    this.disposePhotonReadoutPanel = () => {
      for (const property of derived) {
        property.dispose();
      }
      for (const dispose of disposers) {
        dispose();
      }
    };
  }

  public override dispose(): void {
    this.disposePhotonReadoutPanel();
    super.dispose();
  }
}
