# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive book-style product portfolio website ("The Product Strategist's Grimoire") with 3D page-turning animations. A static HTML/CSS/JS website deployed on Vercel.

**Live URL:** https://productportfolio-7q0pk5ucg-harshavardhans-projects-de753df9.vercel.app

## Development Commands

```bash
# Local development - open in browser directly (no build required)
open index.html

# Deploy to Vercel (already configured)
vercel deploy --prod

# Test deploy to Surge
npx surge . harsha-portfolio-test.surge.sh
```

## Architecture

**Static Website (No Build System)**
- `index.html` - Complete page structure with all content hardcoded (static approach chosen over dynamic rendering)
- `styles.css` - CSS variables, 3D transforms, animations, responsive breakpoints
- `app.js` - `GemLoader` class (Three.js 3D gem) + `BookPortfolio` class (navigation, page flips, particles, modals)
- `data.js` - Legacy content data structure (currently unused; content is in static HTML)

**Key Technical Patterns**
- Page navigation uses CSS 3D transforms (`rotateY(-180deg)`) with `transform-origin: left center`
- Pages stacked via z-index based on `data-page` attribute
- `.flipping` and `.unflipping` CSS classes maintain z-index: 100 during animation for smooth forward/backward flips
- Mobile (< 768px) switches from 3D book to vertical scroll layout
- Intersection Observer for reveal animations
- Debounced scroll handling to prevent accidental page flips

**CSS Variables** (defined in `:root`)
- Colors: `--gold-primary`, `--bg-dark`, `--parchment-light`, etc.
- Dimensions: `--book-width`, `--book-height`, `--page-padding`
- Timing: `--flip-duration`, `--reveal-duration`

## Content Structure

9 pages total:
1. **Cover** - Title, tagline, author
2. **Chapter I** - Zomato District Expansion (Staycations & Cruises)
3. **Chapter II** - CONEXO Credit Card Data Platform
4. **Chapter III** - AI Influencer Search
5. **Chapter IV** - Axion Market Analysis
6. **Chapter V** - SCAMPER Ideation Framework
7. **Chapter VI** - Game Design Portfolio
8. **Chapter VII** - Community Wisdom (PM Advice)
9. **About** - Author bio and links

---

# IMPROVEMENTS ROADMAP

Based on UI/UX research and best practices, here are prioritized improvements for the portfolio.

## HIGH PRIORITY - User Experience

### 1. Reading Experience Optimization (Readability Priority: 0.30)

**Current Issues:**
- Line lengths vary widely across sections
- Some paragraphs are dense without visual breaks
- Code/quote blocks could have better contrast

**Research Basis:**
- Optimal line length: 45-75 characters (66 ideal)
- Users read only 20-28% of page content
- F-Pattern scanning: 80% of viewing time on left half

**Improvements:**
```css
/* Add to styles.css */
.section-text, .insight-text, .activity-insight {
    max-width: 65ch; /* Optimal reading width */
    line-height: 1.7; /* Improved readability */
}

.intro-quote {
    font-size: 1.1rem;
    border-left: 3px solid var(--gold-primary);
    padding-left: 1.5rem;
}
```

**Files to modify:** `styles.css` lines containing `.section-text`, `.insight-text`

---

### 2. Scannability Enhancement (Priority: 0.25)

**Current Issues:**
- Some sections lack clear visual hierarchy
- Key information buried in paragraphs
- Chapter headers could be more distinctive

**Research Basis:**
- Clear heading hierarchy (H1 → H2 → H3)
- Highlighted key phrases improve scanning
- Users scan before reading

**Improvements:**
- Add "TL;DR" summary boxes at top of each chapter
- Bold key terms in first sentence of each section
- Add reading time estimates per chapter

```html
<!-- Add to each chapter after chapter-header -->
<div class="chapter-tldr">
    <span class="tldr-label">Key Insight</span>
    <p class="tldr-text">One-sentence summary of the chapter's main takeaway.</p>
    <span class="read-time">3 min read</span>
</div>
```

**Files to modify:** `index.html` (each chapter), `styles.css` (new `.chapter-tldr` styles)

---

### 3. Navigation Improvements (Priority: 0.20)

**Current Issues:**
- 9 TOC items approaches cognitive overload (Hick's Law: 6 visible options max)
- No visual progress indicator for book completion
- Mobile navigation could be more thumb-friendly

**Research Basis:**
- Hick's Law: +150ms reaction time per additional option
- Miller's Law: 7±2 chunks in working memory
- Goal-Gradient Effect: Progress accelerates near completion

**Improvements:**

A. **Group TOC into sections:**
```html
<nav class="toc-nav">
    <div class="toc-group">
        <span class="toc-group-label">Product Strategy</span>
        <!-- Chapters I-IV -->
    </div>
    <div class="toc-group">
        <span class="toc-group-label">Creative Work</span>
        <!-- Chapters V-VII -->
    </div>
</nav>
```

B. **Add book completion progress:**
```javascript
// In BookPortfolio class
updateProgress() {
    const progress = ((this.currentPage + 1) / this.totalPages) * 100;
    document.querySelector('.book-progress').style.width = `${progress}%`;
}
```

C. **Sticky bottom nav for mobile:**
```css
@media (max-width: 768px) {
    .chapter-nav {
        position: sticky;
        bottom: 0;
        background: var(--bg-dark);
        padding: 1rem;
        border-top: 1px solid var(--gold-primary);
    }
}
```

**Files to modify:** `index.html` (TOC structure), `styles.css` (progress bar, mobile nav), `app.js` (updateProgress method)

---

### 4. Peak-End Experience (Emotional Design)

**Current Issues:**
- About page ending feels abrupt
- No celebration/delight moment after completing the book
- Missing call-to-action at the end

**Research Basis:**
- Peak-End Rule: Experiences judged by peak moment + ending
- Zeigarnik Effect: Incomplete tasks create cognitive tension
- Goal-Gradient Effect: Completion drives satisfaction

**Improvements:**

A. **Add completion celebration:**
```javascript
// When user reaches About page
if (this.currentPage === this.totalPages - 1) {
    this.showCompletionCelebration();
}

showCompletionCelebration() {
    // Gold particle burst
    this.createCelebrationParticles();
    // "Journey Complete" badge animation
    document.querySelector('.completion-badge').classList.add('revealed');
}
```

B. **Enhance About page CTA:**
```html
<div class="final-cta reveal-item">
    <h4>Ready to collaborate?</h4>
    <div class="cta-buttons">
        <a href="mailto:harsha@email.com" class="cta-primary">Get in Touch</a>
        <a href="https://linkedin.com/..." class="cta-secondary">Connect on LinkedIn</a>
    </div>
</div>
```

**Files to modify:** `index.html` (About page), `app.js` (celebration logic), `styles.css` (CTA styles)

---

## MEDIUM PRIORITY - Performance & Polish

### 5. Loading Experience Enhancement

**Current State:**
- 3D gem loader with shatter effect (well-implemented)
- Progress bar with Goal-Gradient (starts at 20%)

**Improvements:**
- Add loading stage messages that rotate:
```javascript
const loadingMessages = [
    "Preparing your experience",
    "Loading case studies",
    "Initializing 3D elements",
    "Almost ready..."
];
```

**Files to modify:** `app.js` (GemLoader class, line ~130)

---

### 6. Accessibility Enhancements (WCAG 2.2 AA)

**Current Issues:**
- Some color contrast ratios may be below 4.5:1
- Focus states not visible on all interactive elements
- No skip-to-content link

**Improvements:**

A. **Skip link:**
```html
<a href="#book" class="skip-link">Skip to content</a>
```

B. **Enhanced focus states:**
```css
:focus-visible {
    outline: 2px solid var(--gold-primary);
    outline-offset: 2px;
}

.nav-arrow:focus-visible,
.toc-item:focus-visible {
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.5);
}
```

C. **ARIA live regions for page changes:**
```javascript
// In nextPage/prevPage
announcePageChange(pageTitle) {
    const announcer = document.getElementById('page-announcer');
    announcer.textContent = `Now viewing: ${pageTitle}`;
}
```

**Files to modify:** `index.html` (skip link, aria attributes), `styles.css` (focus states), `app.js` (announcements)

---

### 7. Mobile Experience Refinement

**Current Issues:**
- Vertical scroll replaces 3D book on mobile
- Touch gestures not optimized for swipe navigation
- Some iframes too small on mobile

**Improvements:**

A. **Swipe navigation:**
```javascript
// Add touch gesture support
let touchStartX = 0;
book.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
book.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
        diff > 0 ? this.prevPage() : this.nextPage();
    }
});
```

B. **Responsive iframe containers:**
```css
@media (max-width: 768px) {
    .mobile-frame {
        height: 400px; /* Taller on mobile */
    }
    .browser-content {
        min-height: 350px;
    }
}
```

**Files to modify:** `app.js` (touch handlers), `styles.css` (mobile breakpoints)

---

### 8. Micro-interactions & Delight

**Current State:**
- Page flip animation with dust particles
- Ambient glow and floating particles

**Improvements:**

A. **Button hover states with subtle animations:**
```css
.activity-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.activity-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);
}
```

B. **Link hover underline animation:**
```css
.prototype-link span {
    background: linear-gradient(var(--gold-primary), var(--gold-primary)) no-repeat left bottom;
    background-size: 0% 2px;
    transition: background-size 0.3s ease;
}
.prototype-link:hover span {
    background-size: 100% 2px;
}
```

**Files to modify:** `styles.css` (hover states)

---

## LOW PRIORITY - Content & SEO

### 9. SEO Optimization

**Current Issues:**
- Basic meta tags only
- No Open Graph / Twitter cards
- No structured data (JSON-LD)

**Improvements:**
```html
<!-- Add to <head> -->
<meta property="og:title" content="Product Portfolio | Harshavardhan Bailur">
<meta property="og:description" content="A strategic journey through digital innovation">
<meta property="og:image" content="https://yoursite.com/og-image.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": "Harshavardhan Bailur - Product Portfolio",
    "description": "Product Strategy and Game Design Portfolio"
}
</script>
```

**Files to modify:** `index.html` (head section)

---

### 10. Content Expansion Opportunities

**Missing content that could add value:**

A. **Metrics & Results:**
- Add quantified outcomes to case studies
- "Increased X by Y%" type statements
- User feedback quotes

B. **Process Documentation:**
- Show the "how" not just the "what"
- Add methodology sections
- Include stakeholder quotes

C. **Interactive Elements:**
- More live prototypes where possible
- Before/after comparisons
- Interactive data visualizations

**Files to modify:** `index.html` (content sections)

---

## TECHNICAL DEBT

### Items to Address

1. **Cache Busting System**
   - Current: Manual version numbers (`?v=20251228-v25`)
   - Improvement: Use content hash or build system

2. **Unused Code Cleanup**
   - `data.js` is not used (content is in HTML)
   - Decision: Keep as backup or remove

3. **CSS Organization**
   - Consider splitting into modules:
     - `base.css` - Variables, reset
     - `components.css` - Cards, buttons
     - `pages.css` - Page-specific styles
     - `animations.css` - Keyframes, transitions

4. **JavaScript Modularization**
   - Consider ES modules for better organization
   - Separate GemLoader and BookPortfolio into files

---

## FILE STRUCTURE

```
product_portfolio/
├── index.html              # Main HTML with all content
├── styles.css              # All CSS styles
├── app.js                  # GemLoader + BookPortfolio classes
├── data.js                 # Legacy content (unused)
├── CLAUDE.md               # This file
├── vercel.json             # Vercel deployment config
├── .vercel/                # Vercel project settings
├── claude skills/          # Skill reference files
├── ui-ux-mastery-modular/  # UI/UX best practices reference
│   └── references/
│       ├── psychology-laws.md      # 21 Laws of UX
│       ├── domain-matrices.md      # Domain priority matrices
│       ├── components.md           # Component patterns
│       ├── accessibility.md        # WCAG guidelines
│       └── conversion-ethics.md    # Ethical design
├── design-philosophy-replication/  # Design extraction guides
│   └── references/
│       ├── visual-hierarchy.md
│       ├── component-patterns.md
│       └── extraction-techniques.md
└── unified-debugger/       # Debugging reference
    └── references/
        ├── fix-patterns.md
        └── research-notes.md
```

---

## QUICK REFERENCE

### Psychology Laws Applied

| Law | Application in Portfolio |
|-----|-------------------------|
| Goal-Gradient | Progress bar starts at 20% |
| Von Restorff | Gold primary CTA stands out |
| Peak-End | Shatter transition creates memorable ending |
| Fitts's Law | Large touch targets for navigation |
| F-Pattern | Critical content top-left in chapters |
| Zeigarnik | "Continue your journey" prompts |

### Domain Matrix (Content/Portfolio)

| Priority | Weight | Current Status |
|----------|--------|----------------|
| Readability | 0.30 | Good, can improve line length |
| Scannability | 0.25 | Needs TL;DR summaries |
| Navigation | 0.20 | Good, can add progress bar |
| Speed | 0.10 | Excellent (static site) |
| Accessibility | 0.10 | Needs focus states |
| Engagement | 0.05 | Good with animations |

---

## DEPLOYMENT CHECKLIST

Before deploying updates:

1. [ ] Test on mobile (Chrome DevTools)
2. [ ] Test page flip animation both directions
3. [ ] Verify all external links work
4. [ ] Check console for errors
5. [ ] Run Lighthouse audit (target: 90+ all categories)
6. [ ] Update cache buster versions
7. [ ] Test with animations disabled
8. [ ] Test with reduced-motion preference

```bash
# Deploy commands
git add -A
git commit -m "feat: Description of changes"
git push origin main
vercel deploy --prod
```
