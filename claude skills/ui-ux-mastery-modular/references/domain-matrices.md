# Domain-Specific Priority Matrices

This reference provides detailed prioritization logic for different domains, including weighted scoring and conflict resolution frameworks.

## Domain Priority Matrices

### E-Commerce
```python
ECOMMERCE = {
    "priorities": [
        ("Trust", 0.25),           # Security, reviews, guarantees
        ("Checkout_Optimization", 0.25),  # Frictionless purchase
        ("Product_Information", 0.20),    # Images, specs, availability
        ("Mobile_Experience", 0.15),      # 84% mobile cart abandonment
        ("Speed", 0.10),           # Page load, interaction
        ("Aesthetics", 0.05)       # Visual appeal
    ],
    "key_metrics": {
        "cart_abandonment_avg": "70.19%",
        "mobile_abandonment": "84%",
        "checkout_elements_ideal": "12-14",
        "guest_checkout_impact": "24-30% reduction in abandonment"
    },
    "critical_patterns": [
        "Guest checkout visible before any form fields",
        "All costs shown upfront (48% abandon for hidden costs)",
        "Trust signals near payment fields",
        "Progress indicator (3-4 steps max)",
        "Order summary always visible"
    ]
}
```

### SaaS / Dashboard
```python
SAAS = {
    "priorities": [
        ("Clarity", 0.25),         # Data understandable at glance
        ("Efficiency", 0.25),      # Power user optimization
        ("Data_Density", 0.20),    # Information per viewport
        ("Learnability", 0.15),    # Onboarding, feature discovery
        ("Customization", 0.10),   # User preferences
        ("Aesthetics", 0.05)
    ],
    "key_metrics": {
        "scan_time_target": "2-5 seconds for critical metrics",
        "keyboard_shortcuts": "Required for power users",
        "empty_state_conversion": "First action within 60 seconds"
    },
    "critical_patterns": [
        "F-pattern layout (critical content top-left)",
        "Card-based modular design",
        "Progressive disclosure (1-2 levels max)",
        "Command palette (⌘+K) for all actions",
        "Sticky headers for data tables"
    ]
}
```

### Healthcare / Medical
```python
HEALTHCARE = {
    "priorities": [
        ("Safety", 0.30),          # Error prevention is paramount
        ("Accuracy", 0.25),        # No ambiguity in clinical data
        ("Accessibility", 0.20),   # Enhanced beyond standard WCAG
        ("Compliance", 0.15),      # HIPAA, regulatory
        ("Efficiency", 0.07),      # Clinical workflow speed
        ("Aesthetics", 0.03)
    ],
    "key_metrics": {
        "usability_ranking": "Bottom 9% of all industries",
        "safety_reports_with_usability": "36%",
        "physician_time_in_systems": "1-2 hours per hour of patient care"
    },
    "critical_patterns": [
        "Double confirmation for ALL high-impact actions",
        "Undo period for reversible actions",
        "Abnormal values visually distinct (not color alone)",
        "Larger touch targets for clinical environments",
        "High contrast for varying lighting conditions"
    ],
    "non_negotiables": [
        "NEVER use color as sole indicator for clinical data",
        "ALWAYS confirm before executing critical commands",
        "ALWAYS provide clear distinction between similar-looking data"
    ]
}
```

### Enterprise / B2B
```python
ENTERPRISE = {
    "priorities": [
        ("Efficiency", 0.30),      # 8-10 hours daily use
        ("Reliability", 0.25),     # Predictable, stable
        ("Keyboard_Navigation", 0.20),  # Power user essential
        ("Documentation", 0.15),   # Complex workflows
        ("Security", 0.07),
        ("Aesthetics", 0.03)
    ],
    "key_metrics": {
        "usage_pattern": "Expert users, extended sessions",
        "learning_curve_acceptable": "Higher than consumer apps",
        "shortcut_adoption": "Critical for productivity"
    },
    "critical_patterns": [
        "Keyboard shortcuts for all common actions",
        "Bulk operations for efficiency",
        "Dense information display (users prefer)",
        "Persistent navigation and context",
        "Detailed audit trails and history"
    ]
}
```

### Consumer / Mobile App
```python
CONSUMER = {
    "priorities": [
        ("Simplicity", 0.25),      # Zero learning curve
        ("Engagement", 0.20),      # Retention, delight
        ("Speed", 0.20),           # Instant gratification
        ("Personalization", 0.15),
        ("Delight", 0.10),         # Micro-interactions
        ("Trust", 0.10)
    ],
    "key_metrics": {
        "first_impression": "2-3 seconds to understand value",
        "onboarding_steps": "3 max before core experience",
        "session_length": "Variable, often brief"
    },
    "critical_patterns": [
        "One primary action per screen",
        "Gesture-based shortcuts for experts",
        "Bottom navigation (thumb zone)",
        "Pull-to-refresh patterns",
        "Haptic feedback for confirmations"
    ]
}
```

### Content / Media / Blog
```python
CONTENT = {
    "priorities": [
        ("Readability", 0.30),     # Typography, contrast, line length
        ("Scannability", 0.25),    # Headers, bullets, highlights
        ("Navigation", 0.20),      # Find related content
        ("Speed", 0.10),           # Fast page loads
        ("Accessibility", 0.10),
        ("Engagement", 0.05)
    ],
    "key_metrics": {
        "reading_percentage": "20-28% of page content",
        "optimal_line_length": "45-75 characters (66 ideal)",
        "scroll_depth": "Most abandon before 50%"
    },
    "critical_patterns": [
        "Clear heading hierarchy (H1→H2→H3)",
        "Highlighted key phrases",
        "Table of contents for long content",
        "Related content suggestions",
        "Reading time estimates"
    ]
}
```

## Conflict Resolution Framework

### Decision Hierarchy
```python
RESOLUTION_HIERARCHY = [
    ("Safety", "ABSOLUTE"),           # Non-negotiable
    ("Accessibility_WCAG_AA", "ABSOLUTE"),  # Non-negotiable
    ("Core_Task_Completion", 0.90),   # Primary user goal
    ("Domain_Priority", 0.80),        # Apply matrix above
    ("User_Expertise", 0.70),         # Novice vs expert
    ("Business_Goals", 0.60),         # Conversion, engagement
    ("Aesthetics", 0.40)              # Visual appeal
]

def resolve_conflict(principle_a, principle_b, context):
    # 1. Check absolutes
    if is_safety_related(principle_a) or is_safety_related(principle_b):
        return prioritize_safety()
    
    if violates_wcag_aa(principle_a) or violates_wcag_aa(principle_b):
        return choose_accessible_option()
    
    # 2. Apply domain matrix
    domain = detect_domain(context)
    matrix = get_priority_matrix(domain)
    
    score_a = calculate_weighted_score(principle_a, matrix)
    score_b = calculate_weighted_score(principle_b, matrix)
    
    # 3. Consider user expertise
    if context.user_expertise == "expert":
        # Favor efficiency, accept higher cognitive load
        score_a += efficiency_bonus(principle_a)
        score_b += efficiency_bonus(principle_b)
    elif context.user_expertise == "novice":
        # Favor learnability, reduce cognitive load
        score_a += learnability_bonus(principle_a)
        score_b += learnability_bonus(principle_b)
    
    # 4. Return higher score, or recommend testing if close
    if abs(score_a - score_b) < 0.1:
        return "A/B_TEST_RECOMMENDED"
    return principle_a if score_a > score_b else principle_b
```

### Common Conflict Resolutions

#### Minimize Clicks vs. Show Content
```
RESOLUTION: Show content wins
EVIDENCE: Joshua Porter 2003 study (8,000+ clicks, 620 tasks)
- NO correlation between click count and success/satisfaction
- Users visited up to 25 pages without frustration
- Information scent matters, not click count
- One study showed 600% findability increase going from 3 to 4 clicks

ACTION: Prioritize clear navigation paths over reducing clicks
```

#### Aesthetic Simplicity vs. Information Density
```
RESOLUTION: Domain-dependent

E-COMMERCE:
- Simplicity wins
- Reduce cognitive load during purchase
- One clear CTA per view
- Whitespace aids conversion

ENTERPRISE:
- Density wins
- Users are experts (8-10 hours/day)
- Efficiency over learnability
- More data per viewport = fewer navigation steps

DASHBOARD:
- Progressive disclosure
- Summary view with drill-down
- Cards for modular density control
```

#### Consistency vs. Optimal for Context
```
RESOLUTION: Consistency is default

THRESHOLD: Innovation must be 30%+ better to overcome learning cost
EVIDENCE: Jakob's Law - users spend 94% of time on other sites

WHEN TO BREAK CONSISTENCY:
- Strong A/B test evidence (>30% improvement)
- Domain-specific requirement (healthcare safety)
- User testing shows confusion with standard

TRANSITION PATH (if breaking):
- Preview mode for users
- Gradual rollout
- Opt-in for new experience
- Clear documentation of changes
```

#### Speed vs. Completeness
```
RESOLUTION: Progressive loading

PATTERN:
1. Show skeleton screen immediately (<100ms)
2. Load critical content first
3. Progressive enhancement for secondary content
4. Lazy load below-fold content

USER PERCEPTION:
- Skeleton screens perceived 20-30% faster than spinners
- Doherty Threshold: <400ms for flow state
- Users forgive slow loading if they see progress
```

#### Personalization vs. Privacy
```
RESOLUTION: Explicit consent + value exchange

REQUIREMENTS:
1. Clear explanation of data use
2. Obvious opt-out mechanism
3. Demonstrate value of personalization
4. Never dark pattern consent

PATTERN:
"Personalize your experience?"
[What we'll use] → [What you'll get]
[Yes, personalize] [No thanks]
```

## Weighted Scoring Calculator

```python
def calculate_design_score(design_decision, domain, context):
    """
    Calculate weighted score for a design decision.
    Higher score = better aligned with domain priorities.
    """
    matrix = get_priority_matrix(domain)
    
    score = 0
    for priority, weight in matrix["priorities"]:
        alignment = assess_alignment(design_decision, priority)
        score += alignment * weight
    
    # Penalty for violations
    if violates_accessibility(design_decision):
        score -= 1.0  # Heavy penalty
    
    if violates_dark_patterns(design_decision):
        score -= 0.8  # Heavy penalty
    
    # Bonus for best practices
    if uses_research_backed_pattern(design_decision):
        score += 0.1
    
    return score

def assess_alignment(decision, priority):
    """
    Returns 0-1 score for how well decision aligns with priority.
    1.0 = Strongly supports
    0.5 = Neutral
    0.0 = Actively harms
    """
    # Implementation based on decision type and priority
    pass
```

## Quick Reference Matrix

| Domain | #1 Priority | #2 Priority | #3 Priority | Key Metric |
|--------|-------------|-------------|-------------|------------|
| E-commerce | Trust | Checkout | Product Info | Cart abandonment |
| SaaS | Clarity | Efficiency | Data Density | Task completion time |
| Healthcare | Safety | Accuracy | Accessibility | Error rate |
| Enterprise | Efficiency | Reliability | Keyboard Nav | Task throughput |
| Consumer | Simplicity | Engagement | Speed | Retention |
| Content | Readability | Scannability | Navigation | Scroll depth |

## Decision Frameworks for Prioritization

### Hierarchy of User Needs (Walter's Adaptation of Maslow)
```
PROGRESSION (must satisfy lower levels first):

5. MEANINGFUL ──── Purpose, personal significance
        ↑
4. PLEASURABLE ─── Delightful, memorable experience
        ↑
3. USABLE ──────── Easy to use, efficient
        ↑
2. RELIABLE ────── Works consistently, no errors
        ↑
1. FUNCTIONAL ──── Core features work

IMPLICATION: Don't pursue delight before reliability.
Don't optimize usability before core functionality works.
```

### RICE Framework (Intercom)
```
FORMULA: Score = (Reach × Impact × Confidence) / Effort

REACH: How many users affected per quarter?
- 10,000 users = 10,000

IMPACT: How much will this improve the experience?
- 3 = Massive impact
- 2 = High impact
- 1 = Medium impact
- 0.5 = Low impact
- 0.25 = Minimal impact

CONFIDENCE: How sure are we about estimates?
- 100% = High confidence (research-backed)
- 80% = Medium confidence
- 50% = Low confidence (gut feeling)

EFFORT: Person-months of work required
- 0.5 = Half a month
- 1 = One month
- 3 = Quarter

EXAMPLE:
Feature A: (5000 × 2 × 80%) / 2 = 4000
Feature B: (10000 × 1 × 50%) / 3 = 1667
→ Prioritize Feature A
```

### Kano Model
```
FEATURE CATEGORIES:

MUST-BE (Basic):
- Absence causes dissatisfaction
- Presence doesn't increase satisfaction
- Example: Checkout actually works
- Never skip these

PERFORMANCE (Linear):
- More = More satisfaction
- Less = Less satisfaction
- Example: Page load speed
- Invest based on ROI

EXCITEMENT (Delighters):
- Absence doesn't cause dissatisfaction
- Presence significantly increases satisfaction
- Example: Personalized recommendations
- Only pursue after basics covered

INDIFFERENT:
- Users don't care either way
- Don't waste resources

REVERSE:
- Presence causes dissatisfaction
- Example: Forced tutorials for experts
- Remove these
```

### Nielsen Severity Ratings
```
SCALE (0-4):

0 = Not a usability problem
1 = Cosmetic only - fix if time permits
2 = Minor - low priority fix
3 = Major - high priority, fix before release
4 = Catastrophic - must fix immediately

PRIORITIZATION FORMULA:
Priority = Severity × Frequency × Impact on Task

Use during usability testing to rank issues.
```

### Power Law of Learning
```
RESEARCH: Skills follow power law improvement curves

IMPLICATION FOR UX:
- New patterns compete with highly-practiced familiar patterns
- Even 10% better designs fail if they cause 20% learning overhead
- Users have invested thousands of hours in existing conventions

WHEN TO INNOVATE:
- Strong evidence of >30% improvement
- Provide transition paths
- Allow opt-in for new experience
- Don't force relearning without major benefit
```
