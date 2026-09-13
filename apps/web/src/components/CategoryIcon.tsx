import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Home, 
  Banknote, 
  Share2, 
  Zap, 
  Tag, 
  Briefcase, 
  Car, 
  Film, 
  Utensils, 
  HeartPulse 
} from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export const COMMON_ICONS = [
  { id: 'trending-up', label: 'Trending Up', Icon: TrendingUp },
  { id: 'shopping-cart', label: 'Shopping Cart', Icon: ShoppingCart },
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'cash', label: 'Cash / Income', Icon: Banknote },
  { id: 'share', label: 'Share / Dividends', Icon: Share2 },
  { id: 'zap', label: 'Utilities / Bills', Icon: Zap },
  { id: 'briefcase', label: 'Work / Business', Icon: Briefcase },
  { id: 'car', label: 'Transport / Car', Icon: Car },
  { id: 'film', label: 'Entertainment', Icon: Film },
  { id: 'utensils', label: 'Food & Dining', Icon: Utensils },
  { id: 'heart-pulse', label: 'Health', Icon: HeartPulse },
  { id: 'tag', label: 'General Tag', Icon: Tag },
];

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-5 h-5" }) => {
  const match = COMMON_ICONS.find((item) => item.id === name);
  const Component = match ? match.Icon : Tag;
  return <Component className={className} />;
};