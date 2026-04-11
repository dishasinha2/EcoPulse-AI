import { useRef, useEffect } from 'react';

export default function CarbonChart({ data, thresholds }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const targetPointsRef = useRef([]);
  const currentPointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Prepare target points
    const maxVal = 600;
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    targetPointsRef.current = data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
      y: padding.top + chartH - (d.intensity / maxVal) * chartH,
      intensity: d.intensity,
    }));

    // Initialize current points if needed
    if (currentPointsRef.current.length !== targetPointsRef.current.length) {
      currentPointsRef.current = targetPointsRef.current.map(p => ({ ...p }));
    }

    // Animate
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const lerp = (a, b, t) => a + (b - a) * t;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, width, height);

      // Lerp current towards target
      currentPointsRef.current = currentPointsRef.current.map((cp, i) => {
        const tp = targetPointsRef.current[i] || cp;
        return {
          x: lerp(cp.x, tp.x, 0.12),
          y: lerp(cp.y, tp.y, 0.12),
          intensity: lerp(cp.intensity, tp.intensity, 0.12),
        };
      });

      // Extend if new points
      while (currentPointsRef.current.length < targetPointsRef.current.length) {
        const tp = targetPointsRef.current[currentPointsRef.current.length];
        currentPointsRef.current.push({ ...tp });
      }

      const points = currentPointsRef.current;
      if (points.length < 2) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw threshold lines
      const drawThreshold = (val, color, label) => {
        const y = padding.top + chartH - (val / maxVal) * chartH;
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = color + '40';
        ctx.lineWidth = 1;
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = color + '80';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(label, width - padding.right, y - 4);
      };

      drawThreshold(thresholds.LOW, '#10b981', 'LOW');
      drawThreshold(thresholds.MEDIUM, '#f59e0b', 'MEDIUM');
      drawThreshold(thresholds.HIGH, '#ef4444', 'HIGH');

      // Gradient fill under curve
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

      // Draw smooth curve (Catmull-Rom to Bezier)
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      // Fill area
      ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
      ctx.lineTo(points[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      // Dynamic line color based on last value
      const lastIntensity = points[points.length - 1]?.intensity || 0;
      let lineColor = '#10b981';
      if (lastIntensity > thresholds.HIGH) lineColor = '#ef4444';
      else if (lastIntensity > thresholds.LOW) lineColor = '#f59e0b';

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw latest point with glow
      const lastPoint = points[points.length - 1];
      if (lastPoint) {
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Outer ring pulse
        const pulse = (Math.sin(Date.now() / 500) + 1) / 2;
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = lineColor + '60';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [data, thresholds]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} className="chart-canvas" />
    </div>
  );
}
