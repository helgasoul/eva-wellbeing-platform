import React, { useState, useEffect } from 'react';

interface AdminEditableSectionProps {
  title: string;
  content: string;
  isEditing: boolean;
  onUpdate: (newContent: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export const AdminEditableSection: React.FC<AdminEditableSectionProps> = ({
  title,
  content,
  isEditing,
  onUpdate,
  placeholder = "Введите текст...",
  multiline = false,
  className = ""
}) => {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (value: string) => {
    setLocalContent(value);
    onUpdate(value);
  };

  if (isEditing) {
    return (
      <div className={`relative group ${className}`}>
        <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full opacity-90 z-10">
          {title}
        </div>
        {multiline ? (
          <textarea
            value={localContent}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg bg-white/50 backdrop-blur-sm min-h-[120px] focus:border-purple-500 focus:outline-none resize-y transition-colors"
          />
        ) : (
          <input
            type="text"
            value={localContent}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg bg-white/50 backdrop-blur-sm focus:border-purple-500 focus:outline-none transition-colors"
          />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {content || placeholder}
    </div>
  );
};