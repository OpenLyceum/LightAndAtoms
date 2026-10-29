/**
 * HydrogenEquations.ts
 *
 * Worked equations for the last transition, with the numbers substituted:
 *
 *   E_n = −2.18 × 10⁻¹⁸ J / n²
 *   ΔE = E_final − E_initial
 *   λ = hc / |ΔE|
 *   1/λ = R_H (1/n_lower² − 1/n_upper²)      (the same λ from the Rydberg equation)
 *
 * Energies follow the chosen unit (J or eV); the hc / |ΔE| line is always in joules, as Gen Chem
 * computes it.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { levelEnergy } from "../../common/model/Bohr.js";
import { toScientificMarkup, toSignificantFigures } from "../../common/model/formatNumber.js";
import { joulesToElectronvolts, metersToNm } from "../../common/model/PhotonUtils.js";
import { StringManager } from "../../i18n/StringManager.js";
import {
  HYDROGEN_IONIZATION_ENERGY,
  PLANCK_CONSTANT,
  RYDBERG_HYDROGEN,
  SPEED_OF_LIGHT,
} from "../../LightAndAtomsConstants.js";
import { EnergyUnit } from "../model/EnergyUnit.js";
import type { HydrogenAtomModel } from "../model/HydrogenAtomModel.js";

/** An energy in the chosen unit, as RichText. */
function energyMarkup(joules: number, unit: EnergyUnit): string {
  return unit === EnergyUnit.JOULES
    ? `${toScientificMarkup(joules)} J`
    : `${toSignificantFigures(joulesToElectronvolts(joules), 3)} eV`;
}

/** Wraps a negative value in parentheses for substitution. */
function parenthesized(markup: string): string {
  return markup.startsWith("−") ? `(${markup})` : markup;
}

/** Lines of the equations panel; the returned Properties live as long as the screen. */
export function createHydrogenEquationLines(model: HydrogenAtomModel): TReadOnlyProperty<string>[] {
  const strings = StringManager.getInstance().getHydrogenAtomStrings();

  const levelFormula = new DerivedProperty([model.energyUnitProperty], (unit) => {
    const constant = energyMarkup(HYDROGEN_IONIZATION_ENERGY, unit);
    return `<i>E</i><sub>n</sub> = −${constant} / <i>n</i><sup>2</sup>`;
  });

  const worked = new DerivedProperty(
    [
      model.lastTransitionProperty,
      model.energyUnitProperty,
      strings.lastTransitionStringProperty,
      strings.noTransitionYetStringProperty,
    ],
    (transition, unit, lastTransition, noneYet) => {
      if (!transition) {
        return `<i>${noneYet}</i>`;
      }
      const { from, to, wavelength, energyChange } = transition;
      const lower = Math.min(from, to);
      const upper = Math.max(from, to);
      const nm = toSignificantFigures(metersToNm(wavelength), 3);
      const deltaE = energyMarkup(energyChange, unit);
      const eFinal = parenthesized(energyMarkup(levelEnergy(to), unit));
      const eInitial = parenthesized(energyMarkup(levelEnergy(from), unit));
      const h = toScientificMarkup(PLANCK_CONSTANT, 4);
      const c = toScientificMarkup(SPEED_OF_LIGHT, 4);
      const absDeltaJ = toScientificMarkup(Math.abs(energyChange));
      const rH = toScientificMarkup(RYDBERG_HYDROGEN, 4);
      return [
        `<b>${lastTransition}: <i>n</i> = ${from} → <i>n</i> = ${to}</b>`,
        `Δ<i>E</i> = <i>E</i><sub>${to}</sub> − <i>E</i><sub>${from}</sub> = ${eFinal} − ${eInitial} = <b>${deltaE}</b>`,
        `λ = <i>hc</i> / |Δ<i>E</i>| = (${h} J·s)(${c} m/s) / (${absDeltaJ} J) = <b>${toScientificMarkup(wavelength)} m = ${nm} nm</b>`,
        `1/λ = <i>R</i><sub>H</sub>(1/${lower}<sup>2</sup> − 1/${upper}<sup>2</sup>), <i>R</i><sub>H</sub> = ${rH} m<sup>−1</sup> → λ = <b>${nm} nm</b>`,
      ].join("<br>");
    },
  );
  return [levelFormula, worked];
}
