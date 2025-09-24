import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

interface FunnyFace {
  id: string;
  image_url: string;
  alt_text: string;
}

export function useContent() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [faces, setFaces] = useState<FunnyFace[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [currentFace, setCurrentFace] = useState<FunnyFace | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    // Load quotes
    const { data: quotesData } = await supabase
      .from('quotes')
      .select('*')
      .eq('is_active', true);

    // Load faces
    const { data: facesData } = await supabase
      .from('funny_faces')
      .select('*')
      .eq('is_active', true);

    if (quotesData) {
      setQuotes(quotesData);
      setCurrentQuote(quotesData[Math.floor(Math.random() * quotesData.length)]);
    }

    if (facesData) {
      setFaces(facesData);
      setCurrentFace(facesData[Math.floor(Math.random() * facesData.length)]);
    }
  };

  const getRandomQuote = () => {
    if (quotes.length === 0) return null;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
    return randomQuote;
  };

  const getRandomFace = () => {
    if (faces.length === 0) return null;
    const randomFace = faces[Math.floor(Math.random() * faces.length)];
    setCurrentFace(randomFace);
    return randomFace;
  };

  return {
    quotes,
    faces,
    currentQuote,
    currentFace,
    getRandomQuote,
    getRandomFace,
    refreshContent: loadContent
  };
}