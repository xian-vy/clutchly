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

    // // Check rate limit
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
      .eq('org_id', userId)
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

    const systemPrompt = `You are a professional reptile genetic calculator. Your task is to analyze the genetic makeup of two reptiles and predict possible offspring outcomes based on their species-specific genetic inheritance patterns.

Rules:
1. ALWAYS consider the specific species being bred and apply appropriate genetic inheritance rules
2. Visual morphs are primary inheritable traits and must be calculated first
3. Consider both visual traits and het traits in calculations when available
4. For each species, apply:
   - Species-specific inheritance patterns
   - Known genetic combinations and interactions
   - Documented morph compatibility rules
   - Species-specific probability calculations
5. Provide accurate probabilities that sum to 100%
6. Consider all inheritance types:
   - Simple recessive
   - Dominant
   - Co-dominant
   - Incomplete dominant
   - Polygenic traits
   - Sex-linked traits where applicable
7. Account for:
   - Multiple gene interactions
   - Complex trait combinations
   - Known genetic incompatibilities
   - Super forms where applicable
8. Provide detailed explanations of genetic mechanisms
9. Never return "unknown morphs" if parents have visible morphs
10. Include genetic probability ratios in Punnett square format when applicable

Input:
Dam: ${JSON.stringify(input.dam)}
Sire: ${JSON.stringify(input.sire)}
Species: ${JSON.stringify(input.species)}

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
      // Sanitize the content before parsing
      const sanitizedContent = content
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\\[^"\\\/bfnrtu]/g, '\\\\$&') // Escape unescaped backslashes
        .replace(/\r?\n/g, '\\n') // Handle newlines properly
        .trim();
      
      const jsonContent = extractJsonFromMarkdown(sanitizedContent);
      
      // Additional validation before parsing
      if (!jsonContent.startsWith('{') || !jsonContent.endsWith('}')) {
        throw new Error('Invalid JSON format');
      }
      
      result = JSON.parse(jsonContent);
      
      // Validate the expected structure
      if (!result.possible_morphs || !result.possible_hets || !result.probability_summary || !result.detailed_analysis) {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw content:', data.choices[0].message.content);
      throw new Error('Failed to parse AI response');
    }

    // Save calculation to history
    await supabase.from('genetic_calculations').insert({
      org_id: userId,
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