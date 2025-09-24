import { Card } from "@/components/ui/card";

interface FunnyFaceCardProps {
  imageUrl: string;
  altText: string;
}

export const FunnyFaceCard = ({ imageUrl, altText }: FunnyFaceCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/20 shadow-lg hover:shadow-xl transition-all duration-500 animate-bounce-in border-0 group">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-64 object-cover rounded-lg group-hover:scale-110 transition-transform duration-500 animate-float"
        />
      </div>
    </Card>
  );
};