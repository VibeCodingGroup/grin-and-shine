import { Card } from "@/components/ui/card";

interface QuoteCardProps {
  quote: string;
  author: string;
}

export const QuoteCard = ({ quote, author }: QuoteCardProps) => {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-all duration-500 animate-bounce-in border-0">
      <div className="space-y-4">
        <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
          "{quote}"
        </blockquote>
        <footer className="text-muted-foreground font-medium">
          — {author}
        </footer>
      </div>
    </Card>
  );
};