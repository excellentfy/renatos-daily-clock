import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const GetLogo3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterGRef = useRef<HTMLDivElement>(null);
  const letterERef = useRef<HTMLDivElement>(null);
  const letterTRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Continuous floating 3D wave animation
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      tl.to(letterGRef.current, {
        y: -4,
        rotateX: 8,
        rotateY: -8,
        duration: 1.6,
        ease: 'sine.inOut',
      }, 0)
      .to(letterERef.current, {
        y: -6,
        rotateX: -6,
        rotateY: 6,
        duration: 1.8,
        ease: 'sine.inOut',
      }, 0.2)
      .to(letterTRef.current, {
        y: -4,
        rotateX: 8,
        rotateY: 8,
        duration: 1.5,
        ease: 'sine.inOut',
      }, 0.4);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex items-center gap-3.5 select-none py-1">
      {/* 3D Animated G-E-T Blocks */}
      <div className="flex items-center gap-1.5" style={{ perspective: '800px' }}>
        {/* 'G' Box */}
        <div
          ref={letterGRef}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#0f143a] border border-[#2b3577] shadow-[0_6px_14px_rgba(0,0,0,0.25),0_0_10px_rgba(244,63,94,0.2)] flex items-center justify-center relative cursor-pointer hover:scale-110 transition-transform"
        >
          <span className="text-2xl md:text-3xl font-black text-[#ff2e5f] font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            G
          </span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
        </div>

        {/* 'E' Box */}
        <div
          ref={letterERef}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#facc15] border border-[#fde047] shadow-[0_6px_14px_rgba(0,0,0,0.2),0_0_12px_rgba(250,204,21,0.35)] flex items-center justify-center relative cursor-pointer hover:scale-110 transition-transform"
        >
          <span className="text-2xl md:text-3xl font-black text-[#ff2e5f] font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            E
          </span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>

        {/* 'T' Box */}
        <div
          ref={letterTRef}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-[#00bfff] border border-[#38bdf8] shadow-[0_6px_14px_rgba(0,0,0,0.2),0_0_12px_rgba(0,191,255,0.35)] flex items-center justify-center relative cursor-pointer hover:scale-110 transition-transform"
        >
          <span className="text-2xl md:text-3xl font-black text-[#ff2e5f] font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            T
          </span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* School Typography with High Contrast & Soft Text Shadow for Light Theme */}
      <div className="flex flex-col justify-center leading-none">
        <span className="text-[9px] md:text-[10px] font-extrabold tracking-wider text-slate-600 uppercase font-sans">
          GINÁSIO EDUCACIONAL TECNOLÓGICO
        </span>
        <span className="text-xl md:text-2xl font-black tracking-tight text-slate-950 uppercase font-sans drop-shadow-sm mt-0.5">
          VENEZUELA
        </span>
      </div>
    </div>
  );
};

export default GetLogo3D;
