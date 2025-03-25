// lifetime-prediction.js
// This service predicts component lifetime based on health data and wear patterns

// Linear degradation model
// Predicts time to failure based on current value, threshold, and rate of change
const linearDegradationModel = (currentValue, threshold, rateOfChange) => {
  // For parameters like battery where lower is worse
  if (rateOfChange >= 0) {
    // If not degrading, return a reasonable maximum rather than 9999
    return 500; // Cap at 500 days for better visualization
  }
  
  // Calculate days to failure
  const daysToFailure = Math.round((currentValue - threshold) / Math.abs(rateOfChange));
  
  // Cap the result at a reasonable maximum for better visualization
  return Math.min(Math.max(0, daysToFailure), 500);
};

// Exponential degradation model
// More realistic for some components that degrade faster as they age
const exponentialDegradationModel = (currentValue, threshold, params) => {
  const { initialValue, age, halfLife } = params;
  
  // If we lack necessary parameters, fall back to linear model
  if (!initialValue || !age || !halfLife) {
    return linearDegradationModel(currentValue, threshold, (initialValue - currentValue) / age);
  }
  
  // Calculate decay constant
  const decayConstant = Math.log(2) / halfLife;
  
  // Predict future value at time t: V(t) = V0 * e^(-λt)
  // Solve for t when V(t) = threshold: t = -ln(threshold/V0)/λ
  const timeToThreshold = Math.round(-Math.log(threshold / initialValue) / decayConstant - age);
  
  // Cap the result at a reasonable maximum for better visualization
  return Math.min(Math.max(0, timeToThreshold), 500);
};

// Calculate rate of change from time series data
const calculateRateOfChange = (timeSeriesData, parameter) => {
  // Need at least 2 data points
  if (!timeSeriesData || timeSeriesData.length < 2) {
    return 0;
  }
  
  // Get first and last values
  const firstPoint = timeSeriesData[0];
  const lastPoint = timeSeriesData[timeSeriesData.length - 1];
  
  // Calculate total change
  const totalChange = lastPoint[parameter] - firstPoint[parameter];
  
  // Calculate time period in days (assuming timeSeriesData spans 24 hours)
  const timePeriodDays = 1; // 24 hours / 24 hours per day
  
  // Return daily rate of change
  return totalChange / timePeriodDays;
};

// Predict component lifetime
const predictComponentLifetime = (satelliteData, componentHistory = {}) => {
  const { currentValues, thresholds, timeSeriesData } = satelliteData;
  
  // Get rates of change for each parameter
  const ratesOfChange = {};
  Object.keys(currentValues).forEach(parameter => {
    ratesOfChange[parameter] = calculateRateOfChange(timeSeriesData, parameter);
  });
  
  // Predict days until each parameter reaches critical threshold
  const predictions = {
    batteryHealth: linearDegradationModel(
      currentValues.batteryHealth, 
      thresholds.batteryHealth.critical,
      ratesOfChange.batteryHealth
    ),
    power: linearDegradationModel(
      currentValues.power,
      thresholds.power.critical,
      ratesOfChange.power
    ),
    // For temperature, higher is worse, so we negate the rate of change
    temperature: linearDegradationModel(
      thresholds.temperature.critical,
      currentValues.temperature,
      -ratesOfChange.temperature
    ),
    signalStrength: linearDegradationModel(
      currentValues.signalStrength,
      thresholds.signalStrength.critical,
      ratesOfChange.signalStrength
    ),
    memoryUsage: linearDegradationModel(
      thresholds.memoryUsage.critical,
      currentValues.memoryUsage,
      -ratesOfChange.memoryUsage
    )
  };
  
  // Map predictions to component lifetimes
  return {
    batteryLifetime: predictions.batteryHealth,
    powerSystemLifetime: Math.min(predictions.power, predictions.batteryHealth * 0.8),
    communicationSystemLifetime: predictions.signalStrength,
    thermalSystemLifetime: predictions.temperature,
    memorySystemLifetime: predictions.memoryUsage
  };
};

// Monte Carlo simulation for reliability prediction
const monteCarloReliabilitySimulation = (
  currentValues, 
  thresholds, 
  degradationRates, 
  iterations = 1000
) => {
  const results = {
    batteryLifetime: [],
    powerSystemLifetime: [],
    communicationSystemLifetime: []
  };
  
  // Run multiple simulations with random variations
  for (let i = 0; i < iterations; i++) {
    // Add random variation to degradation rates to simulate uncertainty
    const variationFactor = 0.3; // 30% variation
    const simulatedRates = {};
    
    Object.keys(degradationRates).forEach(param => {
      const variation = 1 + (Math.random() * 2 - 1) * variationFactor;
      simulatedRates[param] = degradationRates[param] * variation;
    });
    
    // Predict with varied rates
    const batteryLife = linearDegradationModel(
      currentValues.batteryHealth,
      thresholds.batteryHealth.critical,
      simulatedRates.batteryHealth
    );
    
    const powerLife = linearDegradationModel(
      currentValues.power,
      thresholds.power.critical,
      simulatedRates.power
    );
    
    const commLife = linearDegradationModel(
      currentValues.signalStrength,
      thresholds.signalStrength.critical,
      simulatedRates.signalStrength
    );
    
    // Store results
    results.batteryLifetime.push(batteryLife);
    results.powerSystemLifetime.push(powerLife);
    results.communicationSystemLifetime.push(commLife);
  }
  
  // Calculate percentiles (10%, 50%, 90%) for each component
  const getPercentile = (array, percentile) => {
    const sorted = [...array].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile / 100);
    return sorted[index];
  };
  
  const percentiles = {};
  Object.keys(results).forEach(component => {
    percentiles[component] = {
      p10: getPercentile(results[component], 10),
      p50: getPercentile(results[component], 50), // median
      p90: getPercentile(results[component], 90)
    };
  });
  
  return percentiles;
};

// Get maintenance recommendations based on lifetime predictions
const getMaintenanceRecommendations = (predictions) => {
  const recommendations = [];
  const criticalThreshold = 30; // days
  const warningThreshold = 90; // days
  
  Object.entries(predictions).forEach(([component, days]) => {
    if (days <= criticalThreshold) {
      recommendations.push({
        component,
        daysRemaining: days,
        priority: 'critical',
        action: `Schedule immediate maintenance for ${component.replace('Lifetime', '')}`
      });
    } else if (days <= warningThreshold) {
      recommendations.push({
        component,
        daysRemaining: days,
        priority: 'high',
        action: `Include ${component.replace('Lifetime', '')} in next maintenance window`
      });
    }
  });
  
  return recommendations;
};

export default {
  predictComponentLifetime,
  monteCarloReliabilitySimulation,
  getMaintenanceRecommendations,
  calculateRateOfChange
};