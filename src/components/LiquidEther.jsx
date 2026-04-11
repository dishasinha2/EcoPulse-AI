import { useEffect, useRef } from 'react';

const DEFAULT_COLORS = ['#5227FF', '#FF9FFC', '#B19EEF'];

function hexToRgb(color) {
  const normalized = color.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const int = Number.parseInt(value, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

export default function LiquidEther({
  colors = DEFAULT_COLORS,
  mouseForce = 20,
  cursorSize = 100,
  isViscous = true,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  resolution = 0.5,
  isBounce = false,
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 3000,
  autoRampDuration = 0.6,
  color0,
  color1,
  color2,
}) {
  const canvasRef = useRef(null);
  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    active: false,
    strength: 0,
    lastMove: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const palette = [color0, color1, color2, ...colors]
      .filter(Boolean)
      .slice(0, 3)
      .map(hexToRgb);

    while (palette.length < 3) {
      palette.push(hexToRgb(DEFAULT_COLORS[palette.length]));
    }

    const blobs = [
      { radius: 0.24, orbit: 0.18, speed: 0.18, offset: 0, weight: 0.95, color: palette[0] },
      { radius: 0.2, orbit: 0.24, speed: -0.14, offset: 2.1, weight: 0.9, color: palette[1] },
      { radius: 0.22, orbit: 0.14, speed: 0.11, offset: 4.2, weight: 1, color: palette[2] },
    ];

    let frameId = 0;
    let width = 0;
    let height = 0;
    let elapsed = 0;
    let lastTime = performance.now();

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

    const updatePointer = (clientX, clientY) => {
      pointerRef.current.targetX = clientX / Math.max(window.innerWidth, 1);
      pointerRef.current.targetY = clientY / Math.max(window.innerHeight, 1);
      pointerRef.current.active = true;
      pointerRef.current.lastMove = performance.now();
    };

    const handleMove = (event) => updatePointer(event.clientX, event.clientY);
    const handleTouch = (event) => {
      const touch = event.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    const render = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += delta;

      const pointer = pointerRef.current;
      const idleFor = now - pointer.lastMove;
      const shouldAutoDrive = autoDemo && idleFor > autoResumeDelay;
      const followDuration = shouldAutoDrive ? autoRampDuration : takeoverDuration;

      if (shouldAutoDrive) {
        pointer.targetX = 0.5 + Math.cos(elapsed * (0.7 + autoSpeed)) * 0.2 * autoIntensity;
        pointer.targetY = 0.5 + Math.sin(elapsed * (0.95 + autoSpeed)) * 0.16 * autoIntensity;
      }

      const lerp = Math.min(delta / Math.max(followDuration, 0.01), 1);
      pointer.x += (pointer.targetX - pointer.x) * lerp;
      pointer.y += (pointer.targetY - pointer.y) * lerp;
      pointer.strength += (((pointer.active || shouldAutoDrive) ? 1 : 0) - pointer.strength) * Math.min(delta * 4, 1);

      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(3, 5, 13, 0.22)';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      const viscosityFactor = isViscous ? Math.max(0.8, viscous / 20) : 1;
      const forceScale = (mouseForce / 20) * pointer.strength;
      const smoothing = (iterationsViscous + iterationsPoisson) / 64;
      const blobScale = Math.max(0.75, resolution);

      blobs.forEach((blob, index) => {
        const phase = elapsed * (blob.speed * (1 + autoSpeed * 0.3)) + blob.offset;
        const baseX = 0.5 + Math.cos(phase) * blob.orbit;
        const baseY = 0.45 + Math.sin(phase * 1.2) * blob.orbit * 0.6;
        const pointerPullX = (pointer.x - 0.5) * 0.22 * forceScale * (1 + index * 0.08);
        const pointerPullY = (pointer.y - 0.5) * 0.26 * forceScale * (1 + index * 0.08);
        const bounceShift = isBounce ? Math.sin(elapsed * 2 + index) * 0.03 : 0;

        const centerX = (baseX + pointerPullX + bounceShift) * width;
        const centerY = (baseY + pointerPullY) * height;
        const radius = Math.min(width, height) * blob.radius * blobScale;
        const gradient = context.createRadialGradient(
          centerX,
          centerY,
          radius * 0.15,
          centerX,
          centerY,
          radius * (1.6 + smoothing * 0.2) * viscosityFactor
        );

        gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${0.22 * blob.weight})`);
        gradient.addColorStop(0.35, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${0.14 * blob.weight})`);
        gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(centerX, centerY, radius * 1.7 * viscosityFactor, 0, Math.PI * 2);
        context.fill();
      });

      const cursorRadius = cursorSize * (0.7 + forceScale * 0.8);
      const cursorX = pointer.x * width;
      const cursorY = pointer.y * height;
      const cursorGradient = context.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, cursorRadius * 2);
      cursorGradient.addColorStop(0, `rgba(${palette[0].r}, ${palette[0].g}, ${palette[0].b}, ${0.14 * pointer.strength})`);
      cursorGradient.addColorStop(0.45, `rgba(${palette[1].r}, ${palette[1].g}, ${palette[1].b}, ${0.08 * pointer.strength})`);
      cursorGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      context.fillStyle = cursorGradient;
      context.beginPath();
      context.arc(cursorX, cursorY, cursorRadius * 2, 0, Math.PI * 2);
      context.fill();
      context.globalCompositeOperation = 'source-over';

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, [
    autoDemo,
    autoIntensity,
    autoRampDuration,
    autoResumeDelay,
    autoSpeed,
    color0,
    color1,
    color2,
    colors,
    cursorSize,
    isBounce,
    isViscous,
    iterationsPoisson,
    iterationsViscous,
    mouseForce,
    resolution,
    takeoverDuration,
    viscous,
  ]);

  return <canvas ref={canvasRef} className="liquid-ether-canvas" aria-hidden="true" />;
}
