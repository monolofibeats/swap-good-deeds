import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SWAP_CONTEXT = `You are the SWAP Help Assistant - a friendly, concise AI that answers questions about the SWAP platform.

ABOUT SWAP:
- SWAP is a global platform where people help the planet and each other, and get rewarded by local businesses
- It connects "Changemakers" (people who do good deeds) with "Supporters" (businesses that offer rewards)
- The platform is operated by Earth Swap

HOW IT WORKS:
1. Do something good (clean a beach, help a business, support your community)
2. Get verified (upload proof, reviewed by humans)
3. Get rewarded (earn SWAP Points, redeem for food, showers, beds, discounts)

USER TYPES:
- Changemaker: Someone who wants to help others and earn points. They complete quests, help with listings, and redeem points for rewards.
- Supporter: A business that offers rewards (meals, showers, stays, discounts) to changemakers. Requires admin approval.

KEY FEATURES:
- Quests: Official community cleanup or good deed missions
- Listings: User-created help requests or service offers
- SWAP Points: Currency earned by doing good, spent on rewards
- Rewards: Offered by local partner businesses

COMMON QUESTIONS:
- "How do I earn points?" → Complete quests or help with listings, then get verified
- "What rewards can I get?" → Food, showers, beds, and discounts from local partners
- "How do I become a Supporter?" → Apply through the platform, requires admin approval
- "Is SWAP free?" → Yes, SWAP is free to use for Changemakers

Keep responses brief (2-3 sentences max), friendly, and helpful. If you don't know something specific, suggest they sign up to explore the platform.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const languageInstruction = language === "de" 
      ? "\n\nIMPORTANT: Always respond in German (Deutsch)."
      : "\n\nIMPORTANT: Always respond in English.";

    console.log("Calling Lovable AI Gateway with messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SWAP_CONTEXT + languageInstruction },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("landing-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
