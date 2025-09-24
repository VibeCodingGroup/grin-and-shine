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

    // Get user profile with streak info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get recent daily usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: dailyUsage, error: usageError } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (usageError) {
      throw usageError;
    }

    // Get favorites count
    const { data: favorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('item_type')
      .eq('user_id', user.id);

    if (favoritesError) {
      throw favoritesError;
    }

    const favoritesCount = {
      quotes: favorites?.filter(f => f.item_type === 'quote').length || 0,
      faces: favorites?.filter(f => f.item_type === 'face').length || 0,
      total: favorites?.length || 0
    };

    // Calculate total usage stats
    const totalStats = dailyUsage?.reduce((acc, day) => ({
      totalQuotesViewed: acc.totalQuotesViewed + (day.quotes_viewed || 0),
      totalFacesViewed: acc.totalFacesViewed + (day.faces_viewed || 0),
      totalSessions: acc.totalSessions + (day.session_count || 0),
      daysActive: acc.daysActive + ((day.quotes_viewed || 0) + (day.faces_viewed || 0) > 0 ? 1 : 0)
    }), {
      totalQuotesViewed: 0,
      totalFacesViewed: 0,
      totalSessions: 0,
      daysActive: 0
    }) || {
      totalQuotesViewed: 0,
      totalFacesViewed: 0,
      totalSessions: 0,
      daysActive: 0
    };

    const analytics = {
      profile: {
        display_name: profile.display_name,
        created_at: profile.created_at,
        streak_count: profile.streak_count,
        last_visit_date: profile.last_visit_date,
        total_quotes_viewed: profile.total_quotes_viewed,
        total_faces_viewed: profile.total_faces_viewed
      },
      recent_usage: dailyUsage,
      favorites: favoritesCount,
      stats: totalStats,
      achievements: {
        first_week: totalStats.daysActive >= 7,
        quote_enthusiast: profile.total_quotes_viewed >= 50,
        smile_collector: profile.total_faces_viewed >= 100,
        streak_master: profile.streak_count >= 7,
        daily_visitor: profile.streak_count >= 30
      }
    };

    return new Response(JSON.stringify({ success: true, analytics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in user-analytics function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});