---
name: gsap-skills
description: GreenSock Animation Platform (GSAP) best practices, timeline sequencing, reactive React integration, stagger animations, and performance optimizations.
---

# GSAP Skills & React Integration Guide

## Best Practices for GSAP in React

1. **Context & Cleanup**:
   - Use `gsap.context()` inside `useLayoutEffect` or `useEffect` to safely scope selector queries and automatically revert animations on unmount:
   ```typescript
   useEffect(() => {
     const ctx = gsap.context(() => {
       gsap.from(".anim-item", {
         opacity: 0,
         y: 20,
         duration: 0.5,
         stagger: 0.05,
         ease: "power2.out"
       });
     }, containerRef);
     return () => ctx.revert();
   }, [dependencies]);
   ```

2. **Timelines for Orchestration**:
   - Chain related animations sequentially or with position offsets (`"-=0.2"`) rather than managing disconnected timeouts.

3. **Hardware Acceleration & Performance**:
   - Animate `transform` (`x`, `y`, `scale`, `rotation`) and `opacity` to keep animations on the GPU compositor thread.
   - Use `will-change: transform` or `force3D: true` on complex animated elements.

4. **Interactive State & Hover Effects**:
   - Quick tweens with `gsap.to(target, { scale: 1.03, boxShadow: "0 0 20px rgba(0, 191, 255, 0.4)", duration: 0.25 })`.
