// src/services/ai-model-service.js
import * as tf from '@tensorflow/tfjs';

class AIModelService {
  constructor() {
    this.models = {
      anomalyDetection: null,
      metadata: null
    };
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load model metadata
      const metadataResponse = await fetch('/web_models/model_metadata.json');
      this.models.metadata = await metadataResponse.json();
      
      // Load anomaly detection model
      this.models.anomalyDetection = await tf.loadLayersModel('/web_models/anomaly_detection/model.json');
      
      this.initialized = true;
      console.log('AI models initialized successfully');
    } catch (error) {
      console.error('Error initializing AI models:', error);
      throw error;
    }
  }

  // Prepare telemetry data for anomaly detection
  preprocessTelemetry(telemetryData) {
    // Create a sequence from the last 12 data points (assuming that's our sequence length)
    const recentData = telemetryData.slice(-12);
    
    // Extract and normalize features
    const features = recentData.map(point => [
      point.power / 100, // Normalize to 0-1 range
      point.temperature / 50, // Assume max temp is 50°C
      point.batteryHealth / 100,
      point.signalStrength / 100,
      point.memoryUsage / 100,
      point.in_eclipse,
      point.orbit_position
    ]);
    
    return features;
  }

  // Detect anomalies using the trained model
  async detectAnomalies(telemetryData) {
    if (!this.initialized) await this.initialize();
    
    const processedData = this.preprocessTelemetry(telemetryData);
    
    // Create a tensor with shape [1, sequence_length, num_features]
    const inputTensor = tf.tensor3d([processedData]);
    
    // Run inference
    const predictions = await this.models.anomalyDetection.predict(inputTensor);
    const anomalyScore = await predictions.data();
    const isAnomaly = anomalyScore[0] > this.models.metadata.anomaly_detection.threshold;
    
    // Clean up tensors
    inputTensor.dispose();
    predictions.dispose();
    
    return {
      isAnomaly,
      anomalyScore: anomalyScore[0],
      timestamp: telemetryData[telemetryData.length - 1].timestamp
    };
  }

  // Determine root cause (simplified version for web)
  determineRootCause(telemetryData, parameterWithAnomaly) {
    if (!this.initialized) {
      console.error('Model service not initialized');
      return null;
    }
    
    // Get the latest data point
    const latestData = telemetryData[telemetryData.length - 1];
    
    // Simplified rule-based approach based on trained model's insights
    // In production, you'd call a backend API that runs the actual model
    const causes = this.models.metadata.root_cause.causes;
    let probabilities = {};
    
    // Initialize all causes with low probability
    causes.forEach(cause => {
      probabilities[cause] = 0.1; // Base probability
    });
    
    // Update based on the anomalous parameter and its value
    switch(parameterWithAnomaly) {
      case 'power':
        probabilities.solar_panel_degradation = 0.85;
        break;
      case 'temperature':
        probabilities.cooling_system_failure = 0.82;
        break;
      case 'batteryHealth':
        probabilities.battery_cell_degradation = 0.78;
        break;
      case 'signalStrength':
        probabilities.antenna_misalignment = 0.76;
        break;
      case 'memoryUsage':
        probabilities.memory_leak = 0.88;
        break;
    }
    
    // Find the cause with highest probability
    let topCause = Object.keys(probabilities).reduce((a, b) => 
      probabilities[a] > probabilities[b] ? a : b
    );
    
    return {
      cause: topCause,
      probability: probabilities[topCause] * 100,
      reasoning: `Anomaly detected in ${parameterWithAnomaly} with pattern consistent with ${topCause.replace(/_/g, ' ')}.`,
      recommendation: this.getRecommendation(topCause)
    };
  }

  // Get recommendation based on cause
  getRecommendation(cause) {
    const recommendations = {
      solar_panel_degradation: "Check for excess power consumption and consider recalibrating solar panels",
      cooling_system_failure: "Reduce non-critical operations and verify cooling system function",
      battery_cell_degradation: "Schedule battery maintenance in the next maintenance window",
      antenna_misalignment: "Verify antenna positioning and check for external interference sources",
      memory_leak: "Clear non-essential data and check for software memory leaks"
    };
    
    return recommendations[cause] || "Investigate further";
  }

  // Predict component lifetime
  predictLifetime(telemetryData, component = 'battery') {
    if (!this.initialized) {
      console.error('Model service not initialized');
      return 0;
    }
    
    // Get the latest data point
    const latestData = telemetryData[telemetryData.length - 1];
    
    // Calculate estimated lifetime based on current health and degradation rate
    // This is a simplified approach based on the trained model's insights
    let lifetime = 0;
    
    switch(component) {
      case 'battery':
        // Simplified formula derived from model
        const batteryHealth = latestData.batteryHealth;
        const degradationRate = 0.05; // % per day
        lifetime = Math.max(0, Math.min(500, Math.round((batteryHealth - 60) / degradationRate)));
        break;
      
      case 'powerSystem':
        // Power system lifetime is related to battery but with different factors
        lifetime = Math.max(0, Math.min(500, Math.round(latestData.power * 5)));
        break;
        
      case 'communicationSystem':
        // Communication system based on signal strength
        lifetime = Math.max(0, Math.min(500, Math.round(latestData.signalStrength * 5)));
        break;
        
      case 'thermalSystem':
        // Thermal system based on temperature (inverse relationship)
        lifetime = Math.max(0, Math.min(500, Math.round((50 - latestData.temperature) * 10)));
        break;
        
      case 'memorySystem':
        // Memory system based on memory usage (inverse relationship)
        lifetime = Math.max(0, Math.min(500, Math.round((100 - latestData.memoryUsage) * 5)));
        break;
    }
    
    return lifetime;
  }
  
  // Get explainable AI insights
  getExplanation(anomalyDetails, telemetryData) {
    const parameter = anomalyDetails.parameter;
    const recentData = telemetryData.slice(-24);
    
    // Generate explanation based on parameter
    const explanation = {
      reasoning: [],
      factorsConsidered: [],
      confidenceFactors: [],
      suggestedActions: []
    };
    
    // Parameter-specific explanations (simplified version of the AI's reasoning)
    switch(parameter) {
      case 'power':
        explanation.reasoning = [
          `Power level of ${anomalyDetails.value.toFixed(1)}% is below the critical threshold.`,
          `Historical data shows a ${this.detectTrend(recentData, 'power')} trend.`,
          `This suggests potential issues with solar panel efficiency.`
        ];
        break;
        
      case 'temperature':
        explanation.reasoning = [
          `Temperature of ${anomalyDetails.value.toFixed(1)}°C exceeds the critical threshold.`,
          `Rate of increase appears ${this.detectTrend(recentData, 'temperature') === 'rising' ? 'abnormal' : 'normal'}.`,
          `Thermal system may not be dissipating heat effectively.`
        ];
        break;
        
      // Add cases for other parameters
    }
    
    return explanation;
  }
  
  // Helper to detect trend in data
  detectTrend(data, parameter) {
    if (data.length < 2) return 'stable';
    
    const values = data.map(d => d[parameter]);
    const first = values[0];
    const last = values[values.length - 1];
    const diff = last - first;
    
    if (diff > data.length * 0.1) return 'rising';
    if (diff < -data.length * 0.1) return 'falling';
    return 'stable';
  }
}

export default new AIModelService();