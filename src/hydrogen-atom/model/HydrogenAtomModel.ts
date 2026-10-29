/**
 * HydrogenAtomModel.ts
 *
 * A Bohr hydrogen atom that emits and absorbs photons.
 *
 *  - Emission mode: the student lifts the electron to a higher level (energy supplied by an electric
 *    discharge, as in a gas tube) and drops it to a lower one. Each drop emits one photon of
 *    λ = hc / |ΔE| and records a bright line.
 *  - Absorption mode: a lamp fires photons of a chosen wavelength through the atom. A photon whose
 *    energy matches a jump up from the current level (within ABSORPTION_TOLERANCE) is absorbed and
 *    records a dark line; any other photon passes straight through. A photon energetic enough to
 *    free the electron ionises the atom.
 *
 * With "auto relax" on, an excited electron falls back after AUTO_RELAX_DELAY to a randomly chosen
 * lower level, re-emitting in a random direction. That is why an absorption line is dark: the
 * absorbed light is re-emitted, but not toward the observer.
 *
 * Photon positions are in the atom view's frame: px, with the nucleus at the origin.
 */

import {
  BooleanProperty,
  createObservableArray,
  DerivedProperty,
  Emitter,
  EnumerationProperty,
  NumberProperty,
  type ObservableArray,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { dotRandom, Range, Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { findAbsorptionTarget, ionizes, transitionEnergy, transitionWavelength } from "../../common/model/Bohr.js";
import { nmToMeters } from "../../common/model/PhotonUtils.js";
import {
  ABSORPTION_TOLERANCE,
  AUTO_RELAX_DELAY,
  INITIAL_PHOTON_IR_NM,
  INITIAL_PHOTON_UV_NM,
  INITIAL_PHOTON_VISIBLE_NM,
  MAX_LEVEL,
  PHOTON_EMISSION_INTERVAL,
  PHOTON_IR_RANGE_NM,
  PHOTON_SPEED,
  PHOTON_UV_RANGE_NM,
  PHOTON_VISIBLE_RANGE_NM,
} from "../../LightAndAtomsConstants.js";
import { EnergyUnit } from "./EnergyUnit.js";
import { HydrogenMode } from "./HydrogenMode.js";
import { PhotonRegion } from "./PhotonRegion.js";

/** Half-width and half-height of the region photons travel in, px (matches the atom view). */
export const ATOM_VIEW_HALF_WIDTH = 190;
export const ATOM_VIEW_HALF_HEIGHT = 150;

/** A photon in flight. */
export type Photon = {
  /** Position, px from the nucleus. Mutated in place as the photon moves. */
  readonly position: Vector2;
  /** Unit direction of travel. */
  readonly direction: Vector2;
  /** Wavelength, m. */
  readonly wavelength: number;
  /** Incoming (from the lamp) photons can interact once; emitted photons never interact. */
  readonly incoming: boolean;
  /** Set once an incoming photon has crossed the nucleus and passed through. */
  passed: boolean;
};

/** A line recorded in the spectrum below the atom. */
export type RecordedLine = {
  readonly upper: number;
  readonly lower: number;
  /** Wavelength, m. */
  readonly wavelength: number;
};

/** What just happened, for the equations panel and screen-reader announcements. */
export type AtomEvent =
  | { readonly kind: "emitted" | "absorbed"; readonly from: number; readonly to: number; readonly wavelength: number }
  | { readonly kind: "excited"; readonly from: number; readonly to: number }
  | { readonly kind: "passedThrough"; readonly wavelength: number }
  | { readonly kind: "ionized"; readonly from: number; readonly wavelength: number }
  | { readonly kind: "recaptured" };

/** The most recent photon-producing or photon-absorbing transition. */
export type Transition = {
  readonly from: number;
  readonly to: number;
  /** Photon wavelength, m. */
  readonly wavelength: number;
  /** E_final − E_initial, J. */
  readonly energyChange: number;
};

export class HydrogenAtomModel implements TModel {
  public readonly modeProperty = new EnumerationProperty(HydrogenMode.EMISSION);

  /** Principal quantum number of the electron's level (meaningless while ionised). */
  public readonly levelProperty = new NumberProperty(1, { range: new Range(1, MAX_LEVEL), numberType: "Integer" });

  /** Whether the electron has been knocked free. */
  public readonly ionizedProperty = new BooleanProperty(false);

  /** Whether an excited electron falls back on its own. */
  public readonly autoRelaxProperty = new BooleanProperty(true);

  /** Units of the energy-level labels and equations. */
  public readonly energyUnitProperty = new EnumerationProperty(EnergyUnit.JOULES);

  /** Whether the Bohr / Rydberg worked equations are shown. */
  public readonly showEquationsProperty = new BooleanProperty(false);

  /** Which part of the spectrum the lamp's wavelength control covers. */
  public readonly photonRegionProperty = new EnumerationProperty(PhotonRegion.VISIBLE);

  /** Lamp wavelength in each region, nm; the active one is {@link photonWavelengthProperty}. */
  public readonly ultravioletWavelengthProperty = new NumberProperty(INITIAL_PHOTON_UV_NM, {
    range: PHOTON_UV_RANGE_NM,
  });
  public readonly visibleWavelengthProperty = new NumberProperty(INITIAL_PHOTON_VISIBLE_NM, {
    range: PHOTON_VISIBLE_RANGE_NM,
  });
  public readonly infraredWavelengthProperty = new NumberProperty(INITIAL_PHOTON_IR_NM, {
    range: PHOTON_IR_RANGE_NM,
  });

  /** The lamp's current wavelength, nm. */
  public readonly photonWavelengthProperty: TReadOnlyProperty<number>;

  /** Whether the lamp fires a steady stream (absorption mode). */
  public readonly lampOnProperty = new BooleanProperty(false);

  /** Photons in flight. */
  public readonly photons: ObservableArray<Photon> = createObservableArray();

  /** Lines recorded since the last clear: bright in emission mode, dark in absorption mode. */
  public readonly recordedLines: ObservableArray<RecordedLine> = createObservableArray();

  /** The last emission or absorption, shown in the equations panel. */
  public readonly lastTransitionProperty = new Property<Transition | null>(null);

  /** Fires for every event worth describing. */
  public readonly atomEventEmitter = new Emitter<[AtomEvent]>({ parameters: [{ valueType: Object }] });

  /** Seconds the electron has spent in its current excited level. */
  private timeInLevel = 0;

  /** Seconds since the lamp last fired. */
  private timeSinceLampFired = 0;

  public constructor() {
    this.photonWavelengthProperty = new DerivedProperty(
      [
        this.photonRegionProperty,
        this.ultravioletWavelengthProperty,
        this.visibleWavelengthProperty,
        this.infraredWavelengthProperty,
      ],
      (region, uv, visible, ir) =>
        region === PhotonRegion.ULTRAVIOLET ? uv : region === PhotonRegion.VISIBLE ? visible : ir,
    );

    // Switching mode starts a fresh experiment: ground state, empty spectrum.
    this.modeProperty.lazyLink(() => this.resetAtom());
  }

  /** The wavelength property behind a region's control. */
  public wavelengthPropertyFor(region: PhotonRegion): NumberProperty {
    return region === PhotonRegion.ULTRAVIOLET
      ? this.ultravioletWavelengthProperty
      : region === PhotonRegion.VISIBLE
        ? this.visibleWavelengthProperty
        : this.infraredWavelengthProperty;
  }

  /**
   * Moves the electron to level n. Down always works and emits a photon; up works only in emission
   * mode, where the discharge supplies the energy (absorption mode needs a photon).
   */
  public moveElectronTo(n: number): void {
    const level = this.levelProperty.value;
    if (this.ionizedProperty.value || n === level) {
      return;
    }
    if (n < level) {
      this.emit(level, n);
    } else if (this.modeProperty.value === HydrogenMode.EMISSION) {
      this.levelProperty.value = n;
      this.timeInLevel = 0;
      this.atomEventEmitter.emit({ kind: "excited", from: level, to: n });
    }
  }

  /** Whether the electron may be sent to level n by the student right now. */
  public canMoveTo(n: number, level: number, ionized: boolean, mode: HydrogenMode): boolean {
    return !ionized && n !== level && (n < level || mode === HydrogenMode.EMISSION);
  }

  /** Fires one photon from the lamp at the atom. */
  public firePhoton(): void {
    this.photons.push({
      position: new Vector2(-ATOM_VIEW_HALF_WIDTH, 0),
      direction: new Vector2(1, 0),
      wavelength: nmToMeters(this.photonWavelengthProperty.value),
      incoming: true,
      passed: false,
    });
  }

  /** Returns a free electron to the ground state. */
  public recaptureElectron(): void {
    if (this.ionizedProperty.value) {
      this.ionizedProperty.value = false;
      this.levelProperty.value = 1;
      this.atomEventEmitter.emit({ kind: "recaptured" });
    }
  }

  /** Clears the recorded spectrum. */
  public clearSpectrum(): void {
    this.recordedLines.clear();
    this.lastTransitionProperty.value = null;
  }

  /** Electron to the ground state, no photons in flight, empty spectrum. */
  public resetAtom(): void {
    this.levelProperty.reset();
    this.ionizedProperty.reset();
    this.lampOnProperty.reset();
    this.photons.clear();
    this.clearSpectrum();
    this.timeInLevel = 0;
    this.timeSinceLampFired = 0;
  }

  public reset(): void {
    this.modeProperty.reset();
    this.autoRelaxProperty.reset();
    this.energyUnitProperty.reset();
    this.showEquationsProperty.reset();
    this.photonRegionProperty.reset();
    this.ultravioletWavelengthProperty.reset();
    this.visibleWavelengthProperty.reset();
    this.infraredWavelengthProperty.reset();
    this.resetAtom();
  }

  public step(dt: number): void {
    if (this.lampOnProperty.value && this.modeProperty.value === HydrogenMode.ABSORPTION) {
      this.timeSinceLampFired += dt;
      if (this.timeSinceLampFired >= PHOTON_EMISSION_INTERVAL) {
        this.timeSinceLampFired = 0;
        this.firePhoton();
      }
    }

    // Move photons; an incoming one interacts when it reaches the nucleus.
    const departed: Photon[] = [];
    for (const photon of this.photons) {
      const before = photon.position.x;
      photon.position.addXY(photon.direction.x * PHOTON_SPEED * dt, photon.direction.y * PHOTON_SPEED * dt);
      if (photon.incoming && !photon.passed && before < 0 && photon.position.x >= 0) {
        if (this.interact(photon)) {
          departed.push(photon);
          continue;
        }
      }
      if (
        Math.abs(photon.position.x) > ATOM_VIEW_HALF_WIDTH + 1 ||
        Math.abs(photon.position.y) > ATOM_VIEW_HALF_HEIGHT + 1
      ) {
        departed.push(photon);
      }
    }
    if (departed.length > 0) {
      this.photons.removeAll(departed);
    }

    // Spontaneous emission.
    const level = this.levelProperty.value;
    if (this.autoRelaxProperty.value && !this.ionizedProperty.value && level > 1) {
      this.timeInLevel += dt;
      if (this.timeInLevel >= AUTO_RELAX_DELAY) {
        this.emit(level, 1 + Math.floor(dotRandom.nextDouble() * (level - 1)));
      }
    }
  }

  /** Absorbs or ionises with an incoming photon; returns true if the photon was used up. */
  private interact(photon: Photon): boolean {
    photon.passed = true;
    if (this.ionizedProperty.value) {
      return false;
    }
    const level = this.levelProperty.value;
    const target = findAbsorptionTarget(level, photon.wavelength, MAX_LEVEL, ABSORPTION_TOLERANCE);
    if (target !== null) {
      this.levelProperty.value = target;
      this.timeInLevel = 0;
      const wavelength = transitionWavelength(level, target);
      this.recordLine(target, level, wavelength);
      this.lastTransitionProperty.value = {
        from: level,
        to: target,
        wavelength,
        energyChange: transitionEnergy(level, target),
      };
      this.atomEventEmitter.emit({ kind: "absorbed", from: level, to: target, wavelength });
      return true;
    }
    if (ionizes(level, photon.wavelength)) {
      this.ionizedProperty.value = true;
      this.atomEventEmitter.emit({ kind: "ionized", from: level, wavelength: photon.wavelength });
      return true;
    }
    this.atomEventEmitter.emit({ kind: "passedThrough", wavelength: photon.wavelength });
    return false;
  }

  /** Drops the electron from upper to lower, emitting a photon in a random direction. */
  private emit(upper: number, lower: number): void {
    const wavelength = transitionWavelength(upper, lower);
    this.levelProperty.value = lower;
    this.timeInLevel = 0;
    const angle = 2 * Math.PI * dotRandom.nextDouble();
    this.photons.push({
      position: new Vector2(0, 0),
      direction: Vector2.createPolar(1, angle),
      wavelength,
      incoming: false,
      passed: true,
    });
    // Emission mode records bright lines. In absorption mode, re-emission goes in every direction,
    // so it does not fill in the dark line the observer sees.
    if (this.modeProperty.value === HydrogenMode.EMISSION) {
      this.recordLine(upper, lower, wavelength);
    }
    this.lastTransitionProperty.value = {
      from: upper,
      to: lower,
      wavelength,
      energyChange: transitionEnergy(upper, lower),
    };
    this.atomEventEmitter.emit({ kind: "emitted", from: upper, to: lower, wavelength });
  }

  /** Adds a line to the spectrum once (repeats would only brighten it). */
  private recordLine(upper: number, lower: number, wavelength: number): void {
    if (!this.recordedLines.some((recorded) => recorded.upper === upper && recorded.lower === lower)) {
      this.recordedLines.push({ upper, lower, wavelength });
    }
  }
}
