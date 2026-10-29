/**
 * PhotonUtils.ts
 *
 * The two relations every Gen Chem student meets first, c = λν and E = hν, as pure functions.
 * Wavelengths are in metres unless a name says nanometres. No Scenery imports, so the model and
 * its tests can use these directly.
 */

import {
  AVOGADRO_CONSTANT,
  JOULES_PER_ELECTRONVOLT,
  JOULES_PER_KILOJOULE,
  METERS_PER_NANOMETER,
  PLANCK_CONSTANT,
  SPEED_OF_LIGHT,
} from "../../LightAndAtomsConstants.js";

/** Frequency ν = c / λ, Hz, of light of wavelength λ (m). */
export function wavelengthToFrequency(wavelength: number): number {
  return SPEED_OF_LIGHT / wavelength;
}

/** Wavelength λ = c / ν, m, of light of frequency ν (Hz). */
export function frequencyToWavelength(frequency: number): number {
  return SPEED_OF_LIGHT / frequency;
}

/** Energy of one photon E = hc / λ, J. */
export function photonEnergy(wavelength: number): number {
  return (PLANCK_CONSTANT * SPEED_OF_LIGHT) / wavelength;
}

/** Wavelength of a photon carrying energy E (J): λ = hc / E, m. */
export function energyToWavelength(energy: number): number {
  return (PLANCK_CONSTANT * SPEED_OF_LIGHT) / energy;
}

/** Energy of one mole of photons, kJ/mol. */
export function molarPhotonEnergy(wavelength: number): number {
  return (photonEnergy(wavelength) * AVOGADRO_CONSTANT) / JOULES_PER_KILOJOULE;
}

/** Joules to electronvolts. */
export function joulesToElectronvolts(energy: number): number {
  return energy / JOULES_PER_ELECTRONVOLT;
}

/** Nanometres to metres. */
export function nmToMeters(nm: number): number {
  return nm * METERS_PER_NANOMETER;
}

/** Metres to nanometres. */
export function metersToNm(meters: number): number {
  return meters / METERS_PER_NANOMETER;
}
