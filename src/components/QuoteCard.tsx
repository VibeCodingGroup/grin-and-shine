import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';

const QuoteCard: React.FC = () => {
  const { user } = useAuth();
  const { currentQuote, getRandomQuote } = useContent();
  const { trackQuoteView } = useAnalytics();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    // Track quote view when component mounts or quote changes
    if (currentQuote && user) {
      trackQuoteView();
    }
  }, [currentQuote?.id, user]);

  const getNewQuote = () => {
    const newQuote = getRandomQuote();
    if (newQuote && user) {
      trackQuoteView();
    }
  };

  const handleToggleFavorite = () => {
    if (currentQuote && user) {
      toggleFavorite('quote', currentQuote.id);
    }
  };

  if (!currentQuote) {
    return (
      <Card className="bg-gradient-subtle border-primary/20">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading inspirational quote...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-all duration-500 animate-bounce-in border-0">
      <div className="space-y-4">
        <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
          "{currentQuote.text}"
        </blockquote>
        {currentQuote.author && (
          <footer className="text-muted-foreground font-medium">
            — {currentQuote.author}
          </footer>
        )}
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            onClick={getNewQuote}
            variant="happy"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Quote
          </Button>
          {user && (
            <Button 
              onClick={handleToggleFavorite}
              variant={isFavorite('quote', currentQuote.id) ? "default" : "outline"}
              size="icon"
            >
              <Heart className={`h-4 w-4 ${isFavorite('quote', currentQuote.id) ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuoteCard;