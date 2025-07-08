import React, { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface AdminImageUploadProps {
  currentImage?: string;
  isEditing: boolean;
  onImageUpdate: (imageUrl: string) => void;
  alt: string;
  className?: string;
  uploadText?: string;
}

export const AdminImageUpload: React.FC<AdminImageUploadProps> = ({
  currentImage,
  isEditing,
  onImageUpdate,
  alt,
  className = "w-32 h-32 rounded-full object-cover",
  uploadText = "Изменить"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Временно используем URL.createObjectURL для демо
      // В реальном проекте здесь будет загрузка в Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      onImageUpdate(imageUrl);
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="relative group">
        <img
          src={currentImage || '/api/placeholder/150/150'}
          alt={alt}
          className={`${className} cursor-pointer transition-all hover:opacity-75`}
          onClick={() => fileInputRef.current?.click()}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <div className="text-white text-sm flex items-center">
              <Camera className="w-4 h-4 mr-1" />
              {uploadText}
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <img
      src={currentImage || '/api/placeholder/150/150'}
      alt={alt}
      className={className}
    />
  );
};