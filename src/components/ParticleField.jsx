import { useEffect, useRef } from 'react';

export default function ParticleField({ active }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.45 + 0.2,
      life: 0,
      maxLife: Math.random() * 500 + 280,
      color: Math.random() > 0.65 ? '#22d3ee' : '#10b981',
    });

    particlesRef.current = Array.from({ length: 46 }, createParticle);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (active && particlesRef.current.length < 64 && Math.random() > 0.94) {
        particlesRef.current.push(createParticle());
      }

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.3
          ? progress / 0.3
          : 1 - ((progress - 0.3) / 0.7);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life >= p.maxLife) {
          Object.assign(p, createParticle());
        }

        return true;
      });

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.06;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: active ? 0.9 : 0,
        transition: 'opacity 0.6s ease',
      }}
    />
  );
}
