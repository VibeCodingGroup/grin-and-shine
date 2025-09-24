import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuoteCard } from "@/components/QuoteCard";
import { FunnyFaceCard } from "@/components/FunnyFaceCard";
import { Shuffle, Heart, Smile } from "lucide-react";

// Import funny face images
import funnyFace1 from "@/assets/funny-face-1.png";
import funnyFace2 from "@/assets/funny-face-2.png";
import funnyFace3 from "@/assets/funny-face-3.png";
import funnyFace4 from "@/assets/funny-face-4.png";

const motivationalQuotes = [
  {
    quote: "The best way to cheer yourself up is to try to cheer somebody else up.",
    author: "Mark Twain"
  },
  {
    quote: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama"
  },
  {
    quote: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius"
  },
  {
    quote: "The purpose of life is to live it, to taste experience to the utmost.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  }
];

const funnyFaces = [
  { url: funnyFace1, alt: "Goofy cartoon face with crossed eyes and wild hair" },
  { url: funnyFace2, alt: "Silly emoji face with tongue out and winking" },
  { url: funnyFace3, alt: "Character with big glasses and buck teeth" },
  { url: funnyFace4, alt: "Laughing face with squinted eyes and dimples" }
];

const Index = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);

  const getNewQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalQuotes.length);
    } while (newIndex === currentQuoteIndex);
    setCurrentQuoteIndex(newIndex);
  };

  const getNewFace = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * funnyFaces.length);
    } while (newIndex === currentFaceIndex);
    setCurrentFaceIndex(newIndex);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 animate-bounce-in">
          Daily Happiness
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          {currentDate}
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Heart className="text-primary animate-pulse" size={24} />
          <span className="text-lg font-medium text-foreground">Spread joy every day</span>
          <Smile className="text-secondary animate-bounce" size={24} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Quote Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
                Your Daily Motivation
              </h2>
            </div>
            
            <QuoteCard
              quote={motivationalQuotes[currentQuoteIndex].quote}
              author={motivationalQuotes[currentQuoteIndex].author}
            />
            
            <div className="text-center">
              <Button
                onClick={getNewQuote}
                variant="happy"
                size="lg"
                className="px-8 py-3"
              >
                <Shuffle className="mr-2" size={20} />
                New Quote
              </Button>
            </div>
          </div>

          {/* Funny Face Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
                Funny Face of the Moment
              </h2>
            </div>
            
            <FunnyFaceCard
              imageUrl={funnyFaces[currentFaceIndex].url}
              altText={funnyFaces[currentFaceIndex].alt}
            />
            
            <div className="text-center">
              <Button
                onClick={getNewFace}
                variant="fun"
                size="lg"
                className="px-8 py-3"
              >
                <Smile className="mr-2" size={20} />
                New Face
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
          <p className="text-lg text-foreground font-medium">
            Remember: A smile is the shortest distance between two people! 😊
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;