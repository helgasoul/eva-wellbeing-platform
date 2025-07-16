import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSlogan?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  showSlogan = false, 
  className = '' 
}) => {
  const sizeConfig = {
    sm: { icon: 24, text: 'text-lg', slogan: 'text-xs' },
    md: { icon: 32, text: 'text-xl', slogan: 'text-sm' },
    lg: { icon: 48, text: 'text-2xl', slogan: 'text-base' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col items-center">
        {/* Logo Icon */}
        <svg
          width={config.icon}
          height={config.icon}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Two vertical bars (pause symbol) */}
          <rect x="20" y="15" width="12" height="50" rx="6" fill="#8B7DD8" />
          <rect x="48" y="15" width="12" height="50" rx="6" fill="#8B7DD8" />
          
          {/* Flowing wave crossing through */}
          <path
            d="M10 30 Q25 25 40 35 Q55 45 70 30"
            stroke="#7DD3FC"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        
        {/* Main text */}
        {showText && (
          <div className={`${config.text} font-medium text-secondary-foreground mt-1`}>
            <span className="text-primary">без</span>
            <span className="text-muted-foreground mx-1">|</span>
            <span className="text-primary">паузы</span>
          </div>
        )}
        
        {/* Slogan */}
        {showSlogan && (
          <div className={`${config.slogan} text-muted-foreground mt-1 text-center`}>
            Твоя энергия — без паузы
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;