import { generateText } from 'ai';
import { GEMINI_CONFIG, SKILL_CATEGORIES } from './constants';
import { PersonalizedPlan, SkillLevel, LearningUnit } from './types';
import { z } from 'zod';

const PersonalizedPlanSchema = z.object({
  skills: z.array(
    z.object({
      category: z.string(),
      level: z.number(),
      trend: z.enum(['improving', 'stable', 'declining']),
    })
  ),
  currentLevel: z.string(),
  nextLevel: z.string(),
  learningUnits: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.enum(['grammar', 'vocabulary', 'conversation', 'pronunciation']),
      difficulty: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
      estimatedMinutes: z.number(),
    })
  ),
  coachingTips: z.array(z.string()),
  weakAreas: z.array(z.string()),
  strengths: z.array(z.string()),
});

export async function analyzeTranscriptWithGemini(
  transcript: string,
  nativeLanguage: string,
  targetLanguage: string,
  userGoal: string,
  previousPlan?: PersonalizedPlan
): Promise<PersonalizedPlan> {
  const prompt = `You are an expert language assessment specialist. Analyze this conversation transcript and create a personalized learning plan.

Transcript:
${transcript}

Student Information:
- Native Language: ${nativeLanguage}
- Target Language: ${targetLanguage}
- Learning Goal: ${userGoal}

${previousPlan ? `Previous Assessment (for comparison): ${JSON.stringify(previousPlan)}` : ''}

Analyze the transcript and provide:
1. Skill assessment (0-100 scale) for: Grammar, Vocabulary, Fluency, Pronunciation, Listening, Confidence
2. Current CEFR level (A1-C2)
3. Target next level
4. 3-5 learning units tailored to their needs
5. 3-4 specific coaching tips
6. 2-3 main weak areas
7. 2-3 key strengths

Return ONLY valid JSON with this exact structure, no markdown:
{
  "skills": [
    {"category": "Grammar", "level": 65, "trend": "improving"},
    ...
  ],
  "currentLevel": "B1",
  "nextLevel": "B2",
  "learningUnits": [
    {
      "id": "unit-1",
      "title": "Present Perfect Tense",
      "description": "Master the present perfect for recent experiences",
      "type": "grammar",
      "difficulty": "B1",
      "estimatedMinutes": 25
    },
    ...
  ],
  "coachingTips": ["...", "...", "..."],
  "weakAreas": ["..."],
  "strengths": ["..."]
}`;

  try {
    console.log('[v0] Analyzing transcript with Gemini...');
    
    const { text } = await generateText({
      model: 'google:' + GEMINI_CONFIG.model,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    console.log('[v0] Gemini response:', text);

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = PersonalizedPlanSchema.parse(parsed);

    const plan: PersonalizedPlan = {
      userId: '',
      skills: validated.skills,
      currentLevel: validated.currentLevel,
      nextLevel: validated.nextLevel,
      learningUnits: validated.learningUnits,
      coachingTips: validated.coachingTips,
      weakAreas: validated.weakAreas,
      strengths: validated.strengths,
      generatedAt: new Date().toISOString(),
    };

    return plan;
  } catch (error) {
    console.error('[v0] Error analyzing transcript:', error);
    throw error;
  }
}
