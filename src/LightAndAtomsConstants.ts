/**
 * LightAndAtomsConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Physics / model values use SI units (metres, seconds, joules, …), except
 *    where a quantity is named for another unit (`…_NM` is nanometres).
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in LightAndAtomsColors.ts, not here.
 *
 * Physical constants are the exact 2019 SI defining values (h, c, N_A, e) and
 * CODATA 2018 for the hydrogen Rydberg constant. Sources are in doc/model.md.
 */

import { Range } from "scenerystack/dot";
import LightAndAtomsNamespace from "./LightAndAtomsNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Vertical spacing between rows inside a control panel. */
export const PANEL_ROW_SPACING = 8;

/** Font sizes (px) shared by labels, readouts and titles. */
export const FONT_SIZE = {
  title: 16,
  label: 14,
  small: 12,
  tiny: 10,
} as const;

// ── Physical constants (SI) ───────────────────────────────────────────────────

/** Planck constant h, J·s (exact). */
export const PLANCK_CONSTANT = 6.62607015e-34;

/** Speed of light in vacuum c, m/s (exact). */
export const SPEED_OF_LIGHT = 2.99792458e8;

/** Avogadro constant N_A, 1/mol (exact). */
export const AVOGADRO_CONSTANT = 6.02214076e23;

/** Elementary charge, which is also the number of joules in one electronvolt (exact). */
export const JOULES_PER_ELECTRONVOLT = 1.602176634e-19;

/** Boltzmann constant k_B, J/K (exact). */
export const BOLTZMANN_CONSTANT = 1.380649e-23;

/**
 * Rydberg constant for hydrogen R_H, 1/m. This is R_∞ (10 973 731.6 m⁻¹) corrected for the
 * proton's finite mass, R_H = R_∞ / (1 + mₑ/mₚ). It reproduces the measured vacuum Balmer
 * wavelengths (656.47 nm for 3 → 2) to better than 0.01 nm.
 */
export const RYDBERG_HYDROGEN = 1.0967758e7;

/** Ionisation energy of hydrogen h·c·R_H, J (≈ 2.18 × 10⁻¹⁸ J, the textbook value). */
export const HYDROGEN_IONIZATION_ENERGY = PLANCK_CONSTANT * SPEED_OF_LIGHT * RYDBERG_HYDROGEN;

/** Metres per nanometre. */
export const METERS_PER_NANOMETER = 1e-9;

/** Joules per kilojoule. */
export const JOULES_PER_KILOJOULE = 1e3;

// ── Electromagnetic spectrum (EM Spectrum screen) ─────────────────────────────

/** Range of log₁₀(λ / m) covered by the spectrum bar: 0.1 pm (gamma) to 1 km (radio). */
export const LOG_WAVELENGTH_RANGE = new Range(-13, 3);

/** Initial wavelength of the first and second photons, m (500 nm green, 100 nm UV). */
export const INITIAL_WAVELENGTH = 500e-9;
export const INITIAL_WAVELENGTH_2 = 100e-9;

/** Arrow-key steps of the spectrum marker, in decades of wavelength. */
export const MARKER_KEYBOARD_STEP = 0.02;
export const MARKER_SHIFT_KEYBOARD_STEP = 0.002;
export const MARKER_PAGE_KEYBOARD_STEP = 1;

/**
 * Bond energy of a C–C single bond, kJ/mol: a reference for whether a photon carries enough
 * energy per mole to break a typical bond. Average bond enthalpy (OpenStax Chemistry 2e, Table 7.2).
 */
export const C_C_BOND_ENERGY_KJ_PER_MOL = 348;

/** Bounds of the visible band used by every screen, nm. */
export const VISIBLE_MIN_NM = 380;
export const VISIBLE_MAX_NM = 750;

// ── Hydrogen atom (Bohr) ──────────────────────────────────────────────────────

/** Highest Bohr level shown. Six covers Lyman, Balmer and Paschen lines in or near the visible. */
export const MAX_LEVEL = 6;

/**
 * Fractional mismatch |λ − λ_transition| / λ_transition within which an incoming photon is
 * absorbed. Real lines are far narrower; this is wide enough to hit with the arrow buttons
 * (0.1 nm steps) and narrow enough that neighbouring lines (n ≤ 6) never overlap.
 */
export const ABSORPTION_TOLERANCE = 0.0025;

/** Ranges of the photon-source wavelength control in each region, nm. */
export const PHOTON_UV_RANGE_NM = new Range(90, 380);
export const PHOTON_VISIBLE_RANGE_NM = new Range(380, 750);
export const PHOTON_IR_RANGE_NM = new Range(750, 2000);

/** Initial photon-source wavelengths in each region, nm. */
export const INITIAL_PHOTON_UV_NM = 121.6;
export const INITIAL_PHOTON_VISIBLE_NM = 500;
export const INITIAL_PHOTON_IR_NM = 1000;

/** Arrow-button step of the photon wavelength control, nm. */
export const PHOTON_WAVELENGTH_DELTA_NM = 0.1;

/** Photon speed across the atom view, model units (view px) per second. */
export const PHOTON_SPEED = 220;

/** Time between photons while the source is switched on, s. */
export const PHOTON_EMISSION_INTERVAL = 0.6;

/** Seconds an excited electron stays up before it falls back on its own, when "Auto relax" is on. */
export const AUTO_RELAX_DELAY = 1.5;

// ── Line spectra ──────────────────────────────────────────────────────────────

/** Wavelength range of the spectroscope and its chart, nm (the eye's full visible window). */
export const SPECTROSCOPE_MIN_NM = 380;
export const SPECTROSCOPE_MAX_NM = 780;

/** Sample spacing of computed spectra, nm. */
export const SPECTRUM_SAMPLE_STEP_NM = 0.25;

/** Instrumental line width (Gaussian σ) of the hand spectroscope, nm. */
export const INSTRUMENT_SIGMA_NM = 0.8;

/** Fraction of the background removed at the centre of the strongest absorption line. */
export const MAX_ABSORPTION_DEPTH = 0.9;

/** Light-bulb filament temperature range and default, K. */
export const BULB_TEMPERATURE_RANGE = new Range(1500, 3500);
export const INITIAL_BULB_TEMPERATURE = 2800;

/** Effective temperature of the Sun's photosphere, K. */
export const SUN_TEMPERATURE = 5772;

/** Arrow-key steps of the spectroscope wavelength cursor, nm. */
export const CURSOR_KEYBOARD_STEP_NM = 1;
export const CURSOR_SHIFT_KEYBOARD_STEP_NM = 0.1;
export const CURSOR_PAGE_KEYBOARD_STEP_NM = 20;

/** Settings for common/LightAndAtomsControlOptions.ts. */
export const LIGHT_AND_ATOMS_CONTROL_OPTIONS_SETTINGS = {
  /** Slider thumb size width (px). */
  SLIDER_THUMB_SIZE_WIDTH: 12,
  /** Slider thumb size height (px). */
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  /** Standalone slider track size width (px). */
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  /** Standalone slider track size height (px). */
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Number control slider track size width (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  /** Number control slider track size height (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Checkbox box width (px). */
  CHECKBOX_BOX_WIDTH: 16,
  /** Light and atoms number control options scale (dimensionless). */
  LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  /** Light and atoms number control options slider padding (px). */
  LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  /** Light and atoms number control options arrow button spacing (px). */
  LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  /** Light and atoms number control options vertical spacing (px). */
  LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  /** Light and atoms checkbox options spacing (px). */
  LIGHT_AND_ATOMS_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/LightAndAtomsPanel.ts. */
export const LIGHT_AND_ATOMS_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/LightAndAtomsScreenIcons.ts. */
export const LIGHT_AND_ATOMS_SCREEN_ICONS_SETTINGS = {
  CREATE_HYDROGEN_ATOM_ICON_LINE_DASH_DASH: 10, // px
  CREATE_HYDROGEN_ATOM_ICON_X_FACTOR: 72, // dimensionless
  CREATE_HYDROGEN_ATOM_ICON_Y_FACTOR: 72, // dimensionless

  BANDS_ITEM_3_WIDTH: 70, // px
  BANDS_ITEM_4_WIDTH: 60, // px
  BANDS_ITEM_6_WIDTH: 70, // px
  BANDS_ITEM_7_WIDTH: 68, // px
  CREATE_HYDROGEN_ATOM_ICON_RADIUS_SEGMENT_2: 16, // px
  CREATE_HYDROGEN_ATOM_ICON_LINE_WIDTH_VARIANT_2: 7, // px
  CREATE_HYDROGEN_ATOM_ICON_X_SEGMENT_2: 480, // px
  CHILDREN_Y_SEGMENT_2: 200, // px
  CHILDREN_HEIGHT_SEGMENT_2: 110, // px
  CREATE_LINE_SPECTRA_ICON_Y_SEGMENT_2: 70, // px
  CREATE_LINE_SPECTRA_ICON_WIDTH_SEGMENT_2: 6, // px
  CREATE_LINE_SPECTRA_ICON_HEIGHT_SEGMENT_2: 90, // px

  /** Stops (px). */
  STOPS: 20,
  /** Band top (px). */
  BAND_TOP: 200,
  /** Band height (px). */
  BAND_HEIGHT: 90,
  /** Bands width (px). */
  BANDS_WIDTH: 80,
  /** Create em spectrum icon line width (px). */
  CREATE_EM_SPECTRUM_ICON_LINE_WIDTH: 6,
  /** Create hydrogen atom icon line width (px). */
  CREATE_HYDROGEN_ATOM_ICON_LINE_WIDTH: 4,
  /** Create hydrogen atom icon radius (px). */
  CREATE_HYDROGEN_ATOM_ICON_RADIUS: 14,
  /** Photon x (px). */
  PHOTON_X: 330,
  /** Create hydrogen atom icon x (px). */
  CREATE_HYDROGEN_ATOM_ICON_X: 510,
  /** Strip left (px). */
  STRIP_LEFT: 40,
  /** Children y (px). */
  CHILDREN_Y: 70,
  /** Children height (px). */
  CHILDREN_HEIGHT: 90,
  /** Create line spectra icon y (px). */
  CREATE_LINE_SPECTRA_ICON_Y: 200,
  /** Create line spectra icon width (px). */
  CREATE_LINE_SPECTRA_ICON_WIDTH: 8,
  /** Create line spectra icon height (px). */
  CREATE_LINE_SPECTRA_ICON_HEIGHT: 110,
} as const;

/** Settings for common/model/Planck.ts. */
export const PLANCK_SETTINGS = {
  /** Wien displacement constant b, m·K (CODATA 2018). */
  WIEN_CONSTANT: 2.897771955e-3,
} as const;

/** Settings for common/view/ControlFactory.ts. */
export const CONTROL_FACTORY_SETTINGS = {
  ITEMS_MAX_WIDTH_OFFSET: 40, // px
  RADIO_GROUP_SPACING: 4, // px

  /** Control font size (px). */
  CONTROL_FONT_SIZE: 13,
  /** Heading font size (px). */
  HEADING_FONT_SIZE: 14,
  /** Combo box x margin (px). */
  COMBO_BOX_X_MARGIN: 8,
  /** Combo box y margin (px). */
  COMBO_BOX_Y_MARGIN: 3,
  /** Combo box corner radius (px). */
  COMBO_BOX_CORNER_RADIUS: 4,
  /** Labeled spacing (px). */
  LABELED_SPACING: 3,
  /** Push button x margin (px). */
  PUSH_BUTTON_X_MARGIN: 8,
  /** Push button y margin (px). */
  PUSH_BUTTON_Y_MARGIN: 4,
  /** Radio group radius (px). */
  RADIO_GROUP_RADIUS: 6,
} as const;

/** Settings for common/view/EquationsPanel.ts. */
export const EQUATIONS_PANEL_SETTINGS = {
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 8,
} as const;

/** Settings for common/view/SpectrumMarkerNode.ts. */
export const SPECTRUM_MARKER_NODE_SETTINGS = {
  ITEM_3_LINE_WIDTH: 2, // px

  /** Handle triangle width and height, px. */
  HANDLE_WIDTH: 14,
  /** Handle height (px). */
  HANDLE_HEIGHT: 11,
  /** Half-width of the invisible pointer target around the line, px. */
  HIT_HALF_WIDTH: 7,
  /** Children line width (px). */
  CHILDREN_LINE_WIDTH: 4,
  /** Children opacity (dimensionless). */
  CHILDREN_OPACITY: 0.6,
} as const;

/** Settings for common/view/SpectrumStripNode.ts. */
export const SPECTRUM_STRIP_NODE_SETTINGS = {
  /** Display gamma: VisibleColor values are already encoded, so scale them by brightness^(1/γ). */
  DISPLAY_GAMMA: 2.2,
} as const;

/** Settings for hydrogen-atom/model/HydrogenAtomModel.ts. */
export const HYDROGEN_ATOM_MODEL_SETTINGS = {
  /** Atom view half width (px). */
  ATOM_VIEW_HALF_WIDTH: 190,
  /** Atom view half height (px). */
  ATOM_VIEW_HALF_HEIGHT: 150,
} as const;

/** Settings for hydrogen-atom/view/BohrAtomNode.ts. */
export const BOHR_ATOM_NODE_SETTINGS = {
  CAPTION_MAX_WIDTH_OFFSET: 16, // px
  CONSTRUCTOR_LEFT_OFFSET: 8, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  CONSTRUCTOR_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_CENTER_X_FACTOR: 4, // dimensionless
  CONSTRUCTOR_CENTER_X_OFFSET: 6, // px
  CONSTRUCTOR_CENTER_Y_FACTOR: 4, // dimensionless
  CONSTRUCTOR_CENTER_Y_OFFSET: 6, // px
  IONIZED_TEXT_MAX_WIDTH_OFFSET: 20, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 10, // px
  LAMP_X_OFFSET: 26, // px
  BEAM_GUIDE_LINE_DASH_DASH: 6, // px

  /** Radius of the outermost (n = MAX_LEVEL) orbit, px. */
  OUTER_ORBIT_RADIUS: 142,
  /** Angular speed of the electron in n = 1, rad/s. */
  GROUND_ANGULAR_SPEED: 5,
  /** Frame corner radius (px). */
  FRAME_CORNER_RADIUS: 6,
  /** Nucleus radius (px). */
  NUCLEUS_RADIUS: 4,
  /** Electron radius (px). */
  ELECTRON_RADIUS: 5,
  /** Electron line width (px). */
  ELECTRON_LINE_WIDTH: 0.5,
  /** Occupied orbit line width (px). */
  OCCUPIED_ORBIT_LINE_WIDTH: 2,
  /** Lens y (px). */
  LENS_Y: -12,
  /** Lens width (px). */
  LENS_WIDTH: 6,
  /** Lens height (px). */
  LENS_HEIGHT: 24,
  /** Lens corner radius (px). */
  LENS_CORNER_RADIUS: 2,
  /** Lamp x (px). */
  LAMP_X: -24,
  /** Lamp y (px). */
  LAMP_Y: -14,
  /** Lamp width (px). */
  LAMP_WIDTH: 24,
  /** Lamp height (px). */
  LAMP_HEIGHT: 28,
  /** Lamp corner radius (px). */
  LAMP_CORNER_RADIUS: 3,
} as const;

/** Settings for hydrogen-atom/view/EnergyLevelDiagramNode.ts. */
export const ENERGY_LEVEL_DIAGRAM_NODE_SETTINGS = {
  CONSTRUCTOR_RIGHT_OFFSET: 4, // px
  CONSTRUCTOR_LINE_DASH_DASH: 4, // px
  CONSTRUCTOR_LEFT_OFFSET: 48, // px

  HEAD_HEIGHT: 7, // px
  HEAD_WIDTH: 9, // px

  /** Width of a level line, px. */
  LEVEL_WIDTH: 120,
  /** Minimum vertical spacing between labels, px. */
  LABEL_SPACING: 15,
  /** Horizontal offset of a fanned label from the line end, px. */
  LABEL_GAP: 6,
  /** Pointer target height around each level, px. */
  HIT_HEIGHT: 8,
  /** Constructor head height (px). */
  CONSTRUCTOR_HEAD_HEIGHT: 8,
  /** Constructor head width (px). */
  CONSTRUCTOR_HEAD_WIDTH: 8,
  /** Constructor max width (px). */
  CONSTRUCTOR_MAX_WIDTH: 150,
  /** Line line width (px). */
  LINE_LINE_WIDTH: 2,
  /** Constructor line width (px). */
  CONSTRUCTOR_LINE_WIDTH: 0.5,
  /** N label max width (px). */
  N_LABEL_MAX_WIDTH: 50,
  /** Value text max width (px). */
  VALUE_TEXT_MAX_WIDTH: 120,
  /** Electron radius (px). */
  ELECTRON_RADIUS: 5,
  /** Electron line width (px). */
  ELECTRON_LINE_WIDTH: 0.5,
  /** Constructor tail width (px). */
  CONSTRUCTOR_TAIL_WIDTH: 3,
} as const;

/** Settings for hydrogen-atom/view/HydrogenAtomScreenView.ts. */
export const HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS = {
  CONSTRUCTOR_X_OFFSET: 56, // px
  CONSTRUCTOR_Y_OFFSET: 12, // px
  CONSTRUCTOR_TOP_OFFSET: 8, // px

  ENERGY_UNIT_RADIO_GROUP_MAX_WIDTH: 60, // px
  CONTROL_PANEL_ITEM_8_SPACING: 8, // px
  ENERGY_UNITS_LABEL_MAX_WIDTH: 110, // px
  PHOTON_REGION_RADIO_GROUP_MAX_WIDTH: 70, // px

  /** Height of the energy diagram from E₁ to 0, px. */
  DIAGRAM_HEIGHT: 250,
  /** Width available to control-panel content, px. */
  PANEL_WIDTH: 230,
  /** Level buttons x margin (px). */
  LEVEL_BUTTONS_X_MARGIN: 9,
  /** Level buttons y margin (px). */
  LEVEL_BUTTONS_Y_MARGIN: 4,
  /** Control panel spacing (px). */
  CONTROL_PANEL_SPACING: 4,
  /** Wavelength controls max width (px). */
  WAVELENGTH_CONTROLS_MAX_WIDTH: 110,
  /** Wavelength controls page keyboard step (control/model units). */
  WAVELENGTH_CONTROLS_PAGE_KEYBOARD_STEP: 10,
  /** Lamp panel spacing (px). */
  LAMP_PANEL_SPACING: 10,
} as const;

/** Settings for hydrogen-atom/view/HydrogenSpectrumNode.ts. */
export const HYDROGEN_SPECTRUM_NODE_SETTINGS = {
  CONSTRUCTOR_LEFT_OFFSET: 6, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 16, // px

  SECTIONS_ITEM_2_WIDTH: 370, // px
  SECTIONS_ITEM_3_WIDTH: 180, // px

  /** Strip height (px). */
  STRIP_HEIGHT: 44,
  /** Section gap (px). */
  SECTION_GAP: 14,
  /** Minimum spacing between line labels, px. */
  LABEL_MIN_SPACING: 30,
  /** Sections width (px). */
  SECTIONS_WIDTH: 150,
  /** Title max width (px). */
  TITLE_MAX_WIDTH: 560,
  /** Top (px). */
  TOP: 34,
  /** Constructor max width (px). */
  CONSTRUCTOR_MAX_WIDTH: 90,
  /** Redraw line width (px). */
  REDRAW_LINE_WIDTH: 2,
} as const;

/** Settings for hydrogen-atom/view/PhotonNode.ts. */
export const PHOTON_NODE_SETTINGS = {
  HEAD_SHAPE_Y_SEGMENT_2: 4, // px

  /** Packet length, crest spacing and amplitude, px. */
  PACKET_LENGTH: 26,
  /** Packet wavelength (px). */
  PACKET_WAVELENGTH: 7,
  /** Packet amplitude (px). */
  PACKET_AMPLITUDE: 4,
  /** Head shape x (px). */
  HEAD_SHAPE_X: 6,
  /** Head shape y (px). */
  HEAD_SHAPE_Y: -4,
  /** Constructor line width (px). */
  CONSTRUCTOR_LINE_WIDTH: 2.5,
} as const;

/** Settings for line-spectra/model/LineSpectraModel.ts. */
export const LINE_SPECTRA_MODEL_SETTINGS = {
  /** Initial cursor wavelength, nm (the sodium D lines). */
  INITIAL_CURSOR_NM: 589,
} as const;

/** Settings for line-spectra/view/IntensityChartNode.ts. */
export const INTENSITY_CHART_NODE_SETTINGS = {
  CONSTRUCTOR_TOP_OFFSET: 18, // px

  /** Headroom above the tallest peak, as a fraction of it. */
  Y_HEADROOM: 1.08,
  /** Plot line width (px). */
  PLOT_LINE_WIDTH: 1.5,
  /** Right right (px). */
  RIGHT_RIGHT: -6,
} as const;

/** Settings for line-spectra/view/LineSpectraScreenView.ts. */
export const LINE_SPECTRA_SCREEN_VIEW_SETTINGS = {
  TEMPERATURE_CONTROL_MAX_WIDTH_OFFSET: 80, // px
  SOURCE_PANEL_MIN_WIDTH_OFFSET: 24, // px
  CONSTRUCTOR_TOP_OFFSET: 10, // px
  CONSTRUCTOR_Y_OFFSET: 36, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 4, // px

  REFERENCE_ELEMENT_COMBO_BOX_MAX_WIDTH: 140, // px
  REFERENCE_LABEL_MAX_WIDTH: 100, // px

  /** Left edge and width shared by the strips and the chart, so wavelengths line up, px. */
  SPECTRUM_LEFT: 340,
  /** Spectrum width (px). */
  SPECTRUM_WIDTH: 600,
  /** Strip heights and the chart height, px. */
  EYEPIECE_HEIGHT: 60,
  /** Small strip height (px). */
  SMALL_STRIP_HEIGHT: 28,
  /** Chart height (px). */
  CHART_HEIGHT: 175,
  /** Width of the left control column's content, px. */
  PANEL_WIDTH: 220,
  /** Temperature control delta (control/model units). */
  TEMPERATURE_CONTROL_DELTA: 50,
  /** Temperature control keyboard step (control/model units). */
  TEMPERATURE_CONTROL_KEYBOARD_STEP: 50,
  /** Temperature control shift keyboard step (control/model units). */
  TEMPERATURE_CONTROL_SHIFT_KEYBOARD_STEP: 10,
  /** Temperature control page keyboard step (control/model units). */
  TEMPERATURE_CONTROL_PAGE_KEYBOARD_STEP: 500,
  /** Reference row spacing (px). */
  REFERENCE_ROW_SPACING: 8,
  /** Opacity opacity (dimensionless). */
  OPACITY_OPACITY: 0.85,
} as const;

/** Settings for line-spectra/view/MysteryPanel.ts. */
export const MYSTERY_PANEL_SETTINGS = {
  /** Grid x spacing (px). */
  GRID_X_SPACING: 10,
  /** Grid y spacing (px). */
  GRID_Y_SPACING: 5,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for line-spectra/view/SourceIllustrationNode.ts. */
export const SOURCE_ILLUSTRATION_NODE_SETTINGS = {
  FLAME_CORE_BOTTOM_OFFSET: 30, // px
  BULB_GLASS_CENTER_Y_OFFSET: 8, // px
  WHITE_LAMP_CENTER_X_OFFSET: 52, // px

  /** Size of the area the source is drawn in, px. */
  SOURCE_WIDTH: 170,
  /** Source height (px). */
  SOURCE_HEIGHT: 110,
  /** Length of the beam to the spectroscope, px. */
  BEAM_LENGTH: 90,
  /** Tube glass width (px). */
  TUBE_GLASS_WIDTH: 140,
  /** Tube glass height (px). */
  TUBE_GLASS_HEIGHT: 24,
  /** Tube glass corner radius (px). */
  TUBE_GLASS_CORNER_RADIUS: 12,
  /** Tube glass line width (px). */
  TUBE_GLASS_LINE_WIDTH: 1.5,
  /** Tube width (px). */
  TUBE_WIDTH: 16,
  /** Tube height (px). */
  TUBE_HEIGHT: 18,
  /** Mystery label font size (px). */
  MYSTERY_LABEL_FONT_SIZE: 22,
  /** Flame outer opacity (dimensionless). */
  FLAME_OUTER_OPACITY: 0.9,
  /** Flame core scale (dimensionless). */
  FLAME_CORE_SCALE: 0.45,
  /** Flame core opacity (dimensionless). */
  FLAME_CORE_OPACITY: 0.8,
  /** Flame width (px). */
  FLAME_WIDTH: 20,
  /** Flame height (px). */
  FLAME_HEIGHT: 22,
  /** Bulb glass radius (px). */
  BULB_GLASS_RADIUS: 32,
  /** Bulb width (px). */
  BULB_WIDTH: 28,
  /** Bulb height (px). */
  BULB_HEIGHT: 22,
  /** Bulb corner radius (px). */
  BULB_CORNER_RADIUS: 3,
  /** Sun disk radius (px). */
  SUN_DISK_RADIUS: 34,
  /** Rays line width (px). */
  RAYS_LINE_WIDTH: 3,
  /** Cell glass width (px). */
  CELL_GLASS_WIDTH: 60,
  /** Cell glass height (px). */
  CELL_GLASS_HEIGHT: 40,
  /** Cell glass corner radius (px). */
  CELL_GLASS_CORNER_RADIUS: 4,
  /** Cell glass line width (px). */
  CELL_GLASS_LINE_WIDTH: 1.5,
  /** White lamp radius (px). */
  WHITE_LAMP_RADIUS: 18,
  /** Absorption setup line width (px). */
  ABSORPTION_SETUP_LINE_WIDTH: 6,
  /** Absorption setup opacity (dimensionless). */
  ABSORPTION_SETUP_OPACITY: 0.6,
  /** Beam line width (px). */
  BEAM_LINE_WIDTH: 8,
  /** Beam opacity (dimensionless). */
  BEAM_OPACITY: 0.7,
  /** Spectroscope width (px). */
  SPECTROSCOPE_WIDTH: 90,
  /** Spectroscope height (px). */
  SPECTROSCOPE_HEIGHT: 32,
  /** Spectroscope corner radius (px). */
  SPECTROSCOPE_CORNER_RADIUS: 4,
  /** Spectroscope label max width (px). */
  SPECTROSCOPE_LABEL_MAX_WIDTH: 82,
} as const;

/** Settings for preferences/LightAndAtomsPreferencesNode.ts. */
export const LIGHT_AND_ATOMS_PREFERENCES_NODE_SETTINGS = {
  /** Header font size (px). */
  HEADER_FONT_SIZE: 18,
  /** Inverse seconds checkbox font size (px). */
  INVERSE_SECONDS_CHECKBOX_FONT_SIZE: 14,
  /** Inverse seconds checkbox spacing (px). */
  INVERSE_SECONDS_CHECKBOX_SPACING: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Settings for spectrum/view/EMSpectrumBarNode.ts. */
export const EM_SPECTRUM_BAR_NODE_SETTINGS = {
  LABEL_MAX_WIDTH_OFFSET: 6, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 18, // px
  CONSTRUCTOR_TOP_OFFSET: 18, // px
  CONSTRUCTOR_LEFT_OFFSET: 4, // px
  CONSTRUCTOR_LINE_DASH_DASH: 3, // px
  CONSTRUCTOR_RIGHT_OFFSET: 10, // px
  CONSTRUCTOR_CENTER_Y_OFFSET: 6, // px

  ENERGY_ARROW_X_LINE_TO_Y: 5, // px

  /** Bar size, px. */
  BAR_WIDTH: 884,
  /** Bar height (px). */
  BAR_HEIGHT: 48,
  /** Magnified visible strip: size and its top relative to the bar's top, px. */
  ZOOM_WIDTH: 420,
  /** Zoom height (px). */
  ZOOM_HEIGHT: 26,
  /** Zoom top (px). */
  ZOOM_TOP: 122,
  /** Tick length (px). */
  TICK_LENGTH: 6,
  /** Number of gradient stops across the visible band of the bar. */
  VISIBLE_GRADIENT_STOPS: 24,
  /** Energy arrow x (px). */
  ENERGY_ARROW_X: 9,
  /** Energy arrow y (px). */
  ENERGY_ARROW_Y: -5,
  /** Zoom title max width (px). */
  ZOOM_TITLE_MAX_WIDTH: 140,
  /** Nm label max width (px). */
  NM_LABEL_MAX_WIDTH: 140,
} as const;

/** Settings for spectrum/view/EMSpectrumScreenView.ts. */
export const EM_SPECTRUM_SCREEN_VIEW_SETTINGS = {
  WAVE_CAPTION_TOP_OFFSET: 4, // px
  CONTROLS_TOP_OFFSET: 10, // px
  CONSTRUCTOR_TOP_OFFSET: 8, // px
  CONSTRUCTOR_LEFT_OFFSET: 10, // px

  CONTROLS_ITEM_2_SPACING: 24, // px

  /** Top of the spectrum bar, px. */
  BAR_TOP: 62,
  /** Wave boxes, px. */
  WAVE_WIDTH: 500,
  /** Wave height (px). */
  WAVE_HEIGHT: 76,
  /** Wave gap (px). */
  WAVE_GAP: 8,
  /** Gap between the left column and the readout panels, px. */
  COLUMN_GAP: 20,
  /** Tick line width (px). */
  TICK_LINE_WIDTH: 3,
  /** Checkbox label max width (px). */
  CHECKBOX_LABEL_MAX_WIDTH: 220,
  /** Controls spacing (px). */
  CONTROLS_SPACING: 8,
  /** Controls max width (px). */
  CONTROLS_MAX_WIDTH: 100,
} as const;

/** Settings for spectrum/view/PhotonReadoutPanel.ts. */
export const PHOTON_READOUT_PANEL_SETTINGS = {
  TITLE_MAX_WIDTH_OFFSET: 20, // px

  /** Panel content width (px). */
  PANEL_CONTENT_WIDTH: 210,
  /** Title spacing (px). */
  TITLE_SPACING: 6,
  /** Title width (px). */
  TITLE_WIDTH: 12,
  /** Title height (px). */
  TITLE_HEIGHT: 12,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for spectrum/view/WaveNode.ts. */
export const WAVE_NODE_SETTINGS = {
  CONSTRUCTOR_Y_OFFSET: 9, // px

  /** On-screen wavelength at the gamma and radio ends of the bar, px. */
  MIN_SCREEN_WAVELENGTH: 9,
  /** Max screen wavelength (px). */
  MAX_SCREEN_WAVELENGTH: 260,
  /** On-screen wavelength of the longer photon when two are drawn to the same scale, px. */
  SHARED_SCALE_LONGER_WAVELENGTH: 200,
  /** Shortest wavelength drawn, px; anything shorter would alias on the 1.5 px sampling. */
  MIN_DRAWN_WAVELENGTH: 4,
  /** On-screen speed of every wave, px/s. */
  SCREEN_WAVE_SPEED: 70,
  /** Horizontal sample spacing of the drawn curve, px. */
  SAMPLE_SPACING: 1.5,
  /** Padding (px). */
  PADDING: 8,
  /** Box line width (px). */
  BOX_LINE_WIDTH: 1.5,
  /** Box corner radius (px). */
  BOX_CORNER_RADIUS: 4,
  /** Wave path line width (px). */
  WAVE_PATH_LINE_WIDTH: 2.5,
} as const;

/** Settings for common/model/SpectrumSynthesis.ts; units are documented per value. */
export const SPECTRUM_SYNTHESIS_SETTINGS = {
  /** Gaussian line support radius in standard deviations (dimensionless). */
  GAUSSIAN_SUPPORT_SIGMAS: 5,
  /** Conversion from nanometres to metres (m/nm). */
  METERS_PER_NANOMETER: 1e-9,
} as const;

/** Settings for common/model/formatNumber.ts; units are documented per value. */
export const FORMAT_NUMBER_SETTINGS = {
  /** Default number of significant figures in scientific markup (digits). */
  DEFAULT_SIGNIFICANT_FIGURES: 3,
  /** Relative tolerance when choosing a displayed unit (dimensionless). */
  UNIT_BOUNDARY_TOLERANCE: 1e-9,
} as const;

LightAndAtomsNamespace.register("LightAndAtomsConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  PLANCK_CONSTANT,
  SPEED_OF_LIGHT,
  AVOGADRO_CONSTANT,
  RYDBERG_HYDROGEN,
  MAX_LEVEL,
});
