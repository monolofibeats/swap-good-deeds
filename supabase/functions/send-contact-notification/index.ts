import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  recipientUserId: string;
  senderUserId: string;
  itemType: "quest" | "listing";
  itemId: string;
  itemTitle: string;
  message: string;
}

// HTML escape function to prevent XSS in emails
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate and sanitize input
function validateInput(input: ContactNotificationRequest): void {
  // Validate message length
  if (!input.message || input.message.length > 2000) {
    throw new Error("Message must be between 1 and 2000 characters");
  }
  
  // Validate item title length
  if (!input.itemTitle || input.itemTitle.length > 500) {
    throw new Error("Item title must be between 1 and 500 characters");
  }
  
  // Validate item type
  if (!["quest", "listing"].includes(input.itemType)) {
    throw new Error("Invalid item type");
  }
  
  // Validate UUIDs format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (input.senderUserId && !uuidRegex.test(input.senderUserId)) {
    throw new Error("Invalid sender user ID format");
  }
  if (input.itemId && !uuidRegex.test(input.itemId)) {
    throw new Error("Invalid item ID format");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: senderUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !senderUser) {
      throw new Error("Unauthorized");
    }

    const requestBody: ContactNotificationRequest = await req.json();
    
    // Validate all inputs
    validateInput(requestBody);
    
    const { recipientUserId, senderUserId, itemType, itemId, itemTitle, message } = requestBody;

    // Validate UUIDs - skip if empty (like SWAP Team quests)
    if (!recipientUserId || recipientUserId.trim() === "") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "This is a system-created item, no message sent.",
          conversationId: null,
          emailSent: false,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url")
      .eq("user_id", senderUserId)
      .single();

    // Get recipient profile and email
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("display_name, user_id")
      .eq("user_id", recipientUserId)
      .single();

    if (!recipientProfile) {
      throw new Error("Recipient not found");
    }

    // Get recipient email from auth.users (service role can access this)
    let recipientEmail: string | undefined;
    try {
      const { data: recipientAuthData } = await supabase.auth.admin.getUserById(recipientUserId);
      recipientEmail = recipientAuthData?.user?.email;
    } catch (authError) {
      console.log("Could not fetch recipient email:", authError);
      // Continue without email - in-app message will still be sent
    }

    // 1. Create a DM conversation if it doesn't exist
    // First check if a DM already exists between these users
    const { data: existingConv } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", senderUserId);

    let conversationId: string | null = null;

    if (existingConv && existingConv.length > 0) {
      // Check if any of these conversations also include the recipient
      for (const conv of existingConv) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", recipientUserId)
          .single();

        if (otherParticipant) {
          // Check it's a DM (only 2 participants)
          const { count } = await supabase
            .from("conversation_participants")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.conversation_id);
          
          if (count === 2) {
            conversationId = conv.conversation_id;
            break;
          }
        }
      }
    }

    // Create new conversation if none exists
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          conversation_type: "dm",
          created_by: senderUserId,
          title: null,
        })
        .select()
        .single();

      if (convError) throw convError;
      conversationId = newConv.id;

      // Add both participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: conversationId, user_id: senderUserId },
        { conversation_id: conversationId, user_id: recipientUserId },
      ]);
    }

    // 2. Send the in-app message
    const itemLabel = itemType === "quest" ? "Quest" : "Listing";
    const fullMessage = `[Regarding ${itemLabel}: "${itemTitle}"]\n\n${message}`;

    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderUserId,
      content: fullMessage,
    });

    if (msgError) throw msgError;

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    // 3. Send email notification if Resend is configured
    // SECURITY: All user content is HTML-escaped to prevent XSS/injection attacks
    let emailSent = false;
    if (resendApiKey && recipientEmail) {
      try {
        // Sanitize all user-controlled content for HTML email
        const safeDisplayName = escapeHtml(senderProfile?.display_name || "Someone");
        const safeUsername = escapeHtml(senderProfile?.username || "user");
        const safeItemTitle = escapeHtml(itemTitle);
        const safeMessage = escapeHtml(message);
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "SWAP <notifications@resend.dev>",
            to: [recipientEmail],
            subject: `Someone messaged you about your ${itemLabel.toLowerCase()}!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #22c55e;">New Message on SWAP</h2>
                <p><strong>${safeDisplayName}</strong> (@${safeUsername}) sent you a message about your ${itemLabel.toLowerCase()} "<strong>${safeItemTitle}</strong>":</p>
                <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
                </div>
                <p>Log in to SWAP to reply!</p>
                <p style="color: #71717a; font-size: 14px;">– The SWAP Team 🌿</p>
              </div>
            `,
          }),
        });

        emailSent = emailResponse.ok;
        console.log("Email sent:", emailSent);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't throw - in-app message was sent successfully
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversationId,
        emailSent,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
