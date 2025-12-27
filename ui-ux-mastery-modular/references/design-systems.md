# Design System Frameworks

This reference covers major design systems with their core principles, specifications, and when to apply each.

## Material Design 3 (Google)

### Core Principles
```
MATERIAL METAPHOR:
- Surfaces are tactile reality
- Light, shadow, motion inspired by physical world
- Intentional, meaningful motion

BOLD, GRAPHIC, INTENTIONAL:
- Typography, grids, space, color create hierarchy
- Color is bold and meaningful
- Elements are graphic and purposeful

MOTION PROVIDES MEANING:
- Motion focuses attention
- Motion maintains continuity
- Motion provides feedback
```

### Material You (M3) Key Features
```
DYNAMIC COLOR:
- HCT color space (Hue, Chroma, Tone)
- 5 tonal palettes from source color
- 13 tones per palette
- Personalization from user wallpaper

COLOR ROLES:
- Primary: Key components, FAB
- Secondary: Less prominent components
- Tertiary: Contrast, balance
- Surface: Backgrounds, cards
- Error: Error states
```

### Typography (M3)
```
SCALE: 15 styles across 5 roles

ROLES:
- Display: Large, short text
- Headline: Section headers
- Title: Smaller headers
- Body: Long-form text
- Label: Buttons, captions

SIZES: Large, Medium, Small for each

DEFAULTS:
- Display Large: 57px / 64px line-height
- Body Large: 16px / 24px line-height
- Label Medium: 12px / 16px line-height
```

### Motion (M3)
```
DURATION:
- Simple/Micro: 50-100ms
- Standard: 200-300ms
- Complex: 300-500ms
- Extra: 400-700ms

EASING:
Standard: cubic-bezier(0.2, 0.0, 0, 1.0)
Emphasized: cubic-bezier(0.2, 0.0, 0, 1.0) for enter
           cubic-bezier(0.3, 0.0, 0.8, 0.15) for exit
```

### Component Specs
```
BUTTONS:
- Height: 40dp
- Corner radius: 20dp (full rounded)
- Label: Sentence case (changed from M2)

FAB:
- Standard: 56dp
- Small: 40dp
- Large: 96dp

CARDS:
- Corner radius: 12dp (outlined), 8dp (filled)
- Elevation: 0dp (outlined), 1dp (filled)
```

## Apple Human Interface Guidelines

### Core Principles
```
CLARITY:
- Text legible at every size
- Icons precise and lucid
- Adornments subtle and appropriate

DEFERENCE:
- Fluid motion, crisp interface
- Content is primary
- UI helps understanding, never competes

DEPTH:
- Visual layers and motion convey hierarchy
- Touch and discoverability
- 3D spatial relationships
```

### Platform-Specific Guidelines
```
iOS:
- Tab bar navigation (5 items max)
- Large titles that shrink on scroll
- Swipe gestures for navigation
- Pull to refresh
- Haptic feedback

macOS:
- Menu bar is primary
- Window-based interaction
- Keyboard shortcuts essential
- Sidebar navigation
- Toolbar for actions

watchOS:
- Glanceable content
- Digital Crown interaction
- Simple, focused UI
- Complications

visionOS:
- Eye tracking primary input
- Hand gestures for interaction
- Larger touch targets
- Spatial depth
```

### Typography (iOS)
```
SF PRO SCALE:
- Large Title: 34pt
- Title 1: 28pt
- Title 2: 22pt
- Title 3: 20pt
- Headline: 17pt semibold
- Body: 17pt
- Callout: 16pt
- Subhead: 15pt
- Footnote: 13pt
- Caption 1: 12pt
- Caption 2: 11pt

DYNAMIC TYPE:
- Support all accessibility sizes
- Test at largest sizes
- Use SF Pro for consistency
```

### Touch Targets
```
MINIMUM: 44 × 44 points

SPACING:
- Adequate space between targets
- Prevents accidental taps
- Essential for accessibility

THUMB ZONES:
- Bottom third: Easy reach
- Middle third: Moderate reach
- Top third: Requires grip shift
- Place frequent actions in easy zone
```

### SF Symbols
```
6,900+ SYMBOLS:
- 9 weights: Ultralight to Black
- 3 scales: Small, Medium, Large
- 4 rendering modes: Monochrome, Hierarchical, Palette, Multicolor

USAGE:
- Align with SF Pro text
- Match text weight
- Use hierarchical for complex icons
```

## IBM Carbon Design System

### Principles
```
OPEN:
- Open source
- Open design process
- Open to contribution

INCLUSIVE:
- Accessibility first
- Global audience
- Diverse needs

MODULAR:
- Components compose
- Flexible patterns
- Scalable systems
```

### 2x Grid System
```
GRID MODES:
- Wide: 32px gutter
- Narrow: 16px gutter
- Condensed: 1px gutter

COLUMNS:
- 16 columns at all breakpoints
- Responsive margin/gutter
- Nested grids supported

BREAKPOINTS:
- sm: 320px
- md: 672px
- lg: 1056px
- xlg: 1312px
- max: 1584px
```

### Typography
```
IBM PLEX:
- Sans, Serif, Mono variants
- Open source
- Optimized for screens

PRODUCTIVE MODE:
- Smaller, denser
- For product interfaces
- Body: 14px

EXPRESSIVE MODE:
- Larger, more personality
- For marketing, editorial
- Extended hierarchy
```

### Color Tokens
```
STRUCTURE:
- $[category]-[role]-[state]-[lightness]
- Example: $button-primary-active-01

CATEGORIES:
- Background
- Border
- Text
- Icon
- Interactive

ACCESSIBILITY:
- Built-in contrast checking
- WCAG AA compliance
- Color blindness consideration
```

## Atlassian Design System

### Principles
```
FOUNDATIONAL:
- Solves common problems
- Consistent patterns
- Reduces design debt

HARMONIOUS:
- Works together
- Cohesive experience
- Scalable

EMPOWERING:
- Accessible to all
- Skills don't matter
- Enable creativity
```

### Design Tokens
```
TOKEN TYPES:
- Color
- Typography
- Spacing
- Elevation
- Motion

LIFECYCLE:
- Active
- Deprecated
- Soft-deleted
- Deleted

USAGE:
import { token } from '@atlaskit/tokens';

const style = {
    color: token('color.text'),
    backgroundColor: token('color.background.neutral'),
};
```

### Spacing Scale
```
SCALE:
- space.025: 2px
- space.050: 4px
- space.100: 8px
- space.150: 12px
- space.200: 16px
- space.250: 20px
- space.300: 24px
- space.400: 32px
- space.500: 40px
- space.600: 48px
```

## Microsoft Fluent Design

### Five Elements
```
LIGHT:
- Illuminate, reveal
- Focus attention
- Create depth

DEPTH:
- Z-axis for hierarchy
- Shadows, layers
- Spatial relationships

MOTION:
- Continuity
- Connection
- Personality

MATERIAL:
- Acrylic: Translucent backgrounds
- Mica: Primary surfaces
- Smoke: Overlays

SCALE:
- Responsive to device
- Adapt to context
- Consistent experience
```

### Material Types
```
ACRYLIC:
- Translucent blur effect
- For transient surfaces
- Flyouts, menus, overlays

MICA:
- Long-lasting surfaces
- App backgrounds
- Subtle tinting

SMOKE:
- Translucent black
- Modal overlays
- Focus backgrounds
```

### Windows 11 Specific
```
CORNER RADIUS:
- Window: 8px
- Buttons: 4px
- Flyouts: 8px

TYPOGRAPHY:
- Segoe UI Variable
- Optical sizing
- Dynamic weight

ICONOGRAPHY:
- Segoe Fluent Icons
- 2px stroke weight
- Rounded corners
```

## When to Use Each System

### Decision Matrix
```python
def select_design_system(context):
    if context.platform == "android":
        return "Material Design 3"
    
    elif context.platform in ["ios", "macos", "watchos"]:
        return "Apple HIG"
    
    elif context.platform == "windows":
        return "Fluent Design"
    
    elif context.domain == "enterprise":
        if context.brand == "ibm":
            return "Carbon"
        elif context.brand == "atlassian":
            return "Atlassian Design"
        else:
            return "Carbon"  # Good enterprise default
    
    elif context.domain == "cross_platform_web":
        return "Material Design 3"  # Most comprehensive
    
    else:
        return "Custom based on Material"
```

### Comparison Table
| Aspect | Material | Apple HIG | Carbon | Fluent |
|--------|----------|-----------|--------|--------|
| Platform | Android/Web | Apple | Enterprise | Windows |
| Motion | Expressive | Subtle | Minimal | Moderate |
| Color | Dynamic | Vibrant | Systematic | Subtle |
| Typography | Roboto/Custom | SF Pro | IBM Plex | Segoe |
| Density | Comfortable | Spacious | Dense | Moderate |
| Open Source | Yes | Partial | Yes | Partial |

### Mixing Systems
```
ACCEPTABLE:
- Take principles, adapt for brand
- Use accessibility standards from any
- Combine patterns where logical

AVOID:
- Mixing iOS and Material on same platform
- Inconsistent motion languages
- Conflicting interaction patterns

RULE:
Follow platform conventions for native apps.
Custom systems OK for web with consistency.
```

## Implementing Design Tokens

### Token Structure
```javascript
// Base tokens (primitive)
const base = {
    blue: {
        100: '#e3f2fd',
        500: '#2196f3',
        900: '#0d47a1',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
};

// Semantic tokens (purposeful)
const semantic = {
    color: {
        primary: base.blue[500],
        primaryHover: base.blue[700],
        background: '#ffffff',
        text: '#1a1a1a',
    },
    spacing: {
        inline: base.spacing.sm,
        stack: base.spacing.md,
        section: base.spacing.xl,
    },
};

// Component tokens (specific)
const button = {
    background: semantic.color.primary,
    backgroundHover: semantic.color.primaryHover,
    padding: `${base.spacing.sm} ${base.spacing.md}`,
    borderRadius: '4px',
};
```

### CSS Custom Properties
```css
:root {
    /* Base */
    --blue-500: #2196f3;
    --space-4: 16px;
    
    /* Semantic */
    --color-primary: var(--blue-500);
    --spacing-stack: var(--space-4);
    
    /* Component */
    --button-bg: var(--color-primary);
    --button-padding: 8px 16px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    :root {
        --color-primary: var(--blue-300);
        --color-background: #121212;
    }
}
```
