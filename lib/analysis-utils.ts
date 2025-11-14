import { generateObject, generateText } from "ai";
import { PersonalizedPlan, SkillLevel, LearningUnit } from "./types";
import { z } from "zod";
import { ANALYSIS_MODEL } from "./constants";
const PersonalizedPlanSchema = z.object({
  skills: z.array(
    z.object({
      category: z.string(),
      level: z.number(),
      trend: z.enum(["improving", "stable", "declining"]),
    })
  ),
  currentLevel: z.string(),
  nextLevel: z.string(),
  learningUnits: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.enum(["grammar", "vocabulary", "conversation", "pronunciation"]),
      difficulty: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
      estimatedMinutes: z.number(),
    })
  ),
  coachingTips: z.array(z.string()),
  weakAreas: z.array(z.string()),
  strengths: z.array(z.string()),
});

export async function analyzeTranscriptWithAI(
  transcript: string,
  nativeLanguage: string,
  targetLanguage: string,
  userGoal: string,
  previousPlan?: PersonalizedPlan
): Promise<PersonalizedPlan> {
  try {
    const modelName = ANALYSIS_MODEL;

    console.log(
      "[v0] Analyzing transcript with AI via Vercel Gateway:",
      modelName
    );

    const { object } = await generateObject({
      model: modelName,
      prompt: buildAnalysisPrompt({
        transcript,
        nativeLanguage,
        targetLanguage,
        userGoal,
        previousPlan,
      }),
      schema: PersonalizedPlanSchema,
    });

    console.log("[v0] AI response:", object);

    const parsed = object;
    const validated = PersonalizedPlanSchema.parse(parsed);

    const plan: PersonalizedPlan = {
      userId: "",
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
    console.error("[v0] Error analyzing transcript:", error);
    throw error;
  }
}

export function buildAnalysisPrompt({
  transcript,
  nativeLanguage,
  targetLanguage,
  userGoal,
  previousPlan,
}: {
  transcript: string;
  nativeLanguage: string;
  targetLanguage: string;
  userGoal: string;
  previousPlan?: any;
}) {
  return `
You are LangWiseAI Analyst — an expert in language assessment and personalized curriculum design.

Your job:
Given a conversation transcript and user context, produce a JSON object that STRICTLY follows the PersonalizedPlanSchema. 
You MUST return valid JSON only with no commentary.

-----------------------
### User Data
Native Language: ${nativeLanguage}
Target Language: ${targetLanguage}
Learning Goal: ${userGoal}

${
  previousPlan
    ? `Previous Personalized Plan (for trend comparison): ${JSON.stringify(
        previousPlan
      )}`
    : `No previous plan. All skill trends should default to "stable".`
}

-----------------------
### Transcript
${transcript}

-----------------------
### Your Tasks
1. Analyze the transcript to evaluate the user's overall language performance.
2. Identify strengths and weak areas based on real conversational evidence.
3. Produce skill levels (0-100) for: Grammar, Vocabulary, Fluency, Pronunciation, Listening, Confidence.
4. Determine CEFR currentLevel and nextLevel (A1-C2).
5. Create 3-6 tailored learning units:
   - id (string)
   - title
   - description
   - type (grammar | vocabulary | conversation | pronunciation)
   - difficulty (A1-C2)
   - estimatedMinutes
6. Generate 3-5 actionable coachingTips.
7. Compare with previousPlan (if available) to assign each skill a trend:
   - improving
   - stable
   - declining

-----------------------
### Output Format (STRICT)
Return ONLY a JSON object matching this structure:

{
  "skills": [
    {
      "category": "Grammar" | "Vocabulary" | "Fluency" | "Pronunciation" | "Listening" | "Confidence",
      "level": number,
      "trend": "improving" | "stable" | "declining"
    }
  ],
  "currentLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "nextLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "learningUnits": [
    {
      "id": string,
      "title": string,
      "description": string,
      "type": "grammar" | "vocabulary" | "conversation" | "pronunciation",
      "difficulty": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
      "estimatedMinutes": number
    }
  ],
  "coachingTips": [string],
  "weakAreas": [string],
  "strengths": [string]
}

-----------------------
### Additional Requirements
- Personalize results using the user's goal and native language.
- Use CEFR standards for level selection.
`;
}
