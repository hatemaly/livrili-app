# Livrili Logo Components

Professional logo components for the Livrili brand, following the brand guidelines with Prussian Blue (#003049) as the primary color.

## Components

### `<Logo />`
The main logo component with flexible configuration options.

**Props:**
- `variant`: 'default' | 'inverse' | 'muted' | 'secondary'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `layout`: 'horizontal' | 'vertical'
- `showIcon`: boolean (default: true)
- `showText`: boolean (default: true)
- `iconOnly`: boolean (default: false)
- `textOnly`: boolean (default: false)
- `asLink`: boolean (default: false)
- `href`: string (when used as link)

### `<LogoIcon />`
Standalone logo icon component - a box with checkmark.

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
- `variant`: 'default' | 'inverse' | 'muted' | 'secondary'

### Preset Components

#### `<LogoHeader />`
Pre-configured logo for header usage (large size, default variant).

#### `<LogoFooter />`
Pre-configured logo for footer usage (small size, muted variant).

#### `<LogoFavicon />`
Pre-configured icon-only logo for favicon/small spaces.

#### `<LogoBrand />`
Pre-configured brand logo (extra large, vertical layout).

## Usage Examples

```tsx
import { 
  Logo, 
  LogoIcon, 
  LogoHeader, 
  LogoFooter, 
  LogoFavicon, 
  LogoBrand 
} from '@livrili/ui'

// Basic usage
<Logo />

// Different sizes
<Logo size="xs" />
<Logo size="xl" />

// Different variants
<Logo variant="inverse" />    // White text, for dark backgrounds
<Logo variant="secondary" />  // Fire brick color
<Logo variant="muted" />     // Gray text

// Different layouts
<Logo layout="vertical" size="lg" />

// Icon only
<LogoIcon size="md" />
<Logo iconOnly />

// Text only
<Logo textOnly />

// As a link
<Logo asLink href="/" />

// Preset components
<LogoHeader />           // For navigation headers
<LogoFooter />          // For page footers
<LogoFavicon />         // For favicons or compact spaces
<LogoBrand />           // For brand showcase, vertical layout

// Responsive usage
<Logo 
  size="sm" 
  className="md:hidden"           // Small on mobile
/>
<Logo 
  size="lg" 
  className="hidden md:block"     // Large on desktop
/>
```

## Brand Colors

The logo components use the following Livrili brand colors:
- Primary: `#003049` (Prussian Blue) - `text-livrili-prussian`
- Secondary: `#C1121F` (Fire Brick) - `text-livrili-fire`
- Accent: `#669BBC` (Air Blue) - `text-livrili-air`
- Light: `#FDF0D5` (Papaya Whip) - `text-livrili-papaya`

## Accessibility

- All logo components support keyboard navigation when used as links
- Proper focus indicators with `focus:ring-2 focus:ring-livrili-prussian`
- Text alternatives are provided through semantic markup
- Color contrast ratios meet WCAG AA standards

## Responsive Design

The logo components are designed to be responsive:
- Use Tailwind CSS classes for responsive sizing
- Icon and text scale proportionally
- Supports both horizontal and vertical layouts
- Optimized for mobile-first design approach

## Performance

- Uses Lucide React icons (tree-shakeable)
- Minimal bundle impact
- CSS-based styling for optimal performance
- No external image dependencies