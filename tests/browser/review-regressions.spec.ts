import { expect, test } from "@playwright/test";
import type { ScreenView } from "scenerystack/sim";
import type { HydrogenAtomModel } from "../../src/hydrogen-atom/model/HydrogenAtomModel.js";
import type { EMSpectrumModel } from "../../src/spectrum/model/EMSpectrumModel.js";

type SimulationWindow<Model> = {
  phet: {
    joist: {
      sim: {
        selectedScreenProperty: { value: { model: Model; view: ScreenView } };
      };
    };
  };
};

test("clicking each hydrogen energy line selects that level", async ({ page }) => {
  await page.goto("/?ea");
  await page.getByRole("button", { name: "Hydrogen Atom Screen", exact: true }).press("Enter");

  for (let n = 1; n <= 6; n++) {
    const point = await page.evaluate((level) => {
      const screen = (window as unknown as SimulationWindow<HydrogenAtomModel>).phet.joist.sim.selectedScreenProperty
        .value;
      screen.model.resetAtom();
      screen.model.autoRelaxProperty.value = false;
      const diagram = screen.view.children.find((node) => node.constructor.name === "EnergyLevelDiagramNode");
      if (!diagram) {
        throw new Error("Energy-level diagram not found");
      }
      // The physical levels occupy y = 250 / n²; click their lines, not their fanned labels.
      const position = diagram.localToGlobalPoint(diagram.localBounds.center.setXY(90, 250 / level ** 2));
      return { x: position.x, y: position.y };
    }, n);
    await page.mouse.click(point.x, point.y);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as SimulationWindow<HydrogenAtomModel>).phet.joist.sim.selectedScreenProperty.value.model
              .levelProperty.value,
        ),
      )
      .toBe(n);
  }
});

test("comparison caption follows the actual drawing scale in either photon order", async ({ page }) => {
  await page.goto("/?ea");
  await page.getByRole("button", { name: "EM Spectrum Screen", exact: true }).press("Enter");

  const cases = [
    { first: 500e-9, second: 100e-9, compare: true, toScale: true },
    { first: 500e-9, second: 10e-9, compare: true, toScale: true },
    { first: 500e-9, second: 5e-9, compare: true, toScale: false },
    { first: 5e-9, second: 500e-9, compare: true, toScale: false },
    { first: 100e-9, second: 500e-9, compare: true, toScale: true },
    { first: 100e-9, second: 500e-9, compare: false, toScale: false },
  ];
  for (const settings of cases) {
    await page.evaluate(({ first, second, compare }) => {
      const model = (window as unknown as SimulationWindow<EMSpectrumModel>).phet.joist.sim.selectedScreenProperty.value
        .model;
      model.photon1.setWavelength(first);
      model.photon2.setWavelength(second);
      model.compareProperty.value = compare;
    }, settings);
    const expected = settings.toScale ? /Both waves drawn to the same scale/ : /Wave not to scale/;
    await expect(page.locator("svg").getByText(expected)).toHaveCount(1);
  }
});
