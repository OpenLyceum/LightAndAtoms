/**
 * Memory-leak regression suite (fleet standard).
 *
 * List every model/view object that links Properties, adds listeners, or owns child
 * nodes, with a factory that builds a fresh instance. The shared harness in
 * tests/helpers/memoryLeak.ts (template-owned) checks that each one is garbage
 * collected after dispose() and leaves no survivors across repeated cycles
 * (idempotentDispose: true also checks a second dispose()). Add sim-specific leak
 * tests below using forceGC().
 */

import { NumberProperty, Property } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { flatSpectrum } from "../src/common/model/SpectrumSynthesis.js";
import { TimeModel } from "../src/common/TimeModel.js";
import { SpectrumMarkerNode } from "../src/common/view/SpectrumMarkerNode.js";
import { SpectrumStripNode } from "../src/common/view/SpectrumStripNode.js";
import { PhotonState } from "../src/spectrum/model/EMSpectrumModel.js";
import { WaveNode } from "../src/spectrum/view/WaveNode.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

// Long-lived Properties the short-lived nodes below link to; a leak would keep the nodes reachable.
const spectrumProperty = new Property(flatSpectrum());
const valueProperty = new NumberProperty(0.5);
const photon = new PhotonState(500e-9);
const titleProperty = new Property("Photon 1");

describeDisposalLeaks([
  { name: "TimeModel", create: () => new TimeModel(), idempotentDispose: true },
  {
    name: "SpectrumStripNode",
    create: () => new SpectrumStripNode(spectrumProperty, 100, 10, { minWavelength: 380, maxWavelength: 780 }),
  },
  {
    name: "SpectrumMarkerNode",
    create: () =>
      new SpectrumMarkerNode(valueProperty, new Range(0, 1), {
        lineHeight: 10,
        color: "red",
        valueToX: (value) => 100 * value,
        xToValue: (x) => x / 100,
        keyboardStep: 0.1,
        shiftKeyboardStep: 0.01,
        pageKeyboardStep: 0.5,
        createAriaValueText: (value) => String(value),
      }),
  },
  { name: "WaveNode", create: () => new WaveNode(photon, titleProperty, "yellow", 200, 60) },
]);
