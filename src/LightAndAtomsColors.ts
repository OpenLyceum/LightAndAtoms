/**
 * LightAndAtomsColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import LightAndAtomsColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import LightAndAtomsColors from "../../LightAndAtomsColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: LightAndAtomsColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the LightAndAtomsColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import LightAndAtomsNamespace from "./LightAndAtomsNamespace.js";

const LightAndAtomsColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /** Secondary text: axis titles, hints, units. */
  mutedTextColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "mutedText", {
    default: "#9aa3b5",
    projector: "#555555",
  }),

  // ── Charts and spectra ───────────────────────────────────────────────────────

  /** Plot area of intensity charts. */
  chartBackgroundColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "chartBackground", {
    default: "#0d0d1a",
    projector: "#ffffff",
  }),

  /** Chart frame, axes and tick marks. */
  chartAxisColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "chartAxis", {
    default: "#b0b8c8",
    projector: "#333333",
  }),

  /** Chart grid lines. */
  chartGridColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "chartGrid", {
    default: "#2a2f45",
    projector: "#dddddd",
  }),

  /** Intensity curve. */
  chartCurveColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "chartCurve", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  /**
   * Background of an emission spectrum strip. It stays black in projector mode: bright lines on a
   * dark field is what a spectroscope shows, and the line colours are data.
   */
  spectrumStripColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "spectrumStrip", {
    default: "#000000",
    projector: "#000000",
  }),

  /** Lines outside the visible band (UV, IR), which have no colour of their own. */
  invisibleLineColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "invisibleLine", {
    default: "#c8c8c8",
    projector: "#c8c8c8",
  }),

  /** The first photon's marker and wave. */
  photon1ColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "photon1", {
    default: "#ffd54f",
    projector: "#c77700",
  }),

  /** The second photon's marker and wave (compare mode). */
  photon2ColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "photon2", {
    default: "#f48fb1",
    projector: "#ad1457",
  }),

  /** Wave drawn for a non-visible photon. */
  invisibleWaveColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "invisibleWave", {
    default: "#e0e0e0",
    projector: "#444444",
  }),

  // ── EM spectrum regions (fills of the spectrum bar) ──────────────────────────

  gammaRegionColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "gammaRegion", {
    default: "#4a2a6e",
    projector: "#d7c8ec",
  }),
  xRayRegionColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "xRayRegion", {
    default: "#3a3a8a",
    projector: "#cfd2f2",
  }),
  ultravioletRegionColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "ultravioletRegion", {
    default: "#5b3f9e",
    projector: "#e2d4f7",
  }),
  infraredRegionColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "infraredRegion", {
    default: "#7a2b2b",
    projector: "#f6d0cc",
  }),
  microwaveRegionColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "microwaveRegion", {
    default: "#6b4a26",
    projector: "#f3e0c4",
  }),
  radioRegionColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "radioRegion", {
    default: "#3f5a35",
    projector: "#d6ecd0",
  }),

  // ── Hydrogen atom ────────────────────────────────────────────────────────────

  nucleusColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "nucleus", {
    default: "#ef5350",
    projector: "#c62828",
  }),
  electronColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "electron", {
    default: "#64b5f6",
    projector: "#1565c0",
  }),
  orbitColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "orbit", {
    default: "#4a5470",
    projector: "#b0b0b0",
  }),
  energyLevelColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "energyLevel", {
    default: "#c0c8d8",
    projector: "#333333",
  }),
  /** The level the electron currently occupies. */
  occupiedLevelColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "occupiedLevel", {
    default: "#64b5f6",
    projector: "#1565c0",
  }),
  /** Upward transition arrow (excitation or absorption). */
  upArrowColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "upArrow", {
    default: "#81c784",
    projector: "#2e7d32",
  }),

  /** Housing of the lamp in absorption mode, and the light bulb / tube fittings on Line Spectra. */
  lampHousingColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "lampHousing", {
    default: "#777777",
    projector: "#888888",
  }),
  lampHousingStrokeColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "lampHousingStroke", {
    default: "#222222",
    projector: "#333333",
  }),

  /** Blue inner cone of a Bunsen-burner flame. */
  flameCoreColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "flameCore", {
    default: "#4f7cff",
    projector: "#4f7cff",
  }),

  // ── Feedback ─────────────────────────────────────────────────────────────────

  correctColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "correct", {
    default: "#81c784",
    projector: "#2e7d32",
  }),
  incorrectColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "incorrect", {
    default: "#ff8a80",
    projector: "#c62828",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(LightAndAtomsNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default LightAndAtomsColors;
