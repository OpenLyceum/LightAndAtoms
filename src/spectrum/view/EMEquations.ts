/**
 * EMEquations.ts
 *
 * The worked equations for photon 1: ν = c / λ, E = hν, and the molar energy E × N_A, with every
 * number substituted. The constants are shown to four significant figures, as textbooks print them;
 * results to three.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { toScientificMarkup, toSignificantFigures } from "../../common/model/formatNumber.js";
import { frequencyUnit, UNIT_STRING_DEPENDENCIES } from "../../common/view/formatReadouts.js";
import { StringManager } from "../../i18n/StringManager.js";
import { AVOGADRO_CONSTANT, PLANCK_CONSTANT, SPEED_OF_LIGHT } from "../../LightAndAtomsConstants.js";
import type { PhotonState } from "../model/EMSpectrumModel.js";

/** RichText lines for the equations panel; dispose the returned Property with the panel. */
export function createEMEquationLines(
  photon: PhotonState,
  inverseSecondsProperty: TReadOnlyProperty<boolean>,
): TReadOnlyProperty<string> {
  const units = StringManager.getInstance().getUnitStrings();
  return DerivedProperty.deriveAny(
    [
      photon.wavelengthProperty,
      inverseSecondsProperty,
      units.kilojoulesPerMoleStringProperty,
      ...UNIT_STRING_DEPENDENCIES,
    ],
    () => {
      const wavelength = photon.wavelengthProperty.value;
      const fUnit = frequencyUnit(inverseSecondsProperty.value);
      const frequency = SPEED_OF_LIGHT / wavelength;
      const energy = PLANCK_CONSTANT * frequency;
      const molarKJ = (energy * AVOGADRO_CONSTANT) / 1000;
      const c = toScientificMarkup(SPEED_OF_LIGHT, 4);
      const h = toScientificMarkup(PLANCK_CONSTANT, 4);
      const nA = toScientificMarkup(AVOGADRO_CONSTANT, 4);
      const lambda = toScientificMarkup(wavelength);
      const nu = toScientificMarkup(frequency);
      const e = toScientificMarkup(energy);
      const molar = molarKJ >= 0.01 && molarKJ < 1e5 ? toSignificantFigures(molarKJ, 3) : toScientificMarkup(molarKJ);
      const kjPerMol = units.kilojoulesPerMoleStringProperty.value;
      return [
        `ν = <i>c</i> / λ = (${c} m/s) / (${lambda} m) = <b>${nu} ${fUnit}</b>`,
        `<i>E</i> = <i>h</i>ν = (${h} J·s)(${nu} ${fUnit}) = <b>${e} J</b>`,
        `<i>E</i> × <i>N</i><sub>A</sub> = (${e} J)(${nA} mol<sup>−1</sup>) = <b>${molar} ${kjPerMol}</b>`,
      ].join("<br>");
    },
  );
}
