import { useEffect, useRef } from 'react';

const DEFAULT_STOPS = ['#10b981', '#14b8a6', '#22d3ee'];

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const int = Number.parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Aurora({
  colorStops = DEFAULT_STOPS,
  amplitude = 1,
  speed = 0.35,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const colors = colorStops.length ? colorStops : DEFAULT_STOPS;
    let frameId = 0;
    let width = 0;
    let height = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    const drawRibbon = ({ hue, phase, yBias, thickness, blur, alpha }) => {
      context.save();
      context.filter = `blur(${blur}px)`;
      context.globalCompositeOperation = 'screen';
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = hexToRgba(hue, alpha);
      context.lineWidth = thickness;

      context.beginPath();
      const step = Math.max(width / 14, 48);

      for (let x = -step; x <= width + step; x += step) {
        const nx = x / Math.max(width, 1);
        const waveA = Math.sin(nx * 6.5 + elapsed * speed + phase) * 70 * amplitude;
        const waveB = Math.cos(nx * 10 + elapsed * speed * 0.8 + phase * 1.7) * 30 * amplitude;
        const y = height * yBias + waveA + waveB;

        if (x <= 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }

      context.stroke();
      context.restore();
    };

    const render = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += delta;

      context.clearRect(0, 0, width, height);

      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, 'rgba(3, 8, 12, 0.82)');
      sky.addColorStop(0.5, 'rgba(4, 14, 17, 0.4)');
      sky.addColorStop(1, 'rgba(5, 7, 9, 0.92)');
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      drawRibbon({
        hue: colors[0] || DEFAULT_STOPS[0],
        phase: 0,
        yBias: 0.22,
        thickness: 110,
        blur: 55,
        alpha: 0.22,
      });

      drawRibbon({
        hue: colors[1] || DEFAULT_STOPS[1],
        phase: 1.8,
        yBias: 0.3,
        thickness: 140,
        blur: 70,
        alpha: 0.16,
      });

      drawRibbon({
        hue: colors[2] || DEFAULT_STOPS[2],
        phase: 3.2,
        yBias: 0.18,
        thickness: 90,
        blur: 60,
        alpha: 0.14,
      });

      const vignette = context.createRadialGradient(
        width * 0.5,
        height * 0.2,
        0,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.8
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(2, 4, 6, 0.5)');
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [amplitude, colorStops, speed]);

  return <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />;
}
