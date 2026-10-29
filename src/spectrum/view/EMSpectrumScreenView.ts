/**
 * EMSpectrumScreenView.ts
 *
 * The EM Spectrum screen: the logarithmic spectrum bar with one or two draggable photon markers,
 * the magnified visible strip, an animated wave per photon, readouts of λ, ν and E, a menu of
 * everyday examples, and (on request) the worked equations c = λν and E = hν.
 */

import { DerivedProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Line, Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { Checkbox, ComboBox, type ComboBoxItem } from "scenerystack/sun";
import {
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  LIGHT_AND_ATOMS_COMBO_BOX_OPTIONS,
  LIGHT_SURFACE_TEXT_FILL,
} from "../../common/LightAndAtomsButtonOptions.js";
import { LIGHT_AND_ATOMS_CHECKBOX_OPTIONS } from "../../common/LightAndAtomsControlOptions.js";
import { metersToNm } from "../../common/model/PhotonUtils.js";
import { EquationsPanel } from "../../common/view/EquationsPanel.js";
import { formatWavelength } from "../../common/view/formatReadouts.js";
import { SpectrumMarkerNode } from "../../common/view/SpectrumMarkerNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import {
  FONT_SIZE,
  LOG_WAVELENGTH_RANGE,
  MARKER_KEYBOARD_STEP,
  MARKER_PAGE_KEYBOARD_STEP,
  MARKER_SHIFT_KEYBOARD_STEP,
  SCREEN_VIEW_MARGIN,
  VISIBLE_MAX_NM,
  VISIBLE_MIN_NM,
} from "../../LightAndAtomsConstants.js";
import type { LightAndAtomsPreferencesModel } from "../../preferences/LightAndAtomsPreferencesModel.js";
import { EM_EXAMPLES, type EMExample, type EMExampleId, regionOf } from "../model/EMRegion.js";
import type { EMSpectrumModel, PhotonState } from "../model/EMSpectrumModel.js";
import { createEMEquationLines } from "./EMEquations.js";
import { BAR_HEIGHT, EMSpectrumBarNode, ZOOM_HEIGHT, ZOOM_TOP } from "./EMSpectrumBarNode.js";
import { EMSpectrumScreenSummaryContent } from "./EMSpectrumScreenSummaryContent.js";
import { PhotonReadoutPanel } from "./PhotonReadoutPanel.js";
import { regionStringProperty } from "./regionStrings.js";
import { logScreenWavelength, sharedScreenWavelengths, WaveNode } from "./WaveNode.js";

/** Top of the spectrum bar, px. */
const BAR_TOP = 62;
/** Top of the lower half (waves, readouts), px. */
const LOWER_TOP = BAR_TOP + ZOOM_TOP + ZOOM_HEIGHT + 24;
/** Wave boxes, px. */
const WAVE_WIDTH = 500;
const WAVE_HEIGHT = 76;
const WAVE_GAP = 8;
/** Gap between the left column and the readout panels, px. */
const COLUMN_GAP = 20;

export type EMSpectrumScreenViewOptions = ScreenViewOptions;

export class EMSpectrumScreenView extends ScreenView {
  private readonly model: EMSpectrumModel;
  private readonly waveNodes: WaveNode[];

  public constructor(
    model: EMSpectrumModel,
    preferences: LightAndAtomsPreferencesModel,
    providedOptions?: EMSpectrumScreenViewOptions,
  ) {
    const options = optionize<EMSpectrumScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new EMSpectrumScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    this.model = model;

    const strings = StringManager.getInstance().getEMSpectrumStrings();
    const common = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getEMSpectrumA11yStrings();
    const inverseSecondsProperty = preferences.inverseSecondsProperty;

    // ── Spectrum bar with markers ─────────────────────────────────────────────
    const bar = new EMSpectrumBarNode();
    bar.x = (this.layoutBounds.width - bar.logToX(LOG_WAVELENGTH_RANGE.max)) / 2;
    bar.y = BAR_TOP;
    this.addChild(bar);

    const createMarker = (
      photon: PhotonState,
      color: typeof LightAndAtomsColors.photon1ColorProperty,
      nameProperty: TReadOnlyProperty<string>,
      handleAtTop: boolean,
      visibleProperty?: TReadOnlyProperty<boolean>,
    ): SpectrumMarkerNode =>
      new SpectrumMarkerNode(photon.logWavelengthProperty, LOG_WAVELENGTH_RANGE, {
        lineHeight: BAR_HEIGHT,
        handleAtTop,
        color,
        valueToX: (log) => bar.logToX(log),
        xToValue: (x) => bar.xToLog(x),
        keyboardStep: MARKER_KEYBOARD_STEP,
        shiftKeyboardStep: MARKER_SHIFT_KEYBOARD_STEP,
        pageKeyboardStep: MARKER_PAGE_KEYBOARD_STEP,
        createAriaValueText: (log) => {
          const wavelength = 10 ** log;
          return StringUtils.fillIn(a11y.markerValueStringProperty.value, {
            wavelength: formatWavelength(wavelength),
            region: regionStringProperty(regionOf(wavelength).id).value,
          });
        },
        ariaValueDependencies: [a11y.markerValueStringProperty, ...Object.values(strings.regions)],
        accessibleName: nameProperty,
        accessibleHelpText: a11y.markerHelpStringProperty,
        ...(visibleProperty ? { visibleProperty } : {}),
      });

    const marker1 = createMarker(
      model.photon1,
      LightAndAtomsColors.photon1ColorProperty,
      a11y.marker1StringProperty,
      true,
    );
    const marker2 = createMarker(
      model.photon2,
      LightAndAtomsColors.photon2ColorProperty,
      a11y.marker2StringProperty,
      false,
      model.compareProperty,
    );
    bar.addChild(marker2);
    bar.addChild(marker1);

    // Each photon also gets a tick on the magnified visible strip while it is visible.
    const createZoomTick = (photon: PhotonState, color: typeof LightAndAtomsColors.photon1ColorProperty): Line => {
      const tick = new Line(0, ZOOM_TOP - 4, 0, ZOOM_TOP + ZOOM_HEIGHT + 4, { stroke: color, lineWidth: 3 });
      photon.wavelengthProperty.link((wavelength) => {
        const nm = metersToNm(wavelength);
        tick.x = bar.nmToZoomX(Math.min(VISIBLE_MAX_NM, Math.max(VISIBLE_MIN_NM, nm)));
        tick.visible = nm >= VISIBLE_MIN_NM && nm <= VISIBLE_MAX_NM;
      });
      return tick;
    };
    const zoomTick1 = createZoomTick(model.photon1, LightAndAtomsColors.photon1ColorProperty);
    const zoomTick2 = createZoomTick(model.photon2, LightAndAtomsColors.photon2ColorProperty);
    model.compareProperty.link((compare) => {
      zoomTick2.opacity = compare ? 1 : 0;
    });
    bar.addChild(zoomTick2);
    bar.addChild(zoomTick1);

    // ── Waves (left column) ───────────────────────────────────────────────────
    const left = SCREEN_VIEW_MARGIN;
    const wave1 = new WaveNode(
      model.photon1,
      strings.photon1StringProperty,
      LightAndAtomsColors.photon1ColorProperty,
      WAVE_WIDTH,
      WAVE_HEIGHT,
    );
    wave1.leftTop = wave1.leftTop.setXY(left, LOWER_TOP);
    const wave2 = new WaveNode(
      model.photon2,
      strings.photon2StringProperty,
      LightAndAtomsColors.photon2ColorProperty,
      WAVE_WIDTH,
      WAVE_HEIGHT,
    );
    wave2.leftTop = wave2.leftTop.setXY(left, LOWER_TOP + WAVE_HEIGHT + WAVE_GAP);
    model.compareProperty.link((compare) => {
      wave2.visible = compare;
    });
    this.waveNodes = [wave1, wave2];
    const waveCaption = new Text(
      new DerivedProperty(
        [
          strings.waveCaptionStringProperty,
          strings.notToScaleStringProperty,
          strings.sameScaleStringProperty,
          model.compareProperty,
        ],
        (caption, notToScale, sameScale, compare) => `${caption} (${compare ? sameScale : notToScale})`,
      ),
      {
        font: new PhetFont(FONT_SIZE.small),
        fill: LightAndAtomsColors.mutedTextColorProperty,
        left,
        top: LOWER_TOP + 2 * WAVE_HEIGHT + WAVE_GAP + 4,
        maxWidth: WAVE_WIDTH,
      },
    );
    this.addChild(wave1);
    this.addChild(wave2);
    this.addChild(waveCaption);

    // ── Controls under the waves ──────────────────────────────────────────────
    const exampleProperty = new Property<EMExample | null>(null);
    const exampleNames: Record<EMExampleId, TReadOnlyProperty<string>> = {
      cobalt60: strings.examples.cobalt60StringProperty,
      medicalXRay: strings.examples.medicalXRayStringProperty,
      germicidalUV: strings.examples.germicidalUVStringProperty,
      sunburnUV: strings.examples.sunburnUVStringProperty,
      blackLight: strings.examples.blackLightStringProperty,
      violetLaser: strings.examples.violetLaserStringProperty,
      greenLaser: strings.examples.greenLaserStringProperty,
      sodiumLamp: strings.examples.sodiumLampStringProperty,
      redLaser: strings.examples.redLaserStringProperty,
      tvRemote: strings.examples.tvRemoteStringProperty,
      bodyHeat: strings.examples.bodyHeatStringProperty,
      microwaveOven: strings.examples.microwaveOvenStringProperty,
      fmRadio: strings.examples.fmRadioStringProperty,
      amRadio: strings.examples.amRadioStringProperty,
    };
    const itemFont = new PhetFont(FONT_SIZE.small);
    const exampleItems: ComboBoxItem<EMExample | null>[] = [
      {
        value: null,
        createNode: () =>
          new Text(strings.chooseExampleStringProperty, { font: itemFont, fill: LIGHT_SURFACE_TEXT_FILL }),
        accessibleName: strings.chooseExampleStringProperty,
      },
      ...EM_EXAMPLES.map((example) => ({
        value: example,
        createNode: () => new Text(exampleNames[example.id], { font: itemFont, fill: LIGHT_SURFACE_TEXT_FILL }),
        accessibleName: exampleNames[example.id],
      })),
    ];
    const listParent = new Node();
    const exampleComboBox = new ComboBox(exampleProperty, exampleItems, listParent, {
      ...LIGHT_AND_ATOMS_COMBO_BOX_OPTIONS,
      accessibleName: a11y.examplesStringProperty,
    });

    // Choosing an example moves photon 1 there; moving photon 1 away clears the choice.
    exampleProperty.link((example) => {
      if (example) {
        model.photon1.setWavelength(example.wavelength);
      }
    });
    model.photon1.logWavelengthProperty.link((log) => {
      const example = exampleProperty.value;
      if (example && Math.abs(Math.log10(example.wavelength) - log) > 1e-9) {
        exampleProperty.value = null;
      }
    });

    const checkboxLabel = (stringProperty: TReadOnlyProperty<string>): Text =>
      new Text(stringProperty, {
        font: new PhetFont(FONT_SIZE.label),
        fill: LightAndAtomsColors.textColorProperty,
        maxWidth: 220,
      });
    const compareCheckbox = new Checkbox(model.compareProperty, checkboxLabel(strings.compareStringProperty), {
      ...LIGHT_AND_ATOMS_CHECKBOX_OPTIONS,
      accessibleName: strings.compareStringProperty,
    });
    const equationsCheckbox = new Checkbox(
      model.showEquationsProperty,
      checkboxLabel(common.showEquationsStringProperty),
      {
        ...LIGHT_AND_ATOMS_CHECKBOX_OPTIONS,
        accessibleName: common.showEquationsStringProperty,
      },
    );
    const controls = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new HBox({
          spacing: 8,
          children: [
            new Text(strings.examplesTitleStringProperty, {
              font: new PhetFont(FONT_SIZE.label),
              fill: LightAndAtomsColors.textColorProperty,
              maxWidth: 100,
            }),
            exampleComboBox,
          ],
        }),
        new HBox({ spacing: 24, children: [compareCheckbox, equationsCheckbox] }),
      ],
      left,
      top: waveCaption.bottom + 10,
    });
    this.addChild(controls);

    // ── Equations ─────────────────────────────────────────────────────────────
    const equationLines = createEMEquationLines(model.photon1, inverseSecondsProperty);
    const equationsPanel = new EquationsPanel([equationLines], model.showEquationsProperty, WAVE_WIDTH - 24);
    equationsPanel.left = left;
    equationsPanel.top = controls.bottom + 8;
    this.addChild(equationsPanel);

    // ── Readouts (right column) ───────────────────────────────────────────────
    const readout1 = new PhotonReadoutPanel(
      model.photon1,
      strings.photon1StringProperty,
      LightAndAtomsColors.photon1ColorProperty,
      inverseSecondsProperty,
      null,
    );
    readout1.left = left + WAVE_WIDTH + COLUMN_GAP;
    readout1.top = LOWER_TOP;
    const readout2 = new PhotonReadoutPanel(
      model.photon2,
      strings.photon2StringProperty,
      LightAndAtomsColors.photon2ColorProperty,
      inverseSecondsProperty,
      model.photon1,
    );
    readout2.left = readout1.right + 10;
    readout2.top = LOWER_TOP;
    model.compareProperty.link((compare) => {
      readout2.visible = compare;
    });
    this.addChild(readout1);
    this.addChild(readout2);

    // ── Reset All ─────────────────────────────────────────────────────────────
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        exampleProperty.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    // The combo box list goes on top of everything.
    this.addChild(listParent);

    this.addChild(
      new Node({
        pdomOrder: [marker1, marker2, exampleComboBox, compareCheckbox, equationsCheckbox, resetAllButton],
      }),
    );
  }

  /** Resets view-side state; the waves restart with the model clock. */
  public reset(): void {
    this.step(0);
  }

  /** Redraws the waves at the model clock's time: one alone on a log scale, two at a shared scale. */
  public override step(_dt: number): void {
    const time = this.model.timer.timeProperty.value;
    const [wave1, wave2] = this.waveNodes;
    const { photon1, photon2 } = this.model;
    if (this.model.compareProperty.value) {
      const [screen1, screen2] = sharedScreenWavelengths(
        photon1.wavelengthProperty.value,
        photon2.wavelengthProperty.value,
      );
      wave1?.update(time, screen1);
      wave2?.update(time, screen2);
    } else {
      wave1?.update(time, logScreenWavelength(photon1.logWavelengthProperty.value));
    }
  }
}
