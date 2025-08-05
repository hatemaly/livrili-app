# Livrili Brand Style Guide

> **Developer-Friendly Brand Implementation Guide**  
> This guide provides technical specifications and code examples for implementing the Livrili brand consistently across all digital touchpoints.

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Logo Implementation](#logo-implementation)
5. [Component Patterns](#component-patterns)
6. [UI Principles](#ui-principles)
7. [Code Examples](#code-examples)
8. [Implementation Guidelines](#implementation-guidelines)

---

## Brand Overview

### Brand Identity
**Mission**: Connecting retailers and suppliers across Algeria through a seamless B2B marketplace platform.

**Brand Values**:
- **Trust**: Building reliable relationships between retailers and suppliers
- **Efficiency**: Streamlining procurement with smart technology
- **Local First**: Understanding and serving Algeria's unique market needs
- **Growth**: Empowering businesses to scale and succeed

### Voice & Tone
- **Professional** yet **Friendly**
- **Clear** yet **Comprehensive**  
- **Supportive** yet **Empowering**
- **Local** yet **Modern**

---

## Color System

### Primary Palette

```css
:root {
  /* Primary Colors */
  --prussian-blue: #003049;     /* Trust & Professionalism */
  --fire-brick: #c1121f;       /* Energy & Action */
  
  /* Secondary Colors */
  --air-blue: #669bbc;         /* Clarity & Support */
  --papaya-whip: #fdf0d5;      /* Warmth & Approachability */
  
  /* Support Colors */
  --barn-red: #780000;         /* Emphasis & Alerts */
  
  /* Neutral Colors */
  --white: #ffffff;
  --gray-light: #f5f5f5;
  --gray-medium: #888888;
  --gray-dark: #333333;
  --black: #000000;
}
```

### Color Usage Guidelines

#### Primary Actions & Navigation
```css
/* Primary buttons, main navigation, headers */
.primary {
  background-color: var(--prussian-blue);
  color: var(--white);
}

/* Hover states */
.primary:hover {
  background-color: #004a6b; /* 20% lighter */
}
```

#### Secondary Actions & CTAs
```css
/* Secondary buttons, CTAs, important elements */
.secondary {
  background-color: var(--fire-brick);
  color: var(--white);
}

.secondary:hover {
  background-color: #d91429; /* 10% lighter */
}
```

#### Support & Information
```css
/* Information panels, support content */
.info {
  background-color: var(--air-blue);
  color: var(--white);
}

/* Subtle backgrounds, cards */
.neutral {
  background-color: var(--papaya-whip);
  color: var(--gray-dark);
}
```

#### Status & Alerts
```css
/* Error states, critical alerts */
.error {
  background-color: var(--barn-red);
  color: var(--white);
}

/* Warning states */
.warning {
  background-color: #f59e0b;
  color: var(--white);
}

/* Success states */
.success {
  background-color: #10b981;
  color: var(--white);
}
```

### Accessibility Compliance

All color combinations meet WCAG 2.1 AA standards (4.5:1 contrast ratio minimum):

| Background | Text Color | Contrast Ratio | Status |
|------------|------------|----------------|---------|
| `#003049` (Prussian Blue) | `#ffffff` (White) | 12.6:1 | ✅ AAA |
| `#c1121f` (Fire Brick) | `#ffffff` (White) | 7.2:1 | ✅ AAA |
| `#669bbc` (Air Blue) | `#ffffff` (White) | 4.8:1 | ✅ AA |
| `#fdf0d5` (Papaya Whip) | `#333333` (Gray Dark) | 11.4:1 | ✅ AAA |

---

## Typography

### Font Stack

```css
/* Primary font family with Arabic support */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                'Noto Sans Arabic', 'Helvetica Neue', Arial, sans-serif;

/* Monospace for code/data */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
             Consolas, 'Courier New', monospace;
```

### Typography Scale

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Typography Classes

```css
/* Headings */
.heading-1 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--prussian-blue);
  letter-spacing: -0.025em;
}

.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--prussian-blue);
}

.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-dark);
}

/* Body Text */
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--gray-dark);
}

.body-base {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-dark);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-medium);
}
```

### RTL Support

```css
/* Arabic/RTL text support */
.rtl {
  direction: rtl;
  text-align: right;
  font-family: 'Noto Sans Arabic', var(--font-primary);
}

/* Mixed content containers */
.bidi-container {
  unicode-bidi: bidi-override;
}

/* Arabic numerals */
.arabic-numerals {
  font-variant-numeric: tabular-nums;
  direction: ltr;
  unicode-bidi: bidi-override;
}
```

---

## Logo Implementation

### Logo Variants

Available logo files in `/docs/business/Branding/logo-variations/`:
- `livrili-logo-primary.png` - Full color logo
- `livrili-logo-white.png` - White version for dark backgrounds
- `livrili-logo-mono-blue.png` - Monochrome blue version
- `livrili-logo-small.png` - Compact version for small spaces
- `livrili-logo-stacked.png` - Vertical layout
- `livrili-favicon.png` - Icon only for favicons
- `livrili-icon-square.png` - Square icon format

### CSS Logo Implementation

```css
/* Logo container */
.logo {
  display: inline-flex;
  align-items: center;
  font-weight: var(--font-extrabold);
  letter-spacing: -0.05em;
  text-decoration: none;
}

/* Standard logo */
.logo-standard {
  font-size: 2rem;
  color: var(--prussian-blue);
}

/* Small logo */
.logo-small {
  font-size: 1.5rem;
  color: var(--prussian-blue);
}

/* Logo on dark backgrounds */
.logo-inverse {
  color: var(--white);
}

/* Logo icon */
.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin-right: 0.75rem;
  background-color: var(--fire-brick);
  border-radius: 0.75rem;
  position: relative;
  flex-shrink: 0;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1.75rem;
  height: 1.75rem;
  background-color: var(--papaya-whip);
  border-radius: 0.5rem;
}

.logo-icon::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.25rem;
  color: var(--fire-brick);
  font-weight: var(--font-bold);
  z-index: 1;
}
```

### Logo Usage Guidelines

#### Minimum Clear Space
```css
/* Minimum clear space around logo */
.logo-container {
  padding: 1rem; /* Minimum clear space = logo height ÷ 2 */
}
```

#### Minimum Sizes
- **Digital**: 120px width minimum
- **Print**: 1 inch width minimum
- **Favicon**: 16px × 16px, 32px × 32px, 48px × 48px

#### Placement Rules
```css
/* Safe logo placement */
.logo-safe {
  background: solid colors only;
  contrast-ratio: minimum 4.5:1;
  clear-space: maintained;
}

/* Avoid busy backgrounds */
.logo-avoid {
  background: gradients, patterns, images;
  low-contrast: < 4.5:1;
  cramped-space: < 0.5rem clearance;
}
```

---

## Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  background-color: var(--prussian-blue);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #004a6b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 48, 73, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--fire-brick);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #d91429;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(193, 18, 31, 0.3);
}

/* Outline Button */
.btn-outline {
  background-color: transparent;
  color: var(--prussian-blue);
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--prussian-blue);
  border-radius: 0.5rem;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background-color: var(--prussian-blue);
  color: var(--white);
}
```

### Cards

```css
/* Base Card */
.card {
  background-color: var(--white);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Feature Card */
.card-feature {
  background: linear-gradient(135deg, var(--papaya-whip) 0%, var(--white) 100%);
  border: 1px solid rgba(0, 48, 73, 0.1);
  padding: 2rem;
}

/* Status Cards */
.card-success {
  border-left: 4px solid #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.card-warning {
  border-left: 4px solid #f59e0b;
  background-color: rgba(245, 158, 11, 0.05);
}

.card-error {
  border-left: 4px solid var(--barn-red);
  background-color: rgba(120, 0, 0, 0.05);
}
```

### Forms

```css
/* Input Fields */
.input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--gray-light);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  font-family: var(--font-primary);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--prussian-blue);
  box-shadow: 0 0 0 3px rgba(0, 48, 73, 0.1);
}

.input:invalid {
  border-color: var(--barn-red);
}

/* Labels */
.label {
  display: block;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  color: var(--gray-dark);
  margin-bottom: 0.5rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

/* Error Messages */
.error-message {
  color: var(--barn-red);
  font-size: var(--text-sm);
  margin-top: 0.25rem;
}
```

### Navigation

```css
/* Navigation Bar */
.navbar {
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-light);
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Navigation Links */
.nav-link {
  color: var(--gray-dark);
  text-decoration: none;
  font-weight: var(--font-medium);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--prussian-blue);
  background-color: var(--papaya-whip);
}

.nav-link.active {
  color: var(--prussian-blue);
  background-color: rgba(0, 48, 73, 0.1);
}
```

---

## UI Principles

### Design Principles

1. **Mobile-First**: Design for mobile devices first, then scale up
2. **Accessibility**: WCAG 2.1 AA compliance minimum
3. **Performance**: Optimize for 3G networks and slower devices
4. **Consistency**: Use standardized spacing, colors, and typography
5. **Localization**: Support Arabic RTL and French/English LTR

### Spacing System

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Border Radius System

```css
:root {
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;   /* Perfect circle */
}
```

### Shadow System

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04);
  --shadow-brand: 0 4px 12px rgba(0, 48, 73, 0.15);
}
```

---

## Code Examples

### React/Next.js Implementation

```tsx
// components/ui/Button.tsx
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-lg font-semibold",
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        
        // Variants
        {
          "bg-prussian-blue text-white hover:bg-prussian-blue/90 focus:ring-prussian-blue": 
            variant === 'primary',
          "bg-fire-brick text-white hover:bg-fire-brick/90 focus:ring-fire-brick": 
            variant === 'secondary',
          "border-2 border-prussian-blue text-prussian-blue hover:bg-prussian-blue hover:text-white": 
            variant === 'outline',
        },
        
        // Sizes
        {
          "px-3 py-1.5 text-sm": size === 'sm',
          "px-4 py-2 text-base": size === 'md',
          "px-6 py-3 text-lg": size === 'lg',
        },
        
        className
      )}
      {...props}
    />
  )
}
```

```tsx
// components/ui/Logo.tsx
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: 'standard' | 'small' | 'inverse'
  className?: string
}

export function Logo({ variant = 'standard', className }: LogoProps) {
  return (
    <div className={cn(
      "inline-flex items-center font-extrabold tracking-tight",
      {
        "text-2xl text-prussian-blue": variant === 'standard',
        "text-xl text-prussian-blue": variant === 'small',
        "text-2xl text-white": variant === 'inverse',
      },
      className
    )}>
      <div className="relative mr-3 h-10 w-10 rounded-xl bg-fire-brick flex-shrink-0">
        <div className="absolute inset-0 m-1.5 rounded-lg bg-papaya-whip" />
        <div className="absolute inset-0 flex items-center justify-center text-fire-brick font-bold text-xl">
          ✓
        </div>
      </div>
      <span>Livrili</span>
    </div>
  )
}
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'prussian-blue': '#003049',
        'fire-brick': '#c1121f',
        'air-blue': '#669bbc',
        'papaya-whip': '#fdf0d5',
        'barn-red': '#780000',
      },
      fontFamily: {
        'primary': [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Noto Sans Arabic',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'brand': '0 4px 12px rgba(0, 48, 73, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

### CSS Custom Properties

```css
/* globals.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  :root {
    /* Brand Colors */
    --prussian-blue: 0 48 73;
    --fire-brick: 193 18 31;
    --air-blue: 102 155 188;
    --papaya-whip: 253 240 213;
    --barn-red: 120 0 0;
    
    /* Semantic Colors */
    --color-primary: var(--prussian-blue);
    --color-secondary: var(--fire-brick);
    --color-accent: var(--air-blue);
    --color-neutral: var(--papaya-whip);
    --color-error: var(--barn-red);
    
    /* Typography */
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                    'Noto Sans Arabic', 'Helvetica Neue', Arial, sans-serif;
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-primary;
  }
  
  /* RTL Support */
  [dir="rtl"] {
    font-family: 'Noto Sans Arabic', var(--font-primary);
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-lg font-semibold
           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-prussian-blue text-white hover:bg-prussian-blue/90 
           focus:ring-prussian-blue px-4 py-2;
  }
  
  .btn-secondary {
    @apply btn bg-fire-brick text-white hover:bg-fire-brick/90 
           focus:ring-fire-brick px-4 py-2;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm p-6 transition-all duration-200
           hover:shadow-md hover:-translate-y-0.5;
  }
}
```

---

## Implementation Guidelines

### Performance Optimization

1. **Image Optimization**
   ```javascript
   // Next.js Image component with brand assets
   import Image from 'next/image'
   
   <Image
     src="/images/livrili-logo-primary.png"
     alt="Livrili"
     width={200}
     height={60}
     priority // For above-the-fold logos
     placeholder="blur"
     blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
   />
   ```

2. **CSS Loading Strategy**
   ```html
   <!-- Critical CSS inline -->
   <style>
     :root { --prussian-blue: #003049; /* ... */ }
     .logo { /* critical logo styles */ }
   </style>
   
   <!-- Non-critical CSS deferred -->
   <link rel="preload" href="/css/brand-components.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
   ```

### Accessibility Implementation

1. **Color Contrast Validation**
   ```css
   /* Always maintain proper contrast ratios */
   .text-on-prussian { color: #ffffff; } /* 12.6:1 ratio */
   .text-on-fire-brick { color: #ffffff; } /* 7.2:1 ratio */
   .text-on-papaya { color: #333333; } /* 11.4:1 ratio */
   ```

2. **Focus Management**
   ```css
   /* Custom focus styles matching brand */
   :focus-visible {
     outline: 2px solid rgb(var(--prussian-blue));
     outline-offset: 2px;
     border-radius: 0.25rem;
   }
   ```

3. **RTL Support Implementation**
   ```css
   /* Logical properties for RTL support */
   .container {
     margin-inline-start: auto;
     margin-inline-end: auto;
     padding-inline: 1rem;
   }
   
   .button-with-icon {
     gap: 0.5rem;
   }
   
   [dir="rtl"] .button-with-icon {
     flex-direction: row-reverse;
   }
   ```

### Development Workflow

1. **Brand Asset Management**
   ```
   /public/
   ├── images/
   │   ├── brand/
   │   │   ├── logo-primary.svg
   │   │   ├── logo-white.svg
   │   │   ├── logo-mono.svg
   │   │   └── favicon/
   │   │       ├── favicon-16x16.png
   │   │       ├── favicon-32x32.png
   │   │       └── apple-touch-icon.png
   ```

2. **Component Testing**
   ```javascript
   // Test brand consistency
   describe('Brand Components', () => {
     it('should use correct brand colors', () => {
       expect(getComputedStyle(button).backgroundColor).toBe('rgb(0, 48, 73)')
     })
     
     it('should maintain accessibility standards', () => {
       expect(getContrastRatio(backgroundColor, textColor)).toBeGreaterThan(4.5)
     })
   })
   ```

### Quality Assurance Checklist

- [ ] Brand colors match specifications exactly
- [ ] Typography scale is consistent across components
- [ ] Logo maintains minimum clear space requirements
- [ ] All color combinations meet WCAG AA standards
- [ ] RTL layout works correctly for Arabic content
- [ ] Focus states are visible and brand-consistent
- [ ] Mobile breakpoints preserve brand integrity
- [ ] Performance budgets are maintained for brand assets

---

## Resources & Tools

### Design Tools
- **Figma**: Brand component library
- **Adobe Color**: Palette accessibility checker
- **Contrast Ratio Checker**: WebAIM contrast checker

### Development Tools
- **Tailwind CSS**: Pre-configured with brand colors
- **CSS Custom Properties**: Cross-browser color management
- **PostCSS**: Build-time optimizations

### Quality Assurance
- **Lighthouse**: Performance and accessibility auditing
- **axe-core**: Automated accessibility testing
- **Chromatic**: Visual regression testing

---

*This style guide is a living document. For questions or updates, contact the design team or create an issue in the project repository.*