import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `Tu es un expert en nutrition. Tu reçois soit des données physiques pour calculer un TDEE, soit un repas pour extraire les calories/macros, soit une demande de liste de courses sous budget.
Tu réponds UNIQUEMENT en JSON valide selon ce format :
{ "type": "setup|track|shop", "data": {...} }

Pour "setup" (calcul TDEE), "data" doit contenir :
{ "tdee": number, "targetCalories": number, "targetProtein": number, "targetCarbs": number, "targetFat": number }

Pour "track" (analyse repas), "data" doit contenir :
{ "description": string, "calories": number, "protein": number, "carbs": number, "fat": number }

Pour "shop" (liste de courses), "data" doit contenir :
{ "items": [{ "name": string, "quantity": string, "price": string }] }

Pour la whey et les compléments, utilise des valeurs standards si non précisées.
Réponds UNIQUEMENT avec du JSON valide, aucun texte supplémentaire.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
