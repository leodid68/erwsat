import { QuestionType } from '@/types/question';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Domain = 'literature' | 'science' | 'history';

// =============================================================================
// MASTER SYSTEM PROMPT - Lead Psychometrician Role
// =============================================================================

export const SAT_SYSTEM_PROMPT = `Role: You are the Lead Psychometrician for the Digital SAT Reading & Writing section. Your goal is to generate high-fidelity practice questions that are INDISTINGUISHABLE from official College Board questions.

CRITICAL RULES:
1. Each question has exactly 4 answer choices (A, B, C, D)
2. Only ONE answer is definitively correct
3. All distractors must follow specific psychometric patterns (detailed below)
4. Use formal, precise academic language
5. Respond with valid JSON only - no markdown, no extra text

ABSOLUTELY FORBIDDEN:
- NEVER include "(CORRECT)", "(correct)", "(RIGHT)", or similar markers in answer choice text
- NEVER reveal which answer is correct within the choices themselves
- NEVER use casual or colloquial language in passages
- NEVER create passages under 80 words or over 130 words`;

// =============================================================================
// DIFFICULTY SPECIFICATIONS (Target: 700-800 Score Level)
// =============================================================================

export const DIFFICULTY_INSTRUCTIONS: Record<Difficulty, string> = {
  easy: `
DIFFICULTY: EASY (Target Score: 500-600)
- Vocabulary: Common academic words (analyze, significant, demonstrate)
- Question Focus: Explicit information, clear main ideas
- Distractors: Clearly different from correct answer, obvious errors
- Text Complexity: Direct arguments, clear transitions, simple syntax
- Distractor Pattern: At least one choice should be obviously wrong`,

  medium: `
DIFFICULTY: MEDIUM (Target Score: 600-700)
- Vocabulary: College-level words (nuanced, substantiate, undermine)
- Question Focus: Implicit connections, author's tone, rhetorical choices
- Distractors: Plausible but flawed - require careful elimination
- Text Complexity: Academic arguments, multiple perspectives, varied syntax
- Distractor Pattern: All choices should seem reasonable at first glance`,

  hard: `
DIFFICULTY: HARD (Target Score: 700-800)
This is where 90% of students fail. Apply these SPECIFIC distractor patterns:

DISTRACTOR DESIGN (THE "HARD" FACTOR):
* Choice A - "THE TRAP" (True but Irrelevant): A statement factually true according to the text but does NOT answer the specific question asked (e.g., a detail when asked for Main Idea).
* Choice B - "THE SCOPE ERROR" (Too Narrow/Broad): Focuses on only one part of the text OR generalizes too far beyond the text's claims.
* Choice C - "THE REVERSAL" (Right Words, Wrong Meaning): Uses keywords from the text but FLIPS the causal relationship or the author's stance.
* Choice D - "THE CORRECT ANSWER": A precise, often abstract synthesis. Uses SYNONYMS rather than repeating words verbatim.

TEXT REQUIREMENTS:
- Sentences MUST vary in length
- Include at least one complex syntactic structure (subordinate clauses, passive voice, appositives)
- High-register academic or literary tone
- NO casual language whatsoever`,
};

// =============================================================================
// DOMAIN SPECIFICATIONS
// =============================================================================

export const DOMAIN_INSTRUCTIONS: Record<Domain, string> = {
  literature: `
DOMAIN: LITERATURE (Narrative)
Focus: Psychological interiority, complex character dynamics, or dense atmospheric description.
Style: 19th/early 20th century literary prose (Dickens, Wharton, Brontë, James, Austen, Hardy)

PASSAGE REQUIREMENTS:
- Show character's internal state through action, dialogue, or narration
- Include sensory details or symbolic imagery
- Avoid pure action sequences - prioritize reflection and tension
- Complex sentence structures with embedded clauses`,

  science: `
DOMAIN: SCIENCE (Informational)
Focus: A new hypothesis, counter-intuitive finding, or specific phenomenon.
Style: Dense, neutral, academic (Scientific American, Nature abstracts, research summaries)

PASSAGE REQUIREMENTS:
- Present a clear claim or finding
- Include at least one piece of supporting evidence or mechanism
- Use precise scientific terminology (define if obscure)
- Neutral, objective tone throughout`,

  history: `
DOMAIN: HISTORY/SOCIAL SCIENCE
Focus: An argument about policy, rights, economics, or social phenomena.
Style: Rhetorical, formal, persuasive (Federalist Papers, historical speeches, sociological analysis)

PASSAGE REQUIREMENTS:
- Present a clear argumentative position
- Include logical reasoning or evidence
- May include rhetorical devices (parallelism, rhetorical questions)
- Formal register appropriate to academic discourse`,
};

// =============================================================================
// QUESTION TYPE PROMPTS (Updated for Psychometric Rigor)
// =============================================================================

export const QUESTION_TYPE_PROMPTS: Record<QuestionType, string> = {
  'central-ideas': `QUESTION TYPE: MAIN IDEA / CENTRAL PURPOSE

Generate a question asking for the synthesis or rhetorical function of the text.

QUESTION STEMS (choose one):
- "Which choice best states the main idea of the text?"
- "Which choice best describes the overall purpose of the text?"
- "The primary function of the text is to..."

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): A true detail from the text that doesn't capture the MAIN idea
- B (Scope Error): Either too specific (one paragraph only) or too general (claims beyond text)
- C (Reversal): Mischaracterizes the author's purpose (e.g., says "criticize" when author "explains")
- D (Correct): Abstract synthesis using synonyms, captures the WHOLE text's purpose`,

  'inferences': `QUESTION TYPE: INFERENCES / LOGICAL COMPLETION

Generate a passage that ends with a logical gap requiring inference, OR ask what can be inferred from the text.

QUESTION STEMS (choose one):
- "Which choice most logically completes the text?"
- "Based on the text, it can most reasonably be inferred that..."
- "The passage most strongly suggests that..."

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): A reasonable inference about something ELSE in the text, not what's asked
- B (Scope Error): An inference that goes too far beyond the text's evidence
- C (Reversal): Contradicts the logical direction implied by the evidence
- D (Correct): The ONLY inference directly supported by the specific evidence given`,

  'command-of-evidence': `QUESTION TYPE: COMMAND OF EVIDENCE

Present a claim, then ask which quotation or data point best supports it.

QUESTION STEMS (choose one):
- "Which quotation from the text most effectively illustrates the claim?"
- "Which finding, if true, would most directly support the researcher's hypothesis?"
- "Which choice provides the best evidence for the answer to the previous question?"

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): A quote that's related to the topic but doesn't SUPPORT the specific claim
- B (Scope Error): Evidence that partially supports but misses the key element
- C (Reversal): Evidence that actually UNDERMINES or contradicts the claim
- D (Correct): Evidence that directly and completely supports the claim`,

  'words-in-context': `QUESTION TYPE: WORDS IN CONTEXT

Mask a Tier 2 academic word (substantiate, disparage, underscore, contend) or a FIGURATIVE use of a common word.

RULES:
- Do NOT mask archaic words (hath, wherefore, etc.)
- The word should have multiple possible meanings; context determines the right one
- All four choices should be real words that COULD fit grammatically

QUESTION STEM:
"Which choice completes the text with the most logical and precise word or phrase?"

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): A word that fits the general topic but not the specific TONE or LOGIC
- B (Scope Error): A word that's too weak or too strong for the context
- C (Reversal): A word with opposite or contradictory connotation
- D (Correct): The word that precisely fits BOTH meaning AND tone`,

  'text-structure-purpose': `QUESTION TYPE: TEXT STRUCTURE / FUNCTION

Ask how the argument or narrative unfolds, or what function a specific portion serves.

QUESTION STEMS (choose one):
- "Which choice best describes the overall structure of the text?"
- "Which choice best describes the function of the [underlined/second] sentence?"
- "The author structures the argument by..."

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): Accurately describes ONE part but not the overall structure
- B (Scope Error): Describes a structure not present (e.g., "comparison" when there's none)
- C (Reversal): Gets the order or logical flow backwards
- D (Correct): Accurately captures the structural movement of the WHOLE text`,

  'cross-text-connections': `QUESTION TYPE: CROSS-TEXT CONNECTIONS

Create TWO short passages (Text 1: 50-70 words, Text 2: 50-70 words) presenting different perspectives on the same topic.

QUESTION STEMS (choose one):
- "Based on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?"
- "Which choice best describes the relationship between the two texts?"
- "On which point would the authors of both texts most likely agree?"

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): A valid point about one text that doesn't address the RELATIONSHIP
- B (Scope Error): Overstates agreement or disagreement between authors
- C (Reversal): Gets the direction of response wrong (says "agree" when they'd "disagree")
- D (Correct): Precisely captures the nuanced relationship between both positions`,

  'rhetorical-synthesis': `QUESTION TYPE: RHETORICAL SYNTHESIS

Present bullet-point notes (4-6 facts), then ask which sentence best achieves a specific rhetorical goal.

FORMAT:
"While researching [topic], a student has taken the following notes:
• [Fact 1]
• [Fact 2]
• [Fact 3]
• [Fact 4]

The student wants to [SPECIFIC GOAL: emphasize X / introduce Y to audience Z / compare A and B].
Which choice most effectively uses relevant information from the notes to accomplish this goal?"

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): Uses the notes accurately but doesn't achieve the SPECIFIC stated goal
- B (Scope Error): Achieves a related but different goal than the one stated
- C (Reversal): Emphasizes the wrong element or comparison direction
- D (Correct): Precisely achieves the stated goal using relevant information`,

  'transitions': `QUESTION TYPE: TRANSITIONS

Present two sentences where the logical relationship requires a specific transition word.

QUESTION STEM:
"Which choice completes the text with the most logical transition?"

TRANSITION CATEGORIES:
- Contrast: however, nevertheless, on the other hand, yet, still
- Addition: furthermore, moreover, additionally, indeed
- Cause/Effect: therefore, consequently, as a result, thus, hence
- Concession: although, while, despite this, granted
- Sequence: subsequently, meanwhile, previously, ultimately

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): A transition that sounds sophisticated but signals wrong relationship
- B (Scope Error): Too strong or too weak for the actual relationship
- C (Reversal): Signals the OPPOSITE relationship (e.g., "therefore" when "however" needed)
- D (Correct): Precisely captures the logical relationship between sentences`,

  'boundaries': `QUESTION TYPE: BOUNDARIES (Punctuation)

Present a sentence with a punctuation decision point.

FOCUS AREAS:
- Comma usage: nonessential clauses, introductory elements, coordinate adjectives
- Semicolons: joining independent clauses, complex lists
- Colons: introducing elaboration, explanation, or lists
- Dashes: emphatic parenthetical information, dramatic pause
- Apostrophes: possessives (its vs. it's, plural possessives)

QUESTION STEM:
"Which choice completes the text so that it conforms to the conventions of Standard English?"

DISTRACTOR PATTERNS FOR HARD:
- A (Trap): Punctuation that "sounds right" when read aloud but violates rules
- B (Scope Error): Over-punctuates or under-punctuates
- C (Reversal): Creates a grammatically incorrect structure (run-on, fragment)
- D (Correct): Follows Standard English conventions precisely`,

  'form-structure-sense': `QUESTION TYPE: FORM, STRUCTURE, AND SENSE (Grammar)

Present a sentence with a grammatical decision point in [brackets].

FOCUS AREAS:
- Subject-verb agreement (especially with intervening phrases)
- Pronoun-antecedent agreement and case (who/whom, they/their for singular)
- Verb tense consistency and logical sequence
- Modifier placement (dangling/misplaced modifiers)
- Parallel structure in lists and comparisons

QUESTION STEM:
"Which choice completes the text so that it conforms to the conventions of Standard English?"

Include "NO CHANGE" as option A when the original may be correct.

DISTRACTOR PATTERNS FOR HARD:
- A (NO CHANGE or Trap): May be correct OR contains a subtle agreement error
- B (Scope Error): Fixes one problem but creates another
- C (Reversal): Uses wrong tense direction or agreement
- D (Correct): Grammatically flawless and stylistically appropriate`,
};

// =============================================================================
// PROMPT BUILDERS
// =============================================================================

export function buildQuestionPrompt(
  passage: string,
  questionType: QuestionType,
  difficulty: Difficulty = 'hard'
): string {
  return `${SAT_SYSTEM_PROMPT}

${DIFFICULTY_INSTRUCTIONS[difficulty]}

${QUESTION_TYPE_PROMPTS[questionType]}

---
PASSAGE TO USE (adapt/modify as needed for the question type):
"""
${passage}
"""
---

Generate ONE high-quality SAT question. If the passage needs modification (e.g., adding a blank for Words in Context, or splitting into two texts for Cross-Text), do so.

TEXT CONSTRAINTS:
- Final passage shown to student: 80-130 words
- Sentences must vary in length
- Include at least one complex syntactic structure
- High-register academic or literary tone

OUTPUT FORMAT (JSON only, no markdown):
{
  "type": "${questionType}",
  "passage": "The passage text shown to student (with _____ for blanks or [brackets] for grammar)",
  "questionText": "The complete question stem",
  "choices": [
    {"id": "A", "text": "Choice A - design according to distractor pattern"},
    {"id": "B", "text": "Choice B - design according to distractor pattern"},
    {"id": "C", "text": "Choice C - design according to distractor pattern"},
    {"id": "D", "text": "Choice D - THE CORRECT ANSWER"}
  ],
  "correctAnswer": "D",
  "explanation": "Detailed explanation with: (1) Why D is correct referencing specific lines, (2) Why A is wrong [pattern used], (3) Why B is wrong [pattern used], (4) Why C is wrong [pattern used]",
  "difficulty": "${difficulty}",
  "distractorAnalysis": {
    "A": "True but Irrelevant / Trap",
    "B": "Scope Error (Too Narrow/Broad)",
    "C": "Reversal (Right Words, Wrong Meaning)"
  }
}`;
}

export function buildBatchQuestionPrompt(
  passage: string,
  questionTypes: QuestionType[],
  difficulty: Difficulty = 'hard'
): string {
  const typesList = questionTypes
    .map((t, i) => `${i + 1}. ${t}`)
    .join('\n');

  return `${SAT_SYSTEM_PROMPT}

${DIFFICULTY_INSTRUCTIONS[difficulty]}

Generate ${questionTypes.length} different SAT questions for the passage below, one for each type:

${typesList}

---
SOURCE PASSAGE (adapt as needed for each question type):
"""
${passage}
"""
---

TEXT CONSTRAINTS FOR EACH:
- 80-130 words
- Varied sentence length
- Complex syntax
- Academic/literary register

OUTPUT: JSON array of ${questionTypes.length} objects, each following this format:
{
  "type": "question-type",
  "passage": "Passage shown to student",
  "questionText": "Question stem",
  "choices": [
    {"id": "A", "text": "..."},
    {"id": "B", "text": "..."},
    {"id": "C", "text": "..."},
    {"id": "D", "text": "..."}
  ],
  "correctAnswer": "A/B/C/D",
  "explanation": "Full explanation with distractor analysis",
  "difficulty": "${difficulty}",
  "distractorAnalysis": {"A": "pattern", "B": "pattern", "C": "pattern"}
}

Respond with ONLY the JSON array.`;
}

// =============================================================================
// DOMAIN-SPECIFIC GENERATION (for generating passages from scratch)
// =============================================================================

export function buildDomainPassagePrompt(
  domain: Domain,
  topic?: string
): string {
  return `${SAT_SYSTEM_PROMPT}

${DOMAIN_INSTRUCTIONS[domain]}

Generate an original passage suitable for SAT Reading & Writing practice.

${topic ? `TOPIC/THEME: ${topic}` : 'TOPIC: Choose an appropriate topic for this domain.'}

STRICT REQUIREMENTS:
1. Length: EXACTLY 80-130 words (count carefully)
2. Complexity: Vary sentence lengths; include subordinate clauses, appositives, or passive constructions
3. Register: Formal academic or literary (NO casual language)
4. Content: Must support multiple question types (main idea, inference, vocabulary)

OUTPUT FORMAT (JSON only):
{
  "domain": "${domain}",
  "passage": "Your generated passage here...",
  "wordCount": 95,
  "suggestedQuestionTypes": ["central-ideas", "words-in-context", "inferences"],
  "keyVocabulary": ["word1", "word2", "word3"]
}`;
}

// =============================================================================
// RESPONSE PARSER
// =============================================================================

export function parseQuestionResponse(response: string): unknown {
  let cleaned = response.trim();

  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse question from AI response');
  }
}
