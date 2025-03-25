// explainable-ai.js
// This service provides explainable AI insights for anomaly detection and root cause analysis

// Generate explanation for specific anomaly
const generateAnomalyExplanation = (anomaly, historicalData, thresholds) => {
    const { parameter, value, timestamp, severity } = anomaly;
    
    // Base explanation structure
    const explanation = {
      reasoning: [],
      factorsConsidered: [],
      confidenceFactors: [],
      visualizationData: [],
      suggestedActions: []
    };
    
    // Generate reasoning based on parameter type
    switch(parameter) {
      case 'power':
        explanation.reasoning = [
          `Power level of ${value.toFixed(1)}% is below the critical threshold of ${thresholds[parameter].critical}%.`,
          `This represents a ${severity} severity anomaly based on the degree of deviation.`,
          `Historical power levels suggest this is ${historicalData ? 'consistent with a gradual decline' : 'a sudden drop'}.`
        ];
        
        explanation.factorsConsidered = [
          "Recent power level trend over past 24 hours",
          "Correlation with battery health metrics",
          "Solar panel efficiency patterns",
          "Power consumption of active systems"
        ];
        
        explanation.confidenceFactors = [
          "Strong correlation with historical failure patterns",
          "Multiple related parameters showing degradation",
          "Consistent with expected seasonal variations"
        ];
        
        explanation.suggestedActions = [
          "Verify solar panel orientation and exposure",
          "Check for power-intensive processes that could be optimized",
          "Inspect for potential short circuits or power leaks",
          "Confirm battery charging cycles are operating normally"
        ];
        break;
        
      case 'temperature':
        explanation.reasoning = [
          `Temperature of ${value.toFixed(1)}°C exceeds the critical threshold of ${thresholds[parameter].critical}°C.`,
          `This represents a ${severity} severity anomaly based on the rate of increase.`,
          `Thermal analysis indicates this is ${historicalData ? 'likely due to extended exposure to solar radiation' : 'potentially caused by internal component malfunction'}.`
        ];
        
        explanation.factorsConsidered = [
          "Temperature trend over past 24 hours",
          "Correlation with operational workload",
          "Thermal dissipation system performance",
          "Exposure to direct solar radiation"
        ];
        
        explanation.confidenceFactors = [
          "Pattern matches known overheating scenarios",
          "Thermal gradient consistent with cooling system issues",
          "Temperature rise correlates with specific operations"
        ];
        
        explanation.suggestedActions = [
          "Adjust satellite orientation to reduce solar exposure if possible",
          "Temporarily reduce non-critical system operations",
          "Verify cooling system functionality",
          "Check for blocked thermal vents or damaged heat sinks"
        ];
        break;
        
      case 'batteryHealth':
        explanation.reasoning = [
          `Battery health at ${value.toFixed(1)}% is below the critical threshold of ${thresholds[parameter].critical}%.`,
          `This represents a ${severity} severity anomaly based on expected degradation rates.`,
          `Analysis of charge/discharge cycles suggests ${historicalData ? 'normal wear pattern but accelerated timeline' : 'potential cell damage'}.`
        ];
        
        explanation.factorsConsidered = [
          "Battery charge/discharge cycle history",
          "Temperature exposure during operation",
          "Correlation with power consumption patterns",
          "Age of battery compared to expected lifetime"
        ];
        
        explanation.confidenceFactors = [
          "Degradation pattern consistent with similar battery types",
          "Multiple cell metrics showing similar patterns",
          "Historical data from previous missions with similar conditions"
        ];
        
        explanation.suggestedActions = [
          "Implement conservative power management protocols",
          "Schedule battery maintenance in next available window",
          "Adjust charging cycles to optimize remaining capacity",
          "Consider partial operation modes to reduce battery strain"
        ];
        break;
        
      case 'signalStrength':
        explanation.reasoning = [
          `Signal strength at ${value.toFixed(1)}% is below the critical threshold of ${thresholds[parameter].critical}%.`,
          `This represents a ${severity} severity anomaly based on communication needs.`,
          `Signal analysis indicates ${historicalData ? 'gradual degradation consistent with antenna misalignment' : 'sudden drop suggesting potential hardware failure'}.`
        ];
        
        explanation.factorsConsidered = [
          "Signal strength trend over time",
          "Correlation with satellite orientation",
          "Environmental interference patterns",
          "Transmission power and received signal quality"
        ];
        
        explanation.confidenceFactors = [
          "Pattern matches known communication degradation cases",
          "Correlation with specific orbital positions",
          "Similar symptoms observed in previous anomalies"
        ];
        
        explanation.suggestedActions = [
          "Perform antenna diagnostic sequence",
          "Adjust satellite orientation to optimize signal path",
          "Check for external interference sources",
          "Test backup communication systems if available"
        ];
        break;
        
      case 'memoryUsage':
        explanation.reasoning = [
          `Memory usage at ${value.toFixed(1)}% exceeds the critical threshold of ${thresholds[parameter].critical}%.`,
          `This represents a ${severity} severity anomaly based on available system resources.`,
          `Usage pattern analysis suggests ${historicalData ? 'gradual accumulation of uncleared data' : 'potential memory leak in software'}.`
        ];
        
        explanation.factorsConsidered = [
          "Memory usage trend over time",
          "Active processes and their resource consumption",
          "Data storage patterns and cleanup routines",
          "System restart history and effect on memory"
        ];
        
        explanation.confidenceFactors = [
          "Memory profile consistent with known software issues",
          "Process-specific memory allocation patterns",
          "Correlation with specific operations or commands"
        ];
        
        explanation.suggestedActions = [
          "Clear non-essential stored data",
          "Restart specific subsystems showing high memory usage",
          "Review recent software updates for potential memory leaks",
          "Implement more aggressive memory management protocols"
        ];
        break;
        
      default:
        explanation.reasoning = [
          `${parameter} at ${value} is outside expected parameters.`,
          `Further analysis is needed to determine the cause.`
        ];
    }
    
    // Generate visualization data based on parameter
    // This would be used for parameter-specific visualizations in the UI
    explanation.visualizationData = generateVisualizationData(parameter, historicalData);
    
    return explanation;
  };
  
  // Generate data for visualizations to explain AI reasoning
  const generateVisualizationData = (parameter, historicalData) => {
    // In a real system, this would use actual historical data
    // For demo purposes, we'll create synthetic data that illustrates the patterns
    
    const now = new Date();
    const data = [];
    
    // Generate 24 hours of hourly data
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);
      
      let value;
      switch(parameter) {
        case 'power':
          // Show declining trend for power
          value = 85 - (i * 0.4) + (Math.random() * 2 - 1);
          break;
        case 'temperature':
          // Show increasing trend for temperature
          value = 30 + (i * 0.3) + (Math.random() * 2 - 1);
          break;
        case 'batteryHealth':
          // Show gradual decline for battery
          value = 90 - (i * 0.2) + (Math.random() * 1 - 0.5);
          break;
        case 'signalStrength':
          // Show fluctuating signal with downward trend
          value = 80 - (i * 0.1) + (Math.random() * 8 - 4);
          break;
        case 'memoryUsage':
          // Show increasing memory usage with occasional drops (cleanups)
          value = 60 + (i * 0.5) + (Math.random() * 3 - 1.5);
          if (i % 6 === 0) value -= 10; // Simulate periodic cleanup
          break;
        default:
          value = 50 + (Math.random() * 10 - 5);
      }
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        [parameter]: Math.max(0, Math.min(100, value)) // Keep within 0-100 range
      });
    }
    
    return data;
  };
  
  // Generate confidence scores for a root cause
  const generateConfidenceExplanation = (rootCause) => {
    const { anomalyParameter, probability } = rootCause;
    
    // Factors that contribute to confidence score
    const factors = [];
    
    // Generic factors used for all parameters
    const genericFactors = [
      {
        name: "Historical pattern matching",
        description: "Similarity to previously observed anomalies with known causes",
        contribution: Math.floor(Math.random() * 30) + 20
      },
      {
        name: "Parameter correlation",
        description: "Strength of correlation between affected parameters",
        contribution: Math.floor(Math.random() * 25) + 15
      },
      {
        name: "Anomaly severity",
        description: "Degree of deviation from expected values",
        contribution: Math.floor(Math.random() * 20) + 10
      }
    ];
    
    factors.push(...genericFactors);
    
    // Parameter-specific factors
    switch(anomalyParameter) {
      case 'power':
        factors.push({
          name: "Power system diagnostics",
          description: "Results from built-in power system test routines",
          contribution: Math.floor(Math.random() * 20) + 15
        });
        break;
      case 'temperature':
        factors.push({
          name: "Thermal gradient analysis",
          description: "Patterns in temperature distribution across components",
          contribution: Math.floor(Math.random() * 20) + 15
        });
        break;
      case 'batteryHealth':
        factors.push({
          name: "Charge cycle analysis",
          description: "Patterns in battery charging and discharging behavior",
          contribution: Math.floor(Math.random() * 20) + 15
        });
        break;
      case 'signalStrength':
        factors.push({
          name: "Signal spectrum analysis",
          description: "Detailed examination of signal quality across frequencies",
          contribution: Math.floor(Math.random() * 20) + 15
        });
        break;
      case 'memoryUsage':
        factors.push({
          name: "Process memory profiling",
          description: "Analysis of memory usage by specific processes",
          contribution: Math.floor(Math.random() * 20) + 15
        });
        break;
    }
    
    // Normalize contributions to match the given probability
    const totalContribution = factors.reduce((sum, factor) => sum + factor.contribution, 0);
    const normalizationFactor = probability / totalContribution;
    
    factors.forEach(factor => {
      factor.contribution = Math.round(factor.contribution * normalizationFactor);
    });
    
    return factors;
  };
  
  // Generate model insights
  const generateModelInsights = (anomalyParameter) => {
    // Base insights about the models used
    const insights = {
      primaryModel: "",
      secondaryModels: [],
      featureImportance: [],
      limitationsAndUncertainty: []
    };
    
    // Set models based on parameter
    switch(anomalyParameter) {
      case 'power':
        insights.primaryModel = "Regression-based Time Series Analysis";
        insights.secondaryModels = ["Random Forest Classifier", "Bayesian Network"];
        insights.featureImportance = [
          { feature: "Power level delta", importance: 0.35 },
          { feature: "Time of day", importance: 0.25 },
          { feature: "Battery correlation", importance: 0.20 },
          { feature: "Operational mode", importance: 0.15 },
          { feature: "Previous anomaly history", importance: 0.05 }
        ];
        break;
      case 'temperature':
        insights.primaryModel = "Thermal Gradient Neural Network";
        insights.secondaryModels = ["Anomaly Detection LSTM", "Pattern Recognition CNN"];
        insights.featureImportance = [
          { feature: "Temperature rate of change", importance: 0.30 },
          { feature: "Component proximity heat map", importance: 0.25 },
          { feature: "Operational workload", importance: 0.20 },
          { feature: "Solar exposure", importance: 0.15 },
          { feature: "Historical thermal patterns", importance: 0.10 }
        ];
        break;
      case 'batteryHealth':
        insights.primaryModel = "Battery Degradation Predictor";
        insights.secondaryModels = ["Charge Cycle Analyzer", "Cell Performance Classifier"];
        insights.featureImportance = [
          { feature: "Charge/discharge efficiency", importance: 0.35 },
          { feature: "Cycle count", importance: 0.25 },
          { feature: "Temperature exposure", importance: 0.20 },
          { feature: "Depth of discharge", importance: 0.15 },
          { feature: "Rest voltage stability", importance: 0.05 }
        ];
        break;
      case 'signalStrength':
        insights.primaryModel = "Signal Propagation Neural Network";
        insights.secondaryModels = ["Antenna Performance Classifier", "Environmental Interference Detector"];
        insights.featureImportance = [
          { feature: "Signal-to-noise ratio", importance: 0.30 },
          { feature: "Orbital position", importance: 0.25 },
          { feature: "Transmission power", importance: 0.20 },
          { feature: "Weather conditions", importance: 0.15 },
          { feature: "Hardware diagnostics", importance: 0.10 }
        ];
        break;
      case 'memoryUsage':
        insights.primaryModel = "Resource Allocation Analyzer";
        insights.secondaryModels = ["Process Monitoring System", "Memory Leak Detector"];
        insights.featureImportance = [
          { feature: "Memory usage pattern", importance: 0.35 },
          { feature: "Active processes", importance: 0.25 },
          { feature: "System uptime", importance: 0.20 },
          { feature: "Storage allocation map", importance: 0.15 },
          { feature: "Data type distribution", importance: 0.05 }
        ];
        break;
      default:
        insights.primaryModel = "Multi-parameter Anomaly Detector";
        insights.secondaryModels = ["Pattern Recognition System", "Statistical Analyzer"];
        insights.featureImportance = [
          { feature: "Parameter value", importance: 0.40 },
          { feature: "Historical trends", importance: 0.30 },
          { feature: "System context", importance: 0.20 },
          { feature: "Related parameters", importance: 0.10 }
        ];
    }
    
    // Add limitations and uncertainty information
    insights.limitationsAndUncertainty = [
      "Model confidence decreases with novel failure modes not present in training data",
      "Interrelated system effects may not be fully captured in isolated parameter analysis",
      "Predictions become less certain as the time horizon increases",
      "Extreme environmental conditions may result in behavior outside the model's experience"
    ];
    
    return insights;
  };
  
  export default {
    generateAnomalyExplanation,
    generateConfidenceExplanation,
    generateModelInsights
  };