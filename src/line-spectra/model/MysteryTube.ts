/**
 * MysteryTube.ts
 *
 * The identification challenge: a discharge tube holding one gas (or, at the harder level, two)
 * chosen at random from the tube gases. The student ticks the gases they think are present and
 * checks the answer against the bright lines.
 */

import { BooleanProperty, NumberProperty, Property } from "scenerystack/axon";
import { dotRandom } from "scenerystack/dot";
import { type ElementId, type ElementSpectrum, TUBE_ELEMENTS } from "./AtomicLines.js";

export type MysteryFeedback = "none" | "correct" | "incorrect";

/**
 * Picks `count` distinct elements uniformly at random, avoiding the exact set `previous` so that
 * "New mystery tube" always changes something. `random` returns values in [0, 1).
 */
export function pickMystery(
  elements: readonly ElementSpectrum[],
  count: number,
  previous: readonly ElementSpectrum[],
  random: () => number,
): ElementSpectrum[] {
  const sameAsPrevious = (picked: ElementSpectrum[]): boolean =>
    picked.length === previous.length && picked.every((element) => previous.includes(element));

  for (let attempt = 0; ; attempt++) {
    const pool = [...elements];
    const picked: ElementSpectrum[] = [];
    while (picked.length < count && pool.length > 0) {
      const [element] = pool.splice(Math.floor(random() * pool.length), 1);
      if (element) {
        picked.push(element);
      }
    }
    // Give up on avoiding a repeat only if the random source keeps returning the same pick.
    if (!sameAsPrevious(picked) || attempt > 20) {
      return picked;
    }
  }
}

export class MysteryTube {
  /** Whether the tube holds two gases instead of one. */
  public readonly twoGasesProperty = new BooleanProperty(false);

  /** The hidden answer. */
  public readonly answerProperty: Property<readonly ElementSpectrum[]>;

  /** The student's guess: one Property per tube gas. */
  public readonly guessProperties: ReadonlyMap<ElementId, BooleanProperty>;

  /** Result of the last check, cleared when the guess or the tube changes. */
  public readonly feedbackProperty = new Property<MysteryFeedback>("none");

  /** Running score. */
  public readonly correctCountProperty = new NumberProperty(0);
  public readonly attemptCountProperty = new NumberProperty(0);

  /** Whether the current tube has already been answered correctly (so it is not scored twice). */
  private solved = false;

  /** Random source in [0, 1); dotRandom (seedable with ?randomSeed) unless a test supplies one. */
  private readonly random: () => number;

  public constructor(random: () => number = () => dotRandom.nextDouble()) {
    this.random = random;
    this.answerProperty = new Property<readonly ElementSpectrum[]>(pickMystery(TUBE_ELEMENTS, 1, [], this.random));
    this.guessProperties = new Map(TUBE_ELEMENTS.map((element) => [element.id, new BooleanProperty(false)]));

    for (const property of this.guessProperties.values()) {
      property.lazyLink(() => {
        this.feedbackProperty.value = "none";
      });
    }
    this.twoGasesProperty.lazyLink(() => this.newMystery());
  }

  /** Fills a new tube and clears the guess. */
  public newMystery(): void {
    const count = this.twoGasesProperty.value ? 2 : 1;
    this.answerProperty.value = pickMystery(TUBE_ELEMENTS, count, this.answerProperty.value, this.random);
    for (const property of this.guessProperties.values()) {
      property.reset();
    }
    this.feedbackProperty.value = "none";
    this.solved = false;
  }

  /** Compares the guess with the answer and updates the score. */
  public check(): void {
    const answerIds = new Set(this.answerProperty.value.map((element) => element.id));
    const correct = [...this.guessProperties].every(([id, property]) => property.value === answerIds.has(id));
    this.feedbackProperty.value = correct ? "correct" : "incorrect";
    if (!this.solved) {
      this.attemptCountProperty.value += 1;
      if (correct) {
        this.correctCountProperty.value += 1;
        this.solved = true;
      }
    }
  }

  /** Whether any gas is ticked (the Check button needs at least one). */
  public hasGuess(): boolean {
    return [...this.guessProperties.values()].some((property) => property.value);
  }

  public reset(): void {
    this.twoGasesProperty.reset();
    this.correctCountProperty.reset();
    this.attemptCountProperty.reset();
    this.newMystery();
  }
}
