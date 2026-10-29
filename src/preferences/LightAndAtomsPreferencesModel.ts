/**
 * LightAndAtomsPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in lightAndAtomsQueryParameters.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import LightAndAtomsNamespace from "../LightAndAtomsNamespace.js";
import lightAndAtomsQueryParameters from "./lightAndAtomsQueryParameters.js";

export class LightAndAtomsPreferencesModel {
  /** Label frequencies s⁻¹ instead of Hz; initial value from the `inverseSeconds` query parameter. */
  public readonly inverseSecondsProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.inverseSecondsProperty = new BooleanProperty(
      lightAndAtomsQueryParameters.inverseSeconds,
      tandem ? { tandem: tandem.createTandem("inverseSecondsProperty") } : undefined,
    );
  }

  public reset(): void {
    this.inverseSecondsProperty.reset();
  }
}

LightAndAtomsNamespace.register("LightAndAtomsPreferencesModel", LightAndAtomsPreferencesModel);
