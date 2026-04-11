import { useEffect, useRef } from 'react';

export default function InteractiveGlobe({ mousePos }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotationRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 500;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 160;

    // Generate grid points on sphere
    const points = [];
    for (let lat = -80; lat <= 80; lat += 12) {
      for (let lon = -180; lon < 180; lon += 12) {
        points.push({ lat: lat * Math.PI / 180, lon: lon * Math.PI / 180 });
      }
    }

    // Energy hotspots (lat, lon, intensity, color)
    const hotspots = [
      { lat: 51, lon: -0.1, intensity: 0.7, color: '#10b981', label: 'EU-WEST' },
      { lat: 37, lon: -122, intensity: 0.5, color: '#22d3ee', label: 'US-WEST' },
      { lat: 35, lon: 139, intensity: 0.9, color: '#ef4444', label: 'ASIA-EAST' },
      { lat: 60, lon: 10, intensity: 0.3, color: '#10b981', label: 'NORDIC' },
      { lat: -33, lon: 151, intensity: 0.6, color: '#f59e0b', label: 'AU-EAST' },
    ].map(h => ({
      ...h,
      lat: h.lat * Math.PI / 180,
      lon: h.lon * Math.PI / 180,
    }));

    // Arcs between hotspots
    const arcs = [
      [0, 1], [0, 3], [1, 2], [2, 4], [0, 2],
    ];

    const projectPoint = (lat, lon, rot) => {
      const rotLon = lon + rot;
      const x = Math.cos(lat) * Math.sin(rotLon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(rotLon);

      if (z < -0.1) return null; // Behind globe

      const scale = 1 / (1 + z * 0.1);
      return {
        x: cx + x * radius * scale,
        y: cy - y * radius * scale,
        z,
        scale,
      };
    };

    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, size, size);

      // Mouse influence on rotation
      const mx = (mousePosRef.current.x / window.innerWidth - 0.5) * 0.3;
      rotationRef.current += 0.003 + mx * 0.01;
      const rot = rotationRef.current;

      // Globe glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, size, size);

      // Globe outline
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill globe
      const globeGrad = ctx.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, radius);
      globeGrad.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
      globeGrad.addColorStop(1, 'rgba(10, 14, 23, 0.3)');
      ctx.fillStyle = globeGrad;
      ctx.fill();

      // Grid points
      points.forEach(p => {
        const proj = projectPoint(p.lat, p.lon, rot);
        if (!proj) return;

        const alpha = Math.max(0, Math.min(1, (proj.z + 0.5) * 0.6));
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.3})`;
        ctx.fill();
      });

      // Draw latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const proj = projectPoint(lat * Math.PI / 180, lon * Math.PI / 180, rot);
          if (!proj) { started = false; continue; }
          if (!started) {
            ctx.moveTo(proj.x, proj.y);
            started = true;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Arcs between hotspots
      arcs.forEach(([a, b]) => {
        const h1 = hotspots[a];
        const h2 = hotspots[b];
        const p1 = projectPoint(h1.lat, h1.lon, rot);
        const p2 = projectPoint(h2.lat, h2.lon, rot);
        if (!p1 || !p2) return;

        // Animated arc
        const steps = 30;
        const progress = (Math.sin(time * 2 + a) + 1) / 2;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const midLat = h1.lat + (h2.lat - h1.lat) * t;
          const midLon = h1.lon + (h2.lon - h1.lon) * t;
          const arcHeight = Math.sin(t * Math.PI) * 0.3;
          const proj = projectPoint(midLat + arcHeight, midLon, rot);
          if (!proj) { first = true; continue; }
          if (first) { ctx.moveTo(proj.x, proj.y); first = false; }
          else ctx.lineTo(proj.x, proj.y);
        }
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + progress * 0.1})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -time * 30;
        ctx.stroke();
        ctx.setLineDash([]);

        // Traveling pulse
        const pulseT = (time * 0.5 + a * 0.3) % 1;
        const pulseLat = h1.lat + (h2.lat - h1.lat) * pulseT;
        const pulseLon = h1.lon + (h2.lon - h1.lon) * pulseT;
        const arcH = Math.sin(pulseT * Math.PI) * 0.3;
        const pulseProj = projectPoint(pulseLat + arcH, pulseLon, rot);
        if (pulseProj) {
          ctx.beginPath();
          ctx.arc(pulseProj.x, pulseProj.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Hotspots
      hotspots.forEach((h) => {
        const proj = projectPoint(h.lat, h.lon, rot);
        if (!proj || proj.z < 0) return;

        const pulse = Math.sin(time * 3 + h.intensity * 10) * 0.5 + 0.5;

        // Outer ring
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 8 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = h.color + '40';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = h.color;
        ctx.shadowColor = h.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = h.color + 'cc';
        ctx.font = '600 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(h.label, proj.x, proj.y - 14);
      });

      // Orbiting rings
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius + 20 + i * 15, (radius + 20 + i * 15) * 0.3,
          0.3 + i * 0.4 + time * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.05 - i * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="globe-wrapper">
      <canvas ref={canvasRef} className="globe-canvas" />
      {/* Floating data cards */}
      <div className="globe-float-card globe-float-card--1">
        <span className="globe-float-card__dot" style={{ background: '#10b981' }} />
        <span>EU-WEST: <strong style={{ color: '#10b981' }}>142 gCO₂</strong></span>
      </div>
      <div className="globe-float-card globe-float-card--2">
        <span className="globe-float-card__dot" style={{ background: '#ef4444' }} />
        <span>ASIA: <strong style={{ color: '#ef4444' }}>538 gCO₂</strong></span>
      </div>
      <div className="globe-float-card globe-float-card--3">
        <span className="globe-float-card__dot" style={{ background: '#22d3ee' }} />
        <span>NORDIC: <strong style={{ color: '#22d3ee' }}>41 gCO₂</strong></span>
      </div>
    </div>
  );
}
