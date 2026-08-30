---
name: img2threejs
description: Three.js 3D interactive graphics, shaders, particle clouds, orbital geometry, and modern WebGL visual effects integrated into web user interfaces.
---

# Three.js & Modern 3D Web Visuals Guide

## Best Practices for Three.js in React

1. **Lightweight Canvas Lifecycle**:
   - Create and clean up WebGLRenderer, Scene, Camera, and Animation Frame loops carefully to prevent memory leaks and WebGL context loss.
   - Resize handler with `renderer.setSize(width, height)` and `camera.aspect = width / height; camera.updateProjectionMatrix()`.

2. **Aesthetic Principles for UI 3D**:
   - Use luminous particle fields, holographic wireframes, glowing toroidal rings, or geometric orbitals to complement the dark theme.
   - Keep geometry optimized (e.g. `BufferGeometry`, instanced meshes or particle points).
   - Add subtle mouse interactivity: smooth parallax rotation based on pointer position.

3. **Performance Budget**:
   - Limit particle counts (e.g., 500-2000 points) for fluid 60FPS on mobile and desktop.
   - Pause or throttle requestAnimationFrame when canvas is out of viewport or tab is inactive.
