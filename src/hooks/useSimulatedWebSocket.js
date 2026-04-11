// Simulated WebSocket hook for real-time carbon data
import { useState, useEffect, useCallback, useRef } from 'react';

// Simulated carbon intensity data by region (gCO2/kWh)
const REGIONS = {
  'US-WEST': { base: 220, variance: 80 },
  'EU-WEST': { base: 160, variance: 60 },
  'NORDIC': { base: 45, variance: 25 },
  'ASIA-EAST': { base: 540, variance: 120 },
};

const THRESHOLDS = {
  LOW: 150,    // Green - train freely
  MEDIUM: 300, // Amber - consider pausing
  HIGH: 450,   // Red - should pause
};

function generateCarbonData(region = 'EU-WEST') {
  const config = REGIONS[region];
  const timeOfDay = new Date().getHours();
  // Solar impact - lower during daytime
  const solarFactor = Math.sin((timeOfDay - 6) * Math.PI / 12) * 0.3;
  const noise = (Math.random() - 0.5) * config.variance;
  const intensity = Math.max(10, config.base - solarFactor * config.base + noise);

  return {
    intensity: Math.round(intensity),
    region,
    timestamp: Date.now(),
    source: {
      solar: Math.max(0, Math.round(25 + solarFactor * 40 + (Math.random() - 0.5) * 10)),
      wind: Math.round(15 + Math.random() * 20),
      nuclear: Math.round(20 + Math.random() * 5),
      gas: Math.round(20 + Math.random() * 15),
      coal: Math.round(10 + Math.random() * 15),
    },
  };
}

export function useSimulatedWebSocket() {
  const [connected, setConnected] = useState(false);
  const [carbonData, setCarbonData] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, PAUSED
  const [jobMetrics, setJobMetrics] = useState({
    epochsCompleted: 0,
    totalEpochs: 100,
    co2Saved: 0,
    trainingTime: 0,
    pausedTime: 0,
    jobStartTime: null,
    loss: 2.5,
    accuracy: 0,
  });
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);
  const trainingRef = useRef(null);
  const statusRef = useRef(status);
  const metricsRef = useRef(jobMetrics);

  statusRef.current = status;
  metricsRef.current = jobMetrics;

  const addLog = useCallback((type, message) => {
    setLogs(prev => [{
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type,
      message,
    }, ...prev].slice(0, 50));
  }, []);

  const connect = useCallback(() => {
    setTimeout(() => {
      setConnected(true);
      addLog('info', 'WebSocket connected to carbon grid API');
      addLog('info', 'Monitoring EU-WEST carbon intensity');

      // Start carbon data stream
      const initialData = generateCarbonData();
      setCarbonData(initialData);
      setHistory([initialData]);

      intervalRef.current = setInterval(() => {
        const newData = generateCarbonData();
        setCarbonData(newData);
        setHistory(prev => [...prev.slice(-59), newData]);

        // Auto-pause/resume logic when job is active
        const currentStatus = statusRef.current;
        if (currentStatus === 'RUNNING' && newData.intensity > THRESHOLDS.HIGH) {
          setStatus('PAUSED');
          addLog('warn', `Carbon intensity HIGH (${newData.intensity} gCO2/kWh) — Training PAUSED`);
        } else if (currentStatus === 'PAUSED' && newData.intensity < THRESHOLDS.MEDIUM) {
          setStatus('RUNNING');
          addLog('success', `Carbon intensity dropped (${newData.intensity} gCO2/kWh) — Training RESUMED`);
        }
      }, 2000);
    }, 800);
  }, [addLog]);

  const startJob = useCallback(() => {
    if (status === 'IDLE') {
      setStatus('RUNNING');
      setJobMetrics({
        epochsCompleted: 0,
        totalEpochs: 100,
        co2Saved: 0,
        trainingTime: 0,
        pausedTime: 0,
        jobStartTime: Date.now(),
        loss: 2.5,
        accuracy: 0,
      });
      addLog('success', '🚀 Training job started — Model: GPT-Eco-7B');
      addLog('info', 'Carbon-aware scheduling active');

      // Simulate training progress
      trainingRef.current = setInterval(() => {
        const currentStatus = statusRef.current;
        const currentMetrics = metricsRef.current;

        if (currentStatus === 'RUNNING') {
          setJobMetrics(prev => {
            const newEpochs = Math.min(prev.epochsCompleted + 1, prev.totalEpochs);
            const progress = newEpochs / prev.totalEpochs;
            const newLoss = Math.max(0.05, 2.5 * Math.exp(-3 * progress) + (Math.random() - 0.5) * 0.1);
            const newAccuracy = Math.min(98.5, progress * 95 + Math.random() * 3);

            if (newEpochs === prev.totalEpochs && prev.epochsCompleted !== prev.totalEpochs) {
              addLog('success', '✅ Training complete! All epochs finished.');
              setStatus('IDLE');
              clearInterval(trainingRef.current);
            }

            if (newEpochs % 10 === 0 && newEpochs !== prev.epochsCompleted) {
              addLog('info', `Epoch ${newEpochs}/${prev.totalEpochs} — Loss: ${newLoss.toFixed(4)} — Acc: ${newAccuracy.toFixed(1)}%`);
            }

            return {
              ...prev,
              epochsCompleted: newEpochs,
              trainingTime: prev.trainingTime + 1,
              loss: newLoss,
              accuracy: newAccuracy,
            };
          });
        } else if (currentStatus === 'PAUSED') {
          setJobMetrics(prev => ({
            ...prev,
            pausedTime: prev.pausedTime + 1,
            co2Saved: prev.co2Saved + Math.round(Math.random() * 5 + 2),
          }));
        }
      }, 1000);
    }
  }, [status, addLog]);

  const stopJob = useCallback(() => {
    setStatus('IDLE');
    addLog('warn', '⏹ Training job stopped by user');
    if (trainingRef.current) {
      clearInterval(trainingRef.current);
      trainingRef.current = null;
    }
  }, [addLog]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (trainingRef.current) clearInterval(trainingRef.current);
    };
  }, [connect]);

  return {
    connected,
    carbonData,
    history,
    status,
    jobMetrics,
    logs,
    startJob,
    stopJob,
    THRESHOLDS,
  };
}
