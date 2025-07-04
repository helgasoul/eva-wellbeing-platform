import React from 'react';
import './Card.css';

export interface CardProps {
  /**
   * Card contents
   */
  children: React.ReactNode;
  /**
   * Card variant - определяет стиль карточки
   */
  variant?: 'default' | 'gradient' | 'soft' | 'medical' | 'elevated';
  /**
   * Card padding size
   */
  padding?: 'small' | 'medium' | 'large';
  /**
   * Enable hover effects
   */
  hoverable?: boolean;
  /**
   * Card border radius
   */
  rounded?: 'small' | 'medium' | 'large';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Click handler - makes card clickable
   */
  onClick?: () => void;
  /**
   * Card header content
   */
  header?: React.ReactNode;
  /**
   * Card footer content  
   */
  footer?: React.ReactNode;
  /**
   * Background gradient direction
   */
  gradientDirection?: 'primary' | 'secondary' | 'tertiary' | 'soft';
}

/**
 * Card component в стиле Ema для платформы Eva
 * Поддерживает градиентные фоны, различные варианты и анимации
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  rounded = 'medium',
  className = '',
  onClick,
  header,
  footer,
  gradientDirection = 'primary',
  ...props
}) => {
  const baseClass = 'eva-card';
  const variantClass = `eva-card--${variant}`;
  const paddingClass = `eva-card--padding-${padding}`;
  const roundedClass = `eva-card--rounded-${rounded}`;
  const hoverableClass = hoverable ? 'eva-card--hoverable' : '';
  const clickableClass = onClick ? 'eva-card--clickable' : '';
  const gradientClass = variant === 'gradient' ? `eva-card--gradient-${gradientDirection}` : '';

  const cardClass = [
    baseClass,
    variantClass,
    paddingClass,
    roundedClass,
    hoverableClass,
    clickableClass,
    gradientClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <CardComponent
      className={cardClass}
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="eva-card__header">
          {header}
        </div>
      )}
      
      <div className="eva-card__content">
        {children}
      </div>
      
      {footer && (
        <div className="eva-card__footer">
          {footer}
        </div>
      )}
    </CardComponent>
  );
};

export default Card;