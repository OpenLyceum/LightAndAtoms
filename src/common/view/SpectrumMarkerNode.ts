/**
 * SpectrumMarkerNode.ts
 *
 * A draggable vertical marker on a horizontal spectrum axis: a line with a triangular handle. It
 * mixes in AccessibleSlider, so it is focusable and the arrow keys (Shift for fine, Page Up/Down for
 * coarse, Home/End for the ends) move it, with a spoken value. Pointer dragging writes the same
 * Property, so the two stay in sync.
 *
 * The marker does not know the axis scale: the owner supplies `valueToX` and `xToValue` in the
 * parent's coordinate frame (the EM bar is logarithmic, the spectroscope chart linear).
 */

import { Property, type TProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { optionize } from "scenerystack/phet-core";
import { DragListener, Line, Node, type NodeOptions, Path, Rectangle, type TPaint } from "scenerystack/scenery";
import { AccessibleSlider, type AccessibleSliderOptions } from "scenerystack/sun";

/** Handle triangle width and height, px. */
const HANDLE_WIDTH = 14;
const HANDLE_HEIGHT = 11;
/** Half-width of the invisible pointer target around the line, px. */
const HIT_HALF_WIDTH = 7;

type SelfOptions = {
  /** Height of the line, px (the marker's origin is the top of the line). */
  lineHeight: number;
  /** Handle above the line (pointing down) or below it (pointing up). */
  handleAtTop?: boolean;
  color: TPaint;
  /** Model value → x in the parent frame, and back. */
  valueToX: (value: number) => number;
  xToValue: (x: number) => number;
  keyboardStep: number;
  shiftKeyboardStep: number;
  pageKeyboardStep: number;
  /** Spoken value text. */
  createAriaValueText: (value: number) => string;
  /** Extra Properties whose change should refresh the spoken value (e.g. locale strings). */
  ariaValueDependencies?: TReadOnlyProperty<unknown>[];
};

export type SpectrumMarkerNodeOptions = SelfOptions &
  Pick<NodeOptions, "accessibleName" | "accessibleHelpText" | "visibleProperty">;

const AccessibleSliderNode = AccessibleSlider(Node, 0);

export class SpectrumMarkerNode extends AccessibleSliderNode {
  private readonly disposeSpectrumMarkerNode: () => void;

  public constructor(valueProperty: TProperty<number>, range: Range, providedOptions: SpectrumMarkerNodeOptions) {
    const options = optionize<SpectrumMarkerNodeOptions, SelfOptions, NodeOptions>()(
      { handleAtTop: true, ariaValueDependencies: [] },
      providedOptions,
    );
    const enabledRangeProperty = new Property(range);

    const superOptions: AccessibleSliderOptions & NodeOptions = {
      valueProperty,
      enabledRangeProperty,
      keyboardStep: options.keyboardStep,
      shiftKeyboardStep: options.shiftKeyboardStep,
      pageKeyboardStep: options.pageKeyboardStep,
      pdomCreateAriaValueText: (value: number) => options.createAriaValueText(value),
      pdomDependencies: options.ariaValueDependencies,
      accessibleName: options.accessibleName,
      accessibleHelpText: options.accessibleHelpText,
      cursor: "ew-resize",
    };
    if (options.visibleProperty) {
      superOptions.visibleProperty = options.visibleProperty;
    }
    super(superOptions);

    const h = options.lineHeight;
    const handleShape = options.handleAtTop
      ? new Shape()
          .moveTo(-HANDLE_WIDTH / 2, -HANDLE_HEIGHT)
          .lineTo(HANDLE_WIDTH / 2, -HANDLE_HEIGHT)
          .lineTo(0, 0)
          .close()
      : new Shape()
          .moveTo(-HANDLE_WIDTH / 2, h + HANDLE_HEIGHT)
          .lineTo(HANDLE_WIDTH / 2, h + HANDLE_HEIGHT)
          .lineTo(0, h)
          .close();

    // A dark halo under the coloured line keeps it visible over any region colour.
    this.children = [
      new Rectangle(-HIT_HALF_WIDTH, -HANDLE_HEIGHT, 2 * HIT_HALF_WIDTH, h + 2 * HANDLE_HEIGHT, {
        fill: "rgba(0,0,0,0.01)",
      }),
      new Line(0, 0, 0, h, { stroke: "black", lineWidth: 4, opacity: 0.6 }),
      new Line(0, 0, 0, h, { stroke: options.color, lineWidth: 2 }),
      new Path(handleShape, { fill: options.color, stroke: "black", lineWidth: 1 }),
    ];

    const dragListener = new DragListener({
      drag: (event) => {
        const parent = this.getParent();
        if (parent) {
          const x = parent.globalToLocalPoint(event.pointer.point).x;
          valueProperty.value = range.constrainValue(options.xToValue(x));
        }
      },
    });
    this.addInputListener(dragListener);

    const updatePosition = (value: number): void => {
      this.x = options.valueToX(value);
    };
    valueProperty.link(updatePosition);

    this.disposeSpectrumMarkerNode = () => {
      valueProperty.unlink(updatePosition);
      this.removeInputListener(dragListener);
      dragListener.dispose();
      enabledRangeProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSpectrumMarkerNode();
    super.dispose();
  }
}
