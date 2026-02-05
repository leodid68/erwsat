import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGutenbergBookRaw,
  fetchWikipediaArticleRaw,
  fetchGuardianArticleRaw,
} from '@/lib/text-sources';
import {
  isAnthropicConfigured,
  selectPassagesWithSonnet,
} from '@/lib/anthropic';
import { getEnv } from '@/lib/env-loader';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicApiKey } from '@/lib/env-loader';

const MODEL = 'claude-sonnet-4-20250514';

// Curated sources for SAT-style texts
export const CURATED_SOURCES = {
  literature: [
    { provider: 'gutenberg', id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
    { provider: 'gutenberg', id: 98, title: 'A Tale of Two Cities', author: 'Charles Dickens' },
    { provider: 'gutenberg', id: 1400, title: 'Great Expectations', author: 'Charles Dickens' },
    { provider: 'gutenberg', id: 768, title: 'Wuthering Heights', author: 'Emily Brontë' },
    { provider: 'gutenberg', id: 1260, title: 'Jane Eyre', author: 'Charlotte Brontë' },
    { provider: 'gutenberg', id: 25344, title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne' },
    { provider: 'gutenberg', id: 209, title: 'The Turn of the Screw', author: 'Henry James' },
    { provider: 'gutenberg', id: 145, title: 'Middlemarch', author: 'George Eliot' },
  ],
  history: [
    { provider: 'wikipedia', id: 'American_Revolution', title: 'American Revolution' },
    { provider: 'wikipedia', id: 'French_Revolution', title: 'French Revolution' },
    { provider: 'wikipedia', id: 'Industrial_Revolution', title: 'Industrial Revolution' },
    { provider: 'wikipedia', id: 'Civil_rights_movement', title: 'Civil Rights Movement' },
    { provider: 'gutenberg', id: 18, title: 'The Federalist Papers', author: 'Hamilton, Madison, Jay' },
  ],
  science: [
    { provider: 'wikipedia', id: 'Climate_change', title: 'Climate Change' },
    { provider: 'wikipedia', id: 'Evolution', title: 'Evolution' },
    { provider: 'wikipedia', id: 'Quantum_mechanics', title: 'Quantum Mechanics' },
    { provider: 'wikipedia', id: 'Artificial_intelligence', title: 'Artificial Intelligence' },
    { provider: 'wikipedia', id: 'DNA', title: 'DNA' },
  ],
  socialScience: [
    { provider: 'wikipedia', id: 'Psychology', title: 'Psychology' },
    { provider: 'wikipedia', id: 'Economics', title: 'Economics' },
    { provider: 'wikipedia', id: 'Sociology', title: 'Sociology' },
  ],
};

// Domain distribution for SAT ERW (official proportions)
const MODULE_DISTRIBUTION = {
  'Craft & Structure': {
    percentage: 28,
    skills: ['Words in Context', 'Text Structure and Purpose'],
  },
  'Information & Ideas': {
    percentage: 26,
    skills: ['Central Ideas and Details', 'Command of Evidence (Textual)', 'Inferences'],
  },
  'Standard English Conventions': {
    percentage: 26,
    skills: ['Boundaries', 'Form, Structure, and Sense'],
  },
  'Expression of Ideas': {
    percentage: 20,
    skills: ['Transitions', 'Rhetorical Synthesis'],
  },
} as const;

type Domain = keyof typeof MODULE_DISTRIBUTION;

interface PassageWithSource {
  text: string;
  source: string;
  author?: string;
  provider: string;
}

interface GeneratedQuestion {
  passage: string;
  passageSource: string;
  questionStem: string;
  choices: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  domain: string;
  skill: string;
}

// Create Anthropic client
function getClient(): Anthropic {
  return new Anthropic({
    apiKey: getAnthropicApiKey(),
    baseURL: 'https://api.anthropic.com',
    timeout: 120000,
  });
}

/**
 * Generate a SAT question from a REAL passage
 */
async function generateQuestionFromRealPassage(
  passage: PassageWithSource,
  domain: Domain,
  skill: string,
  difficulty: 'Medium' | 'Hard'
): Promise<GeneratedQuestion> {
  const client = getClient();

  const difficultyGuidelines = difficulty === 'Hard'
    ? `
- Create challenging distractors using "True but Irrelevant" pattern (statement true in passage but doesn't answer question)
- Use "Scope Error" pattern (too narrow or too broad interpretations)
- For Words in Context: choose words with subtle contextual meanings`
    : `
- Distractors should be clearly wrong but plausible
- Test comprehension without excessive complexity`;

  const prompt = `You are an expert SAT test architect. Generate a SAT-style question based on this REAL passage.

REAL PASSAGE FROM "${passage.source}"${passage.author ? ` by ${passage.author}` : ''}:
---
${passage.text}
---

SPECIFICATIONS:
- Domain: ${domain}
- Skill: ${skill}
- Difficulty: ${difficulty}

QUESTION REQUIREMENTS FOR ${skill}:
${skill === 'Words in Context' ? `
- Identify a word in the passage that has contextual meaning
- Replace it with a blank ______ in your output
- Ask which word best fits the context
- All 4 choices must be grammatically valid but only one fits precisely` : ''}
${skill === 'Text Structure and Purpose' ? `
- Ask about the function of a specific part or the overall structure
- Options should describe different rhetorical purposes` : ''}
${skill === 'Central Ideas and Details' ? `
- Ask about main ideas or specific supporting details
- Options should include plausible but incorrect interpretations` : ''}
${skill === 'Command of Evidence (Textual)' ? `
- Ask which evidence from the passage best supports a claim
- Reference specific parts of the passage` : ''}
${skill === 'Inferences' ? `
- Ask what can be reasonably inferred from the passage
- Options should include overstatements and unsupported conclusions` : ''}
${skill === 'Boundaries' ? `
- Focus on a sentence that could have punctuation variations
- Options present different punctuation solutions` : ''}
${skill === 'Form, Structure, and Sense' ? `
- Focus on grammar: subject-verb agreement, pronouns, or tense
- Create options with grammatical variations` : ''}
${skill === 'Transitions' ? `
- Identify a transition point and replace with blank
- Context should indicate the logical relationship needed` : ''}
${skill === 'Rhetorical Synthesis' ? `
- Ask how information could be best combined or presented
- Focus on rhetorical effectiveness` : ''}

${difficultyGuidelines}

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "passage": "The passage text (with ______ blank if Words in Context or Transitions)",
  "passageSource": "${passage.source}${passage.author ? ` (${passage.author})` : ''}",
  "questionStem": "The question text",
  "choices": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  },
  "correctAnswer": "B",
  "explanation": "Why B is correct and others are wrong",
  "domain": "${domain}",
  "skill": "${skill}"
}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let jsonStr = content.text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
  }
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  return JSON.parse(jsonStr);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sources, // Array of { provider, id } or 'auto' for automatic selection
      questionsPerModule = 27
    } = body;

    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: 'Claude API (Anthropic) non configurée' },
        { status: 500 }
      );
    }

    const env = getEnv();
    const totalQuestions = questionsPerModule * 2; // 54 total

    // Step 1: Determine sources to use
    let selectedSources: Array<{ provider: string; id: string | number; title: string; author?: string }> = [];

    if (sources === 'auto' || !sources) {
      // Auto-select a mix of sources
      const literature = CURATED_SOURCES.literature.slice(0, 3);
      const history = CURATED_SOURCES.history.slice(0, 2);
      const science = CURATED_SOURCES.science.slice(0, 2);
      const social = CURATED_SOURCES.socialScience.slice(0, 1);
      selectedSources = [...literature, ...history, ...science, ...social];
    } else {
      selectedSources = sources;
    }

    // Step 2: Fetch real texts from sources
    const allPassages: PassageWithSource[] = [];
    const fetchErrors: string[] = [];

    for (const source of selectedSources) {
      try {
        let fullText: string;

        if (source.provider === 'gutenberg') {
          const result = await fetchGutenbergBookRaw(Number(source.id));
          fullText = result.fullText;
        } else if (source.provider === 'wikipedia') {
          const result = await fetchWikipediaArticleRaw(String(source.id));
          fullText = result.fullText;
        } else if (source.provider === 'guardian') {
          if (!env.GUARDIAN_API_KEY) {
            fetchErrors.push(`Guardian API key not configured for ${source.title}`);
            continue;
          }
          const result = await fetchGuardianArticleRaw(String(source.id), env.GUARDIAN_API_KEY);
          fullText = result.fullText;
        } else {
          continue;
        }

        // Use Claude to select best passages from this source
        const passagesNeeded = Math.ceil(totalQuestions / selectedSources.length);
        const selected = await selectPassagesWithSonnet(fullText, passagesNeeded);

        for (const p of selected) {
          allPassages.push({
            text: p.text,
            source: source.title,
            author: source.author,
            provider: source.provider,
          });
        }

        // Small delay between sources
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        fetchErrors.push(`Failed to fetch ${source.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (allPassages.length < totalQuestions) {
      // If not enough passages, duplicate some
      while (allPassages.length < totalQuestions) {
        const idx = allPassages.length % Math.max(1, allPassages.length);
        allPassages.push({ ...allPassages[idx] });
      }
    }

    // Step 3: Generate questions for each passage
    const domains = Object.keys(MODULE_DISTRIBUTION) as Domain[];
    const questions: Array<GeneratedQuestion & { id: string; moduleId: number }> = [];
    const generationErrors: string[] = [];

    // Module 1 (Medium difficulty)
    for (let i = 0; i < questionsPerModule; i++) {
      const passage = allPassages[i];
      const domainIdx = i % domains.length;
      const domain = domains[domainIdx];
      const skills = MODULE_DISTRIBUTION[domain].skills;
      const skill = skills[i % skills.length];

      try {
        const question = await generateQuestionFromRealPassage(passage, domain, skill, 'Medium');
        questions.push({
          ...question,
          id: `M1_Q${i + 1}`,
          moduleId: 1,
        });
      } catch (error) {
        generationErrors.push(`M1_Q${i + 1}: ${error instanceof Error ? error.message : 'Failed'}`);
      }

      // Rate limiting
      if (i % 5 === 4) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Module 2 (Hard difficulty)
    for (let i = 0; i < questionsPerModule; i++) {
      const passage = allPassages[questionsPerModule + i];
      const domainIdx = i % domains.length;
      const domain = domains[domainIdx];
      const skills = MODULE_DISTRIBUTION[domain].skills;
      const skill = skills[i % skills.length];

      try {
        const question = await generateQuestionFromRealPassage(passage, domain, skill, 'Hard');
        questions.push({
          ...question,
          id: `M2_Q${i + 1}`,
          moduleId: 2,
        });
      } catch (error) {
        generationErrors.push(`M2_Q${i + 1}: ${error instanceof Error ? error.message : 'Failed'}`);
      }

      // Rate limiting
      if (i % 5 === 4) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Format response
    const module1Questions = questions.filter(q => q.moduleId === 1);
    const module2Questions = questions.filter(q => q.moduleId === 2);

    const testId = `placement_real_${Date.now()}`;

    return NextResponse.json({
      success: true,
      test: {
        testId,
        testName: `SAT_RW_Placement_Real_${new Date().toISOString().split('T')[0]}`,
        modules: [
          {
            moduleId: 1,
            difficulty: 'Medium',
            questions: module1Questions,
            generatedAt: new Date().toISOString(),
          },
          {
            moduleId: 2,
            difficulty: 'Hard',
            questions: module2Questions,
            generatedAt: new Date().toISOString(),
          },
        ],
        allPassages: questions.map(q => ({
          id: `passage_${q.id}`,
          source: q.passageSource,
          text: q.passage,
          moduleId: q.moduleId,
          questionId: q.id,
        })),
        sources: selectedSources.map(s => s.title),
        generatedAt: new Date().toISOString(),
      },
      stats: {
        totalQuestions: questions.length,
        totalPassages: questions.length,
        sourcesUsed: selectedSources.length,
        fetchErrors: fetchErrors.length,
        generationErrors: generationErrors.length,
      },
      errors: [...fetchErrors, ...generationErrors].length > 0
        ? [...fetchErrors, ...generationErrors]
        : undefined,
    });
  } catch (error) {
    console.error('Placement test generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
