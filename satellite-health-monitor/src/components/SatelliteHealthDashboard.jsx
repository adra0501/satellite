import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { AlertTriangle, Battery, Thermometer, ZapOff, Activity, Clock, Settings, Zap, FileText, Upload, Wifi, Server, UploadCloud, RefreshCw, LogOut, User } from 'lucide-react';
import AuthContext from '../context/AuthContext';
// Main App Component
const SatelliteHealthDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const [satelliteData, setSatelliteData] = useState({
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
  });
  
  const [anomalies, setAnomalies] = useState([]);
  const [rootCauses, setRootCauses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [predictionData, setPredictionData] = useState({
    batteryLifetime: 500, // days
    powerSystemLifetime: 420, // days
    communicationSystemLifetime: 350, // days
    thermalSystemLifetime: 280, // days
    memorySystemLifetime: 500, // days
  });
  
  const [realTimeActive, setRealTimeActive] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(5); // seconds
  const [statusMessage, setStatusMessage] = useState('Ready to monitor');
  const [detectionMethod, setDetectionMethod] = useState('threshold');
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [modelStatus, setModelStatus] = useState('ready');
  
  // Reports state - start with an empty array for truly dynamic generation
  const [recentReports, setRecentReports] = useState([]);

  // Initialize mock time series data
  useEffect(() => {
    // Generate some fake time series data
    const timeSeriesData = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      timeSeriesData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        power: 75 + Math.random() * 15,
        temperature: 25 + Math.random() * 15,
        batteryHealth: 80 + Math.random() * 15,
        signalStrength: 70 + Math.random() * 20,
        memoryUsage: 50 + Math.random() * 30
      });
    }
    
    setSatelliteData(prev => ({
      ...prev,
      timeSeriesData
    }));
  }, []);

  // Handler for toggling real-time updates
  const toggleRealTimeUpdates = () => {
    setRealTimeActive(!realTimeActive);
    setStatusMessage(realTimeActive ? 'Real-time updates paused' : 'Monitoring in real-time');
    setLastUpdated(new Date().toLocaleTimeString());
  };
  
  // Handler for changing update interval
  const handleIntervalChange = (e) => {
    const newInterval = parseInt(e.target.value);
    setUpdateInterval(newInterval);
    
    if (realTimeActive) {
      setStatusMessage(`Update interval changed to ${newInterval} seconds`);
    }
  };

  // Handler for updating values manually
  const handleValueChange = (parameter, value) => {
    setSatelliteData(prev => ({
      ...prev,
      currentValues: {
        ...prev.currentValues,
        [parameter]: parseFloat(value)
      }
    }));
    setStatusMessage(`Manual update: ${parameter} set to ${value}`);
    setLastUpdated(new Date().toLocaleTimeString());
  };
  
  // Handler for updating thresholds
  const handleThresholdChange = (parameter, thresholdType, value) => {
    setSatelliteData(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [parameter]: {
          ...prev.thresholds[parameter],
          [thresholdType]: parseFloat(value)
        }
      }
    }));
    setStatusMessage(`Threshold updated: ${parameter} ${thresholdType} set to ${value}`);
  };

  // Function to determine if a value exceeds threshold
  const isAnomaly = (parameter, value) => {
    const { thresholds } = satelliteData;
    if (parameter === 'temperature' || parameter === 'memoryUsage') {
      return value > thresholds[parameter].critical;
    } else {
      return value < thresholds[parameter].critical;
    }
  };
  
  // Handler for changing anomaly detection method
  const handleDetectionMethodChange = (method) => {
    setDetectionMethod(method);
    setStatusMessage(`Anomaly detection method changed to ${method}`);
  };

  // Navigation tabs
  const NavTabs = () => (
    <div className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            Health Dashboard
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rca' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('rca')}
          >
            Root Cause Analysis
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lifetime' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('lifetime')}
          >
            Lifetime Prediction
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'power' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('power')}
          >
            Power Efficiency
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            Custom Alerts
          </button>
        </div>
      </div>
    </div>
  );

  // Real-time control panel
  const RealTimeControls = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Real-Time Monitoring Control</h3>
      <div className="flex flex-wrap items-center gap-4">
        <button 
          className={`px-4 py-2 rounded-md flex items-center ${
            realTimeActive 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}
          onClick={toggleRealTimeUpdates}
        >
          <RefreshCw size={16} className="mr-2" />
          {realTimeActive ? 'Pause Real-Time' : 'Start Real-Time'}
        </button>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">Update Interval:</span>
          <select 
            value={updateInterval} 
            onChange={handleIntervalChange}
            className="border rounded px-3 py-1 text-sm"
            disabled={!realTimeActive}
          >
            <option value="1">1 second</option>
            <option value="2">2 seconds</option>
            <option value="5">5 seconds</option>
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-2">Detection Method:</span>
          <select 
            value={detectionMethod} 
            onChange={(e) => handleDetectionMethodChange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="threshold">Threshold-based</option>
            <option value="statistical">AI Statistical (Deep Learning)</option>
            <option value="machine-learning">AI Machine Learning</option>
          </select>
        </div>
        
        <div className="ml-auto flex items-center">
          <span className="text-xs text-gray-500 mr-2">Last updated:</span>
          <span className="text-xs font-medium">{lastUpdated}</span>
        </div>
      </div>
      
      <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-700">
        {statusMessage}
      </div>
    </div>
  );

  // Component to display meter for current values
  const ParameterMeter = ({ parameter, value, icon: Icon }) => {
    const { thresholds } = satelliteData;
    const threshold = thresholds[parameter];
    const isAlert = isAnomaly(parameter, value);
    
    // Handle percentage calculation considering min/max values
    let percentValue;
    if (parameter === 'temperature' || parameter === 'memoryUsage') {
      // For temperature and memory usage, higher values are concerning
      percentValue = ((value - threshold.min) / (threshold.max - threshold.min)) * 100;
    } else {
      // For power, battery health and signal strength, lower values are concerning
      percentValue = (value / threshold.max) * 100;
    }
    
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Icon size={18} className={isAlert ? "text-red-500 mr-2" : "text-blue-500 mr-2"} />
            <h3 className="text-lg font-medium capitalize">{parameter.replace(/([A-Z])/g, ' $1').trim()}</h3>
          </div>
          {isAlert && <AlertTriangle size={18} className="text-red-500" />}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className={`h-2.5 rounded-full ${isAlert ? 'bg-red-500' : 'bg-blue-500'}`} 
            style={{ width: `${Math.min(Math.max(percentValue, 0), 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{threshold.min}</span>
          <span>{value.toFixed(1)}</span>
          <span>{threshold.max}</span>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Update value:
          </label>
          <div className="flex">
            <input 
              type="range" 
              min={threshold.min} 
              max={threshold.max} 
              value={value}
              onChange={(e) => handleValueChange(parameter, e.target.value)}
              className="w-full"
            />
            <input 
              type="number"
              min={threshold.min}
              max={threshold.max}
              value={value}
              onChange={(e) => handleValueChange(parameter, e.target.value)}
              className="ml-2 w-16 border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
    );
  };

  // Dashboard view component
  const DashboardView = () => (
    <div>
      <RealTimeControls />
      
      <h2 className="text-xl font-bold mb-4">Health Anomaly Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ParameterMeter parameter="power" value={satelliteData.currentValues.power} icon={Zap} />
        <ParameterMeter parameter="temperature" value={satelliteData.currentValues.temperature} icon={Thermometer} />
        <ParameterMeter parameter="batteryHealth" value={satelliteData.currentValues.batteryHealth} icon={Battery} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ParameterMeter parameter="signalStrength" value={satelliteData.currentValues.signalStrength} icon={Wifi} />
        <ParameterMeter parameter="memoryUsage" value={satelliteData.currentValues.memoryUsage} icon={Server} />
      </div>
      
      <h3 className="text-lg font-bold mb-2">Health Trends (Last 24 Hours)</h3>
      <div className="bg-white p-4 rounded-lg shadow h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={satelliteData.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="power" stroke="#2563EB" name="Power (%)" />
            <Line type="monotone" dataKey="temperature" stroke="#DC2626" name="Temperature (°C)" />
            <Line type="monotone" dataKey="batteryHealth" stroke="#059669" name="Battery Health (%)" />
            <Line type="monotone" dataKey="signalStrength" stroke="#8B5CF6" name="Signal Strength (%)" />
            <Line type="monotone" dataKey="memoryUsage" stroke="#F59E0B" name="Memory Usage (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <h3 className="text-lg font-bold mb-2">Active Anomalies</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {anomalies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {anomalies.slice(-5).map((anomaly, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{anomaly?.parameter?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{typeof anomaly?.value === 'number' ? anomaly.value.toFixed(1) : anomaly?.value || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{anomaly?.threshold || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{anomaly?.timestamp || new Date().toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (anomaly?.severity === 'high') ? 'bg-red-100 text-red-800' : 
                        (anomaly?.severity === 'medium') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {anomaly?.severity || 'low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No anomalies detected</div>
        )}
      </div>
    </div>
  );

  // Root Cause Analysis view component
  const RCAView = () => {
    // State for selected anomaly and explanation data
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);
    const [aiExplanation, setAiExplanation] = useState(null);
    const [confidenceFactors, setConfidenceFactors] = useState([]);
    const [modelInsights, setModelInsights] = useState(null);
    
    // Fake anomalies and root causes for demonstration
    const demoAnomalies = [
      {
        id: 1,
        parameter: 'temperature',
        value: 38.5,
        threshold: 38,
        timestamp: new Date().toLocaleString(),
        severity: 'high'
      },
      {
        id: 2,
        parameter: 'batteryHealth',
        value: 64.2,
        threshold: 65,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        severity: 'medium'
      }
    ];
    
    const demoRootCauses = [
      {
        id: 1,
        anomalyParameter: 'temperature',
        cause: 'Cooling system malfunction',
        probability: 85,
        recommendation: 'Reduce non-critical operations and verify cooling system function',
        timestamp: new Date().toLocaleString()
      },
      {
        id: 2,
        anomalyParameter: 'batteryHealth',
        cause: 'Battery cell degradation',
        probability: 72,
        recommendation: 'Schedule battery maintenance in the next maintenance window',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()
      }
    ];
    
    // Function to generate explanation when an anomaly is selected
    const handleSelectAnomaly = (cause) => {
      setSelectedAnomaly(cause);
      
      // Generate mock AI explanation
      const mockExplanation = {
        reasoning: [
          `Analysis of ${cause.anomalyParameter} historical data shows a gradual degradation pattern`,
          `Correlation with environmental factors indicates possible relation to recent thermal variations`,
          `Comparison with similar anomalies in the past suggests ${cause.cause.toLowerCase()} as the primary factor`
        ],
        factorsConsidered: [
          `Historical ${cause.anomalyParameter} data for the past 30 days`,
          'Environmental conditions during anomaly occurrence',
          'Correlation with other subsystem parameters',
          'Maintenance history and component age'
        ],
        suggestedActions: [
          cause.recommendation,
          'Increase monitoring frequency for this subsystem',
          'Prepare contingency plans if degradation continues',
          'Schedule diagnostic tests during next maintenance window'
        ],
        visualizationData: generateMockTimeSeriesData(cause.anomalyParameter)
      };
      
      setAiExplanation(mockExplanation);
      
      // Generate confidence factors
      const mockConfidenceFactors = [
        {
          name: "Historical pattern matching",
          description: "Similarity to previously observed anomalies with known causes",
          contribution: Math.floor(cause.probability * 0.3)
        },
        {
          name: "Parameter correlation",
          description: "Strength of correlation between affected parameters",
          contribution: Math.floor(cause.probability * 0.25)
        },
        {
          name: "Anomaly severity",
          description: "Degree of deviation from expected values",
          contribution: Math.floor(cause.probability * 0.2)
        },
        {
          name: `${cause.anomalyParameter} specific analysis`,
          description: `Detailed examination of ${cause.anomalyParameter} patterns`,
          contribution: Math.floor(cause.probability * 0.25)
        }
      ];
      
      setConfidenceFactors(mockConfidenceFactors);
      
      // Generate model insights
      const mockModelInsights = {
        primaryModel: "Deep Learning LSTM",
        secondaryModels: ["Random Forest Classifier", "Gradient Boosting", "Bayesian Network"],
        featureImportance: [
          { feature: `${cause.anomalyParameter} level`, importance: 0.35 },
          { feature: "Historical trends", importance: 0.25 },
          { feature: "Related parameters", importance: 0.2 },
          { feature: "Operational context", importance: 0.1 },
          { feature: "Time factors", importance: 0.1 }
        ],
        limitationsAndUncertainty: [
          "Model confidence decreases with novel failure modes not present in training data",
          "Interrelated system effects may not be fully captured in isolated parameter analysis",
          "Predictions become less certain as the time horizon increases",
          "Extreme environmental conditions may result in behavior outside the model's experience"
        ]
      };
      
      setModelInsights(mockModelInsights);
    };
    
    // Generate mock time series data for visualization
    const generateMockTimeSeriesData = (parameter) => {
      const data = [];
      const now = new Date();
      let baseValue;
      
      // Set appropriate base values based on parameter
      switch(parameter) {
        case 'temperature':
          baseValue = 30;
          break;
        case 'batteryHealth':
          baseValue = 80;
          break;
        case 'power':
          baseValue = 85;
          break;
        case 'signalStrength':
          baseValue = 75;
          break;
        case 'memoryUsage':
          baseValue = 60;
          break;
        default:
          baseValue = 50;
      }
      
      // Generate 24 hours of data with a trend leading to anomaly
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Create degradation pattern leading to anomaly
        let value;
        if (parameter === 'temperature' || parameter === 'memoryUsage') {
          // For these parameters, higher values are worse (upward trend)
          const degradation = Math.max(0, (24 - i) * 0.4 * (1 + Math.random() * 0.2));
          value = baseValue + degradation;
        } else {
          // For other parameters like power, battery, signal - lower is worse (downward trend)
          const degradation = Math.max(0, (24 - i) * 0.7 * (1 + Math.random() * 0.2));
          value = baseValue - degradation;
        }
        
        const dataPoint = {
          time,
          [parameter]: value
        };
        
        data.push(dataPoint);
      }
      
      return data;
    };
    
    return (
      <div>
        <RealTimeControls />
        
        <h2 className="text-xl font-bold mb-4">Root Cause Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            {demoRootCauses.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anomaly</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probable Cause</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {demoRootCauses.map((cause) => (
                        <tr key={cause.id} className={selectedAnomaly && selectedAnomaly.id === cause.id ? "bg-blue-50" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">{cause.anomalyParameter.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="px-6 py-4">{cause.cause}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{cause.probability}%</td>
                          <td className="px-6 py-4">{cause.recommendation}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleSelectAnomaly(cause)}
                            >
                              Explain
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">No root causes to display</div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">AI Models Used</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 border rounded">
                <div className="font-medium mb-1">Bayesian Network</div>
                <div className="text-sm text-gray-600">For causal relationships</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium mb-1">Decision Tree</div>
                <div className="text-sm text-gray-600">For interpretable reasoning</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium mb-1">Time Series Analysis</div>
                <div className="text-sm text-gray-600">For trend identification</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="mr-2 p-1 bg-blue-500 text-white rounded-full">
                  <RefreshCw size={14} />
                </div>
                <span className="text-sm font-medium text-blue-700">
                  Detection Mode: {detectionMethod.charAt(0).toUpperCase() + detectionMethod.slice(1)}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {detectionMethod === 'threshold' ? 
                  'Using threshold-based detection with rule-based explanation' : 
                  'Using AI-based detection with machine learning models'}
              </p>
            </div>
          </div>
        </div>
        
        {selectedAnomaly && aiExplanation && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">
              Explainable AI Insights: {selectedAnomaly.anomalyParameter.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-blue-700 mb-2">AI Reasoning Process</h4>
              <ul className="list-disc pl-5 space-y-1">
                {aiExplanation.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-gray-700">{reason}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Factors Considered</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {aiExplanation.factorsConsidered.map((factor, idx) => (
                    <li key={idx} className="text-gray-700">{factor}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Recommended Actions</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {aiExplanation.suggestedActions.map((action, idx) => (
                    <li key={idx} className="text-gray-700">{action}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Parameter visualization */}
            <div className="mb-6">
              <h4 className="font-medium text-blue-700 mb-2">Parameter Trend Analysis</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aiExplanation.visualizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={selectedAnomaly.anomalyParameter} 
                      stroke="#2563EB" 
                      name={selectedAnomaly.anomalyParameter.replace(/([A-Z])/g, ' $1').trim()} 
                    />
                    {selectedAnomaly.anomalyParameter === 'temperature' || selectedAnomaly.anomalyParameter === 'memoryUsage' ? (
                      <ReferenceLine 
                        y={satelliteData.thresholds[selectedAnomaly.anomalyParameter]?.critical || 38} 
                        stroke="red" 
                        strokeDasharray="3 3" 
                        label={{ value: 'Critical Threshold', position: 'top' }} 
                      />
                    ) : (
                      <ReferenceLine 
                        y={satelliteData.thresholds[selectedAnomaly.anomalyParameter]?.critical || 65} 
                        stroke="red" 
                        strokeDasharray="3 3" 
                        label={{ value: 'Critical Threshold', position: 'bottom' }} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Confidence score explanation */}
            <div className="mb-6">
              <h4 className="font-medium text-blue-700 mb-2">Confidence Score Breakdown ({selectedAnomaly.probability}%)</h4>
              <div className="space-y-3">
                {confidenceFactors.map((factor, idx) => (
                  <div key={idx} className="border-b pb-2">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{factor.name}</span>
                      <span className="text-blue-600">{factor.contribution}%</span>
                    </div>
                    <p className="text-sm text-gray-600">{factor.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="h-1.5 rounded-full bg-blue-500" 
                        style={{ width: `${factor.contribution}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Model insights */}
            {modelInsights && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">AI Model Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <div className="mb-3">
                      <span className="font-medium">Primary Model:</span>
                      <div className="mt-1 p-2 bg-blue-50 rounded">{modelInsights.primaryModel}</div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="font-medium">Supporting Models:</span>
                      <div className="mt-1 space-y-1">
                        {modelInsights.secondaryModels.map((model, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded">{model}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Feature Importance:</span>
                    <div className="space-y-2 mt-1">
                      {modelInsights.featureImportance.map((feature, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span>{feature.feature}</span>
                          <span className="text-gray-600">{(feature.importance * 100).toFixed(0)}%</span>
                          <div className="w-1/2 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-blue-400" 
                              style={{ width: `${feature.importance * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                  <h5 className="font-medium text-yellow-800 mb-1">Model Limitations</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                    {modelInsights.limitationsAndUncertainty.map((limitation, idx) => (
                      <li key={idx}>{limitation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-4">Explainable AI Framework</h3>
          <p className="mb-3">The AI system analyzes anomalies based on historical patterns and known failure modes.</p>
          <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
            <p className="text-gray-700">Root causes are determined by evaluating correlations between different parameters, rate of change, and previous similar incidents.</p>
          </div>
          <p className="mb-3">Confidence scores are calculated using:</p>
          <ul className="list-disc pl-5 mb-4">
            <li>Historical accuracy of similar diagnoses</li>
            <li>Strength of correlation between parameters</li>
            <li>Uniqueness of the pattern signature</li>
          </ul>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">How to Use AI Explanations</h4>
            <p className="text-sm text-gray-700 mb-2">
              Click the "Explain" button next to any detected anomaly to see a detailed 
              breakdown of the AI's reasoning, including factors considered, confidence 
              metrics, and recommended actions.
            </p>
            <p className="text-sm text-gray-700">
              The visual representation shows the parameter's trend leading up to the anomaly,
              helping to identify patterns that contributed to the AI's diagnosis.
            </p>
          </div>
        </div>
      </div>
    );
  };
 
  // Lifetime Prediction view component
  const LifetimePredictionView = () => {
    // Define data for component lifetime visualization
    const componentLifetimeData = [
      { name: 'Battery', value: predictionData.batteryLifetime, fullName: 'Battery System' },
      { name: 'Power', value: predictionData.powerSystemLifetime, fullName: 'Power System' },
      { name: 'Comm', value: predictionData.communicationSystemLifetime, fullName: 'Communication System' },
      { name: 'Thermal', value: predictionData.thermalSystemLifetime, fullName: 'Thermal System' },
      { name: 'Memory', value: predictionData.memorySystemLifetime, fullName: 'Memory System' }
    ];
    
    return (
      <div>
        <RealTimeControls />
        
        <h2 className="text-xl font-bold mb-4">Component Lifetime Prediction</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">Critical Components Lifetime</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={componentLifetimeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: 'Component Systems', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Estimated Days Remaining', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 500]} 
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} days`, 
                      props.payload.fullName
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6" 
                    name="Estimated Days Remaining" 
                  />
                  <ReferenceLine y={90} stroke="red" strokeDasharray="3 3" label="Critical Threshold (90 days)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">Component Wear Analysis</h3>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Battery Health Decay</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className="h-2.5 rounded-full bg-blue-500" 
                  style={{ width: `${(satelliteData.currentValues.batteryHealth / 100) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Critical</span>
                <span>Current: {satelliteData.currentValues.batteryHealth.toFixed(1)}%</span>
                <span>Optimal</span>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Battery estimated to reach critical levels in {predictionData.batteryLifetime > 500 ? '500+' : predictionData.batteryLifetime} days. 
                    {predictionData.batteryLifetime < 100 ? ' Consider scheduling maintenance soon.' : ' Regular monitoring advised.'}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Simulate battery aging by reducing battery health
                const newBatteryHealth = Math.max(
                  satelliteData.currentValues.batteryHealth - 5,
                  satelliteData.thresholds.batteryHealth.min
                );
                handleValueChange('batteryHealth', newBatteryHealth);
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              Simulate Battery Aging
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-3">Predictive Maintenance</h3>
          <div className="border-b pb-4 mb-4">
            <h4 className="font-medium mb-2">Next Scheduled Maintenance</h4>
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-800 text-xl font-bold">
                  {Math.max(
                    Math.min(
                      predictionData.batteryLifetime, 
                      predictionData.powerSystemLifetime,
                      predictionData.communicationSystemLifetime
                    ) - 30,
                    0
                  )}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Days until recommended maintenance</p>
                <p className="text-sm text-gray-500">Based on component lifetime predictions</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Maintenance Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <Battery />
                </div>
                <p className="ml-2 text-sm text-gray-600">Battery system inspection and potential cell replacement</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <Zap />
                </div>
                <p className="ml-2 text-sm text-gray-600">Power distribution unit calibration</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <Thermometer />
                </div>
                <p className="ml-2 text-sm text-gray-600">Thermal control system check and coolant refill</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
 
  // Power Efficiency View component
  const PowerEfficiencyView = () => {
    // Mock power consumption data for the time series chart
    const [powerData, setPowerData] = useState([]);
    const [selectedOptimization, setSelectedOptimization] = useState(null);
    const [optimizationImpact, setOptimizationImpact] = useState(null);
    
    // Initialize power data on component mount
    useEffect(() => {
      // Generate power consumption data for the last 24 hours
      const data = [];
      const now = new Date();
      
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourOfDay = time.getHours();
        
        // Pattern: Higher usage during day, lower at night
        let basePower = 75;
        
        // Add time-of-day variation (higher during day, lower at night)
        if (hourOfDay >= 8 && hourOfDay <= 18) {
          basePower += 10; // Higher during working hours
        } else if (hourOfDay >= 0 && hourOfDay <= 5) {
          basePower -= 15; // Lower during early morning hours
        }
        
        // Add some random variation
        const randomVariation = Math.random() * 5 - 2.5;
        
        data.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          power: Math.max(60, Math.min(100, basePower + randomVariation)),
          date: time.toLocaleDateString()
        });
      }
      
      setPowerData(data);
    }, []);
    
    // Power utilization breakdown data
    const powerBreakdown = [
      { system: 'Communication Systems', percentage: 35, color: 'bg-blue-500' },
      { system: 'Navigation & Control', percentage: 25, color: 'bg-green-500' },
      { system: 'Scientific Instruments', percentage: 20, color: 'bg-purple-500' },
      { system: 'Thermal Control', percentage: 15, color: 'bg-red-500' },
      { system: 'Other Systems', percentage: 5, color: 'bg-yellow-500' }
    ];
    
    // Power optimization recommendations
    const optimizations = [
      {
        id: 1,
        title: 'Reduce communication system duty cycle',
        description: 'Lower power consumption by reducing the frequency of routine status updates during low-activity periods',
        savings: 5,
        impact: 'Low',
        implementation: 'Easy',
        icon: <Settings className="h-5 w-5 text-blue-500" />
      },
      {
        id: 2,
        title: 'Implement sleep mode for scientific instruments',
        description: 'Put non-critical instruments in sleep mode when not actively collecting data',
        savings: 4,
        impact: 'Medium',
        implementation: 'Medium',
        icon: <ZapOff className="h-5 w-5 text-blue-500" />
      },
      {
        id: 3,
        title: 'Optimize thermal control system cycling',
        description: 'Adjust temperature thresholds to reduce heating/cooling cycles while maintaining safe operating temperatures',
        savings: 3,
        impact: 'Low',
        implementation: 'Medium',
        icon: <Activity className="h-5 w-5 text-blue-500" />
      }
    ];
    
    // Handler for selecting an optimization
    const handleSelectOptimization = (optimization) => {
      setSelectedOptimization(optimization);
      
      // Generate impact analysis
      setOptimizationImpact({
        powerSavings: optimization.savings,
        missionExtension: Math.round(optimization.savings * 9),
        subsystemImpacts: [
          {
            subsystem: 'Battery Life',
            impact: optimization.id === 1 ? 'High Positive' : 'Medium Positive',
            details: 'Reduced power draw extends overall battery lifetime'
          },
          {
            subsystem: 'Thermal Management',
            impact: optimization.id === 3 ? 'High Positive' : 'Low Impact',
            details: 'Changes in duty cycles affect overall thermal load'
          },
          {
            subsystem: 'Data Collection',
            impact: optimization.id === 2 ? 'Low Negative' : 'No Impact',
            details: 'Slight reduction in data frequency but within mission parameters'
          }
        ],
        implementationSteps: [
          'Update operational parameters via next scheduled uplink',
          'Monitor system response for 24-48 hours',
          'Adjust parameters if needed based on telemetry'
        ],
        timeToImplement: optimization.implementation === 'Easy' ? '1-2 days' : '3-5 days'
      });
    };
    
    // Handler for applying power optimizations
    const applyPowerOptimization = () => {
      // Simulate power efficiency improvement
      const newPower = Math.min(
        satelliteData.currentValues.power + 5,
        satelliteData.thresholds.power.max
      );
      handleValueChange('power', newPower);
      setStatusMessage('Power optimization applied: +5% efficiency');
      
      // Update power data to show optimization effect
      const optimizedData = [...powerData];
      // Apply efficiency improvement to last 6 hours (future projection)
      for (let i = optimizedData.length - 6; i < optimizedData.length; i++) {
        if (i >= 0) {
          optimizedData[i] = {
            ...optimizedData[i],
            power: Math.min(100, optimizedData[i].power + 5 + Math.random() * 2)
          };
        }
      }
      setPowerData(optimizedData);
    };
    
    return (
      <div>
        <RealTimeControls />
        
        <h2 className="text-xl font-bold mb-4">Power Efficiency Monitor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">Power Consumption Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[60, 100]} label={{ value: 'Power Level (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Power']} />
                  <Legend />
                  <ReferenceLine y={satelliteData.thresholds.power.critical} stroke="red" strokeDasharray="3 3" label="Critical Threshold" />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="#2563EB" 
                    name="Power Consumption (%)" 
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <span>Current Power Level: {satelliteData.currentValues.power.toFixed(1)}%</span>
                <span>Critical Threshold: {satelliteData.thresholds.power.critical}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">Power Utilization Breakdown</h3>
            {powerBreakdown.map((system, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{system.system}</h4>
                  <span>{system.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div 
                    className={`h-2.5 rounded-full ${system.color}`} 
                    style={{ width: `${system.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-800">Power Health Status</h4>
                <span className={satelliteData.currentValues.power > satelliteData.thresholds.power.critical + 10 
                  ? "text-green-600 font-medium" 
                  : "text-amber-600 font-medium"}>
                  {satelliteData.currentValues.power > satelliteData.thresholds.power.critical + 10 
                    ? "Optimal" 
                    : "Adequate"}
                </span>
              </div>
              <p className="text-sm text-blue-600">
                Current power levels are {satelliteData.currentValues.power - satelliteData.thresholds.power.critical}% above critical threshold.
                {satelliteData.currentValues.power < satelliteData.thresholds.power.critical + 15 
                  ? " Consider implementing power saving measures." 
                  : " Power reserves are sufficient for normal operations."}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">Power Optimization Recommendations</h3>
            
            <div className="border-l-4 border-green-500 pl-4 py-2 mb-4">
              <h4 className="font-medium text-green-700">Potential Power Savings: 12%</h4>
              <p className="text-sm text-gray-600">Implementing the following recommendations could extend mission duration by up to 45 days.</p>
            </div>
            
            <ul className="space-y-4">
              {optimizations.map((optimization) => (
                <li 
                  key={optimization.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition hover:bg-blue-50 ${
                    selectedOptimization && selectedOptimization.id === optimization.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectOptimization(optimization)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {optimization.icon}
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">{optimization.title}</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          {optimization.savings}% savings
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{optimization.description}</p>
                      <div className="flex mt-2 text-xs space-x-4">
                        <span className={`${
                          optimization.impact === 'Low' ? 'text-green-600' : 
                          optimization.impact === 'Medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          Impact: {optimization.impact}
                        </span>
                        <span className={`${
                          optimization.implementation === 'Easy' ? 'text-green-600' : 
                          optimization.implementation === 'Medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          Implementation: {optimization.implementation}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                onClick={applyPowerOptimization}
              >
                <Zap className="h-4 w-4 mr-2" />
                Apply Selected Optimizations
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-3">Power Efficiency Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Solar Panel Efficiency</h4>
                  <span className="text-sm font-medium text-amber-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Slight degradation from nominal 95%</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Power Distribution Efficiency</h4>
                  <span className="text-sm font-medium text-green-600">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '98%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Within optimal parameters</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Battery Charge/Discharge</h4>
                  <span className="text-sm font-medium text-green-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '95%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optimal cycling efficiency</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Overall Power Efficiency</h4>
                  <span className="text-sm font-medium text-amber-600">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: '88%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Room for optimization</p>
              </div>
            </div>
            
            <div className="mt-5 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">
              <p className="font-medium">Efficiency Notes</p>
              <p className="mt-1 text-xs">Current power configuration is prioritizing reliability over maximum efficiency. Consider recalibration during next maintenance window.</p>
            </div>
          </div>
        </div>
        
        {selectedOptimization && optimizationImpact && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-medium mb-3">
              Optimization Impact Analysis: {selectedOptimization.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-medium text-green-800 mb-2">Power Savings</h4>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-green-600 mr-1">{optimizationImpact.powerSavings}%</div>
                  <div className="text-sm text-green-700">reduction in power consumption</div>
                </div>
                <p className="text-sm mt-3">
                  Estimated to extend mission duration by approximately {optimizationImpact.missionExtension} days.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Subsystem Impacts</h4>
                <ul className="space-y-2">
                  {optimizationImpact.subsystemImpacts.map((impact, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">{impact.subsystem}:</span> 
                      <span className={`ml-1 ${
                        impact.impact.includes('Positive') ? 'text-green-600' :
                        impact.impact.includes('Negative') ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {impact.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Implementation</h4>
                <div className="mb-2">
                  <span className="text-sm font-medium">Time to implement:</span> 
                  <span className="ml-1 text-sm">{optimizationImpact.timeToImplement}</span>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {optimizationImpact.implementationSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
 
 // Updated CustomAlertsView with working report generation
const CustomAlertsView = () => {
  // State for form values
  const [reportType, setReportType] = useState('Health Summary Report');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportFormat, setReportFormat] = useState('pdf');
  
  // Import report service
  const [reportService, setReportService] = useState(null);

  // Load the report service on component mount
  useEffect(() => {
    // Dynamically import the report service
    import('../services/report-service').then(module => {
      setReportService(module.default);
    }).catch(error => {
      console.error('Failed to load report service:', error);
      setStatusMessage('Error loading report generation module');
    });
  }, []);
  
  // Generate a new report
  const handleGenerateReport = () => {
    // Create a new report with current date and time
    const now = new Date();
    const reportId = now.getTime(); // Use timestamp for unique ID
    
    // Format date as YYYY-MM-DD
    const reportDate = now.toISOString().split('T')[0];
    
    // Create a meaningful report name with date range
    const reportName = `${reportType} (${startDate} to ${endDate})`;
    
    const newReport = {
      id: reportId,
      name: reportName,
      type: reportType.split(' ')[0], // Extract first word as type
      date: reportDate,
      format: reportFormat.toUpperCase()
    };
    
    // Add the new report to the start of the list
    setRecentReports([newReport, ...recentReports]);
    
    // Show status message
    setStatusMessage(`Generating ${reportFormat.toUpperCase()} report: ${reportName}`);

    // Generate the actual report using the report service
    if (reportService) {
      try {
        // Prepare data for report generation
        const reportData = {
          satelliteData: satelliteData,
          anomalies: anomalies,
          rootCauses: rootCauses || [],
          predictionData: predictionData
        };
        
        const dateRange = {
          startDate: startDate,
          endDate: endDate
        };
        
        // Generate and download the report
        const result = reportService.generateReport(
          reportType,
          reportData,
          dateRange,
          reportFormat.toLowerCase(),
          'download'
        );
        
        if (result.success) {
          setStatusMessage(`${reportFormat.toUpperCase()} report downloaded: ${result.filename}`);
        } else {
          setStatusMessage(`Error generating report: ${result.error}`);
        }
      } catch (error) {
        console.error('Report generation error:', error);
        setStatusMessage(`Error generating report: ${error.message}`);
      }
    } else {
      setStatusMessage('Report service not loaded yet. Please try again.');
    }
  };
  
  // Handle viewing a report
  const handleViewReport = (reportName) => {
    if (reportService) {
      try {
        // Prepare data for report generation
        const reportData = {
          satelliteData: satelliteData,
          anomalies: anomalies,
          rootCauses: rootCauses || [],
          predictionData: predictionData
        };
        
        const dateRange = {
          startDate: startDate,
          endDate: endDate
        };
        
        // Generate and view the report
        const result = reportService.generateReport(
          reportType,
          reportData,
          dateRange,
          'pdf', // Always view as PDF
          'view'
        );
        
        if (result.success) {
          setStatusMessage(`Viewing report: ${reportName}`);
        } else {
          setStatusMessage(`Error viewing report: ${result.error}`);
        }
      } catch (error) {
        console.error('Report viewing error:', error);
        setStatusMessage(`Error viewing report: ${error.message}`);
      }
    } else {
      setStatusMessage('Report service not loaded yet. Please try again.');
    }
  };
  
  return (
    <div>
      <RealTimeControls />
      
      <h2 className="text-xl font-bold mb-4">Custom Alerts & Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Configure Alerts</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Power Threshold
            </label>
            <div className="flex">
              <input 
                type="range" 
                min={satelliteData.thresholds.power.min} 
                max={satelliteData.thresholds.power.max} 
                value={satelliteData.thresholds.power.critical}
                onChange={(e) => handleThresholdChange('power', 'critical', e.target.value)}
                className="w-full"
              />
              <input 
                type="number"
                min={satelliteData.thresholds.power.min}
                max={satelliteData.thresholds.power.max}
                value={satelliteData.thresholds.power.critical}
                onChange={(e) => handleThresholdChange('power', 'critical', e.target.value)}
                className="ml-2 w-16 border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature Threshold
            </label>
            <div className="flex">
              <input 
                type="range" 
                min={satelliteData.thresholds.temperature.min} 
                max={satelliteData.thresholds.temperature.max}
                value={satelliteData.thresholds.temperature.critical}
                onChange={(e) => handleThresholdChange('temperature', 'critical', e.target.value)}
                className="w-full"
              />
              <input 
                type="number"
                min={satelliteData.thresholds.temperature.min}
                max={satelliteData.thresholds.temperature.max}
                value={satelliteData.thresholds.temperature.critical}
                onChange={(e) => handleThresholdChange('temperature', 'critical', e.target.value)}
                className="ml-2 w-16 border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Battery Health Threshold
            </label>
            <div className="flex">
              <input 
                type="range" 
                min={satelliteData.thresholds.batteryHealth.min} 
                max={satelliteData.thresholds.batteryHealth.max} 
                value={satelliteData.thresholds.batteryHealth.critical}
                onChange={(e) => handleThresholdChange('batteryHealth', 'critical', e.target.value)}
                className="w-full"
              />
              <input 
                type="number"
                min={satelliteData.thresholds.batteryHealth.min}
                max={satelliteData.thresholds.batteryHealth.max}
                value={satelliteData.thresholds.batteryHealth.critical}
                onChange={(e) => handleThresholdChange('batteryHealth', 'critical', e.target.value)}
                className="ml-2 w-16 border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setStatusMessage('Alert configuration saved')}
            >
              Save Alert Configuration
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium mb-4">Generate Reports</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select 
              className="w-full border rounded px-3 py-2"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option>Health Summary Report</option>
              <option>Anomaly Detail Report</option>
              <option>Power Efficiency Report</option>
              <option>Maintenance Prediction Report</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input 
                type="date" 
                className="w-full border rounded px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input 
                type="date" 
                className="w-full border rounded px-3 py-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="format" 
                  value="pdf" 
                  className="h-4 w-4 text-blue-600" 
                  checked={reportFormat === 'pdf'}
                  onChange={() => setReportFormat('pdf')}
                />
                <span className="ml-2">PDF</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  name="format" 
                  value="csv" 
                  className="h-4 w-4 text-blue-600"
                  checked={reportFormat === 'csv'}
                  onChange={() => setReportFormat('csv')}
                />
                <span className="ml-2">CSV</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleGenerateReport}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-4">Recent Reports</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{report.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.format}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewReport(report.name)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No reports available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
 // Return the main component UI
 return (
  <div className="min-h-screen bg-gray-100">
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Satellite Health Monitoring System</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
              realTimeActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <span className={`h-2 w-2 rounded-full mr-1 ${realTimeActive ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              Status: {realTimeActive ? 'Monitoring' : 'Standby'}
            </span>
            
            {user && (
              <div className="flex items-center ml-4">
                <User size={16} className="text-gray-600 mr-1" />
                <span className="text-gray-600 mr-3">{user.username}</span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                >
                  <LogOut size={14} className="mr-1" />
                  Logout
                </button>
              </div>
            )}
            
            <UploadCloud 
              size={18} 
              className="text-blue-500 cursor-pointer" 
              onClick={() => setStatusMessage('Data synced with mission control')}
              title="Sync with mission control"
            />
          </div>
        </div>
      </div>
    </header>
    
    <main className="max-w-7xl mx-auto py-6 px-4">
      <NavTabs />
      
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'rca' && <RCAView />}
      {activeTab === 'lifetime' && <LifetimePredictionView />}
      {activeTab === 'power' && <PowerEfficiencyView />}
      {activeTab === 'alerts' && <CustomAlertsView />}
    </main>
  </div>
);
};

// Export the component
export default SatelliteHealthDashboard;