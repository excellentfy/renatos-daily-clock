import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeClockSceneProps {
  primaryColor?: string; // hex string e.g. '#00F0FF'
  activePeriodIndex?: number | null; // 1 to 7
  progress?: number; // 0 to 100
}

export const ThreeClockScene: React.FC<ThreeClockSceneProps> = ({
  primaryColor = '#00F0FF',
  activePeriodIndex = 1,
  progress = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(new THREE.Color(primaryColor), 2, 50);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // 5. Central Holographic Orb (Core)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(primaryColor),
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      emissive: new THREE.Color(primaryColor),
      emissiveIntensity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 6. Outer Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.2, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(primaryColor),
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);
    ring1Ref.current = ring1;

    const ringGeo2 = new THREE.TorusGeometry(2.7, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.4,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);
    ring2Ref.current = ring2;

    // 7. Particle Starfield Constellation
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(primaryColor),
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Mouse parallax interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 1.5;
      mouseY = y * 1.5;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (coreMesh) {
        coreMesh.rotation.y = elapsedTime * 0.4;
        coreMesh.rotation.x = elapsedTime * 0.2;
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.05;
        coreMesh.scale.set(scale, scale, scale);
      }

      if (ring1) {
        ring1.rotation.z = elapsedTime * 0.3;
        ring1.rotation.y = elapsedTime * 0.15;
      }

      if (ring2) {
        ring2.rotation.x = -elapsedTime * 0.2;
        ring2.rotation.z = elapsedTime * 0.25;
      }

      if (particles) {
        particles.rotation.y = elapsedTime * 0.05;
      }

      // Smooth camera follow
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update theme colors reactively
  useEffect(() => {
    if (coreMeshRef.current) {
      const mat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(primaryColor);
      mat.emissive.set(primaryColor);
    }
    if (ring1Ref.current) {
      const mat = ring1Ref.current.material as THREE.MeshBasicMaterial;
      mat.color.set(primaryColor);
    }
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.color.set(primaryColor);
    }
  }, [primaryColor]);

  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-card/80 to-background/90 border border-border/50 backdrop-blur-xl shadow-2xl flex items-center justify-center">
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
      
      {/* Floating 3D HUD Indicators */}
      <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
        <span className="text-xs font-mono tracking-wider text-cyan-300 font-semibold uppercase">
          Orbit Time Tracker 3D
        </span>
      </div>

      <div className="absolute bottom-3 right-4 pointer-events-none text-right">
        <div className="text-[10px] font-mono text-muted-foreground uppercase">
          Tempo Atual
        </div>
        <div className="text-sm font-bold font-mono text-foreground" style={{ color: primaryColor }}>
          {activePeriodIndex ? `${activePeriodIndex}º Tempo (${progress}%)` : 'Intervalo / Pausa'}
        </div>
      </div>
    </div>
  );
};

export default ThreeClockScene;
