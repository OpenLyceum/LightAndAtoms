/**
 * lightAndAtomsQueryParameters.ts
 *
 * Sim-specific startup query parameters. This is the single place where every
 * sim-specific query parameter is declared and documented. Public-facing
 * parameters (intended for end users / sharing links) must set `public: true`.
 *
 * Usage: append e.g. `?inverseSeconds=true` to the sim URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import LightAndAtomsNamespace from "../LightAndAtomsNamespace.js";

const lightAndAtomsQueryParameters = QueryStringMachine.getAll({
  /**
   * Write frequencies in s⁻¹ (as many chemistry textbooks do) instead of Hz. The two are the same
   * unit; this only changes the label.
   */
  inverseSeconds: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },
});

LightAndAtomsNamespace.register("lightAndAtomsQueryParameters", lightAndAtomsQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default lightAndAtomsQueryParameters;
