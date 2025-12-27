---
name: ui-ux-mastery-modular
description: |
  Comprehensive UI/UX design system applying research-backed principles from Nielsen Norman Group, Baymard Institute, WCAG 2.2, cognitive psychology, and major design systems (Material Design 3, Apple HIG, Carbon, Atlassian, Fluent). Automatically triggers for: website design, landing pages, dashboards, forms, checkout flows, navigation, buttons, modals, cards, tables, mobile apps, accessibility, components, UI patterns, user interfaces, web applications, SaaS products, e-commerce, healthcare apps, enterprise software. Includes domain-specific prioritization matrices, conflict resolution frameworks, and evidence-based implementation patterns. Modular structure with deep-dive reference files for each domain.
---

# UI/UX Mastery Skill (Modular)

This skill embeds research-backed UI/UX principles with domain-adaptive logic. Reference files provide deep-dive details—load as needed.

## ⚠️ MANDATORY: Task Type Detection

**BEFORE responding, identify the task type:**

```python
if task in ["review", "audit", "critique", "evaluate", "analyze", "feedback", "improve"]:
    # LOAD ALL 5 CORE REFERENCES — Do not skip any
    load("references/domain-matrices.md")    # Priority weights
    load("references/psychology-laws.md")    # Cognitive violations
    load("references/accessibility.md")      # WCAG compliance
    load("references/components.md")         # Pattern evaluation  
    load("references/conversion-ethics.md")  # Dark patterns & CRO
    
elif task in ["build", "create", "design", "make"]:
    # Load domain-matrices.md FIRST, then relevant references
    load("references/domain-matrices.md")
    load_relevant_for_domain()
```

**If user shares a website/screenshot/design for feedback → THIS IS A REVIEW → Load all 5 references.**

## CRITICAL: Reference Loading Rules

### For Website Reviews/Audits/Critiques — LOAD ALL THESE:
```
MANDATORY for any review task:
1. references/domain-matrices.md    → Identify domain, apply priority weights
2. references/psychology-laws.md    → Check cognitive load, attention, Fitts's/Hick's Law violations
3. references/accessibility.md      → WCAG 2.2 AA compliance check
4. references/components.md         → Evaluate forms, nav, buttons, tables, loading states
5. references/conversion-ethics.md  → Check for dark patterns, trust signals, CRO issues
```

### For Building/Creating — Load by Task:
| File | When to Load |
|------|--------------|
| `references/domain-matrices.md` | ALWAYS FIRST — Detect domain, get priority weights |
| `references/psychology-laws.md` | Cognitive load decisions, attention management, choice architecture |
| `references/accessibility.md` | ALL builds (non-negotiable baseline) |
| `references/components.md` | Forms, buttons, modals, tables, nav, loading/empty states |
| `references/design-systems.md` | Platform-specific (iOS/Android/Windows) or design system alignment |
| `references/conversion-ethics.md` | E-commerce, marketing, checkout, signup flows |

### Review/Audit Checklist (Apply After Loading References)
```
□ Domain identified? (e-commerce/SaaS/healthcare/enterprise/consumer/content)
□ Priority matrix applied? (Trust vs Speed vs Efficiency per domain)
□ Nielsen's 10 heuristics checked?
□ Psychology violations? (Hick's Law, cognitive overload, F-pattern ignored)
□ Accessibility issues? (contrast, touch targets, keyboard nav, screen reader)
□ Component patterns correct? (form labels, button hierarchy, nav pattern)
□ Dark patterns present? (confirmshaming, hidden costs, roach motel)
□ Conversion blockers? (friction, missing trust signals, poor microcopy)
```

## Quick Domain Detection

```python
def get_domain_priorities(domain):
    MATRICES = {
        "e-commerce": ["Trust", "Checkout", "Product_Info", "Mobile", "Speed"],
        "saas": ["Clarity", "Efficiency", "Data_Density", "Learnability"],
        "healthcare": ["Safety", "Accuracy", "Accessibility", "Compliance"],
        "enterprise": ["Efficiency", "Reliability", "Keyboard_Nav", "Security"],
        "consumer": ["Simplicity", "Engagement", "Speed", "Delight"],
        "content": ["Readability", "Scannability", "Navigation", "Speed"]
    }
    return MATRICES.get(domain, ["Usability", "Accessibility", "Clarity"])
```

For detailed priority weights and conflict resolution: see `references/domain-matrices.md`

## Universal Baseline (ALWAYS APPLY)

### Nielsen's 10 Heuristics
1. **Visibility of system status** - Feedback within 100ms, loading states for >1s
2. **Match system to real world** - User language, not jargon
3. **User control & freedom** - Undo/redo, clear exits
4. **Consistency & standards** - Jakob's Law: match other sites
5. **Error prevention** - Constraints, confirmations, smart defaults
6. **Recognition over recall** - Visible options, autocomplete
7. **Flexibility & efficiency** - Keyboard shortcuts, power user paths
8. **Aesthetic & minimalist** - Every element earns its place
9. **Error recovery** - [What] + [Why] + [How to fix]
10. **Help & documentation** - Contextual, searchable

### WCAG 2.2 AA Essentials
```
Contrast: 4.5:1 (normal text), 3:1 (large/UI)
Touch targets: 44x44px minimum
Focus: Always visible indicators
Keyboard: All functionality accessible
Color: Never sole indicator of meaning
Motion: Respect prefers-reduced-motion
```

For full accessibility implementation: see `references/accessibility.md`

### Core Metrics
```
Response time: <400ms (Doherty Threshold)
Choices: ≤6 visible (Hick's Law)
Memory chunks: 4±1 items (Miller's Law)
Line length: 45-75 characters
Touch targets: ≥44px
```

For psychology foundations: see `references/psychology-laws.md`

## Quick Component Reference

### Forms
- Labels: TOP-aligned (50ms vs 500ms for left-aligned)
- Layout: SINGLE-COLUMN always (15+ seconds faster)
- Validation: "Reward Early, Punish Late" (blur first, then realtime)
- Required: Asterisk (*) AND "(optional)" for optional
- Checkout: 12-14 elements maximum

### Buttons
- Hierarchy: Primary (one per view) > Secondary > Tertiary > Destructive
- States: Default, Hover, Focus, Active, Disabled, Loading
- Size: Min 44px height, 64px width
- Labels: Verb + Noun ("Save Changes", not "Submit")

### Navigation
- Desktop ≤7 items: Horizontal nav
- Desktop >7 items: Mega menu
- Mobile ≤5 items: Bottom tab bar
- Mobile >5 items: Hamburger (with label) or Priority+

### Loading
- <1s: No indicator
- 1-3s: Spinner
- >3s: Skeleton screen

For detailed component patterns: see `references/components.md`

## Conflict Resolution Quick Reference

```
HIERARCHY (highest priority first):
1. Safety/Accessibility (non-negotiable)
2. Core task completion
3. Domain-specific priority
4. User expertise level
5. Business goals
```

### Common Resolutions
| Conflict | Resolution |
|----------|------------|
| Clicks vs. content | Content wins (no correlation between clicks and satisfaction) |
| Simplicity vs. density | Domain-dependent (e-commerce→simple, enterprise→dense) |
| Consistency vs. optimal | Consistency unless 30%+ improvement proven |
| Speed vs. completeness | Progressive loading with skeleton screens |

For full conflict resolution framework: see `references/domain-matrices.md`

## Anti-Patterns (NEVER USE)

### Dark Patterns
- Confirmshaming, hidden costs, forced continuity, roach motel

### Usability Failures
- Placeholder-only labels
- Disabled buttons without explanation
- Color-only status indicators
- Modal on page load
- Breaking back button

For ethics and conversion patterns: see `references/conversion-ethics.md`

## Implementation Sequence

1. **Structure**: Semantic HTML, heading hierarchy
2. **Accessibility**: WCAG AA from the start
3. **Core Function**: Main user flows
4. **Responsive**: Mobile-first or desktop-down
5. **States**: Loading, empty, error
6. **Polish**: Animation, micro-interactions
