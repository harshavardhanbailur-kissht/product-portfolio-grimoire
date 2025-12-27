# Accessibility: WCAG 2.2 AA Complete Reference

This reference provides comprehensive WCAG 2.2 AA implementation guidance. Accessibility is NON-NEGOTIABLE across all domains.

## Impact Statistics

```
GLOBAL IMPACT:
- 16% of world population has significant disability
- 26% of US adults have some disability type
- 8% of men are color blind (0.5% of women)
- 35%+ of adults over 40 have vestibular disorders
- 95.9% of top websites have WCAG failures
```

## POUR Principles

### Perceivable
Users must be able to perceive the information being presented.

### Operable
UI components and navigation must be operable.

### Understandable
Information and operation of UI must be understandable.

### Robust
Content must be robust enough for assistive technologies.

## Color and Contrast

### Contrast Requirements
```
WCAG 2.2 AA REQUIREMENTS:

Normal Text (<18pt or <14pt bold):
- Minimum: 4.5:1 contrast ratio

Large Text (≥18pt or ≥14pt bold):
- Minimum: 3:1 contrast ratio

UI Components & Graphics:
- Minimum: 3:1 contrast ratio

Focus Indicators:
- Minimum: 3:1 against adjacent colors
```

### Testing Tools
```
RECOMMENDED TOOLS:
- WebAIM Contrast Checker: webaim.org/resources/contrastchecker
- axe DevTools: Browser extension
- WAVE: wave.webaim.org
- Lighthouse: Built into Chrome DevTools
- Colour Contrast Analyser: Desktop app
```

### Color Blindness Considerations
```css
/* AVOID relying solely on these pairs: */
PROBLEMATIC_PAIRS = [
    "red/green",    /* Deuteranopia, Protanopia */
    "blue/purple",  /* Tritanopia */
    "green/brown",  /* Common confusion */
    "red/brown"     /* Protanopia */
]

/* ALWAYS add secondary indicators: */
.status-success {
    color: green;
    /* ADD: */ 
    &::before { content: "✓ "; }
}

.status-error {
    color: red;
    /* ADD: */
    &::before { content: "✗ "; }
}
```

### Cultural Color Considerations
```
RESEARCH: Color meanings vary significantly by culture
(Systematic review of 132 studies, 1895-2022, 42,266 participants)

WHITE:
- West: Purity, cleanliness, weddings
- East Asia: Death, mourning, funerals
→ Impact: Background choices, celebration UI

RED:
- West: Danger, stop, error, passion
- China: Luck, prosperity, celebration
→ Impact: Error states vs. promotional CTAs

GREEN:
- West: Go, success, nature, money
- China: Infidelity, exorcism (in some contexts)
→ Impact: Success states, financial UI

BLUE:
- Most universally positive across cultures
- Trust, calm, professionalism
→ Safe choice for global products

IMPLICATION FOR GLOBAL PRODUCTS:
- Research target cultures before finalizing colors
- Don't assume Western color meanings are universal
- Test with international users
- Use icons + text alongside color
- Consider offering theme customization
```

### Implementation
```css
/* Safe color palette example */
:root {
    /* High contrast pairs */
    --text-primary: #1a1a1a;      /* On white: 16:1 */
    --text-secondary: #666666;    /* On white: 5.74:1 */
    --background: #ffffff;
    
    /* Status colors with sufficient contrast */
    --success: #0a6b3d;           /* 7:1 on white */
    --error: #c41e3a;             /* 5.9:1 on white */
    --warning: #8a6d00;           /* 5.6:1 on white */
    --info: #0056b3;              /* 7.2:1 on white */
}
```

## Keyboard Navigation

### Requirements
```
ALL FUNCTIONALITY must be keyboard accessible:
- Tab: Navigate between interactive elements
- Shift+Tab: Navigate backwards
- Enter/Space: Activate buttons/links
- Arrow keys: Navigate within components
- Escape: Close modals, dropdowns, menus
```

### Focus Management
```css
/* NEVER remove focus outline without replacement */
/* BAD: */
*:focus { outline: none; } /* NEVER DO THIS */

/* GOOD: Custom focus styles */
*:focus-visible {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
}

/* Hide focus for mouse, show for keyboard */
*:focus:not(:focus-visible) {
    outline: none;
}
```

### Tab Order
```html
<!-- Use tabindex carefully -->
tabindex="0"   /* Add to natural tab order */
tabindex="-1"  /* Programmatically focusable only */
tabindex="1+"  /* AVOID: Creates maintenance nightmare */

<!-- Logical order through DOM structure -->
<nav><!-- Tab through nav first --></nav>
<main><!-- Then main content --></main>
<aside><!-- Then sidebar --></aside>
```

### Skip Links
```html
<!-- First focusable element on page -->
<a href="#main-content" class="skip-link">
    Skip to main content
</a>

<style>
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px;
    background: var(--background);
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
</style>
```

### Modal Focus Trapping
```javascript
// Required for accessible modals
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Move focus to modal on open
    first.focus();
}

// Return focus to trigger on close
function closeModal() {
    modal.hidden = true;
    triggerElement.focus(); // Return focus
}
```

## Semantic HTML

### Heading Hierarchy
```html
<!-- CORRECT: Logical hierarchy -->
<h1>Page Title</h1>
    <h2>Section</h2>
        <h3>Subsection</h3>
        <h3>Subsection</h3>
    <h2>Section</h2>

<!-- INCORRECT: Skipping levels -->
<h1>Page Title</h1>
    <h3>Subsection</h3>  <!-- Missing h2! -->
```

### Landmark Regions
```html
<header role="banner">
    <nav role="navigation" aria-label="Main">...</nav>
</header>

<main role="main">
    <article>...</article>
    <aside role="complementary">...</aside>
</main>

<footer role="contentinfo">...</footer>
```

### Lists
```html
<!-- Use semantic lists, not divs -->
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>

<ol>
    <li>Step 1</li>
    <li>Step 2</li>
</ol>

<dl>
    <dt>Term</dt>
    <dd>Definition</dd>
</dl>
```

## Forms

### Labels
```html
<!-- REQUIRED: Explicit label association -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email">

<!-- OR implicit association -->
<label>
    Email Address
    <input type="email" name="email">
</label>

<!-- NEVER: Placeholder-only labels -->
<input type="email" placeholder="Email"> <!-- WRONG -->
```

### Required Fields
```html
<label for="name">
    Name <span aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
</label>
<input type="text" id="name" required aria-required="true">
```

### Error Messages
```html
<!-- Associate error with input -->
<label for="email">Email</label>
<input 
    type="email" 
    id="email" 
    aria-describedby="email-error"
    aria-invalid="true"
>
<span id="email-error" role="alert">
    Please enter a valid email address
</span>
```

### Form Validation
```html
<!-- Group related errors -->
<div role="alert" aria-live="assertive">
    <h2>Please correct the following errors:</h2>
    <ul>
        <li><a href="#email">Email is required</a></li>
        <li><a href="#password">Password must be 8+ characters</a></li>
    </ul>
</div>
```

### Autocomplete
```html
<!-- Use autocomplete for faster, accessible forms -->
<input type="text" autocomplete="name">
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="street-address">
<input type="text" autocomplete="postal-code">
<input type="text" autocomplete="cc-number">
```

## Images and Media

### Alt Text
```html
<!-- Informative images -->
<img src="chart.png" alt="Sales increased 25% in Q3 2024">

<!-- Decorative images -->
<img src="divider.png" alt="" role="presentation">

<!-- Complex images -->
<figure>
    <img src="complex-diagram.png" alt="System architecture diagram">
    <figcaption>
        Detailed description: The system consists of...
    </figcaption>
</figure>

<!-- Linked images -->
<a href="/products">
    <img src="logo.png" alt="Acme Corp - Go to products">
</a>
```

### Icons
```html
<!-- Decorative icon with text -->
<button>
    <svg aria-hidden="true">...</svg>
    Save
</button>

<!-- Icon-only button -->
<button aria-label="Close dialog">
    <svg aria-hidden="true">...</svg>
</button>

<!-- Icon with visible label -->
<button>
    <svg aria-hidden="true">...</svg>
    <span class="sr-only">Search</span>
</button>
```

### Video and Audio
```html
<!-- Captions required for video with audio -->
<video controls>
    <source src="video.mp4" type="video/mp4">
    <track kind="captions" src="captions.vtt" srclang="en" label="English">
    <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Audio Descriptions">
</video>

<!-- Transcript for audio-only -->
<audio controls>
    <source src="podcast.mp3" type="audio/mpeg">
</audio>
<details>
    <summary>Transcript</summary>
    <p>Full transcript text...</p>
</details>
```

## ARIA

### When to Use ARIA
```
RULES:
1. Use native HTML elements first (button, not div[role="button"])
2. Don't change native semantics unnecessarily
3. All interactive ARIA elements must be keyboard accessible
4. Don't use role="presentation" on focusable elements
5. All interactive elements must have accessible name
```

### Common ARIA Patterns

#### Live Regions
```html
<!-- For dynamic content updates -->
<div aria-live="polite">
    <!-- Updates announced after current speech -->
    3 items in cart
</div>

<div aria-live="assertive" role="alert">
    <!-- Updates announced immediately -->
    Error: Please enter a valid email
</div>
```

#### Expanded/Collapsed
```html
<button 
    aria-expanded="false" 
    aria-controls="menu"
>
    Menu
</button>
<ul id="menu" hidden>...</ul>
```

#### Current Page
```html
<nav>
    <a href="/" aria-current="page">Home</a>
    <a href="/about">About</a>
</nav>
```

#### Dialogs
```html
<div 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="dialog-title"
>
    <h2 id="dialog-title">Confirm Delete</h2>
    <!-- Content -->
</div>
```

## Motion and Animation

### Reduced Motion
```css
/* REQUIRED: Respect user preference */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* Alternative: Provide essential motion only */
@media (prefers-reduced-motion: reduce) {
    .decorative-animation {
        animation: none;
    }
    
    /* Keep functional transitions but reduce */
    .functional-transition {
        transition-duration: 0.1ms;
    }
}
```

### Flashing Content
```
WCAG REQUIREMENT:
- Nothing flashes more than 3 times per second
- If unavoidable, content must be small (<25% of viewport)
- Red flashes are especially dangerous

IMPLEMENTATION:
- Avoid flashing content entirely
- Use fade transitions instead of blink
- Allow users to pause animations
```

## Touch Targets

### Size Requirements
```css
/* WCAG 2.2 minimum: 24x24px */
/* Apple HIG recommended: 44x44px */

.button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px;
}

/* Adequate spacing between targets */
.button + .button {
    margin-left: 8px; /* Prevents accidental taps */
}
```

## Screen Reader Only Content
```css
/* Visually hidden but accessible */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Focusable sr-only (for skip links) */
.sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
}
```

## Testing Checklist

### Automated Testing
```
TOOLS:
- [ ] axe DevTools (browser extension)
- [ ] Lighthouse accessibility audit
- [ ] WAVE (wave.webaim.org)
- [ ] Pa11y (command line)

NOTE: Automated testing catches ~30% of issues
```

### Manual Testing
```
KEYBOARD:
- [ ] Tab through entire page
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] Focus indicator always visible
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates elements

SCREEN READER (VoiceOver, NVDA, JAWS):
- [ ] All content announced
- [ ] Headings create logical outline
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Errors announced
- [ ] Dynamic content announced (aria-live)

ZOOM:
- [ ] Content readable at 200% zoom
- [ ] No horizontal scroll at 320px width
- [ ] Text reflows (no content cut off)

REDUCED MOTION:
- [ ] Enable "reduce motion" in OS settings
- [ ] Animations respect preference
- [ ] Essential feedback still works
```

### WCAG 2.2 Quick Reference

| Criterion | Level | Requirement |
|-----------|-------|-------------|
| 1.1.1 | A | All images have alt text |
| 1.3.1 | A | Semantic HTML structure |
| 1.4.1 | A | Color not sole indicator |
| 1.4.3 | AA | 4.5:1 text contrast |
| 1.4.11 | AA | 3:1 UI component contrast |
| 2.1.1 | A | Keyboard accessible |
| 2.4.3 | A | Logical focus order |
| 2.4.7 | AA | Focus visible |
| 2.5.8 | AA | 24x24px target size |
| 3.3.1 | A | Error identification |
| 3.3.2 | A | Labels or instructions |
| 4.1.2 | A | Name, role, value |
