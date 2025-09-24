import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<{
    quotes: string[];
    faces: string[];
  }>({ quotes: [], faces: [] });

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('user_favorites')
      .select('item_type, item_id')
      .eq('user_id', user.id);

    if (data) {
      const quoteIds = data
        .filter(f => f.item_type === 'quote')
        .map(f => f.item_id);
      
      const faceIds = data
        .filter(f => f.item_type === 'face')
        .map(f => f.item_id);

      setFavorites({
        quotes: quoteIds,
        faces: faceIds
      });
    }
  };

  const toggleFavorite = async (itemType: 'quote' | 'face', itemId: string) => {
    if (!user?.id) return;

    const isFavorite = itemType === 'quote' 
      ? favorites.quotes.includes(itemId)
      : favorites.faces.includes(itemId);

    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      setFavorites(prev => ({
        ...prev,
        [itemType === 'quote' ? 'quotes' : 'faces']: 
          prev[itemType === 'quote' ? 'quotes' : 'faces'].filter(id => id !== itemId)
      }));
    } else {
      // Add to favorites
      await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId
        });

      setFavorites(prev => ({
        ...prev,
        [itemType === 'quote' ? 'quotes' : 'faces']: 
          [...prev[itemType === 'quote' ? 'quotes' : 'faces'], itemId]
      }));
    }
  };

  const isFavorite = (itemType: 'quote' | 'face', itemId: string) => {
    return itemType === 'quote' 
      ? favorites.quotes.includes(itemId)
      : favorites.faces.includes(itemId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
}