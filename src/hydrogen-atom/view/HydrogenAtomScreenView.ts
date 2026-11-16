import { HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS } from "../../LightAndAtomsConstants.js";
/**
 * HydrogenAtomScreenView.ts
 *
 * The Hydrogen Atom screen: the Bohr atom (left), its energy-level diagram (centre), the controls
 * (right), and the spectrum the atom builds up (bottom), with the worked Bohr / Rydberg equations
 * on request. Every emission, absorption, pass-through and ionisation is announced to screen
 * readers.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, RichText, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { TextPushButton } from "scenerystack/sun";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/LightAndAtomsButtonOptions.js";
import { LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS } from "../../common/LightAndAtomsControlOptions.js";
import { LightAndAtomsPanel } from "../../common/LightAndAtomsPanel.js";
import { seriesOf } from "../../common/model/Bohr.js";
import { toSignificantFigures } from "../../common/model/formatNumber.js";
import { metersToNm } from "../../common/model/PhotonUtils.js";
import { checkbox, heading, label, pushButton, radioGroup } from "../../common/view/ControlFactory.js";
import { EquationsPanel } from "../../common/view/EquationsPanel.js";
import { colorName } from "../../common/view/spectralColor.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import {
  FONT_SIZE,
  MAX_LEVEL,
  PANEL_ROW_SPACING,
  PHOTON_IR_RANGE_NM,
  PHOTON_UV_RANGE_NM,
  PHOTON_VISIBLE_RANGE_NM,
  PHOTON_WAVELENGTH_DELTA_NM,
  SCREEN_VIEW_MARGIN,
} from "../../LightAndAtomsConstants.js";
import { EnergyUnit } from "../model/EnergyUnit.js";
import {
  ATOM_VIEW_HALF_HEIGHT,
  ATOM_VIEW_HALF_WIDTH,
  type AtomEvent,
  type HydrogenAtomModel,
} from "../model/HydrogenAtomModel.js";
import { HydrogenMode } from "../model/HydrogenMode.js";
import { PhotonRegion } from "../model/PhotonRegion.js";
import { BohrAtomNode } from "./BohrAtomNode.js";
import { EnergyLevelDiagramNode } from "./EnergyLevelDiagramNode.js";
import { HydrogenAtomScreenSummaryContent } from "./HydrogenAtomScreenSummaryContent.js";
import { createHydrogenEquationLines } from "./HydrogenEquations.js";
import { HydrogenSpectrumNode } from "./HydrogenSpectrumNode.js";

/** Height of the energy diagram from E₁ to 0, px. */
const DIAGRAM_HEIGHT: number = HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.DIAGRAM_HEIGHT;
/** Width available to control-panel content, px. */
const PANEL_WIDTH: number = HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.PANEL_WIDTH;

export type HydrogenAtomScreenViewOptions = ScreenViewOptions;

export class HydrogenAtomScreenView extends ScreenView {
  private readonly atomNode: BohrAtomNode;

  public constructor(model: HydrogenAtomModel, providedOptions?: HydrogenAtomScreenViewOptions) {
    const options = optionize<HydrogenAtomScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new HydrogenAtomScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getHydrogenAtomStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getHydrogenAtomA11yStrings();

    // ── Atom and energy diagram ───────────────────────────────────────────────
    this.atomNode = new BohrAtomNode(model);
    this.atomNode.x = SCREEN_VIEW_MARGIN + ATOM_VIEW_HALF_WIDTH;
    this.atomNode.y = SCREEN_VIEW_MARGIN + ATOM_VIEW_HALF_HEIGHT;
    this.addChild(this.atomNode);

    const diagram = new EnergyLevelDiagramNode(model, DIAGRAM_HEIGHT);
    diagram.x = this.atomNode.x + ATOM_VIEW_HALF_WIDTH + HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_X_OFFSET;
    diagram.y =
      this.atomNode.y +
      ATOM_VIEW_HALF_HEIGHT -
      DIAGRAM_HEIGHT -
      HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_Y_OFFSET;
    this.addChild(diagram);

    // ── Spectrum ──────────────────────────────────────────────────────────────
    const clearButton = pushButton(common.clearStringProperty, () => model.clearSpectrum());
    const spectrum = new HydrogenSpectrumNode(model, clearButton);
    spectrum.left = SCREEN_VIEW_MARGIN;
    spectrum.top = this.atomNode.y + ATOM_VIEW_HALF_HEIGHT + HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    this.addChild(spectrum);

    // ── Controls ──────────────────────────────────────────────────────────────
    const modeRadio = radioGroup(
      model.modeProperty,
      [
        { value: HydrogenMode.EMISSION, label: strings.emissionStringProperty },
        { value: HydrogenMode.ABSORPTION, label: strings.absorptionStringProperty },
      ],
      strings.modeStringProperty,
      PANEL_WIDTH,
      "horizontal",
    );

    const levelButtons = Array.from({ length: MAX_LEVEL }, (_, i) => {
      const n = i + 1;
      return new TextPushButton(String(n), {
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        font: new PhetFont(FONT_SIZE.label),
        textFill: LIGHT_SURFACE_TEXT_FILL,
        xMargin: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.LEVEL_BUTTONS_X_MARGIN,
        yMargin: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.LEVEL_BUTTONS_Y_MARGIN,
        listener: () => model.moveElectronTo(n),
        enabledProperty: new DerivedProperty(
          [model.levelProperty, model.ionizedProperty, model.modeProperty],
          (level, ionized, mode) => model.canMoveTo(n, level, ionized, mode),
        ),
        accessibleName: new DerivedProperty([a11y.levelButtonStringProperty], (pattern) =>
          StringUtils.fillIn(pattern, { n }),
        ),
      });
    });
    const absorptionHint = new RichText(strings.moveElectronAbsorptionHintStringProperty, {
      font: new PhetFont(FONT_SIZE.tiny),
      fill: LightAndAtomsColors.mutedTextColorProperty,
      lineWrap: PANEL_WIDTH,
      visibleProperty: new DerivedProperty([model.modeProperty], (mode) => mode === HydrogenMode.ABSORPTION),
    });
    const recaptureButton = pushButton(strings.recaptureStringProperty, () => model.recaptureElectron());
    recaptureButton.visibleProperty = model.ionizedProperty;

    const unitRadio = radioGroup(
      model.energyUnitProperty,
      [
        { value: EnergyUnit.JOULES, label: StringManager.getInstance().getUnitStrings().joulesStringProperty },
        {
          value: EnergyUnit.ELECTRONVOLTS,
          label: StringManager.getInstance().getUnitStrings().electronvoltsStringProperty,
        },
      ],
      strings.energyUnitsStringProperty,
      HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.ENERGY_UNIT_RADIO_GROUP_MAX_WIDTH,
      "horizontal",
    );
    const autoRelaxCheckbox = checkbox(model.autoRelaxProperty, strings.autoRelaxStringProperty, PANEL_WIDTH - 24);
    const equationsCheckbox = checkbox(
      model.showEquationsProperty,
      common.showEquationsStringProperty,
      PANEL_WIDTH - 24,
    );

    const controlPanel = new LightAndAtomsPanel(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING,
        children: [
          heading(strings.modeStringProperty, PANEL_WIDTH),
          modeRadio,
          label(strings.moveElectronStringProperty, PANEL_WIDTH),
          new HBox({ spacing: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.CONTROL_PANEL_SPACING, children: levelButtons }),
          absorptionHint,
          recaptureButton,
          autoRelaxCheckbox,
          new HBox({
            spacing: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.CONTROL_PANEL_ITEM_8_SPACING,
            children: [
              label(strings.energyUnitsStringProperty, HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.ENERGY_UNITS_LABEL_MAX_WIDTH),
              unitRadio,
            ],
          }),
          equationsCheckbox,
        ],
      }),
    );
    this.addChild(controlPanel);

    // ── Lamp (absorption mode) ────────────────────────────────────────────────
    const regionRadio = radioGroup(
      model.photonRegionProperty,
      [
        { value: PhotonRegion.ULTRAVIOLET, label: common.ultravioletStringProperty },
        {
          value: PhotonRegion.VISIBLE,
          label: StringManager.getInstance().getEMSpectrumStrings().regions.visibleStringProperty,
        },
        { value: PhotonRegion.INFRARED, label: common.infraredStringProperty },
      ],
      strings.lampRegionStringProperty,
      HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.PHOTON_REGION_RADIO_GROUP_MAX_WIDTH,
      "horizontal",
    );
    const wavelengthControls = [
      { region: PhotonRegion.ULTRAVIOLET, range: PHOTON_UV_RANGE_NM },
      { region: PhotonRegion.VISIBLE, range: PHOTON_VISIBLE_RANGE_NM },
      { region: PhotonRegion.INFRARED, range: PHOTON_IR_RANGE_NM },
    ].map(
      ({ region, range }) =>
        new NumberControl(common.wavelengthStringProperty, model.wavelengthPropertyFor(region), range, {
          ...LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS,
          delta: PHOTON_WAVELENGTH_DELTA_NM,
          titleNodeOptions: {
            fill: LightAndAtomsColors.textColorProperty,
            font: new PhetFont(FONT_SIZE.label),
            maxWidth: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.WAVELENGTH_CONTROLS_MAX_WIDTH,
          },
          numberDisplayOptions: {
            decimalPlaces: 1,
            valuePattern: StringManager.getInstance().getLineSpectraStrings().cursorReadoutStringProperty,
          },
          sliderOptions: {
            ...LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS.sliderOptions,
            keyboardStep: 1,
            shiftKeyboardStep: PHOTON_WAVELENGTH_DELTA_NM,
            pageKeyboardStep: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.WAVELENGTH_CONTROLS_PAGE_KEYBOARD_STEP,
          },
          accessibleName: a11y.lampWavelengthStringProperty,
          visibleProperty: new DerivedProperty([model.photonRegionProperty], (active) => active === region),
        }),
    );
    const fireButton = pushButton(strings.fireStringProperty, () => model.firePhoton());
    fireButton.enabledProperty = new DerivedProperty([model.lampOnProperty], (on) => !on);
    const lampOnCheckbox = checkbox(model.lampOnProperty, strings.lampOnStringProperty, PANEL_WIDTH - 24);

    const lampPanel = new LightAndAtomsPanel(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING,
        children: [
          heading(strings.lampStringProperty, PANEL_WIDTH),
          regionRadio,
          new Node({ children: wavelengthControls }),
          new HBox({
            spacing: HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.LAMP_PANEL_SPACING,
            children: [fireButton, lampOnCheckbox],
          }),
        ],
      }),
      {
        visibleProperty: new DerivedProperty([model.modeProperty], (mode) => mode === HydrogenMode.ABSORPTION),
        minWidth: controlPanel.width,
      },
    );
    this.addChild(lampPanel);

    // The control panel grows when the absorption hint or Recapture button appears; keep both
    // panels pinned to the right edge and stacked.
    Multilink.multilink([controlPanel.localBoundsProperty, lampPanel.localBoundsProperty], () => {
      controlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
      controlPanel.top = SCREEN_VIEW_MARGIN;
      lampPanel.right = controlPanel.right;
      lampPanel.top = controlPanel.bottom + 10;
    });

    // ── Equations ─────────────────────────────────────────────────────────────
    const equationsPanel = new EquationsPanel(createHydrogenEquationLines(model), model.showEquationsProperty, 640);
    equationsPanel.localBoundsProperty.link(() => {
      equationsPanel.left = SCREEN_VIEW_MARGIN;
      equationsPanel.top = spectrum.bottom + HYDROGEN_ATOM_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    });
    this.addChild(equationsPanel);

    // ── Reset All ─────────────────────────────────────────────────────────────
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // ── Announcements ─────────────────────────────────────────────────────────
    const colorNames = a11y.colors;
    const colorNameProperties = {
      ultraviolet: colorNames.ultravioletStringProperty,
      violet: colorNames.violetStringProperty,
      blue: colorNames.blueStringProperty,
      cyan: colorNames.cyanStringProperty,
      green: colorNames.greenStringProperty,
      yellow: colorNames.yellowStringProperty,
      orange: colorNames.orangeStringProperty,
      red: colorNames.redStringProperty,
      infrared: colorNames.infraredStringProperty,
    } as const;
    const seriesNames: Record<ReturnType<typeof seriesOf>, TReadOnlyProperty<string>> = {
      lyman: strings.series.lymanStringProperty,
      balmer: strings.series.balmerStringProperty,
      paschen: strings.series.paschenStringProperty,
      brackett: strings.series.brackettStringProperty,
      pfund: strings.series.pfundStringProperty,
    };
    const describeEvent = (event: AtomEvent): string => {
      if (event.kind === "emitted" || event.kind === "absorbed") {
        const nm = metersToNm(event.wavelength);
        const pattern = event.kind === "emitted" ? a11y.emittedStringProperty : a11y.absorbedStringProperty;
        return StringUtils.fillIn(pattern.value, {
          from: event.from,
          to: event.to,
          wavelength: toSignificantFigures(nm, 3),
          color: colorNameProperties[colorName(nm)].value,
          series: seriesNames[seriesOf(Math.min(event.from, event.to))].value,
        });
      } else if (event.kind === "excited") {
        return StringUtils.fillIn(a11y.excitedStringProperty.value, { from: event.from, to: event.to });
      } else if (event.kind === "passedThrough") {
        return StringUtils.fillIn(a11y.passedThroughStringProperty.value, {
          wavelength: toSignificantFigures(metersToNm(event.wavelength), 3),
        });
      } else if (event.kind === "ionized") {
        return StringUtils.fillIn(a11y.ionizedEventStringProperty.value, {
          wavelength: toSignificantFigures(metersToNm(event.wavelength), 3),
        });
      }
      return a11y.recapturedStringProperty.value;
    };
    model.atomEventEmitter.addListener((event) => {
      // A steady stream would flood the screen reader with pass-throughs; announce only real events then.
      if (event.kind === "passedThrough" && model.lampOnProperty.value) {
        return;
      }
      this.addAccessibleResponse(describeEvent(event));
    });

    this.addChild(
      new Node({
        pdomOrder: [controlPanel, lampPanel, clearButton, resetAllButton],
      }),
    );
  }

  public override step(dt: number): void {
    this.atomNode.step(dt);
  }
}
