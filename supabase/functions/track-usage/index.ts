import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    const { action_type, item_id } = await req.json();
    const today = new Date().toISOString().split('T')[0];

    // Update or insert daily usage
    const { error: usageError } = await supabase
      .from('daily_usage')
      .upsert({
        user_id: user.id,
        date: today,
        quotes_viewed: action_type === 'quote_viewed' ? 1 : 0,
        faces_viewed: action_type === 'face_viewed' ? 1 : 0,
        session_count: action_type === 'session_start' ? 1 : 0
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });

    if (usageError) {
      console.error('Usage tracking error:', usageError);
    }

    // Update user profile stats
    const updateData: any = {};
    if (action_type === 'quote_viewed') {
      updateData.total_quotes_viewed = { increment: 1 };
    } else if (action_type === 'face_viewed') {
      updateData.total_faces_viewed = { increment: 1 };
    }

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await supabase.rpc('update_user_streak', {
        user_uuid: user.id
      });

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Update totals
      const { error: totalError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (totalError) {
        console.error('Total update error:', totalError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in track-usage function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});