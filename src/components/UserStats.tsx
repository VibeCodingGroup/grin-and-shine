import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Flame, Calendar, Eye, Smile } from 'lucide-react';

interface UserProfile {
  streak_count: number;
  total_quotes_viewed: number;
  total_faces_viewed: number;
}

const UserStats: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('streak_count, total_quotes_viewed, total_faces_viewed')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  if (!profile) return null;

  return (
    <Card className="bg-gradient-subtle border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Your Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm text-muted-foreground">Streak</div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {profile.streak_count} days
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Quotes</div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {profile.total_quotes_viewed}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 col-span-2">
            <Smile className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-sm text-muted-foreground">Funny Faces</div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {profile.total_faces_viewed}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStats;