// anomaly-detection.js
// This service implements algorithms for anomaly detection

// Simple threshold-based anomaly detection
const detectThresholdAnomalies = (data, thresholds) => {
  const anomalies = [];
  
  // Check each parameter against its threshold
  Object.keys(data).forEach(parameter => {
    if (thresholds[parameter]) {
      const value = data[parameter];
      const { critical } = thresholds[parameter];
      
      // Different parameters have different threshold conditions
      let isAnomaly = false;
      
      if (parameter === 'temperature' || parameter === 'memoryUsage') {
        // For these parameters, exceeding threshold is an anomaly
        isAnomaly = value > critical;
      } else {
        // For other parameters, falling below threshold is an anomaly
        isAnomaly = value < critical;
      }
      
      if (isAnomaly) {
        anomalies.push({
          parameter,
          value,
          threshold: critical,
          timestamp: new Date().toLocaleString(),
          severity: getSeverity(parameter, value, thresholds[parameter])
        });
      }
    }
  });
  
  return anomalies;
};

// Determine severity based on how far from threshold
const getSeverity = (parameter, value, paramThresholds) => {
  const { critical, min, max } = paramThresholds;
  
  // Calculate normalized deviation from threshold
  let deviation;
  if (parameter === 'temperature' || parameter === 'memoryUsage') {
    // For these, higher is worse
    deviation = (value - critical) / (max - critical);
  } else {
    // For others, lower is worse
    deviation = (critical - value) / (critical - min);
  }
  
  // Classify severity
  if (deviation >= 0.5) return 'high';
  if (deviation >= 0.2) return 'medium';
  return 'low';
};

// Statistical anomaly detection using z-score
// This method detects values that deviate significantly from recent history
const detectStatisticalAnomalies = (current, history, zThreshold = 2.5) => {
  const anomalies = [];
  
  Object.keys(current).forEach(parameter => {
    // Need sufficient history for statistical analysis
    if (history.length >= 10) {
      // Extract parameter values from history
      const values = history.map(point => point[parameter]);
      
      // Calculate mean and standard deviation
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate z-score (how many standard deviations from mean)
      const zScore = Math.abs((current[parameter] - mean) / stdDev);
      
      // If z-score exceeds threshold, it's an anomaly
      if (zScore > zThreshold) {
        anomalies.push({
          parameter,
          value: current[parameter],
          mean,
          stdDev,
          zScore,
          timestamp: new Date().toLocaleString(),
          severity: zScore > 3.5 ? 'high' : (zScore > 3 ? 'medium' : 'low')
        });
      }
    }
  });
  
  return anomalies;
};

// Machine learning based anomaly detection simulation
// In a real system, this would use actual ML models
const detectMLAnomalies = (data, modelParams = {}) => {
  // This is a placeholder that simulates ML-based detection
  // In a real implementation, this would use trained models
  
  // For demo purposes, we'll randomly detect anomalies with low probability
  const anomalies = [];
  const detectionProbability = 0.05; // 5% chance of detecting an anomaly
  
  Object.keys(data).forEach(parameter => {
    if (Math.random() < detectionProbability) {
      anomalies.push({
        parameter,
        value: data[parameter],
        confidence: Math.random() * 40 + 60, // 60-100% confidence
        modelType: 'Neural Network',
        timestamp: new Date().toLocaleString(),
        severity: Math.random() > 0.7 ? 'high' : (Math.random() > 0.4 ? 'medium' : 'low')
      });
    }
  });
  
  return anomalies;
};

export default {
  detectThresholdAnomalies,
  detectStatisticalAnomalies,
  detectMLAnomalies
};