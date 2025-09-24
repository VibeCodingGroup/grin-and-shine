import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const { user } = useAuth();
  const [todaysUsage, setTodaysUsage] = useState({
    quotes_viewed: 0,
    faces_viewed: 0,
    session_count: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadTodaysUsage();
      incrementSessionCount();
    }
  }, [user?.id]);

  const loadTodaysUsage = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (data) {
      setTodaysUsage({
        quotes_viewed: data.quotes_viewed || 0,
        faces_viewed: data.faces_viewed || 0,
        session_count: data.session_count || 0
      });
    }
  };

  const incrementSessionCount = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existing) {
      await supabase
        .from('daily_usage')
        .update({
          session_count: (existing.session_count || 0) + 1
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('daily_usage')
        .insert({
          user_id: user.id,
          date: today,
          session_count: 1,
          quotes_viewed: 0,
          faces_viewed: 0
        });
    }

    setTodaysUsage(prev => ({
      ...prev,
      session_count: prev.session_count + 1
    }));
  };

  const trackQuoteView = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const newQuoteCount = (existing?.quotes_viewed || 0) + 1;

    if (existing) {
      await supabase
        .from('daily_usage')
        .update({
          quotes_viewed: newQuoteCount
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('daily_usage')
        .insert({
          user_id: user.id,
          date: today,
          quotes_viewed: 1,
          faces_viewed: 0,
          session_count: 1
        });
    }

    // Update user profile total
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('total_quotes_viewed')
      .eq('user_id', user.id)
      .single();

    if (currentProfile) {
      await supabase
        .from('profiles')
        .update({
          total_quotes_viewed: (currentProfile.total_quotes_viewed || 0) + 1
        })
        .eq('user_id', user.id);
    }

    setTodaysUsage(prev => ({
      ...prev,
      quotes_viewed: newQuoteCount
    }));
  };

  const trackFaceView = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const newFaceCount = (existing?.faces_viewed || 0) + 1;

    if (existing) {
      await supabase
        .from('daily_usage')
        .update({
          faces_viewed: newFaceCount
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('daily_usage')
        .insert({
          user_id: user.id,
          date: today,
          faces_viewed: 1,
          quotes_viewed: 0,
          session_count: 1
        });
    }

    // Update user profile total
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('total_faces_viewed')
      .eq('user_id', user.id)
      .single();

    if (currentProfile) {
      await supabase
        .from('profiles')
        .update({
          total_faces_viewed: (currentProfile.total_faces_viewed || 0) + 1
        })
        .eq('user_id', user.id);
    }

    setTodaysUsage(prev => ({
      ...prev,
      faces_viewed: newFaceCount
    }));
  };

  return {
    todaysUsage,
    trackQuoteView,
    trackFaceView
  };
}