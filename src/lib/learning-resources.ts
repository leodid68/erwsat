/**
 * Learning resources for SAT skills
 * Links to reliable educational content in English and French
 */

export interface LearningResource {
  title: string;
  url: string;
  language: 'en' | 'fr';
  source: string;
  type: 'video' | 'article' | 'practice' | 'guide';
}

export interface SkillResources {
  skillKey: string;
  skillName: string;
  description: string;
  resources: LearningResource[];
}

/**
 * Comprehensive resource mapping for all SAT ERW skills
 */
export const SKILL_RESOURCES: Record<string, SkillResources> = {
  'central-ideas': {
    skillKey: 'central-ideas',
    skillName: 'Central Ideas & Details',
    description: 'Identifier l\'idée principale et les détails de support dans un texte',
    resources: [
      {
        title: 'Finding the Main Idea',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:central-ideas-and-details/a/sat-reading-central-ideas-and-details',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT Reading: Central Ideas (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:central-ideas-and-details/v/central-ideas-and-details-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Official SAT Practice',
        url: 'https://satsuite.collegeboard.org/sat/practice-preparation/practice-tests',
        language: 'en',
        source: 'College Board',
        type: 'practice',
      },
      {
        title: 'Identifier l\'idée principale d\'un texte',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/l-idee-principale-et-les-idees-secondaires-f1045',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'inferences': {
    skillKey: 'inferences',
    skillName: 'Inferences',
    description: 'Tirer des conclusions logiques à partir d\'informations implicites',
    resources: [
      {
        title: 'Making Inferences',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:inferences/a/sat-reading-inferences',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT Reading: Inferences (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:inferences/v/inferences-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Faire des inférences en lecture',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/l-inference-f1056',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'command-of-evidence': {
    skillKey: 'command-of-evidence',
    skillName: 'Command of Evidence',
    description: 'Utiliser des preuves textuelles pour soutenir une affirmation',
    resources: [
      {
        title: 'Command of Evidence',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:command-of-evidence/a/sat-reading-command-of-evidence',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Command of Evidence (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:command-of-evidence/v/command-of-evidence-textual-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Citer des preuves textuelles',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/la-justification-f1434',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'words-in-context': {
    skillKey: 'words-in-context',
    skillName: 'Words in Context',
    description: 'Comprendre le sens des mots selon le contexte',
    resources: [
      {
        title: 'Words in Context',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:words-in-context/a/sat-reading-words-in-context',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Words in Context (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:words-in-context/v/words-in-context-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'SAT Vocabulary List',
        url: 'https://www.vocabulary.com/lists/194479',
        language: 'en',
        source: 'Vocabulary.com',
        type: 'practice',
      },
      {
        title: 'Le sens des mots selon le contexte',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/le-sens-des-mots-f1038',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'text-structure-purpose': {
    skillKey: 'text-structure-purpose',
    skillName: 'Text Structure & Purpose',
    description: 'Analyser la structure et l\'intention de l\'auteur',
    resources: [
      {
        title: 'Text Structure and Purpose',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:text-structure-and-purpose/a/sat-reading-text-structure-and-purpose',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Text Structure (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:text-structure-and-purpose/v/text-structure-and-purpose-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Les structures de texte',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/les-types-de-textes-f1049',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'cross-text-connections': {
    skillKey: 'cross-text-connections',
    skillName: 'Cross-Text Connections',
    description: 'Comparer et connecter des idées entre plusieurs textes',
    resources: [
      {
        title: 'Cross-Text Connections',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:cross-text-connections/a/sat-reading-cross-text-connections',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Cross-Text Connections (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:cross-text-connections/v/cross-text-connections-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Comparer des textes',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/la-comparaison-f1446',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'rhetorical-synthesis': {
    skillKey: 'rhetorical-synthesis',
    skillName: 'Rhetorical Synthesis',
    description: 'Synthétiser des informations pour atteindre un objectif rhétorique',
    resources: [
      {
        title: 'Rhetorical Synthesis',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:rhetorical-synthesis/a/sat-writing-rhetorical-synthesis',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Rhetorical Synthesis (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:rhetorical-synthesis/v/rhetorical-synthesis-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'La synthèse de textes',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/le-resume-et-la-synthese-f1050',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'transitions': {
    skillKey: 'transitions',
    skillName: 'Transitions',
    description: 'Utiliser des mots de liaison pour connecter les idées',
    resources: [
      {
        title: 'Transitions',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:transitions/a/sat-writing-transitions',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Transitions (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:transitions/v/transitions-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Transition Words List',
        url: 'https://owl.purdue.edu/owl/general_writing/mechanics/transitions_and_transitional_devices/index.html',
        language: 'en',
        source: 'Purdue OWL',
        type: 'article',
      },
      {
        title: 'Les marqueurs de relation',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/les-marqueurs-de-relation-f1044',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'boundaries': {
    skillKey: 'boundaries',
    skillName: 'Boundaries (Punctuation)',
    description: 'Maîtriser la ponctuation : virgules, points-virgules, tirets',
    resources: [
      {
        title: 'Boundaries (Punctuation)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:boundaries/a/sat-writing-boundaries',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Boundaries (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:boundaries/v/boundaries-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Comma Rules',
        url: 'https://owl.purdue.edu/owl/general_writing/punctuation/commas/index.html',
        language: 'en',
        source: 'Purdue OWL',
        type: 'article',
      },
      {
        title: 'Semicolons & Colons',
        url: 'https://owl.purdue.edu/owl/general_writing/punctuation/semi_colons_colons_and_dashes/index.html',
        language: 'en',
        source: 'Purdue OWL',
        type: 'article',
      },
      {
        title: 'La ponctuation',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/la-ponctuation-f1036',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
  'form-structure-sense': {
    skillKey: 'form-structure-sense',
    skillName: 'Form, Structure & Sense',
    description: 'Accord sujet-verbe, pronoms, temps verbaux',
    resources: [
      {
        title: 'Form, Structure, and Sense',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:form-structure-and-sense/a/sat-writing-form-structure-and-sense',
        language: 'en',
        source: 'Khan Academy',
        type: 'guide',
      },
      {
        title: 'SAT: Form, Structure, Sense (Video)',
        url: 'https://www.khanacademy.org/test-prep/sat/x0a8c2e5f:reading-and-writing/x0a8c2e5f:form-structure-and-sense/v/form-structure-and-sense-sat-reading-and-writing',
        language: 'en',
        source: 'Khan Academy',
        type: 'video',
      },
      {
        title: 'Subject-Verb Agreement',
        url: 'https://owl.purdue.edu/owl/general_writing/grammar/subject_verb_agreement.html',
        language: 'en',
        source: 'Purdue OWL',
        type: 'article',
      },
      {
        title: 'Pronoun Reference',
        url: 'https://owl.purdue.edu/owl/general_writing/grammar/pronouns/index.html',
        language: 'en',
        source: 'Purdue OWL',
        type: 'article',
      },
      {
        title: 'L\'accord du verbe avec le sujet',
        url: 'https://www.alloprof.qc.ca/fr/eleves/bv/francais/l-accord-du-verbe-f1029',
        language: 'fr',
        source: 'Alloprof',
        type: 'article',
      },
    ],
  },
};

/**
 * Get resources for a specific skill
 */
export function getResourcesForSkill(skillKey: string): SkillResources | null {
  return SKILL_RESOURCES[skillKey] || null;
}

/**
 * Get resources for weak skills (accuracy below threshold)
 */
export function getResourcesForWeakSkills(
  accuracyByType: Record<string, { correct: number; total: number }>,
  threshold: number = 70
): SkillResources[] {
  const weakSkills: SkillResources[] = [];

  for (const [skillKey, stats] of Object.entries(accuracyByType)) {
    if (stats.total > 0) {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < threshold && SKILL_RESOURCES[skillKey]) {
        weakSkills.push(SKILL_RESOURCES[skillKey]);
      }
    }
  }

  // Sort by accuracy (weakest first)
  return weakSkills;
}
