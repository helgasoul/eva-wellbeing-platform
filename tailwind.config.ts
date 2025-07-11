
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				trust: {
					DEFAULT: 'hsl(var(--trust))',
					foreground: 'hsl(var(--trust-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				mint: {
					DEFAULT: 'hsl(var(--mint))',
					light: 'hsl(var(--mint-light))',
					foreground: 'hsl(var(--mint-foreground))'
				},
				orange: {
					DEFAULT: 'hsl(var(--orange))',
					light: 'hsl(var(--orange-light))',
					foreground: 'hsl(var(--orange-foreground))'
				},
				purple: {
					DEFAULT: 'hsl(var(--purple))',
					light: 'hsl(var(--purple-light))',
					foreground: 'hsl(var(--purple-foreground))'
				},
				'soft-purple': {
					DEFAULT: 'hsl(var(--soft-purple))',
					foreground: 'hsl(var(--soft-purple-foreground))'
				},
				'soft-pink': {
					DEFAULT: 'hsl(var(--soft-pink))',
					foreground: 'hsl(var(--soft-pink-foreground))'
				},
				'soft-blue': {
					DEFAULT: 'hsl(var(--soft-blue))',
					foreground: 'hsl(var(--soft-blue-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontSize: {
				'xs': ['14px', { lineHeight: '1.6' }],
				'sm': ['16px', { lineHeight: '1.7' }],
				'base': ['18px', { lineHeight: '1.8' }], // Increased from 16px
				'lg': ['20px', { lineHeight: '1.8' }], // Increased from 18px
				'xl': ['22px', { lineHeight: '1.8' }], // Increased from 20px
				'2xl': ['28px', { lineHeight: '1.6' }], // Increased from 24px
				'3xl': ['32px', { lineHeight: '1.5' }], // Increased from 30px
				'4xl': ['40px', { lineHeight: '1.4' }], // Increased from 36px
				'5xl': ['52px', { lineHeight: '1.3' }], // Increased from 48px
				'6xl': ['64px', { lineHeight: '1.2' }], // Increased from 60px
				'7xl': ['80px', { lineHeight: '1.1' }], // Increased from 72px
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'gentle-float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-15px)'
					}
				},
				'warm-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'gentle-float': 'gentle-float 4s ease-in-out infinite',
				'warm-pulse': 'warm-pulse 3s ease-in-out infinite'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
				'poppins': ['Poppins', 'sans-serif']
			},
			boxShadow: {
				// Google Material Design shadows
				'soft': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'elevated': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'floating': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
				
				// Legacy shadows (keeping for compatibility)
				'gentle': '0 4px 8px -2px rgba(203, 140, 79, 0.12), 0 2px 4px -1px rgba(203, 140, 79, 0.08)',
				'warm': '0 12px 20px -4px rgba(203, 140, 79, 0.15), 0 4px 8px -2px rgba(203, 140, 79, 0.08)',
				'cozy': '0 24px 32px -8px rgba(203, 140, 79, 0.18), 0 8px 16px -4px rgba(203, 140, 79, 0.1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
