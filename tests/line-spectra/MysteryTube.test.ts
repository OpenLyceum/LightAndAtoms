/**
 * MysteryTube.test.ts
 *
 * The identification challenge: random picks, checking and scoring.
 */

import { describe, expect, it } from "vitest";
import { TUBE_ELEMENTS } from "../../src/line-spectra/model/AtomicLines.js";
import { MysteryTube, pickMystery } from "../../src/line-spectra/model/MysteryTube.js";

/** A deterministic random source (linear congruential generator) for repeatable tests. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("MysteryTube", () => {
  it("picks distinct elements and is repeatable for a seed", () => {
    const a = pickMystery(TUBE_ELEMENTS, 2, [], seededRandom(7));
    const b = pickMystery(TUBE_ELEMENTS, 2, [], seededRandom(7));
    expect(a).toEqual(b);
    expect(a[0]).not.toBe(a[1]);
  });

  it("avoids repeating the previous tube", () => {
    const random = seededRandom(3);
    let previous = pickMystery(TUBE_ELEMENTS, 1, [], random);
    for (let i = 0; i < 50; i++) {
      const next = pickMystery(TUBE_ELEMENTS, 1, previous, random);
      expect(next).not.toEqual(previous);
      previous = next;
    }
  });

  it("scores a correct guess once and an incorrect one as an attempt", () => {
    const mystery = new MysteryTube(seededRandom(11));
    const answer = mystery.answerProperty.value[0];
    const wrong = TUBE_ELEMENTS.find((element) => element !== answer);
    if (!(answer && wrong)) {
      throw new Error("bad setup");
    }
    mystery.guessProperties.get(wrong.id)?.set(true);
    mystery.check();
    expect(mystery.feedbackProperty.value).toBe("incorrect");
    expect(mystery.attemptCountProperty.value).toBe(1);

    mystery.guessProperties.get(wrong.id)?.set(false);
    expect(mystery.feedbackProperty.value).toBe("none");
    mystery.guessProperties.get(answer.id)?.set(true);
    mystery.check();
    mystery.check();
    expect(mystery.feedbackProperty.value).toBe("correct");
    expect(mystery.correctCountProperty.value).toBe(1);
    expect(mystery.attemptCountProperty.value).toBe(2);
  });

  it("switches to two gases and clears the guess", () => {
    const mystery = new MysteryTube(seededRandom(5));
    mystery.guessProperties.get("neon")?.set(true);
    mystery.twoGasesProperty.value = true;
    expect(mystery.answerProperty.value).toHaveLength(2);
    expect(mystery.hasGuess()).toBe(false);
  });
});
