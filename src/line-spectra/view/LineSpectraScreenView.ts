import { LINE_SPECTRA_SCREEN_VIEW_SETTINGS } from "../../LightAndAtomsConstants.js";
/**
 * LineSpectraScreenView.ts
 *
 * The Line Spectra screen: choose a light source (left), see it glow and send its light into a
 * spectroscope (top), see the strip of colour in the eyepiece, compare it with a reference gas, and
 * read wavelengths off the intensity chart with a cursor that runs through the strips and the chart
 * alike. The mystery tube adds an identification challenge.
 */

import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { linear, toFixed } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Rectangle, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/LightAndAtomsButtonOptions.js";
import { LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS } from "../../common/LightAndAtomsControlOptions.js";
import { LightAndAtomsPanel } from "../../common/LightAndAtomsPanel.js";
import { sampleAt } from "../../common/model/SpectrumSynthesis.js";
import { checkbox, comboBox, heading, label, labeled, radioGroup } from "../../common/view/ControlFactory.js";
import { SpectrumMarkerNode } from "../../common/view/SpectrumMarkerNode.js";
import { SpectrumStripNode } from "../../common/view/SpectrumStripNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import {
  BULB_TEMPERATURE_RANGE,
  CURSOR_KEYBOARD_STEP_NM,
  CURSOR_PAGE_KEYBOARD_STEP_NM,
  CURSOR_SHIFT_KEYBOARD_STEP_NM,
  FONT_SIZE,
  PANEL_ROW_SPACING,
  SCREEN_VIEW_MARGIN,
  SPECTROSCOPE_MAX_NM,
  SPECTROSCOPE_MIN_NM,
} from "../../LightAndAtomsConstants.js";
import { type ElementSpectrum, FLAME_ELEMENTS, TUBE_ELEMENTS } from "../model/AtomicLines.js";
import type { LineSpectraModel } from "../model/LineSpectraModel.js";
import { SourceType } from "../model/SourceType.js";
import { elementNameProperty } from "./elementNames.js";
import { IntensityChartNode } from "./IntensityChartNode.js";
import { LineSpectraScreenSummaryContent } from "./LineSpectraScreenSummaryContent.js";
import { MysteryPanel } from "./MysteryPanel.js";
import { SourceIllustrationNode } from "./SourceIllustrationNode.js";

/** Left edge and width shared by the strips and the chart, so wavelengths line up, px. */
const SPECTRUM_LEFT: number = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.SPECTRUM_LEFT;
const SPECTRUM_WIDTH: number = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.SPECTRUM_WIDTH;
/** Strip heights and the chart height, px. */
const EYEPIECE_HEIGHT: number = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.EYEPIECE_HEIGHT;
const SMALL_STRIP_HEIGHT: number = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.SMALL_STRIP_HEIGHT;
const CHART_HEIGHT: number = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.CHART_HEIGHT;
/** Width of the left control column's content, px. */
const PANEL_WIDTH: number = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.PANEL_WIDTH;

export type LineSpectraScreenViewOptions = ScreenViewOptions;

export class LineSpectraScreenView extends ScreenView {
  public constructor(model: LineSpectraModel, providedOptions?: LineSpectraScreenViewOptions) {
    const options = optionize<LineSpectraScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new LineSpectraScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);

    const strings = StringManager.getInstance().getLineSpectraStrings();
    const a11y = StringManager.getInstance().getLineSpectraA11yStrings();
    const listParent = new Node();

    // ── Source controls (left) ────────────────────────────────────────────────
    const sourceRadio = radioGroup(
      model.sourceTypeProperty,
      [
        { value: SourceType.DISCHARGE_TUBE, label: strings.sources.dischargeTubeStringProperty },
        { value: SourceType.FLAME_TEST, label: strings.sources.flameTestStringProperty },
        { value: SourceType.ABSORPTION, label: strings.sources.absorptionStringProperty },
        { value: SourceType.LIGHT_BULB, label: strings.sources.lightBulbStringProperty },
        { value: SourceType.SUN, label: strings.sources.sunStringProperty },
        { value: SourceType.MYSTERY, label: strings.sources.mysteryStringProperty },
      ],
      strings.sourceStringProperty,
      PANEL_WIDTH - 20,
    );

    const elementChoices = (elements: readonly ElementSpectrum[]) =>
      elements.map((element) => ({ value: element, label: elementNameProperty(element.id) }));
    const gasCombo = comboBox(
      model.tubeElementProperty,
      elementChoices(TUBE_ELEMENTS),
      listParent,
      strings.gasStringProperty,
      PANEL_WIDTH,
    );
    const saltCombo = comboBox(
      model.flameElementProperty,
      elementChoices(FLAME_ELEMENTS),
      listParent,
      strings.saltStringProperty,
      PANEL_WIDTH,
    );
    const units = StringManager.getInstance().getUnitStrings();
    const temperatureControl = new NumberControl(
      strings.temperatureStringProperty,
      model.bulbTemperatureProperty,
      BULB_TEMPERATURE_RANGE,
      {
        ...LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS,
        delta: LINE_SPECTRA_SCREEN_VIEW_SETTINGS.TEMPERATURE_CONTROL_DELTA,
        titleNodeOptions: {
          fill: LightAndAtomsColors.textColorProperty,
          font: new PhetFont(FONT_SIZE.label),
          maxWidth: PANEL_WIDTH - LINE_SPECTRA_SCREEN_VIEW_SETTINGS.TEMPERATURE_CONTROL_MAX_WIDTH_OFFSET,
        },
        numberDisplayOptions: {
          decimalPlaces: 0,
          valuePattern: new DerivedProperty(
            [units.valueUnitStringProperty, units.kelvinStringProperty],
            (pattern, kelvin) => StringUtils.fillIn(pattern, { value: "{{value}}", unit: kelvin }),
          ),
        },
        sliderOptions: {
          ...LIGHT_AND_ATOMS_NUMBER_CONTROL_OPTIONS.sliderOptions,
          keyboardStep: LINE_SPECTRA_SCREEN_VIEW_SETTINGS.TEMPERATURE_CONTROL_KEYBOARD_STEP,
          shiftKeyboardStep: LINE_SPECTRA_SCREEN_VIEW_SETTINGS.TEMPERATURE_CONTROL_SHIFT_KEYBOARD_STEP,
          pageKeyboardStep: LINE_SPECTRA_SCREEN_VIEW_SETTINGS.TEMPERATURE_CONTROL_PAGE_KEYBOARD_STEP,
        },
        accessibleName: strings.temperatureStringProperty,
      },
    );
    const comparisonCheckbox = checkbox(
      model.showEmissionComparisonProperty,
      strings.showEmissionStringProperty,
      PANEL_WIDTH - 24,
    );

    const isSource = (...types: SourceType[]): TReadOnlyProperty<boolean> =>
      new DerivedProperty([model.sourceTypeProperty], (sourceType) => types.includes(sourceType));
    const gasRow = labeled(strings.gasStringProperty, gasCombo, PANEL_WIDTH);
    gasRow.visibleProperty = isSource(SourceType.DISCHARGE_TUBE, SourceType.ABSORPTION);
    const saltRow = labeled(strings.saltStringProperty, saltCombo, PANEL_WIDTH);
    saltRow.visibleProperty = isSource(SourceType.FLAME_TEST);
    temperatureControl.visibleProperty = isSource(SourceType.LIGHT_BULB);
    comparisonCheckbox.visibleProperty = isSource(SourceType.ABSORPTION);

    const sourcePanel = new LightAndAtomsPanel(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING,
        children: [
          heading(strings.sourceStringProperty, PANEL_WIDTH),
          sourceRadio,
          gasRow,
          saltRow,
          temperatureControl,
          comparisonCheckbox,
        ],
      }),
      { minWidth: PANEL_WIDTH + LINE_SPECTRA_SCREEN_VIEW_SETTINGS.SOURCE_PANEL_MIN_WIDTH_OFFSET },
    );
    sourcePanel.left = SCREEN_VIEW_MARGIN;
    sourcePanel.top = SCREEN_VIEW_MARGIN;
    this.addChild(sourcePanel);

    const mysteryPanel = new MysteryPanel(model.mystery, PANEL_WIDTH);
    mysteryPanel.visibleProperty = isSource(SourceType.MYSTERY);
    sourcePanel.localBoundsProperty.link(() => {
      mysteryPanel.left = SCREEN_VIEW_MARGIN;
      mysteryPanel.top = sourcePanel.bottom + LINE_SPECTRA_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_TOP_OFFSET;
    });
    this.addChild(mysteryPanel);

    // ── Source picture and spectroscope (top) ─────────────────────────────────
    const illustration = new SourceIllustrationNode(model);
    illustration.left = SPECTRUM_LEFT;
    illustration.top = SCREEN_VIEW_MARGIN;
    this.addChild(illustration);

    // ── Strips ────────────────────────────────────────────────────────────────
    const stripOptions = { minWavelength: SPECTROSCOPE_MIN_NM, maxWavelength: SPECTROSCOPE_MAX_NM };
    const smallLabel = (text: TReadOnlyProperty<string>): Text =>
      new Text(text, {
        font: new PhetFont(FONT_SIZE.small),
        fill: LightAndAtomsColors.textColorProperty,
        maxWidth: SPECTRUM_WIDTH,
      });

    const eyepieceTitle = smallLabel(strings.eyepieceStringProperty);
    eyepieceTitle.left = SPECTRUM_LEFT;
    eyepieceTitle.top = illustration.bottom + 8;
    const eyepieceTop = eyepieceTitle.bottom + 4;
    const eyepiece = new SpectrumStripNode(model.spectrumProperty, SPECTRUM_WIDTH, EYEPIECE_HEIGHT, {
      ...stripOptions,
      x: SPECTRUM_LEFT,
      y: eyepieceTop,
    });
    const eyepieceFrame = new Rectangle(SPECTRUM_LEFT, eyepieceTop, SPECTRUM_WIDTH, EYEPIECE_HEIGHT, {
      stroke: LightAndAtomsColors.chartAxisColorProperty,
    });

    // Comparison (absorption mode) and reference strips share one row below the eyepiece.
    const rowTop = eyepieceTop + EYEPIECE_HEIGHT + 8;
    const comparisonVisible = new DerivedProperty(
      [model.sourceTypeProperty, model.showEmissionComparisonProperty],
      (sourceType, show) => sourceType === SourceType.ABSORPTION && show,
    );
    const comparisonLabel = smallLabel(strings.emissionOfGasStringProperty);
    comparisonLabel.left = SPECTRUM_LEFT;
    comparisonLabel.top = rowTop;
    comparisonLabel.visibleProperty = comparisonVisible;
    const comparisonStrip = new SpectrumStripNode(
      model.comparisonSpectrumProperty,
      SPECTRUM_WIDTH,
      SMALL_STRIP_HEIGHT,
      {
        ...stripOptions,
        x: SPECTRUM_LEFT,
        y: comparisonLabel.bottom + 2,
        visibleProperty: comparisonVisible,
      },
    );

    const referenceChoices = [
      { value: null, label: strings.noneStringProperty },
      ...TUBE_ELEMENTS.map((element) => ({ value: element, label: elementNameProperty(element.id) })),
    ];
    const referenceCombo = comboBox<ElementSpectrum | null>(
      model.referenceElementProperty,
      referenceChoices,
      listParent,
      strings.referenceStringProperty,
      LINE_SPECTRA_SCREEN_VIEW_SETTINGS.REFERENCE_ELEMENT_COMBO_BOX_MAX_WIDTH,
    );
    const referenceRow = new HBox({
      spacing: LINE_SPECTRA_SCREEN_VIEW_SETTINGS.REFERENCE_ROW_SPACING,
      children: [
        label(strings.referenceStringProperty, LINE_SPECTRA_SCREEN_VIEW_SETTINGS.REFERENCE_LABEL_MAX_WIDTH),
        referenceCombo,
      ],
    });
    const referenceStripTop = (): number =>
      (comparisonVisible.value ? comparisonStrip.bottom : eyepieceTop + EYEPIECE_HEIGHT) + 8;
    const referenceStrip = new SpectrumStripNode(model.referenceSpectrumProperty, SPECTRUM_WIDTH, SMALL_STRIP_HEIGHT, {
      ...stripOptions,
      x: SPECTRUM_LEFT,
      visibleProperty: new DerivedProperty([model.referenceElementProperty], (element) => element !== null),
    });
    Multilink.multilink([comparisonVisible, referenceRow.localBoundsProperty], () => {
      referenceRow.left = SPECTRUM_LEFT;
      referenceRow.top = referenceStripTop();
      referenceStrip.top = referenceRow.bottom + 2;
    });

    // ── Chart ─────────────────────────────────────────────────────────────────
    const chart = new IntensityChartNode(model.spectrumProperty, SPECTRUM_WIDTH, CHART_HEIGHT);
    chart.x = SPECTRUM_LEFT;
    chart.y =
      this.layoutBounds.maxY -
      SCREEN_VIEW_MARGIN -
      LINE_SPECTRA_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_Y_OFFSET -
      CHART_HEIGHT;

    this.addChild(eyepieceTitle);
    this.addChild(eyepiece);
    this.addChild(eyepieceFrame);
    this.addChild(comparisonLabel);
    this.addChild(comparisonStrip);
    this.addChild(referenceRow);
    this.addChild(referenceStrip);
    this.addChild(chart);

    // ── Wavelength cursor through the strips and the chart ────────────────────
    const nmToX = (nm: number): number => linear(SPECTROSCOPE_MIN_NM, SPECTROSCOPE_MAX_NM, 0, SPECTRUM_WIDTH, nm);
    const cursorLayer = new Node({ x: SPECTRUM_LEFT, y: eyepieceTop });
    const cursor = new SpectrumMarkerNode(model.cursorWavelengthProperty, model.cursorWavelengthProperty.range, {
      lineHeight: chart.y + CHART_HEIGHT - eyepieceTop,
      handleAtTop: true,
      color: LightAndAtomsColors.photon1ColorProperty,
      valueToX: nmToX,
      xToValue: (x) => linear(0, SPECTRUM_WIDTH, SPECTROSCOPE_MIN_NM, SPECTROSCOPE_MAX_NM, x),
      keyboardStep: CURSOR_KEYBOARD_STEP_NM,
      shiftKeyboardStep: CURSOR_SHIFT_KEYBOARD_STEP_NM,
      pageKeyboardStep: CURSOR_PAGE_KEYBOARD_STEP_NM,
      createAriaValueText: (nm) =>
        StringUtils.fillIn(a11y.cursorValueStringProperty.value, {
          value: toFixed(nm, 1),
          intensity: Math.round(100 * sampleAt(model.spectrumProperty.value, nm)),
        }),
      ariaValueDependencies: [a11y.cursorValueStringProperty, model.spectrumProperty],
      accessibleName: a11y.cursorStringProperty,
      accessibleHelpText: a11y.cursorHelpStringProperty,
    });
    cursor.opacity = LINE_SPECTRA_SCREEN_VIEW_SETTINGS.OPACITY_OPACITY;
    cursorLayer.addChild(cursor);
    this.addChild(cursorLayer);

    const cursorReadout = new Text("", {
      font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
      fill: LightAndAtomsColors.photon1ColorProperty,
    });
    Multilink.multilink([model.cursorWavelengthProperty, strings.cursorReadoutStringProperty], (nm, pattern) => {
      cursorReadout.string = StringUtils.fillIn(pattern, { value: toFixed(nm, 1) });
      cursorReadout.right = SPECTRUM_LEFT + SPECTRUM_WIDTH;
      cursorReadout.bottom = chart.y - LINE_SPECTRA_SCREEN_VIEW_SETTINGS.CONSTRUCTOR_BOTTOM_OFFSET;
    });
    this.addChild(cursorReadout);

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
    this.addChild(listParent);

    this.addChild(
      new Node({
        pdomOrder: [sourcePanel, mysteryPanel, referenceCombo, cursor, resetAllButton],
      }),
    );
  }
}
