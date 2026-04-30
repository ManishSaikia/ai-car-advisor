import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import carsData from '../../../data/cars.json';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price_inr: number;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_cc: number;
  mileage_kmpl: number;
  range_km: number | null;
  seating_capacity: number;
  safety_rating: {
    source: string;
    stars: number;
  };
  specs: {
    power_bhp: number;
    torque_nm: number;
    boot_space_litres: number;
    ground_clearance_mm: number;
    features: string[];
  };
  user_review: {
    summary: string;
    pros: string[];
    cons: string[];
    typical_buyer: string;
  };
}

export interface RecommendationResponse {
  car: Car;
  match_reason: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Minify car data to save tokens (omit large texts if necessary, but 25 cars is small enough)
    const availableCars = carsData.map((car: any) => ({
      id: car.id,
      make: car.make,
      model: car.model,
      price_inr: car.price_inr,
      body_type: car.body_type,
      fuel_type: car.fuel_type,
      seating_capacity: car.seating_capacity,
      transmission: car.transmission
    }));

    const systemPrompt = `
You are an expert Indian Car Advisor API.
Your goal is to eventually recommend the top 3 best cars from the provided dataset based on the user's chat history.
HOWEVER, do not recommend cars immediately unless you have enough information (at least 2-3 constraints like budget, fuel type, body type, or primary use case).
If you need more information to make a good recommendation, ask a helpful clarifying question to narrow down their choices.

**IMPORTANT NEW RULE**: If the user asks about a specific car by name (e.g., "tell me about Creta", "lets go with city", "show me Nexon EV"), check if it exists in the Available Cars Dataset. If it does, you MUST return a "type": "details" response with the UUID of that car to show them a detailed view.
When returning details, your "content" message MUST be enthusiastic and validate their choice (e.g., "Great choice! The Honda City is a fantastic sedan. Here are the details:"). If the car is not in the dataset, you can politely inform them you don't have details on that specific car and suggest alternatives.

Available Cars Dataset:
${JSON.stringify(availableCars)}

You must return a JSON object with the following keys:
- "type": strictly either "question", "recommendation", or "details".
- "content": the text message to show the user (your clarifying question, a brief intro to recommendations, or an enthusiastic validation of their specific car choice).
- "recommendations": if type is "recommendation", provide an array of exactly 3 objects. Otherwise, leave this array empty.
  Each recommendation object must have:
  - "id": The exact UUID of the recommended car from the dataset.
  - "match_reason": A 1-2 sentence convincing reason explaining why this car is a perfect match.
- "car_id": if type is "details", provide the exact UUID of the requested car here. Otherwise, omit this key.

Example for asking a question:
{
  "type": "question",
  "content": "I can help with that! To narrow it down, what is your approximate budget and do you prefer manual or automatic?",
  "recommendations": []
}

Example for recommending:
{
  "type": "recommendation",
  "content": "Based on your needs, here are the top 3 cars I recommend:",
  "recommendations": [
    { "id": "uuid-1", "match_reason": "Because you wanted a fuel-efficient 5-seater under 15 Lakhs." }
  ]
}

Example for specific car details:
{
  "type": "details",
  "content": "Excellent choice! The Hyundai Creta is a phenomenal family SUV. Here is everything you need to know about it:",
  "recommendations": [],
  "car_id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r"
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    let resultText = chatCompletion.choices[0]?.message?.content || '{}';
    
    // Clean up if the model wrapped it in markdown
    if (resultText.startsWith('\`\`\`json')) {
        resultText = resultText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }
    
    let parsed: any = { type: 'question', content: "I'm sorry, I couldn't understand that.", recommendations: [] };
    try {
        parsed = JSON.parse(resultText);
    } catch (e) {
        console.error("Failed to parse LLaMA response:", resultText);
        return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    // If it's a recommendation, attach full car data
    let finalRecommendations: RecommendationResponse[] = [];
    if (parsed.type === 'recommendation' && Array.isArray(parsed.recommendations)) {
      finalRecommendations = parsed.recommendations.slice(0, 3).map((rec: any) => {
        const fullCar = carsData.find(c => c.id === rec.id) as any;
        return {
          car: fullCar,
          match_reason: rec.match_reason
        };
      }).filter((rec: any) => rec.car !== undefined);
    }
    
    // If it's details, fetch the specific car
    let detailedCar: any = null;
    if (parsed.type === 'details' && parsed.car_id) {
      detailedCar = carsData.find(c => c.id === parsed.car_id) || null;
    }

    return NextResponse.json({
      type: parsed.type,
      content: parsed.content || "Here is what I found:",
      recommendations: finalRecommendations,
      detailedCar: detailedCar
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
