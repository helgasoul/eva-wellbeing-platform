import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface CourseImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square';
  // Enhanced image props from database
  generatedImageUrl?: string;
  imageDescription?: string;
  imageKeywords?: string[];
  category?: string;
}

// Enhanced placeholder images categorized by course content
const categoryPlaceholders = {
  menopause_basics: [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=225&fit=crop&crop=center', // Woman with laptop
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop&crop=center' // Woman in white
  ],
  hormones: [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=225&fit=crop&crop=center', // Science/medical theme
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=225&fit=crop&crop=center' // Abstract/wellness
  ],
  nutrition: [
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=225&fit=crop&crop=center', // Natural/healthy
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=225&fit=crop&crop=center' // Fresh/natural
  ],
  mental_health: [
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=225&fit=crop&crop=center', // Peaceful
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=225&fit=crop&crop=center' // Calming nature
  ],
  sexuality: [
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=225&fit=crop&crop=center', // Gentle/natural
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=225&fit=crop&crop=center' // Mature woman
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop&crop=center', // Active lifestyle
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=225&fit=crop&crop=center' // Wellness
  ]
};

const getPlaceholderImage = (text: string, category?: string): string => {
  const categoryImages = category && categoryPlaceholders[category as keyof typeof categoryPlaceholders] 
    ? categoryPlaceholders[category as keyof typeof categoryPlaceholders]
    : categoryPlaceholders.menopause_basics;
  
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % categoryImages.length;
  return categoryImages[index];
};

export const CourseImage: React.FC<CourseImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = 'video',
  generatedImageUrl,
  imageDescription,
  imageKeywords,
  category
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass = aspectRatio === 'video' ? 'aspect-video' : 'aspect-square';
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Enhanced image source selection logic
  const getImageSource = (): string => {
    // Priority 1: Generated AI image (highest quality and relevance)
    if (generatedImageUrl && !imageError) return generatedImageUrl;
    
    // Priority 2: Original thumbnail URL
    if (src && !imageError) return src;
    
    // Priority 3: Category-specific placeholder
    return getPlaceholderImage(alt, category);
  };

  const imageSrc = getImageSource();
  const effectiveAlt = imageDescription || alt;

  return (
    <div className={`relative ${aspectClass} overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={effectiveAlt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      
      {/* Keywords overlay for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && imageKeywords && imageKeywords.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {imageKeywords.join(', ')}
        </div>
      )}
    </div>
  );
};