import { useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import QuoteCard from "@/components/QuoteCard";
import FunnyFaceCard from "@/components/FunnyFaceCard";
import UserStats from '@/components/UserStats';
import { Shuffle, Heart, Smile, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
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
        <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
          <div></div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-bounce-in">
            Daily Happiness
          </h1>
          <div className="flex gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-lg md:text-xl">
          {currentDate}
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Heart className="text-primary animate-pulse" size={24} />
          <span className="text-lg font-medium text-foreground">Spread joy every day</span>
          <Smile className="text-secondary animate-bounce" size={24} />
        </div>
      </header>

      {user && (
        <div className="max-w-2xl mx-auto px-4 mb-8">
          <UserStats />
        </div>
      )}

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
            
            <QuoteCard />
          </div>

          {/* Funny Face Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
                Funny Face of the Moment
              </h2>
            </div>
            
            <FunnyFaceCard />
          </div>
        </div>

        {!user && (
          <div className="text-center mt-12 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
            <p className="text-lg text-foreground font-medium mb-4">
              Sign up to track your happiness journey, save favorites, and build your daily streak! 😊
            </p>
            <Link to="/auth">
              <Button size="lg" variant="happy">
                Get Started
              </Button>
            </Link>
          </div>
        )}

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