import React from 'react';
import './Button.css';

export interface ButtonProps {
  /**
   * Button contents
   */
  children: React.ReactNode;
  /**
   * Button variant - определяет стиль кнопки
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'soft';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button state
   */
  disabled?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Icon before text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon after text
   */
  rightIcon?: React.ReactNode;
}

/**
 * Button component в стиле Ema для платформы Eva
 * Поддерживает градиентные фоны, анимации и различные варианты
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseClass = 'eva-button';
  const variantClass = `eva-button--${variant}`;
  const sizeClass = `eva-button--${size}`;
  const disabledClass = disabled ? 'eva-button--disabled' : '';
  const loadingClass = loading ? 'eva-button--loading' : '';
  const fullWidthClass = fullWidth ? 'eva-button--full-width' : '';

  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    disabledClass,
    loadingClass,
    fullWidthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <span className="eva-button__content">
        {leftIcon && (
          <span className="eva-button__icon eva-button__icon--left">
            {leftIcon}
          </span>
        )}
        
        <span className="eva-button__text">{children}</span>
        
        {rightIcon && (
          <span className="eva-button__icon eva-button__icon--right">
            {rightIcon}
          </span>
        )}
        
        {loading && (
          <span className="eva-button__spinner">
            <svg
              className="eva-button__spinner-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="60"
              />
            </svg>
          </span>
        )}
      </span>
    </button>
  );
};

export default Button;