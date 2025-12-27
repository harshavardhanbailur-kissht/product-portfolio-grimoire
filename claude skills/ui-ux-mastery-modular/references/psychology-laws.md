# The 21 Laws of UX: Psychology Foundations

This reference provides the complete Laws of UX with original research citations, quantified thresholds, and practical applications.

## Decision-Making Laws

### Hick's Law (Hick & Hyman, 1952)
```
FORMULA: RT = a + b × log₂(n+1)
WHERE: RT = reaction time, n = number of choices

THRESHOLD: +150ms per additional bit of information
PRACTICAL LIMIT: 6 visible options maximum before paralysis
```

**Research**: W.E. Hick (1952), "On the rate of gain of information"
- Reaction time increases logarithmically with choices
- More pronounced when quick decisions matter
- Less pronounced for familiar/practiced choices

**Application**:
```python
def optimize_choices(options, context):
    if len(options) <= 6:
        return show_all(options)
    elif context.requires_speed:
        return show_top_6_with_more(options)
    else:
        return progressive_disclosure(options)
```

**Examples**:
- Navigation: Max 7 items
- Dropdown: Consider search for >10 items
- Settings: Group into categories
- Forms: Smart defaults reduce choices

---

### Miller's Law (George Miller, 1956)
```
THRESHOLD: 7 ± 2 items in working memory
MODERN RESEARCH: 4 ± 1 for pure working memory (Cowan, 2001)
```

**Research**: "The Magical Number Seven, Plus or Minus Two" - Psychological Review
- Working memory has finite capacity
- "Chunking" groups items into meaningful units
- Phone numbers use chunking: 555-867-5309

**Application**:
```
CHUNKING STRATEGIES:
- Group related information visually
- Use progressive disclosure
- Limit steps in multi-step processes
- Break long forms into sections
```

**Examples**:
- Phone: XXX-XXX-XXXX (3 chunks, not 10 digits)
- Credit card: XXXX XXXX XXXX XXXX (4 chunks)
- Navigation: 5-7 top-level items
- Wizard: 3-5 steps with progress indicator

---

### Paradox of Choice (Barry Schwartz, 2004)
```
EVIDENCE: Iyengar & Lepper Jam Study (2000)
- 24 options: 60% browsed, 3% bought
- 6 options: 40% browsed, 30% bought
RESULT: 10x higher conversion with fewer options
```

**Conditions increasing choice overload** (Chernev et al., 2015):
- Decision makers want quick decisions
- Making optimal choice matters
- Options are difficult to compare
- Customers uncertain about preferences

**Application**:
- Curate options, don't just list
- Provide recommendations
- Use smart defaults
- Allow filtering/sorting for large sets

---

### Decision Fatigue (Baumeister, 1998)
```
EVIDENCE: Ego depletion research
- Radish/chocolate experiment: Willpower depletes
- Judicial parole study: 65% favorable at day start → 0% before break
```

**Application**:
- Place important decisions early in flow
- Reduce total decision count
- Provide smart defaults
- Allow breaks in long processes
- Save progress for later completion

## Attention & Memory Laws

### Von Restorff Effect (Hedwig von Restorff, 1933)
```
PRINCIPLE: Distinctive items among homogeneous stimuli are better remembered
ALSO KNOWN AS: Isolation Effect
```

**Application**:
```css
/* Make important elements visually distinct */
.cta-primary {
  background: var(--brand-color);
  font-weight: bold;
  /* Only ONE per view */
}

/* Don't over-apply or nothing stands out */
```

**Examples**:
- Primary CTA button styling
- Error messages (red, icon)
- New/updated badges
- Important notifications

**Warning**: If everything is emphasized, nothing is emphasized.

---

### Serial Position Effect (Ebbinghaus, 1885)
```
PRIMACY EFFECT: First items remembered best
RECENCY EFFECT: Last items remembered best
```

**Application**:
```
LIST PLACEMENT:
- Most important: First position
- Second most: Last position
- Least important: Middle positions

NAVIGATION:
- Home/Primary: Far left
- Profile/Settings: Far right
- Secondary items: Middle
```

---

### F-Pattern (Nielsen Norman Group, 2006)
```
EYE-TRACKING DATA:
- 232 users, thousands of pages
- 80% viewing time on left half
- Users read 20-28% of page content
- Average visit: <60 seconds
```

**Pattern**:
1. Horizontal scan across top
2. Move down, scan shorter horizontal
3. Vertical scan down left side

**Application**:
- Critical content: Top-left quadrant
- Headlines: Carry information in first 2 words
- Left-align important elements
- Use headings that are scannable

---

### Banner Blindness (Benway & Lane, 1998)
```
FINDING: Users ignore anything that looks like an ad
- Affects content styled like ads
- Box shapes near edges
- Animation (ironically)
```

**Application**:
- Don't style important content like ads
- Avoid sidebar placement for CTAs
- Be cautious with animation for important elements
- Integrate content naturally

## Motivation Laws

### Doherty Threshold (Walter Doherty, 1982)
```
THRESHOLD: 400ms for system response
PREVIOUS STANDARD: 2 seconds
IMPACT: Productivity increases exponentially below 400ms
```

**Research**: IBM study found productivity improved dramatically when response time dropped below 400ms.

**Application**:
```
RESPONSE TIME TARGETS:
- <100ms: Feels instantaneous
- 100-400ms: Slight delay, acceptable
- >400ms: Flow state breaks, show loading indicator
- >1000ms: User distraction likely
- >10000ms: Risk of abandonment
```

**Optimization**:
- Skeleton screens for perceived speed
- Optimistic UI updates
- Progressive loading
- Service worker caching

---

### Goal-Gradient Effect (Clark Hull, 1932)
```
FINDING: Effort increases as goal approaches
EVIDENCE: Coffee shop loyalty cards
- Started at 10/12 stamps vs 0/10
- Both need 10 purchases
- Pre-stamped completed 20% faster
```

**Application**:
```
PROGRESS INDICATORS:
- Start at 10-20% (not 0%)
- "Profile 40% complete" drives completion
- Reward proximity to goal
- Show checkmarks for completed steps
```

**Examples**:
- Onboarding progress bars
- E-commerce checkout steps
- Form completion percentages
- Gamification progress

---

### Zeigarnik Effect (Bluma Zeigarnik, 1927)
```
FINDING: Incomplete tasks create cognitive tension
- People remember unfinished tasks better
- Creates urge to complete
```

**Research**: Observed waiters remembering unpaid orders but forgetting paid ones.

**Application**:
```
LEVERAGE INCOMPLETENESS:
- "Your profile is 60% complete"
- Show what's remaining, not just completed
- Draft saves and "continue where you left off"
- Abandoned cart reminders
```

**Ethical use**: Help users complete valuable tasks, don't manipulate.

---

### Peak-End Rule (Daniel Kahneman)
```
FINDING: Experiences judged by peak moment + ending
NOT: Average of all moments
```

**Research**: Cold water experiments - longer exposure with warmer end preferred.

**Application**:
```
EXPERIENCE DESIGN:
- Create positive peaks (surprise, delight)
- Ensure positive ending (confirmation, celebration)
- Recovery from negative peaks matters
- Final impression persists in memory
```

**Examples**:
- Checkout confirmation page (celebration)
- Onboarding completion screen
- Error recovery with solution
- Thank you screens with next steps

## Perception Laws

### Fitts's Law (Paul Fitts, 1954)
```
FORMULA: MT = a + b × log₂(2D/W)
WHERE: MT = movement time, D = distance, W = target width
```

**Practical implications**:
```
TARGET SIZE:
- Larger = faster to acquire
- Screen corners = "infinite" targets (edges catch cursor)
- Adjacent targets need spacing

PLACEMENT:
- Frequently used: Close to starting position
- Important actions: Near center of attention
- Related actions: Grouped together
```

**Application**:
```css
/* Make clickable targets large enough */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Use screen edges for menus */
.sidebar {
  position: fixed;
  left: 0;
}
```

---

### Gestalt Principles (Wertheimer, Koffka, Köhler, 1920s)

#### Proximity
```
PRINCIPLE: Close elements perceived as grouped
APPLICATION: Use spacing to show relationships
```

#### Similarity
```
PRINCIPLE: Similar elements perceived as related
APPLICATION: Consistent styling for same function
```

#### Continuity
```
PRINCIPLE: Elements on line/curve perceived as related
APPLICATION: Align elements to create flow
```

#### Closure
```
PRINCIPLE: Brain completes incomplete shapes
APPLICATION: Partial visibility indicates more content
```

#### Figure-Ground
```
PRINCIPLE: Visual field separates into figures and ground
APPLICATION: Clear hierarchy, obvious focus areas
```

#### Common Region (Palmer, 1992)
```
PRINCIPLE: Elements in bounded area perceived as grouped
APPLICATION: Use cards, containers, borders
STRENGTH: Can overcome proximity
```

#### Uniform Connectedness (Palmer & Rock, 1994)
```
PRINCIPLE: Connected elements perceived as grouped
APPLICATION: Lines, arrows, visual connections
STRENGTH: Strongest grouping principle
```

## Complexity Laws

### Tesler's Law (Larry Tesler, 1980s)
```
PRINCIPLE: Every application has inherent irreducible complexity
QUESTION: Who deals with it - user or developer?
```

**Application**:
```
SHIFT COMPLEXITY TO SYSTEM:
- Smart defaults
- Auto-formatting (phone, credit card)
- Validation with correction suggestions
- Predictive input

EXAMPLES:
- Date picker vs. text input
- Address autocomplete
- Currency conversion
- Timezone handling
```

---

### Jakob's Law (Jakob Nielsen)
```
PRINCIPLE: Users spend most time on OTHER sites
IMPLICATION: Expect your site to work like others
```

**Application**:
```
FOLLOW CONVENTIONS:
- Logo top-left, links to home
- Search top-right
- Primary nav horizontal top
- Cart icon top-right (e-commerce)
- Footer: About, Contact, Legal
```

**When to deviate**:
- Strong evidence of >30% improvement
- A/B tested with real users
- Provide learning path for users

---

### Aesthetic-Usability Effect (Kurosu & Kashimura, 1995)
```
FINDING: Beautiful design perceived as more usable
DANGER: Can mask actual usability problems
```

**Research**: ATM study showed aesthetic designs rated more usable even with same functionality.

**Application**:
- Invest in visual design AND usability
- Don't let beauty hide problems
- Test with users, not just stakeholders
- Aesthetics can't fix fundamental UX issues

---

### Processing Fluency (Reber, Schwarz & Winkielman, 2004)
```
FINDING: Easier to process = perceived as more true/beautiful
MECHANISM: Positive affect from ease of processing
```

**Factors increasing fluency**:
- High contrast
- Clean fonts
- Rhyming
- Repetition
- Prototypical designs

**Application**:
```
INCREASE FLUENCY:
- High contrast text
- Standard typefaces
- Consistent patterns
- Predictable layouts
- Clear visual hierarchy
```

---

## Behavior Laws

### Fogg Behavior Model (BJ Fogg, Stanford, 2009)
```
FORMULA: B = M × A × P
WHERE: Behavior = Motivation × Ability × Prompt

ALL THREE must converge at same moment
```

**Components**:

**Motivation** (core motivators):
- Pleasure / Pain
- Hope / Fear
- Acceptance / Rejection

**Ability** (simplicity factors):
- Time required
- Money required
- Physical effort
- Cognitive load
- Social deviance
- Routine deviation

**Prompts** (trigger types):
- Sparks: Motivate low-motivation users
- Facilitators: Ease low-ability users
- Signals: Remind high-motivation/ability users

**Key insight**: "Making behavior simpler succeeds faster than adding motivation."

**Application**:
```python
def design_for_behavior(target_behavior):
    # Check ability first - it's cheaper to improve
    if requires_high_ability(target_behavior):
        reduce_friction()  # Faster wins than motivation
    
    if requires_high_motivation(target_behavior):
        add_motivators()  # Pleasure, hope, acceptance
    
    # Always need appropriate trigger
    add_contextual_prompt(target_behavior)
```

## Quick Reference Table

| Law | Threshold/Key | Application |
|-----|---------------|-------------|
| Hick's | +150ms per option | Max 6 choices visible |
| Miller's | 7±2 chunks | Group related items |
| Doherty | <400ms response | Show loading if slower |
| Goal-Gradient | Accelerates near end | Start progress at 10-20% |
| Fitts's | MT = a + b × log₂(2D/W) | Large targets, close placement |
| Peak-End | Peak + ending = memory | End experiences positively |
| Von Restorff | Distinctive = memorable | One primary CTA per view |
| F-Pattern | 80% left side | Important content top-left |
| Jakob's | Match other sites | Follow conventions |
| Tesler's | Complexity conserved | System handles complexity |
