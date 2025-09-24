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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');

    if (type === 'quotes') {
      let query = supabase
        .from('quotes')
        .select('*')
        .eq('is_active', true);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ success: true, quotes: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'faces') {
      const { data, error } = await supabase
        .from('funny_faces')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ success: true, faces: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'random-quote') {
      let query = supabase
        .from('quotes')
        .select('*')
        .eq('is_active', true);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No quotes found');
      }

      // Return random quote
      const randomQuote = data[Math.floor(Math.random() * data.length)];

      return new Response(JSON.stringify({ success: true, quote: randomQuote }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'random-face') {
      const { data, error } = await supabase
        .from('funny_faces')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No faces found');
      }

      // Return random face
      const randomFace = data[Math.floor(Math.random() * data.length)];

      return new Response(JSON.stringify({ success: true, face: randomFace }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'categories') {
      const { data, error } = await supabase
        .from('quotes')
        .select('category')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const categories = [...new Set(data?.map(item => item.category))].filter(Boolean);

      return new Response(JSON.stringify({ success: true, categories }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid content type');

  } catch (error) {
    console.error('Error in get-content function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});