// data-service.js
// This service handles data fetching, processing, and real-time updates

import { Subject } from 'rxjs';

// Create observables for real-time data updates
const satelliteDataSubject = new Subject();
const anomalySubject = new Subject();
const rootCauseSubject = new Subject();

// Initial satellite data structure
const initialSatelliteData = {
  currentValues: {
    power: 85,
    temperature: 32,
    batteryHealth: 90,
    signalStrength: 78,
    memoryUsage: 65,
  },
  thresholds: {
    power: { min: 70, max: 100, critical: 75 },
    temperature: { min: 20, max: 40, critical: 38 },
    batteryHealth: { min: 60, max: 100, critical: 65 },
    signalStrength: { min: 50, max: 100, critical: 55 },
    memoryUsage: { min: 0, max: 90, critical: 85 },
  },
  timeSeriesData: []
};

// Generate initial time series data
const generateInitialTimeSeriesData = () => {
  const timeSeriesData = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(now.getHours() - i);
    
    timeSeriesData.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      power: 85 + Math.floor(Math.random() * 10) - 5,
      temperature: 32 + Math.floor(Math.random() * 6) - 3,
      batteryHealth: 90 - (i * 0.1),
      signalStrength: 78 + Math.floor(Math.random() * 8) - 4,
      memoryUsage: 65 + Math.floor(Math.random() * 10) - 5,
    });
  }
  
  return timeSeriesData;
};

// Initialize data
let satelliteData = {
  ...initialSatelliteData,
  timeSeriesData: generateInitialTimeSeriesData()
};

let anomalies = [];
let rootCauses = [];

// Function to detect anomalies based on thresholds
const detectAnomalies = (latestData) => {
  const { thresholds } = satelliteData;
  const newAnomalies = [];
  
  if (latestData.power < thresholds.power.critical) {
    newAnomalies.push({
      id: Date.now(),
      parameter: 'power',
      value: latestData.power,
      threshold: thresholds.power.critical,
      timestamp: new Date().toLocaleString(),
      severity: 'high'
    });
  }
  
  if (latestData.temperature > thresholds.temperature.critical) {
    newAnomalies.push({
      id: Date.now() + 1,
      parameter: 'temperature',
      value: latestData.temperature,
      threshold: thresholds.temperature.critical,
      timestamp: new Date().toLocaleString(),
      severity: 'high'
    });
  }
  
  if (latestData.batteryHealth < thresholds.batteryHealth.critical) {
    newAnomalies.push({
      id: Date.now() + 2,
      parameter: 'batteryHealth',
      value: latestData.batteryHealth,
      threshold: thresholds.batteryHealth.critical,
      timestamp: new Date().toLocaleString(),
      severity: 'medium'
    });
  }
  
  if (latestData.signalStrength < thresholds.signalStrength.critical) {
    newAnomalies.push({
      id: Date.now() + 3,
      parameter: 'signalStrength',
      value: latestData.signalStrength,
      threshold: thresholds.signalStrength.critical,
      timestamp: new Date().toLocaleString(),
      severity: 'medium'
    });
  }
  
  if (latestData.memoryUsage > thresholds.memoryUsage.critical) {
    newAnomalies.push({
      id: Date.now() + 4,
      parameter: 'memoryUsage',
      value: latestData.memoryUsage,
      threshold: thresholds.memoryUsage.critical,
      timestamp: new Date().toLocaleString(),
      severity: 'low'
    });
  }
  
  if (newAnomalies.length > 0) {
    anomalies = [...anomalies, ...newAnomalies];
    anomalySubject.next(anomalies);
    
    // Generate root causes for new anomalies
    const newRootCauses = generateRootCauses(newAnomalies);
    rootCauses = [...rootCauses, ...newRootCauses];
    rootCauseSubject.next(rootCauses);
  }
  
  return newAnomalies;
};

// Function to generate root causes for anomalies
const generateRootCauses = (newAnomalies) => {
  return newAnomalies.map(anomaly => {
    let cause = '';
    let recommendation = '';
    
    switch(anomaly.parameter) {
      case 'power':
        cause = 'Possible solar panel degradation or increased power consumption';
        recommendation = 'Check for excess power consumption and consider recalibrating solar panels';
        break;
      case 'temperature':
        cause = 'Cooling system malfunction or excess heat generation from components';
        recommendation = 'Reduce non-critical operations and verify cooling system function';
        break;
      case 'batteryHealth':
        cause = 'Battery cell degradation due to charge/discharge cycles';
        recommendation = 'Schedule battery maintenance in the next maintenance window';
        break;
      case 'signalStrength':
        cause = 'Potential antenna misalignment or signal interference';
        recommendation = 'Verify antenna positioning and check for external interference sources';
        break;
      case 'memoryUsage':
        cause = 'Memory leak or excessive data storage';
        recommendation = 'Clear non-essential data and check for software memory leaks';
        break;
      default:
        cause = 'Unknown cause';
        recommendation = 'Investigate further';
    }
    
    return {
      id: anomaly.id,
      anomalyParameter: anomaly.parameter,
      cause,
      probability: Math.floor(Math.random() * 30) + 70,
      recommendation,
      timestamp: new Date().toLocaleString()
    };
  });
};

// Function to update satellite data with new values
const updateSatelliteData = (parameter, value) => {
  // Update current value
  satelliteData = {
    ...satelliteData,
    currentValues: {
      ...satelliteData.currentValues,
      [parameter]: parseFloat(value)
    }
  };
  
  // Add new datapoint to time series
  const now = new Date();
  const newDataPoint = {
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...satelliteData.currentValues
  };
  
  // Keep only the last 25 data points for performance
  let updatedTimeSeries = [...satelliteData.timeSeriesData, newDataPoint];
  if (updatedTimeSeries.length > 25) {
    updatedTimeSeries = updatedTimeSeries.slice(updatedTimeSeries.length - 25);
  }
  
  satelliteData = {
    ...satelliteData,
    timeSeriesData: updatedTimeSeries
  };
  
  // Notify subscribers of new data
  satelliteDataSubject.next(satelliteData);
  
  // Check for anomalies
  detectAnomalies(satelliteData.currentValues);
  
  return satelliteData;
};

// Function to update threshold values
const updateThreshold = (parameter, thresholdType, value) => {
  satelliteData = {
    ...satelliteData,
    thresholds: {
      ...satelliteData.thresholds,
      [parameter]: {
        ...satelliteData.thresholds[parameter],
        [thresholdType]: parseFloat(value)
      }
    }
  };
  
  satelliteDataSubject.next(satelliteData);
  return satelliteData;
};

// Simulate real-time data updates
let dataUpdateInterval = null;

const startRealTimeUpdates = (intervalMs = 5000) => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval);
  }
  
  dataUpdateInterval = setInterval(() => {
    // Randomly update one parameter
    const parameters = ['power', 'temperature', 'batteryHealth', 'signalStrength', 'memoryUsage'];
    const randomParameter = parameters[Math.floor(Math.random() * parameters.length)];
    const currentValue = satelliteData.currentValues[randomParameter];
    
    // Generate a value with small random change
    let newValue;
    if (randomParameter === 'temperature') {
      newValue = currentValue + (Math.random() * 2 - 1); // -1 to +1 change
    } else {
      newValue = currentValue + (Math.random() * 4 - 2); // -2 to +2 change
    }
    
    // Ensure value stays within min/max for the parameter
    const { min, max } = satelliteData.thresholds[randomParameter];
    newValue = Math.max(min, Math.min(max, newValue));
    
    updateSatelliteData(randomParameter, newValue);
  }, intervalMs);
  
  return () => clearInterval(dataUpdateInterval);
};

const stopRealTimeUpdates = () => {
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval);
    dataUpdateInterval = null;
  }
};

// Export the data service
export default {
  // Data getters
  getSatelliteData: () => satelliteData,
  getAnomalies: () => anomalies,
  getRootCauses: () => rootCauses,
  
  // Observables for real-time updates
  satelliteData$: satelliteDataSubject.asObservable(),
  anomalies$: anomalySubject.asObservable(),
  rootCauses$: rootCauseSubject.asObservable(),
  
  // Functions for updating data
  updateSatelliteData,
  updateThreshold,
  detectAnomalies,
  
  // Real-time simulation control
  startRealTimeUpdates,
  stopRealTimeUpdates
};