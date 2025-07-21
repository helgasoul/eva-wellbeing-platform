
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { CourseInstructor } from '@/types/academy';

interface InstructorAvatarProps {
  instructor: CourseInstructor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
};

export const InstructorAvatar: React.FC<InstructorAvatarProps> = ({
  instructor,
  size = 'sm',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {!imageError && instructor.photo_url ? (
        <AvatarImage
          src={instructor.photo_url}
          alt={`${instructor.name} - инструктор`}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <AvatarFallback className="bg-muted text-muted-foreground">
          {instructor.name ? getInitials(instructor.name) : <User className="w-4 h-4" />}
        </AvatarFallback>
      )}
    </Avatar>
  );
};
