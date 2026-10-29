/**
 * MysteryPanel.ts
 *
 * The identification challenge: tick the gas (or two gases) you think is in the mystery tube, then
 * Check. Comparing the mystery spectrum with a reference gas (the Reference menu under the
 * eyepiece) is the intended method.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { GridBox, RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { LightAndAtomsPanel } from "../../common/LightAndAtomsPanel.js";
import { checkbox, heading, pushButton } from "../../common/view/ControlFactory.js";
import { StringManager } from "../../i18n/StringManager.js";
import LightAndAtomsColors from "../../LightAndAtomsColors.js";
import { FONT_SIZE, PANEL_ROW_SPACING } from "../../LightAndAtomsConstants.js";
import { TUBE_ELEMENTS } from "../model/AtomicLines.js";
import type { MysteryTube } from "../model/MysteryTube.js";
import { elementNameProperty } from "./elementNames.js";

export class MysteryPanel extends LightAndAtomsPanel {
  public constructor(mystery: MysteryTube, width: number) {
    const strings = StringManager.getInstance().getLineSpectraStrings();
    const a11y = StringManager.getInstance().getLineSpectraA11yStrings();

    const question = new RichText(
      new DerivedProperty(
        [mystery.twoGasesProperty, strings.mysteryQuestionStringProperty, strings.mysteryQuestionTwoStringProperty],
        (two, one, twoQuestion) => (two ? twoQuestion : one),
      ),
      {
        font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }),
        fill: LightAndAtomsColors.textColorProperty,
        lineWrap: width,
      },
    );

    const guessCheckboxes = TUBE_ELEMENTS.map((element) => {
      const property = mystery.guessProperties.get(element.id);
      if (!property) {
        throw new Error(`no guess for ${element.id}`);
      }
      return checkbox(property, elementNameProperty(element.id), width / 2 - 26);
    });
    const grid = new GridBox({
      xSpacing: 10,
      ySpacing: 5,
      xAlign: "left",
      autoColumns: 2,
      children: guessCheckboxes,
    });

    const anyGuessProperty = DerivedProperty.deriveAny([...mystery.guessProperties.values()], () => mystery.hasGuess());
    const checkButton = pushButton(strings.checkStringProperty, () => mystery.check());
    checkButton.enabledProperty = anyGuessProperty;
    const newButton = pushButton(strings.newMysteryStringProperty, () => mystery.newMystery());

    const feedback = new Text("", { font: new PhetFont({ size: FONT_SIZE.label, weight: "bold" }), maxWidth: width });
    DerivedProperty.deriveAny(
      [mystery.feedbackProperty, strings.correctStringProperty, strings.incorrectStringProperty],
      () => mystery.feedbackProperty.value,
    ).link((result) => {
      feedback.string =
        result === "correct"
          ? strings.correctStringProperty.value
          : result === "incorrect"
            ? strings.incorrectStringProperty.value
            : "";
      feedback.fill =
        result === "correct" ? LightAndAtomsColors.correctColorProperty : LightAndAtomsColors.incorrectColorProperty;
    });
    const score = new Text(
      new DerivedProperty(
        [mystery.correctCountProperty, mystery.attemptCountProperty, strings.scoreStringProperty],
        (correct, attempts, pattern) => StringUtils.fillIn(pattern, { correct, attempts }),
      ),
      { font: new PhetFont(FONT_SIZE.small), fill: LightAndAtomsColors.mutedTextColorProperty, maxWidth: width },
    );

    super(
      new VBox({
        align: "left",
        spacing: PANEL_ROW_SPACING,
        children: [
          heading(strings.sources.mysteryStringProperty, width),
          question,
          checkbox(mystery.twoGasesProperty, strings.twoGasesStringProperty, width - 24),
          grid,
          new VBox({ align: "left", spacing: 6, children: [checkButton, newButton] }),
          feedback,
          score,
        ],
      }),
    );

    // Announce the result of each check.
    mystery.feedbackProperty.lazyLink((result) => {
      if (result !== "none") {
        this.addAccessibleResponse(
          result === "correct" ? a11y.correctStringProperty.value : a11y.incorrectStringProperty.value,
        );
      }
    });
  }
}
