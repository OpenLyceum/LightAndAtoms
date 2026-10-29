/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { HydrogenAtomScreen } from "./hydrogen-atom/HydrogenAtomScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import LightAndAtomsColors from "./LightAndAtomsColors.js";
import { LineSpectraScreen } from "./line-spectra/LineSpectraScreen.js";
import { LightAndAtomsPreferencesModel } from "./preferences/LightAndAtomsPreferencesModel.js";
import { LightAndAtomsPreferencesNode } from "./preferences/LightAndAtomsPreferencesNode.js";
import { EMSpectrumScreen } from "./spectrum/EMSpectrumScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from lightAndAtomsQueryParameters.
  const simPreferences = new LightAndAtomsPreferencesModel(Tandem.ROOT.createTandem("preferences"));

  const screens = [
    new EMSpectrumScreen(simPreferences, {
      name: stringManager.getScreenNames().spectrumStringProperty,
      tandem: Tandem.ROOT.createTandem("spectrumScreen"),
      backgroundColorProperty: LightAndAtomsColors.backgroundColorProperty,
    }),
    new HydrogenAtomScreen({
      name: stringManager.getScreenNames().hydrogenAtomStringProperty,
      tandem: Tandem.ROOT.createTandem("hydrogenAtomScreen"),
      backgroundColorProperty: LightAndAtomsColors.backgroundColorProperty,
    }),
    new LineSpectraScreen({
      name: stringManager.getScreenNames().lineSpectraStringProperty,
      tandem: Tandem.ROOT.createTandem("lineSpectraScreen"),
      backgroundColorProperty: LightAndAtomsColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: (tandem: Tandem) => new LightAndAtomsPreferencesNode(simPreferences, tandem),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Credits shown in Help → About
    credits: {
      leadDesign: "Martin Veillette",
      softwareDevelopment: "Martin Veillette",
      team: "",
      qualityAssurance: "",
      thanks: "Atomic line wavelengths: NIST Atomic Spectra Database (physics.nist.gov/asd).",
    },
  });

  sim.start();
});
