import Groq from 'groq-sdk';
import crypto from 'crypto';
import { cacheService } from '../lib/redis';
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

export const aiService = {
  resolveDoubt: async (intelId: string, question: string, context: IntelContext): Promise<string> => {
    const cacheKey = generateCacheKey(intelId, question);
    
    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const systemPrompt = `You are an expert technical tutor. Answer the user's question directly and concisely based ONLY on the following context. If the answer is not in the context or requires external code compilation, provide a conceptually accurate explanation. Do not use markdown headers.
    
Context:
Title: ${context.title}
Description: ${context.description}
Tags: ${context.tags.join(', ')}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 250,
      }, { signal: controller.signal });

      clearTimeout(timeout);

      const responseText = completion.choices[0]?.message?.content || 'I am unable to process this doubt right now.';
      
      await cacheService.set(cacheKey, responseText, 604800); 

      return responseText;

    } catch (error: any) {
      console.error("GROQ CRASH REASON:", error);
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
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
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 100,
      }, { signal: controller.signal });

      clearTimeout(timeout);
      
      const challengeText = completion.choices[0]?.message?.content || 'Explain the main concept of this resource in your own words.';
      
      await cacheService.set(cacheKey, challengeText, 2592000); 

      return challengeText;
    } catch (error) {
      clearTimeout(timeout);
      return 'Explain the main concept of this resource in your own words.'; 
    }
  },

  evaluateFeynman: async (context: IntelContext, challenge: string, response: string): Promise<{ passed: boolean, feedback: string }> => {
    const systemPrompt = `You are an expert evaluator. The user is trying to explain a technical concept using the Feynman Technique. 
    
Context: ${context.title}
Question Asked: ${challenge}
User's Answer: ${response}

Determine if the user's answer demonstrates a solid fundamental understanding of the concept. It does not need to be perfect, but it must not be fundamentally incorrect.

You MUST respond in strict JSON format with exactly two keys:
"passed": boolean (true if they understand it, false if they don't)
"feedback": string (1-2 sentences of encouraging feedback or correction)

Do not include any text outside of the JSON object.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        max_tokens: 150,
      });

      const resultText = completion.choices[0]?.message?.content || '{"passed":true,"feedback":"Good effort."}';
      return JSON.parse(resultText);
    } catch (error) {
      return { passed: true, feedback: 'Validation bypassed due to server load. Good work.' };
    }
  }
};