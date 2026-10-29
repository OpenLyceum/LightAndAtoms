/**
 * AtomicLines.ts
 *
 * The emission lines of every source on the Line Spectra screen, between 380 and 780 nm.
 *
 * Wavelengths of atomic lines are air wavelengths from the NIST Atomic Spectra Database
 * (https://physics.nist.gov/asd), rounded to 0.01 nm. Relative intensities are rounded to give the
 * appearance of a discharge tube or flame through a hand spectroscope: the strongest visible line of
 * each element is 1. NIST's tabulated intensities depend on the source and are not comparable
 * between elements, so they were used only to rank lines within an element.
 *
 * Flame colours of the alkaline-earth metals and copper come mostly from molecules formed in the
 * flame (CaOH, SrOH, BaOH, CuCl, CuOH), not from free atoms. Those are given as bands with a width
 * σ (nm) at approximate band-head positions (Pearse & Gaydon, *The Identification of Molecular
 * Spectra*); they are qualitative.
 *
 * Fraunhofer lines are the strongest dark lines in the solar spectrum, with their classic letters;
 * the A and B bands are absorption by O₂ in Earth's atmosphere.
 */

import type { SpectralFeature } from "../../common/model/SpectrumSynthesis.js";

/** Shorthand for an atomic line. */
function line(wavelength: number, intensity: number): SpectralFeature {
  return { wavelength, intensity, width: 0 };
}

/** Shorthand for a molecular band. */
function band(wavelength: number, intensity: number, width: number): SpectralFeature {
  return { wavelength, intensity, width };
}

export type ElementId =
  | "hydrogen"
  | "helium"
  | "neon"
  | "sodium"
  | "mercury"
  | "argon"
  | "krypton"
  | "lithium"
  | "potassium"
  | "calcium"
  | "strontium"
  | "barium"
  | "copper";

export type ElementSpectrum = {
  readonly id: ElementId;
  readonly symbol: string;
  readonly features: readonly SpectralFeature[];
};

const HYDROGEN: ElementSpectrum = {
  id: "hydrogen",
  symbol: "H",
  // The Balmer series (n → 2): Hα, Hβ, Hγ, Hδ, Hε.
  features: [line(397.01, 0.05), line(410.17, 0.1), line(434.05, 0.2), line(486.13, 0.45), line(656.28, 1)],
};

const HELIUM: ElementSpectrum = {
  id: "helium",
  symbol: "He",
  features: [
    line(388.86, 0.5),
    line(396.47, 0.08),
    line(402.62, 0.12),
    line(438.79, 0.06),
    line(447.15, 0.4),
    line(471.31, 0.1),
    line(492.19, 0.1),
    line(501.57, 0.25),
    line(504.77, 0.05),
    line(587.56, 1),
    line(667.82, 0.3),
    line(706.52, 0.35),
    line(728.14, 0.1),
  ],
};

const NEON: ElementSpectrum = {
  id: "neon",
  symbol: "Ne",
  features: [
    line(533.08, 0.08),
    line(534.11, 0.08),
    line(540.06, 0.2),
    line(585.25, 0.6),
    line(588.19, 0.3),
    line(594.48, 0.4),
    line(597.55, 0.15),
    line(603.0, 0.3),
    line(607.43, 0.4),
    line(609.62, 0.45),
    line(614.31, 0.6),
    line(616.36, 0.3),
    line(621.73, 0.3),
    line(626.65, 0.45),
    line(630.48, 0.25),
    line(633.44, 0.45),
    line(638.3, 0.5),
    line(640.22, 1),
    line(650.65, 0.6),
    line(653.29, 0.3),
    line(659.9, 0.3),
    line(667.83, 0.4),
    line(671.7, 0.3),
    line(692.95, 0.5),
    line(703.24, 0.6),
    line(717.39, 0.2),
    line(724.52, 0.3),
    line(743.89, 0.15),
  ],
};

const SODIUM: ElementSpectrum = {
  id: "sodium",
  symbol: "Na",
  // The D doublet dominates; the rest are faint.
  features: [
    line(498.28, 0.02),
    line(568.26, 0.03),
    line(568.82, 0.04),
    line(589.0, 1),
    line(589.59, 0.5),
    line(615.42, 0.02),
    line(616.07, 0.02),
  ],
};

const MERCURY: ElementSpectrum = {
  id: "mercury",
  symbol: "Hg",
  features: [
    line(404.66, 0.4),
    line(407.78, 0.1),
    line(435.83, 1),
    line(491.6, 0.04),
    line(546.07, 0.8),
    line(576.96, 0.25),
    line(579.07, 0.25),
    line(623.44, 0.02),
    line(690.75, 0.02),
  ],
};

const ARGON: ElementSpectrum = {
  id: "argon",
  symbol: "Ar",
  // Neutral-atom (Ar I) red lines plus the ion (Ar II) blue lines that give the tube its lavender glow.
  features: [
    line(415.86, 0.2),
    line(419.83, 0.1),
    line(420.07, 0.15),
    line(425.94, 0.1),
    line(427.22, 0.08),
    line(434.81, 0.15),
    line(442.6, 0.06),
    line(454.51, 0.09),
    line(458.99, 0.06),
    line(460.96, 0.12),
    line(465.79, 0.07),
    line(472.69, 0.09),
    line(476.49, 0.12),
    line(480.6, 0.15),
    line(484.78, 0.07),
    line(487.99, 0.18),
    line(496.51, 0.07),
    line(514.53, 0.06),
    line(555.87, 0.06),
    line(603.21, 0.05),
    line(696.54, 0.6),
    line(706.72, 0.5),
    line(714.7, 0.1),
    line(727.29, 0.3),
    line(738.4, 0.5),
    line(750.39, 1),
    line(751.47, 0.6),
    line(763.51, 0.8),
    line(772.38, 0.4),
  ],
};

const KRYPTON: ElementSpectrum = {
  id: "krypton",
  symbol: "Kr",
  features: [
    line(427.4, 0.3),
    line(428.3, 0.1),
    line(431.96, 0.3),
    line(436.26, 0.15),
    line(437.61, 0.1),
    line(440.0, 0.1),
    line(445.39, 0.15),
    line(446.37, 0.15),
    line(450.24, 0.2),
    line(556.22, 0.4),
    line(557.03, 1),
    line(587.09, 1),
    line(758.74, 0.4),
    line(760.15, 0.5),
    line(768.52, 0.4),
    line(769.45, 0.3),
  ],
};

const LITHIUM: ElementSpectrum = {
  id: "lithium",
  symbol: "Li",
  features: [line(460.29, 0.005), line(610.36, 0.05), line(670.78, 1)],
};

const POTASSIUM: ElementSpectrum = {
  id: "potassium",
  symbol: "K",
  // The strong resonance doublet is at the red edge of vision; the violet pair adds the lilac.
  features: [line(404.41, 0.15), line(404.72, 0.1), line(766.49, 1), line(769.9, 0.6)],
};

const CALCIUM: ElementSpectrum = {
  id: "calcium",
  symbol: "Ca",
  // Atomic 422.67 nm line plus the orange-red and green CaOH bands that dominate the flame.
  features: [line(422.67, 0.3), band(554, 0.5, 5), band(603, 0.35, 4), band(622, 1, 6)],
};

const STRONTIUM: ElementSpectrum = {
  id: "strontium",
  symbol: "Sr",
  // Atomic 460.73 nm line plus SrOH / SrCl bands across the red.
  features: [line(460.73, 0.4), band(606, 0.5, 4), band(646, 0.7, 6), band(659, 0.6, 4), band(682, 1, 6)],
};

const BARIUM: ElementSpectrum = {
  id: "barium",
  symbol: "Ba",
  // Atomic 553.55 nm line, Ba⁺ lines, and BaOH green bands.
  features: [
    line(455.4, 0.3),
    line(493.41, 0.2),
    band(487, 0.3, 4),
    band(513, 0.6, 5),
    band(524, 0.5, 5),
    line(553.55, 1),
  ],
};

const COPPER: ElementSpectrum = {
  id: "copper",
  symbol: "Cu",
  // A copper(II) chloride flame: blue CuCl bands, green CuOH band and atomic copper lines.
  features: [
    band(428.8, 0.4, 3),
    band(435.4, 0.5, 3),
    band(443.4, 0.4, 3),
    band(452, 0.3, 3),
    band(488.9, 0.3, 3),
    line(510.55, 0.3),
    line(515.32, 0.3),
    line(521.82, 0.4),
    band(535, 1, 8),
  ],
};

/** Gases available in discharge tubes, in the order they are listed. */
export const TUBE_ELEMENTS: readonly ElementSpectrum[] = [HYDROGEN, HELIUM, NEON, SODIUM, MERCURY, ARGON, KRYPTON];

/** Metal salts available for flame tests. */
export const FLAME_ELEMENTS: readonly ElementSpectrum[] = [
  LITHIUM,
  SODIUM,
  POTASSIUM,
  CALCIUM,
  STRONTIUM,
  BARIUM,
  COPPER,
];

/** Fraunhofer lines in the visible solar spectrum: letter and depth (relative). */
export const FRAUNHOFER_LINES: readonly (SpectralFeature & { readonly letter: string })[] = [
  { letter: "K", ...line(393.37, 0.9) },
  { letter: "H", ...line(396.85, 0.85) },
  { letter: "h", ...line(410.17, 0.3) },
  { letter: "G", ...band(430.79, 0.5, 0.6) },
  { letter: "Hγ", ...line(434.05, 0.35) },
  { letter: "d", ...line(438.36, 0.25) },
  { letter: "F", ...line(486.13, 0.5) },
  { letter: "b", ...line(516.73, 0.3) },
  { letter: "b", ...line(517.27, 0.35) },
  { letter: "b", ...line(518.36, 0.4) },
  { letter: "E", ...line(527.04, 0.3) },
  { letter: "D", ...line(589.0, 0.5) },
  { letter: "D", ...line(589.59, 0.45) },
  { letter: "C", ...line(656.28, 0.6) },
  { letter: "B", ...band(686.72, 0.4, 0.8) },
  { letter: "A", ...band(759.37, 0.7, 1) },
];
