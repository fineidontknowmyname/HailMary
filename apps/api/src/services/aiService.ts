import Groq from 'groq-sdk';
import crypto from 'crypto';
import { cacheService } from '../lib/redis';
import { SYSTEM_PROMPTS } from '../utils/prompts';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateCacheKey = (intelId: string, question: string): string => {
  const hash = crypto.createHash('sha256').update(`${intelId}:${question.toLowerCase().trim()}`).digest('hex');
  return `doubt:${hash}`;
};

interface IntelContext {
  title: string;
  description: string;
  tags: string[];
}

export type AiMode = 'tutor' | 'debugger';

const FEYNMAN_FALLBACK = {
  passed: true,
  feedback: "Our grader is temporarily unavailable, so this wasn't checked. It's marked complete but not verified — you can re-verify it later.",
  verifiedBy: 'fallback',
  misconception: null,
} as const;

export const aiService = {
  resolveDoubt: async (
    intelId: string,
    question: string,
    context: IntelContext,
    mode: AiMode = 'tutor'
  ): Promise<string> => {
    const cacheKey = generateCacheKey(intelId, question);
    
    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Build the system prompt based on the requested mode
    const topic = `${context.title} (${context.tags.join(', ')})`;
    let modePrompt: string;

    switch (mode) {
      case 'debugger': {
        const language = context.tags[0] || context.title;
        modePrompt = SYSTEM_PROMPTS.CODE_DEBUGGER(language);
        break;
      }
      case 'tutor':
      default:
        modePrompt = SYSTEM_PROMPTS.ULTIMATE_TUTOR(topic);
        break;
    }

    const systemPrompt = `${modePrompt.trim()}

Resource context:
- Title: ${context.title}
- Description: ${context.description}
- Tags: ${context.tags.join(', ')}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.4,
        max_tokens: 600,
      }, { signal: controller.signal });

      clearTimeout(timeout);

      const responseText = completion.choices[0]?.message?.content || 'I am unable to process this doubt right now.';
      
      await cacheService.set(cacheKey, responseText, 604800); 

      return responseText;

    } catch (error) {
      console.error("GROQ CRASH REASON:", error);
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('AI processing timed out. Please try again.');
      }
      throw new Error('Failed to resolve doubt via AI Service.');
    }
  },
  generateChallenge: async (intelId: string, context: IntelContext): Promise<string> => {
    const cacheKey = `challenge:${intelId}`;
    const cachedChallenge = await cacheService.get(cacheKey);
    
    if (cachedChallenge) {
      return cachedChallenge;
    }

    const systemPrompt = `You are a strict but encouraging technical mentor. Based on the provided context, generate exactly one thought-provoking question that tests if a student truly understands the core concept. The question must require a written explanation, not a yes/no answer. Keep it under 2 sentences.

Context:
Title: ${context.title}
Description: ${context.description}
Tags: ${context.tags.join(', ')}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: 'openai/gpt-oss-20b',
        temperature: 0.5,
        max_tokens: 350,
      }, { signal: controller.signal });

      clearTimeout(timeout);
      
      const challengeText = completion.choices[0]?.message?.content || 'Explain the main concept of this resource in your own words.';
      
      await cacheService.set(cacheKey, challengeText, 2592000); 

      return challengeText;
    } catch {
      clearTimeout(timeout);
      return 'Explain the main concept of this resource in your own words.';
    }
  },

  evaluateFeynman: async (
    context: IntelContext,
    challenge: string,
    response: string
  ): Promise<{ passed: boolean; feedback: string; verifiedBy: 'ai' | 'fallback'; misconception: string | null }> => {
    const systemPrompt = `You are an expert evaluator. The user is trying to explain a technical concept using the Feynman Technique.

Context: ${context.title}
Question Asked: ${challenge}
User's Answer: ${response}

Determine if the user's answer demonstrates a solid fundamental understanding of the concept. It does not need to be perfect, but it must not be fundamentally incorrect.

You MUST respond in strict JSON format with exactly these keys:
"passed": boolean (true if they understand it, false if they don't)
"feedback": string (1-2 sentences of encouraging feedback or correction)
"misconception": string or null (when "passed" is false, a short 3-6 word tag naming the specific misunderstanding, e.g. "confuses latency with throughput" or "misses the base case"; null when "passed" is true)

Do not include any text outside of the JSON object.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: 'openai/gpt-oss-20b',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        max_tokens: 300,
      }, { signal: controller.signal });

      clearTimeout(timeout);

      const resultText = completion.choices[0]?.message?.content;
      if (!resultText) {
        return FEYNMAN_FALLBACK;
      }

      const parsed = JSON.parse(resultText) as { passed?: unknown; feedback?: unknown; misconception?: unknown };
      if (typeof parsed.passed !== 'boolean') {
        return FEYNMAN_FALLBACK;
      }

      return {
        passed: parsed.passed,
        feedback: typeof parsed.feedback === 'string' && parsed.feedback.trim()
          ? parsed.feedback
          : (parsed.passed ? 'Solid explanation.' : 'Not quite — revisit the core idea and try again.'),
        verifiedBy: 'ai',
        misconception: !parsed.passed && typeof parsed.misconception === 'string' && parsed.misconception.trim()
          ? parsed.misconception.trim()
          : null,
      };
    } catch (error) {
      console.error('FEYNMAN EVAL FAILED:', error);
      clearTimeout(timeout);
      return FEYNMAN_FALLBACK;
    }
  },

  tutorSession: async (
    resourceTitle: string,
    userMessage: string,
    mode: AiMode = 'tutor',
    strugglingTopics: string[] = []
  ): Promise<string> => {
    let modePrompt: string;

    switch (mode) {
      case 'debugger':
        modePrompt = SYSTEM_PROMPTS.CODE_DEBUGGER(resourceTitle);
        break;
      case 'tutor':
      default:
        modePrompt = SYSTEM_PROMPTS.ULTIMATE_TUTOR(resourceTitle);
        break;
    }

    const struggleNote = strugglingTopics.length > 0
      ? `\n\nThis learner has recently struggled with or tested weak on: ${strugglingTopics.join(', ')}. If the question touches any of these, slow down and check their reasoning rather than just giving the answer.`
      : '';

    const systemPrompt = `${modePrompt.trim()}${struggleNote}

Keep responses under 3 short paragraphs. Use markdown for code snippets.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.6,
        max_tokens: 700,
      }, { signal: controller.signal });

      clearTimeout(timeout);
      
      return completion.choices[0]?.message?.content || 'I encountered an error. Could you rephrase that?';
    } catch (error) {
      clearTimeout(timeout);
      console.error("Tutor Session Error:", error);
      return 'I encountered an error. Could you rephrase that?';
    }
  }
};