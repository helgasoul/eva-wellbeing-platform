
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface CourseImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square';
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=225&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop'
];

export const CourseImage: React.FC<CourseImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'video'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectClass = aspectRatio === 'video' ? 'aspect-video' : 'aspect-square';
  
  // Get a consistent placeholder image based on alt text
  const getPlaceholderImage = (text: string) => {
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return placeholderImages[Math.abs(hash) % placeholderImages.length];
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // If no src provided or image failed to load, show placeholder
  if (!src || imageError) {
    return (
      <div className={`relative ${aspectClass} overflow-hidden ${className}`}>
        <img
          src={getPlaceholderImage(alt)}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={handleImageLoad}
          loading="lazy"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${aspectClass} overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
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
    </div>
  );
};
