-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  streak_count INTEGER DEFAULT 0,
  last_visit_date DATE,
  total_quotes_viewed INTEGER DEFAULT 0,
  total_faces_viewed INTEGER DEFAULT 0
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create motivational quotes table for dynamic content
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'motivation',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create funny faces table for dynamic content
CREATE TABLE public.funny_faces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('quote', 'face')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Create daily usage tracking
CREATE TABLE public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quotes_viewed INTEGER DEFAULT 0,
  faces_viewed INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funny_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for quotes (public read, admin write)
CREATE POLICY "Everyone can view active quotes" 
ON public.quotes 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for funny faces (public read, admin write)
CREATE POLICY "Everyone can view active faces" 
ON public.funny_faces 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for user favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for daily usage
CREATE POLICY "Users can view their own usage" 
ON public.daily_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
ON public.daily_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
ON public.daily_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Function to update user streak
CREATE OR REPLACE FUNCTION public.update_user_streak(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_streak INTEGER := 0;
  last_visit DATE;
  today DATE := CURRENT_DATE;
BEGIN
  -- Get user's last visit date
  SELECT last_visit_date INTO last_visit
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- Calculate streak
  IF last_visit IS NULL THEN
    current_streak := 1;
  ELSIF last_visit = today THEN
    -- Already visited today, return current streak
    SELECT streak_count INTO current_streak
    FROM public.profiles
    WHERE user_id = user_uuid;
    RETURN current_streak;
  ELSIF last_visit = today - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    SELECT streak_count + 1 INTO current_streak
    FROM public.profiles
    WHERE user_id = user_uuid;
  ELSE
    -- Streak broken, reset to 1
    current_streak := 1;
  END IF;
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    streak_count = current_streak,
    last_visit_date = today
  WHERE user_id = user_uuid;
  
  RETURN current_streak;
END;
$$;

-- Insert initial motivational quotes
INSERT INTO public.quotes (text, author, category) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams'),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'inspiration'),
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'action'),
('Don''t let yesterday take up too much of today.', 'Will Rogers', 'mindfulness'),
('You learn more from failure than from success.', 'Unknown', 'growth'),
('If you are working on something that you really care about, you don''t have to be pushed.', 'Steve Jobs', 'passion'),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'confidence'),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'journey');

-- Insert funny face references (using existing assets)
INSERT INTO public.funny_faces (image_url, alt_text) VALUES
('/src/assets/funny-face-1.png', 'Silly grinning face with big smile'),
('/src/assets/funny-face-2.png', 'Funny face with tongue out'),
('/src/assets/funny-face-3.png', 'Winking silly face'),
('/src/assets/funny-face-4.png', 'Cheerful laughing face');