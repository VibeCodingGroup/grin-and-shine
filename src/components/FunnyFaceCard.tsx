import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart, Smile } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';

const FunnyFaceCard: React.FC = () => {
  const { user } = useAuth();
  const { currentFace, getRandomFace } = useContent();
  const { trackFaceView } = useAnalytics();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    // Track face view when component mounts or face changes
    if (currentFace && user) {
      trackFaceView();
    }
  }, [currentFace?.id, user]);

  const getNewFace = () => {
    const newFace = getRandomFace();
    if (newFace && user) {
      trackFaceView();
    }
  };

  const handleToggleFavorite = () => {
    if (currentFace && user) {
      toggleFavorite('face', currentFace.id);
    }
  };

  if (!currentFace) {
    return (
      <Card className="bg-gradient-subtle border-primary/20">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading funny face...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg hover:shadow-xl transition-all duration-500 animate-bounce-in border-0 group">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={currentFace.image_url}
          alt={currentFace.alt_text}
          className="w-full h-64 object-cover rounded-lg group-hover:scale-110 transition-transform duration-500 animate-float"
        />
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <Button 
          onClick={getNewFace}
          variant="fun"
          className="gap-2"
        >
          <Smile className="h-4 w-4" />
          New Face
        </Button>
        {user && (
          <Button 
            onClick={handleToggleFavorite}
            variant={isFavorite('face', currentFace.id) ? "default" : "outline"}
            size="icon"
          >
            <Heart className={`h-4 w-4 ${isFavorite('face', currentFace.id) ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FunnyFaceCard;