# Component Patterns: Research-Backed Implementation

This reference provides detailed patterns for common UI components based on research from Nielsen Norman Group, Baymard Institute, and eye-tracking studies.

## Forms

### Label Placement Research
```
EYE-TRACKING DATA (Matteo Penzo, UXmatters 2006):

TOP-ALIGNED LABELS:
- Saccade time: ~50ms
- Cognitive load: Lowest
- Best for: Most forms
- Why: Single eye fixation captures label + field

RIGHT-ALIGNED LABELS:
- Saccade time: 170-240ms
- Creates ragged left edge
- Use: When vertical space limited

LEFT-ALIGNED LABELS:
- Saccade time: ~500ms
- Cognitive load: Highest
- Creates most visual noise
- Avoid: Unless form is very simple

BOLD LABELS:
- 60% slower than non-bold (~80ms vs 50ms)
- Use normal weight for better scannability

PLACEHOLDER-ONLY:
- NEVER use as sole label
- Disappears on focus
- Causes memory burden
```

### Form Layout
```
RESEARCH: CXL Institute (702 participants, 2016)

SINGLE-COLUMN:
- 15.4 seconds faster completion (95% CI)
- Clearer visual path
- Required for mobile
- Exception: Logically paired fields (First/Last name)

MULTI-COLUMN ISSUES:
- 5+ different user interpretations observed
- Users saw second column as "alternative"
- Increased abandonment

FIELD SIZING:
- Match expected input length
- ZIP code: Short
- Email: Medium
- Address: Full width
- Visual cue for expected input

FORM SUCCESS RATES (CHI research, Seckler et al.):
- Forms following usability guidelines: 78% one-try submissions
- Forms violating guidelines: 42% one-try submissions
- This is nearly 2x success rate from following research
```

### Validation Patterns
```
"REWARD EARLY, PUNISH LATE" (Luke Wroblewski/Etre, 2009)

RESULTS:
- 22% increase in success rates
- 22% decrease in errors
- 31% increase in satisfaction
- 42% decrease in completion time
- 47% decrease in eye fixations

PATTERN:
function validateField(field, isCorrectingError) {
    if (isCorrectingError) {
        // User fixing error - validate immediately
        return validateOnChange(field);
    } else {
        // First attempt - wait until blur
        return validateOnBlur(field);
    }
}

TIMING:
- "After" validation 7-10 seconds faster than "before and while"
- Show success state for valid fields (green check)
- Show error immediately when correcting
- 31% of e-commerce sites lack inline validation
```

### Required Field Marking
```
RESEARCH: Baymard Institute

FINDING: 32% of users failed to complete required fields 
when only optional fields were marked

BEST PRACTICE:
- Mark required with asterisk (*)
- Mark optional with "(optional)" text
- Use both visual indicator AND aria-required="true"

EXAMPLE:
<label for="email">
    Email <span class="required">*</span>
</label>
<input type="email" id="email" required aria-required="true">

<label for="phone">
    Phone <span class="optional">(optional)</span>
</label>
<input type="tel" id="phone">
```

### Input Types for Mobile
```html
<!-- Optimized keyboard display -->
<input type="email">              <!-- @ and . visible -->
<input type="tel">                <!-- Numeric pad -->
<input type="number" inputmode="decimal">  <!-- Decimal pad -->
<input type="search">             <!-- Search key -->
<input type="url">                <!-- / and . visible -->

<!-- Date/time -->
<input type="date">               <!-- Native date picker -->
<input type="time">               <!-- Native time picker -->
<input type="datetime-local">     <!-- Both -->

<!-- Specialized -->
<input type="password" autocomplete="current-password">
<input type="text" autocomplete="one-time-code" inputmode="numeric">
```

## Buttons

### Hierarchy
```
PRIMARY:
- One per view (maximum)
- Highest contrast, brand color
- Main action user should take
- Example: "Save Changes", "Continue"

SECONDARY:
- Supporting actions
- Lower visual weight
- Outlined or muted fill
- Example: "Cancel", "Back"

TERTIARY:
- Minor actions
- Text-only or underlined
- Minimal visual weight
- Example: "Learn more", "Skip"

DESTRUCTIVE:
- Red/orange color
- Requires confirmation for permanent actions
- Example: "Delete Account"
```

### States (All Required)
```css
.button {
    /* Default */
    background: var(--primary);
    cursor: pointer;
}

.button:hover {
    /* Hover - visual feedback */
    background: var(--primary-dark);
}

.button:focus-visible {
    /* Focus - keyboard navigation */
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
}

.button:active {
    /* Active - pressed state */
    transform: scale(0.98);
}

.button:disabled {
    /* Disabled - not interactive */
    opacity: 0.5;
    cursor: not-allowed;
}

.button.loading {
    /* Loading - action in progress */
    pointer-events: none;
    position: relative;
}

.button.loading::after {
    content: "";
    /* Spinner styles */
}
```

### Sizing
```css
/* Touch-friendly minimum */
.button {
    min-height: 44px;      /* Apple HIG / WCAG */
    min-width: 64px;       /* Readable label */
    padding: 12px 16px;    /* Comfortable click area */
}

/* Size variants */
.button-sm {
    min-height: 36px;      /* Desktop only */
    padding: 8px 12px;
}

.button-lg {
    min-height: 52px;
    padding: 16px 24px;
}
```

### Labels
```
GOOD:
- "Save Changes"
- "Delete Account"
- "Add to Cart"
- "Continue to Checkout"
- "Download Report"

BAD:
- "Submit"
- "Click Here"
- "OK"
- "Yes" / "No" (ambiguous)
- "Go"

PATTERN: [Verb] + [Object]
```

## Navigation

### Pattern Selection
```python
def select_navigation_pattern(item_count, platform, site_type):
    if platform == "desktop":
        if item_count <= 7:
            return "horizontal_navbar"
        elif site_type == "e-commerce":
            return "mega_menu"  # 88% of top sites
        else:
            return "dropdown_menu"
    
    elif platform == "mobile":
        if item_count <= 5:
            return "bottom_tab_bar"  # Thumb-reachable
        elif site_type == "browsing_heavy":
            return "hamburger_menu"
        else:
            return "priority_plus"  # Top items + "More"
```

### Hamburger Menu Research
```
NN/G FINDINGS:

DISCOVERABILITY:
- 20%+ drop compared to visible navigation
- Lower usage likelihood
- Later use in task flows
- Only 52% of users 45+ understand icon

WHEN ACCEPTABLE:
- Mobile (smaller penalty)
- Secondary navigation
- App settings/profile

WHEN TO AVOID:
- Desktop (always show nav)
- E-commerce category navigation
- Primary user flows

IMPROVEMENT:
- Add "Menu" label to icon (+10% interaction)
- Use on mobile only
- Keep critical nav visible
```

### Breadcrumbs
```
NN/G RESEARCH:

BENEFITS:
- No documented downsides
- Users either use them or ignore them
- Essential for hierarchical sites (>2 levels)
- 36% of mobile e-commerce fails to show full hierarchy

IMPLEMENTATION:
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/products/laptops">Laptops</a></li>
        <li aria-current="page">MacBook Pro</li>
    </ol>
</nav>

MOBILE:
- Show at least parent category
- Truncate middle with "..."
- Keep current page visible
```

### Mega Menus
```
BEST PRACTICES:

STRUCTURE:
- Group items into categories
- Use clear headings
- Include featured content/images
- Limit depth to 2 levels

INTERACTION:
- Open on hover (desktop)
- 300-500ms delay before closing
- Clear hover area boundaries
- Keyboard accessible

ACCESSIBILITY:
- Use semantic navigation
- Include skip links
- Proper ARIA labels
- Focus management
```

## Tables

### Responsive Patterns
```
HORIZONTAL SCROLL:
- Simple to implement
- Maintains data relationships
- Loses context on small screens
- Best for: Simple tables, comparison data

CARD STACK:
- Good for mobile
- Each row becomes card
- Loses comparison ability
- Best for: List-like data, detail views

PRIORITY COLUMNS:
- Hide less important columns progressively
- Maintains key data visibility
- Requires prioritization decisions
- Best for: Feature comparison, dashboards
```

### Requirements
```css
/* Sticky headers for scrollable tables */
thead th {
    position: sticky;
    top: 0;
    background: var(--surface);
}

/* First column sticky for horizontal scroll */
tbody th,
tbody td:first-child {
    position: sticky;
    left: 0;
    background: var(--surface);
}

/* Adequate padding */
td, th {
    padding: 12px 16px;
}

/* Right-align numbers */
td[data-type="number"] {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

/* Truncation with tooltip */
.truncate {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```

### Sortable Tables
```html
<table>
    <thead>
        <tr>
            <th>
                <button 
                    aria-sort="ascending"
                    aria-label="Name, sorted ascending"
                >
                    Name ↑
                </button>
            </th>
        </tr>
    </thead>
</table>

<!-- Sort states -->
aria-sort="none"        /* Not sorted */
aria-sort="ascending"   /* A-Z, 0-9 */
aria-sort="descending"  /* Z-A, 9-0 */
```

## Modals / Dialogs

### When to Use
```
USE MODALS:
- Confirmations requiring immediate decision
- Simple forms (1-3 fields)
- Alerts requiring acknowledgment
- Preview/zoom content

AVOID MODALS:
- Complex forms (use page)
- Content that can be inline
- Frequent actions
- Mobile (use full screen)
```

### Requirements
```javascript
const modalRequirements = {
    // Accessibility
    focusTrap: true,           // Tab cycles within modal
    escapeCloses: true,        // Esc dismisses
    returnFocus: true,         // Focus returns on close
    ariaModal: true,           // aria-modal="true"
    ariaLabelledby: true,      // Title linked to modal
    
    // Interaction
    clickOutsideCloses: true,  // Backdrop dismisses
    preventBodyScroll: true,   // No background scroll
    
    // Sizing
    maxWidth: "600px",         // Content-appropriate
    maxHeight: "80vh",         // Room for viewport
    scrollable: true           // Modal content scrolls
};
```

### Implementation
```html
<div 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <h2 id="modal-title">Confirm Delete</h2>
    
    <p>Are you sure you want to delete this item?</p>
    
    <div class="modal-actions">
        <button type="button" onclick="closeModal()">
            Cancel
        </button>
        <button type="button" class="destructive">
            Delete
        </button>
    </div>
</div>
```

## Loading States

### Pattern Selection
```
DURATION-BASED:

< 1 second:
- No indicator needed
- Feels instantaneous
- Just update content

1-3 seconds:
- Spinner or progress bar
- Subtle, not distracting
- Position near action

> 3 seconds:
- Skeleton screen
- Show progress percentage if known
- Allow cancellation if possible
```

### Skeleton Screens
```
RESEARCH: Perceived as 20-30% faster than spinners

IMPLEMENTATION:
- Match actual content layout
- Use subtle pulse animation
- Gray blocks for text (varied lengths)
- Rounded shapes for images/avatars
- Don't skeleton interactive elements

EXAMPLE CSS:
.skeleton {
    background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: skeleton 1.5s ease-in-out infinite;
}

@keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

### Progress Indicators
```
DETERMINATE:
- Known duration (file upload, process)
- Show percentage
- Estimate time remaining
- Start at 10-20% (Goal-Gradient Effect)

INDETERMINATE:
- Unknown duration (search, API call)
- Spinning/pulsing indicator
- Reassure action is happening
- Show elapsed time if >10s
```

## Empty States

### Structure
```
1. ILLUSTRATION (optional)
   - Friendly, on-brand graphic
   - Not required but adds warmth
   
2. HEADING
   - What happened
   - Clear, descriptive
   - "No projects yet"

3. BODY
   - Why it matters / what to do
   - Brief explanation
   - "Projects help you organize your work"

4. CALL TO ACTION
   - Primary action to resolve
   - "+ Create Project"
   - Secondary action if relevant
```

### Examples
```html
<!-- No results -->
<div class="empty-state">
    <svg class="empty-illustration">...</svg>
    <h3>No results found</h3>
    <p>Try adjusting your search or filters.</p>
    <button onclick="clearFilters()">Clear filters</button>
</div>

<!-- First use -->
<div class="empty-state">
    <svg class="empty-illustration">...</svg>
    <h3>Welcome to Projects</h3>
    <p>Create your first project to get started.</p>
    <button class="primary">+ Create Project</button>
</div>

<!-- Error state -->
<div class="empty-state error">
    <svg class="error-illustration">...</svg>
    <h3>Something went wrong</h3>
    <p>We couldn't load your data. Please try again.</p>
    <button onclick="retry()">Retry</button>
</div>
```

## Notifications / Toasts

### Types
```
SUCCESS:
- Confirms completed action
- Auto-dismiss (3-5 seconds)
- Green/positive color
- Example: "Changes saved"

ERROR:
- Indicates failure
- Persist until dismissed
- Red/error color
- Include recovery action
- Example: "Failed to save. Retry?"

WARNING:
- Alerts to potential issue
- May auto-dismiss or persist
- Yellow/orange color
- Example: "You have unsaved changes"

INFO:
- Neutral information
- Auto-dismiss (3-5 seconds)
- Blue/neutral color
- Example: "New version available"
```

### Implementation
```
POSITIONING:
- Top-right (common)
- Bottom-center (less intrusive)
- Consistent location

TIMING:
- Success/Info: 3-5 seconds
- Warning: 5-10 seconds
- Error: Until dismissed

ACCESSIBILITY:
- role="alert" for important
- role="status" for informational
- aria-live="polite" or "assertive"
- Keyboard dismissible
- Don't rely on color alone
```

### Best Practices
```
DO:
- Stack multiple notifications
- Show one at a time (or limit to 3)
- Allow manual dismiss
- Include action when relevant
- Animate entrance/exit

DON'T:
- Auto-dismiss errors
- Cover critical UI
- Use for complex content
- Spam notifications
- Require immediate action
```

## Motion and Animation

### Disney's 12 Principles Applied to UI
```
RESEARCH: Disney animation principles translate directly to interface design

1. SQUASH AND STRETCH
   → Button press states, toggle animations
   → Creates tactile feedback sensation

2. ANTICIPATION
   → Hover states indicating interactivity
   → Pre-loading indicators before action

3. STAGING
   → Drawing attention to primary action
   → Modal overlays focusing user attention

4. STRAIGHT AHEAD vs POSE TO POSE
   → Procedural vs keyframe animation approaches
   → Use pose-to-pose for UI (more controlled)

5. FOLLOW THROUGH AND OVERLAPPING ACTION
   → Staggered element timing establishes hierarchy
   → Lists loading item by item
   → Cards settling after appearing

6. SLOW IN AND SLOW OUT (Easing)
   → CRITICAL for natural feel
   → Without easing, animations appear robotic
   → Use ease-out for entering, ease-in for exiting

7. ARCS
   → Natural movement paths
   → Avoid perfectly linear transitions
   → Curved paths for drag-and-drop

8. SECONDARY ACTION
   → Supporting animations reinforce primary
   → Icon spin while button clicks
   → Ripple effect on touch

9. TIMING
   → 100ms: Micro-feedback (button click)
   → 200-300ms: Standard transitions
   → 400-500ms: Complex transitions (modals, page)
   → >500ms: Feels sluggish

10. EXAGGERATION
    → FABs drawing attention
    → Error shake animations
    → Balance: Too much = annoying

11. SOLID DRAWING
    → 3D perspective in UI depth
    → Shadows indicating elevation
    → Material Design's elevation system

12. APPEAL
    → Emotional connection
    → Personality in micro-interactions
    → Mailchimp's high-five, Slack's loading messages
```

### Motion Timing Reference
```css
/* Duration by complexity */
--duration-instant: 100ms;    /* Micro-interactions, feedback */
--duration-fast: 200ms;       /* Simple state changes */
--duration-normal: 300ms;     /* Standard transitions */
--duration-slow: 500ms;       /* Complex, full-screen */
--duration-slower: 700ms;     /* Extra complex (rare) */

/* Easing curves */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  /* Use for: Elements entering view */
  
--ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  /* Use for: Elements exiting view */
  
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  /* Use for: Elements moving/transforming */

--ease-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  /* Use for: Playful emphasis (sparingly) */
```

### Motion Accessibility (CRITICAL)
```
VESTIBULAR DISORDERS:
- Affect ~35% of adults over 40
- Parallax, zooming, spinning can cause:
  → Dizziness
  → Nausea  
  → Migraines
  → Disorientation

WCAG REQUIREMENTS:
- Animations triggered by interaction must be disableable
- Auto-playing content >5 seconds must be pausable
- Nothing flashes more than 3 times per second

IMPLEMENTATION:
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

ALTERNATIVE APPROACH:
- Replace motion with fade/opacity changes
- Replace parallax with static layering
- Keep functional feedback, remove decorative motion
```

### When to Use Animation
```
USE ANIMATION FOR:
✓ Feedback (button clicked, action completed)
✓ State changes (expanded/collapsed)
✓ Spatial relationships (where did that go?)
✓ Attention (new notification)
✓ Loading (something is happening)

AVOID ANIMATION FOR:
✗ Purely decorative motion
✗ Delays that slow users down
✗ Complex sequences for simple actions
✗ Anything that autoplays indefinitely
✗ Large-scale motion (full-screen swooshes)
```
