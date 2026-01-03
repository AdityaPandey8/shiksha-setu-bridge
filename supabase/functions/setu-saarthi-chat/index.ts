/**
 * Setu Saarthi Chat Edge Function
 * 
 * AI-powered learning and career assistant for Shiksha Setu.
 * Uses Lovable AI Gateway for natural conversation.
 * 
 * Restricted to: Learning, Education, Career Guidance only.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Setu Saarthi chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Build a context-aware system prompt for Setu Saarthi
 */
function buildSystemPrompt(context?: {
  studentClass?: string;
  stream?: string;
  chapter?: string;
  language?: string;
}): string {
  const basePrompt = `You are "Setu Saarthi", the official AI learning and career assistant for Shiksha Setu, an educational app for students in Classes 6-10 in rural India.

YOUR PERSONALITY:
- Friendly, patient, and encouraging
- Use simple language suitable for young students
- Be supportive and motivating
- Explain concepts step-by-step

YOUR CAPABILITIES:
1. LEARNING SUPPORT:
   - Explain concepts from any subject (Math, Science, Hindi, English, Social Studies)
   - Break down complex topics into simple steps
   - Provide examples and analogies
   - Help with homework and doubts
   - Give quiz explanations (after they attempt)

2. CAREER GUIDANCE:
   - Explain different career paths: Mathematics, Biology, Arts, Commerce streams
   - Describe competitive exams (JEE, NEET, UPSC, etc.)
   - Suggest courses and skill development
   - Discuss job opportunities in different fields

3. STUDY TIPS:
   - Time management advice
   - Memory techniques
   - Exam preparation strategies
   - Motivation and confidence building

RESTRICTIONS:
- ONLY discuss learning, education, and career topics
- DO NOT provide quiz answers directly (give hints and explanations instead)
- DO NOT discuss violence, politics, adult content, or inappropriate topics
- If asked about off-topic subjects, respond: "I can help with learning and career guidance only. What would you like to learn today?"

RESPONSE STYLE:
- Keep responses concise but helpful
- Use bullet points for lists
- Include relevant emojis to make learning fun
- End with an encouraging note or follow-up question when appropriate`;

  // Add context if available
  let contextInfo = "";
  if (context) {
    if (context.studentClass) {
      contextInfo += `\n\nSTUDENT CONTEXT:
- Class: ${context.studentClass}`;
    }
    if (context.stream) {
      contextInfo += `\n- Interested Stream: ${context.stream}`;
    }
    if (context.chapter) {
      contextInfo += `\n- Currently studying: ${context.chapter}`;
    }
    if (context.language === "hindi") {
      contextInfo += `\n\nIMPORTANT: Respond in Hindi when the student writes in Hindi. Mix Hindi and English (Hinglish) naturally.`;
    }
  }

  return basePrompt + contextInfo;
}
