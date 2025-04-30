'use server'
import { NextRequest, NextResponse } from 'next/server';
import { GeneticCalculatorInput } from '@/lib/types/genetic-calculator';
import { createClient } from '@/lib/supabase/server'



// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const userRateLimits = new Map<string, number>();

function isRateLimited(userId: string): boolean {
  const lastRequest = userRateLimits.get(userId);
  const now = Date.now();
  
  if (!lastRequest || now - lastRequest >= RATE_LIMIT_WINDOW) {
    userRateLimits.set(userId, now);
    return false;
  }
  
  return true;
}

function extractJsonFromMarkdown(content: string): string {
  // Remove markdown code block markers
  const jsonContent = content.replace(/```json\n?|\n?```/g, '');
  return jsonContent.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { input }: { input: GeneticCalculatorInput } = await request.json();
    const supabase = await createClient()
    const currentUser= await supabase.auth.getUser()
    const userId = currentUser.data.user?.id

    if (!input) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check rate limit
     if (isRateLimited(userId)) {
       return NextResponse.json(
         { 
           error: 'Rate limit exceeded. Please wait 1 minute between calculations.',
           rateLimited: true 
         },
         { status: 429 }
       );
     }

    // Check if calculation already exists in history
    const { data: existingCalculation } = await supabase
      .from('genetic_calculations')
      .select('*')
      .eq('user_id', userId)
      .eq('dam_id', input.dam.id)
      .eq('sire_id', input.sire.id)
      .single();

    if (existingCalculation) {
      return NextResponse.json(
        { 
          error: 'This calculation already exists in your history.',
          result: existingCalculation.result
        },
        { status: 200 }
      );
    }

    const systemPrompt = `You are a professional reptile genetic calculator. Your task is to analyze the genetic makeup of two reptiles and predict possible offspring outcomes.

Rules:
1. ALWAYS consider visual morphs first - these are the primary inheritable traits
2. Visual morphs should be calculated even if no het traits are present
3. Consider both visual traits and het traits in your calculations when available
4. Provide probabilities for each possible morph and het combination
5. Explain the genetic inheritance patterns clearly
6. Consider dominant, recessive, and co-dominant traits
7. Account for multiple gene interactions
8. If parents have visual morphs but no hets, focus analysis on the visual traits
9. Never return "unknown morphs" if parents have visible morphs

Input:
Dam: ${JSON.stringify(input.dam)}
Sire: ${JSON.stringify(input.sire)}
Species : ${JSON.stringify(input.species)}

Please provide a detailed genetic analysis in the following JSON format:
{
  "possible_morphs": [
    {
      "name": "string",
      "probability": number,
      "description": "string"
    }
  ],
  "possible_hets": [
    {
      "trait": "string",
      "probability": number,
      "description": "string"
    }
  ],
  "probability_summary": "string",
  "detailed_analysis": "string"
}

IMPORTANT: Respond ONLY with the JSON object, no additional text or markdown formatting.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Please calculate the possible genetic outcomes in JSON format.' }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error(`Groq API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let result;
    try {
      const content = data.choices[0].message.content;
      const jsonContent = extractJsonFromMarkdown(content);
      result = JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }

    // Save calculation to history
    await supabase.from('genetic_calculations').insert({
      user_id: userId,
      dam_id: input.dam.id,
      sire_id: input.sire.id,
      result
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in genetic calculator API:', error);
    return NextResponse.json(
      { error: 'Failed to generate genetic calculation' },
      { status: 500 }
    );
  }
}