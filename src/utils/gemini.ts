import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserPersona, Meal } from '../context/NutritionContext';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
  } catch (e) {
    console.error('Failed to initialize Google Generative AI', e);
  }
}

const PERSONA_TIPS_PROMPT: Record<UserPersona, string> = {
  beginner: 'Offer simple, easy-to-understand nutrition advice. Highlight general balance, vitamins, and basic portion control. Keep it encouraging.',
  dieter: 'Focus heavily on satiety, calorie density, fiber, and how this fits into a calorie deficit or weight-loss plan. Point out hidden calorie traps.',
  athlete: 'Focus on macronutrient breakdown, protein density for muscle repair, glycogen replenishment (carbs), and recovery. Discuss performance benefits.',
  busypro: 'Provide practical hacks for convenience, meal prep ideas, mental focus benefits, sustained energy levels, and how to make this quicker or healthier on-the-go.'
};

export class GeminiScanError extends Error {
  constructor(
    message: string,
    public readonly code: 'MISSING_API_KEY' | 'API_ERROR' | 'PARSE_ERROR'
  ) {
    super(message);
    this.name = 'GeminiScanError';
  }
}

function parseGeminiJson(responseText: string): Record<string, unknown> {
  let cleanJson = responseText.trim();
  const fenceMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleanJson = fenceMatch[1].trim();
  }
  return JSON.parse(cleanJson);
}

const VALID_CATEGORIES = ['Home-cooked', 'Restaurant', 'Packaged', 'Snacks & Drinks'] as const;

/**
 * Estimates calories and macros from a base64 image using Gemini vision
 */
export async function estimateNutritionFromImage(
  base64Image: string,
  persona: UserPersona
): Promise<Omit<Meal, 'id' | 'timestamp' | 'date'>> {
  if (!API_KEY || !genAI) {
    throw new GeminiScanError(
      'Gemini API key is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file in the project root and restart the app.',
      'MISSING_API_KEY'
    );
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const systemPrompt = `
You are an elite, highly accurate AI nutritionist and food photo scanner.
Analyze the food photo provided, identify the dish(es), estimate portion sizes, and calculate calories and macronutrients (Protein, Carbs, Fats in grams).

You must respond in strict JSON format matching this schema:
{
  "name": "Dish Name (e.g. Crispy Chicken Burger with Lettuce)",
  "category": "Home-cooked" | "Restaurant" | "Packaged" | "Snacks & Drinks",
  "calories": 520,
  "protein": 35,
  "carbs": 42,
  "fats": 18,
  "ingredients": [
    { "name": "Chicken Patty", "size": "150g", "calories": 280 },
    { "name": "Sesame Bun", "size": "1 bun", "calories": 180 }
  ],
  "healthAdvice": "A short 2-3 sentence personalized nutritional review."
}

Context:
1. User persona: "${persona}". ${PERSONA_TIPS_PROMPT[persona]} Tailor "healthAdvice" to this profile.
2. "category" must be exactly one of: "Home-cooked", "Restaurant", "Packaged", "Snacks & Drinks".
3. Base all values on what you actually see in the photo. Do not guess unrelated foods.
4. Return ONLY valid JSON — no markdown, no explanation outside the JSON.
`;

  let responseText: string;
  try {
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
    ]);
    responseText = result.response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    throw new GeminiScanError(
      `Could not analyze this image: ${message}`,
      'API_ERROR'
    );
  }

  let parsedData: Record<string, unknown>;
  try {
    parsedData = parseGeminiJson(responseText);
  } catch {
    console.error('Failed to parse Gemini response:', responseText);
    throw new GeminiScanError(
      'AI returned an invalid response. Please try scanning again.',
      'PARSE_ERROR'
    );
  }

  const rawCategory = String(parsedData.category || 'Home-cooked');
  const category = VALID_CATEGORIES.includes(rawCategory as typeof VALID_CATEGORIES[number])
    ? (rawCategory as Meal['category'])
    : 'Home-cooked';

  const ingredients = Array.isArray(parsedData.ingredients)
    ? parsedData.ingredients.map((ing: unknown) => {
        const item = ing as Record<string, unknown>;
        return {
          name: String(item.name || 'Ingredient'),
          size: String(item.size || ''),
          calories: Math.round(Number(item.calories || 0)),
        };
      })
    : [];

  return {
    name: String(parsedData.name || 'Scanned Meal'),
    category,
    calories: Math.round(Number(parsedData.calories || 0)),
    protein: Math.round(Number(parsedData.protein || 0)),
    carbs: Math.round(Number(parsedData.carbs || 0)),
    fats: Math.round(Number(parsedData.fats || 0)),
    ingredients,
    healthAdvice: String(parsedData.healthAdvice || ''),
  };
}
