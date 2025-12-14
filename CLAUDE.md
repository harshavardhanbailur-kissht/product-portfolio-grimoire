# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive book-style product portfolio website ("The Product Strategist's Grimoire") with 3D page-turning animations. A static HTML/CSS/JS website deployed on Vercel.

## Development Commands

```bash
# Local development - open in browser directly (no build required)
open index.html

# Deploy to Vercel (already configured)
vercel deploy --prod
```

## Architecture

**Static Website (No Build System)**
- `index.html` - Complete page structure with all content hardcoded (static approach chosen over dynamic rendering)
- `styles.css` - CSS variables, 3D transforms, animations, responsive breakpoints
- `app.js` - `BookPortfolio` class handling navigation, page flips, particles, modals
- `data.js` - Legacy content data structure (currently unused; content is in static HTML)

**Key Technical Patterns**
- Page navigation uses CSS 3D transforms (`rotateY(-180deg)`) with `transform-origin: left center`
- Pages stacked via z-index based on `data-page` attribute
- Mobile (< 768px) switches from 3D book to vertical scroll layout
- Intersection Observer for reveal animations
- Debounced scroll handling to prevent accidental page flips

**CSS Variables** (defined in `:root`)
- Colors: `--gold-primary`, `--bg-dark`, `--parchment-light`, etc.
- Dimensions: `--book-width`, `--book-height`, `--page-padding`
- Timing: `--flip-duration`, `--reveal-duration`

## Content Structure

6 pages: Cover, 4 chapters (Axion, SCAMPER, Game Design, Community Wisdom), About page. Content is product management case studies and game design portfolio pieces.
