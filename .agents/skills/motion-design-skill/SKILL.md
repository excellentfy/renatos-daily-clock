---
name: motion-design-skill
description: Motion design principles, micro-interactions, cubic easing curves, spring physics, and fluid transitions for modern reactive web applications.
---

# Motion Design Skill Guide & Best Practices

## Core Principles of UI Motion

1. **Purpose-Driven Animation**:
   - Every movement must provide feedback, guide attention, or establish spatial relationships.
   - Avoid decorative motion that slows down user workflows.

2. **Timing & Easing**:
   - **Micro-interactions (buttons, toggles, badges)**: 150ms - 250ms with snappy ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - **Card & Component Transitions**: 300ms - 450ms with smooth standard easing.
   - **Modal & View Transitions**: 400ms - 600ms with natural spring or multi-stage stagger.

3. **Spatial Continuity & Choreography**:
   - Elements entering or leaving should move in harmony with user intent.
   - Use staggered delays (30ms - 50ms per item) when animating lists or grids of cards to create a fluid cascading wave effect.

4. **Feedback & Haptics/Audio-Visual**:
   - State changes (e.g. class starting, countdown zero, filter change) should trigger subtle visual pulses, glowing accents, and satisfying micro-animations.
