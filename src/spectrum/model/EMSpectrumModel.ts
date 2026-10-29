/**
 * EMSpectrumModel.ts
 *
 * State of the EM Spectrum screen: one photon (or two, in compare mode) placed anywhere from gamma
 * rays to radio waves. The independent variable is log₁₀(λ / m), because the spectrum spans sixteen
 * decades and the bar, the marker and the keyboard steps are all logarithmic. Frequency and photon
 * energy are derived from it with c = λν and E = hν.
 */

import { BooleanProperty, DerivedProperty, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { TModel } from "scenerystack/joist";
import { molarPhotonEnergy, photonEnergy, wavelengthToFrequency } from "../../common/model/PhotonUtils.js";
import { TimeModel } from "../../common/TimeModel.js";
import { INITIAL_WAVELENGTH, INITIAL_WAVELENGTH_2, LOG_WAVELENGTH_RANGE } from "../../LightAndAtomsConstants.js";
import { type EMRegion, regionOf } from "./EMRegion.js";

/** One photon's wavelength and everything derived from it. */
export class PhotonState {
  /** log₁₀(λ / m), the quantity the marker drags. */
  public readonly logWavelengthProperty: NumberProperty;

  /** Wavelength, m. */
  public readonly wavelengthProperty: TReadOnlyProperty<number>;

  /** Frequency, Hz. */
  public readonly frequencyProperty: TReadOnlyProperty<number>;

  /** Energy of one photon, J. */
  public readonly energyProperty: TReadOnlyProperty<number>;

  /** Energy of one mole of photons, kJ/mol. */
  public readonly molarEnergyProperty: TReadOnlyProperty<number>;

  /** The named region the wavelength falls in. */
  public readonly regionProperty: TReadOnlyProperty<EMRegion>;

  public constructor(initialWavelength: number) {
    this.logWavelengthProperty = new NumberProperty(Math.log10(initialWavelength), { range: LOG_WAVELENGTH_RANGE });
    this.wavelengthProperty = new DerivedProperty([this.logWavelengthProperty], (log) => 10 ** log);
    this.frequencyProperty = new DerivedProperty([this.wavelengthProperty], wavelengthToFrequency);
    this.energyProperty = new DerivedProperty([this.wavelengthProperty], photonEnergy);
    this.molarEnergyProperty = new DerivedProperty([this.wavelengthProperty], molarPhotonEnergy);
    this.regionProperty = new DerivedProperty([this.wavelengthProperty], regionOf);
  }

  /** Sets the wavelength, m, clamped to the bar. */
  public setWavelength(wavelength: number): void {
    this.logWavelengthProperty.value = LOG_WAVELENGTH_RANGE.constrainValue(Math.log10(wavelength));
  }

  public reset(): void {
    this.logWavelengthProperty.reset();
  }
}

export class EMSpectrumModel implements TModel {
  /** The first photon, always shown. */
  public readonly photon1 = new PhotonState(INITIAL_WAVELENGTH);

  /** The second photon, shown in compare mode. */
  public readonly photon2 = new PhotonState(INITIAL_WAVELENGTH_2);

  /** Whether the second photon is shown, with ratios against the first. */
  public readonly compareProperty = new BooleanProperty(false);

  /** Whether the c = λν and E = hν worked equations are shown. */
  public readonly showEquationsProperty = new BooleanProperty(false);

  /** Drives the travelling-wave animation; starts playing. */
  public readonly timer = new TimeModel(true);

  public reset(): void {
    this.photon1.reset();
    this.photon2.reset();
    this.compareProperty.reset();
    this.showEquationsProperty.reset();
    this.timer.reset();
  }

  public step(dt: number): void {
    this.timer.step(dt);
  }
}
