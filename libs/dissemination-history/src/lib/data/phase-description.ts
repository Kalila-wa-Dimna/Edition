import { MapPhase } from './map-phases';

export interface IPhaseDescription {
  name: string;
  dating?: string;
  content: string[];
}

export const PHASE_DESCRIPRIONS: Record<MapPhase, IPhaseDescription> = {
  [MapPhase.intro]: {
    name: 'Inroduction',
    // dating: '',
    content: [
      `<em>Kalīla and Dimna</em> is a work of wisdom literature.
          More precisely, it is a mirror of princes and courtiers in the form of animal fables that was avidly read,
          copied, translated, and rewritten in an area stretching from Spain to Malaysia in more than 40 languages until the 19<sup>th</sup> century.`,
    ],
  },
  [MapPhase.sources]: {
    name: 'Sanskrit Sources',
    dating: '3<sup>rd</sup> Century CE',
    content: [
      `<em>Kalīla and Dimna</em>'s earliest Sanskrit sources, the <em>Pañcatantra</em> and the <em>Mahābhārata</em>, date to approximately the third century CE.`,
    ],
  },
  [MapPhase['persian-redaction']]: {
    name: 'Middle Persian Redation',
    dating: '550 CE',
    content: [
      `<em>Kalīla and Dimna</em> was redacted in Middle Persian circa 550 CE, adding the frame story and several prefaces. This version is mostly lost; only a fragment survives.`,
    ],
  },
  [MapPhase.syriac]: {
    name: 'Oldest Extant Version',
    dating: '590 CE',
    content: [
      `The oldest extant version of <em>Kalīla and Dimna</em> is in Syriac from 590 CE.`,
    ],
  },
  [MapPhase.arabic]: {
    name: 'The Arabic Version',
    dating: '750 CE',
    content: [
      `The subsequent Arabic version from 750 CE adds a preface and several chapters. It is the source of all later translations.`,
    ],
  },
  [MapPhase.medieval]: {
    name: 'Persian and Medieval European versions',
    dating: '11<sup>th</sup> to 13<sup>th</sup> century CE',
    content: [
      `In the 11<sup>th</sup> to 13<sup>th</sup> century CE, Persian and Medieval European versions were translated and redacted.`,
      'The Latin translation (via Hebrew) generated all modern European translations.',
    ],
  },

  [MapPhase['inside-europe']]: {
    name: 'In Europe',
    dating: '15<sup>th</sup> to 19<sup>th</sup> century CE',
    content: [
      `In the 15<sup>th</sup> to 19<sup>th</sup> century CE, dissemination ensued in Europe. The modern language <em>Kalīla and Dimna</em> is first and most often translated into is German, beginning in 1482.`,
      `However, French was a more common source of translation for later versions.`,
    ],
  },
  [MapPhase['into-asia-africa']]: {
    name: 'In Asia and Africa',
    dating: '15<sup>th</sup> to 19<sup>th</sup> century CE',
    content: [
      `In the 15<sup>th</sup> to 19<sup>th</sup> century CE, dissemination ensued in Africa and Asia.`,
      `The Persian versions, especially the Anvar-i Sohaili (15<sup>th</sup> century) and the Ottoman Humayun Nameh (16<sup>th</sup> century) became classics in their own right.`,
      `The work then received a renewed reception in the 19<sup>th</sup> century in South and Southeast Asia, where it resurfaced in eight languages.
`,
    ],
  },
  [MapPhase.conclusion]: {
    name: 'Conclusion',
    // dating: '',
    content: [
      `  Many questions about the <em>Kalīla and Dimna</em>'s multiple and strongly diverging versions are still unsolved, in fact, it constitutes an entire textual tradition.
              As a manual on social behavior and a study of human manipulation and its effects, it has kept its relevance until today.`,
    ],
  },
};
