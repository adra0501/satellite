# satellite_data_generator.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

def generate_satellite_telemetry(days=90, sample_interval_minutes=10, satellite_id="SAT-001"):
    """
    Generate synthetic satellite telemetry data
    
    Parameters:
    - days: Number of days of data to generate
    - sample_interval_minutes: Time between samples in minutes
    - satellite_id: ID of the satellite
    
    Returns:
    - DataFrame with telemetry data
    """
    # Calculate number of samples
    samples = int((days * 24 * 60) / sample_interval_minutes)
    
    # Start date (3 months ago)
    start_date = datetime.now() - timedelta(days=days)
    
    # Initialize dataframe
    dates = [start_date + timedelta(minutes=i*sample_interval_minutes) for i in range(samples)]
    
    # Create base DataFrame
    df = pd.DataFrame({
        'timestamp': dates,
        'satellite_id': satellite_id
    })
    
    # Add orbit information
    orbit_period_minutes = 95  # Typical LEO satellite
    df['orbit_position'] = ((df.index * sample_interval_minutes) % orbit_period_minutes) / orbit_period_minutes
    df['in_eclipse'] = df['orbit_position'].apply(lambda x: 1 if 0.3 < x < 0.7 else 0)
    
    # Generate normal parameter values with realistic patterns
    
    # Power - Affected by solar panels, eclipse, and degradation over time
    base_power = 90
    solar_degradation = np.linspace(0, 5, samples)  # Gradual degradation over time
    orbit_variation = 5 * np.sin(df['orbit_position'] * 2 * np.pi)  # Variation based on orbit
    eclipse_effect = -20 * df['in_eclipse']  # Power drops in eclipse
    noise = np.random.normal(0, 1, samples)  # Random noise
    df['power'] = base_power - solar_degradation + orbit_variation + eclipse_effect + noise
    
    # Temperature - Affected by sun exposure, power consumption, and thermal cycles
    base_temp = 25
    orbit_temp_variation = 10 * np.sin(df['orbit_position'] * 2 * np.pi)  # Thermal cycle based on orbit
    power_temp_effect = 0.1 * (df['power'] - 85)  # Higher power causes higher temperature
    df['temperature'] = base_temp + orbit_temp_variation + power_temp_effect + np.random.normal(0, 1, samples)
    
    # Battery Health - Gradual degradation with charge cycles
    base_battery = 95
    cycle_count = np.linspace(0, 180, samples)  # Assume cycles accumulate steadily
    df['batteryHealth'] = base_battery - 0.02 * cycle_count + np.random.normal(0, 0.5, samples)
    
    # Signal Strength - Varies with distance to ground stations
    base_signal = 85
    ground_station_passes = np.sin(df.index * (sample_interval_minutes / (4*60)) * 2 * np.pi)
    df['signalStrength'] = base_signal + 10 * ground_station_passes + np.random.normal(0, 2, samples)
    
    # Memory Usage - Varies with activities and regular maintenance
    base_memory = 60
    activity_cycles = np.sin(df.index * (sample_interval_minutes / (6*60)) * 2 * np.pi)
    df['memoryUsage'] = base_memory + 15 * activity_cycles + np.random.normal(0, 3, samples)
    
    # Ensure values stay within realistic ranges
    df['power'] = df['power'].clip(0, 100)
    df['temperature'] = df['temperature'].clip(-10, 50)
    df['batteryHealth'] = df['batteryHealth'].clip(0, 100)
    df['signalStrength'] = df['signalStrength'].clip(0, 100)
    df['memoryUsage'] = df['memoryUsage'].clip(0, 100)
    
    # Now introduce anomaly periods
    anomalies = []
    
    # 1. Power anomaly - Sudden drop simulating partial solar panel failure
    anomaly_start = int(samples * 0.2)  # At 20% of the time series
    anomaly_duration = int(samples * 0.03)  # Lasting 3% of the total duration
    df.loc[anomaly_start:anomaly_start+anomaly_duration, 'power'] *= 0.7  # 30% power drop
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        if i % 3 == 0:  # Only label every 3rd point to simulate detection delay
            anomalies.append({
                'timestamp': df.loc[i, 'timestamp'],
                'parameter': 'power',
                'value': df.loc[i, 'power'],
                'root_cause': 'solar_panel_degradation',
                'severity': 'high'
            })
    
    # 2. Temperature anomaly - Overheating
    anomaly_start = int(samples * 0.4)  # At 40% of the time series
    anomaly_duration = int(samples * 0.02)  # Lasting 2% of the total duration
    df.loc[anomaly_start:anomaly_start+anomaly_duration, 'temperature'] += 15  # 15°C temperature increase
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        if i % 3 == 0:
            anomalies.append({
                'timestamp': df.loc[i, 'timestamp'],
                'parameter': 'temperature',
                'value': df.loc[i, 'temperature'],
                'root_cause': 'cooling_system_failure',
                'severity': 'high'
            })
    
    # 3. Battery anomaly - Accelerated degradation
    anomaly_start = int(samples * 0.6)  # At 60% of the time series
    anomaly_duration = int(samples * 0.05)  # Lasting 5% of the total duration
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        decay_factor = 0.997 ** (i - anomaly_start)
        df.loc[i, 'batteryHealth'] *= decay_factor
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        if i % 3 == 0 and df.loc[i, 'batteryHealth'] < 75:
            anomalies.append({
                'timestamp': df.loc[i, 'timestamp'],
                'parameter': 'batteryHealth',
                'value': df.loc[i, 'batteryHealth'],
                'root_cause': 'battery_cell_degradation',
                'severity': 'medium'
            })
    
    # 4. Signal anomaly - Temporary communication issues
    anomaly_start = int(samples * 0.7)  # At 70% of the time series
    anomaly_duration = int(samples * 0.01)  # Brief 1% duration
    df.loc[anomaly_start:anomaly_start+anomaly_duration, 'signalStrength'] *= 0.5  # 50% signal drop
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        if i % 2 == 0:
            anomalies.append({
                'timestamp': df.loc[i, 'timestamp'],
                'parameter': 'signalStrength',
                'value': df.loc[i, 'signalStrength'],
                'root_cause': 'antenna_misalignment',
                'severity': 'medium'
            })
    
    # 5. Memory anomaly - Memory leak
    anomaly_start = int(samples * 0.85)  # At 85% of the time series
    anomaly_duration = int(samples * 0.04)  # Lasting 4% of the total duration
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        leak_increase = min(95, df.loc[i-1, 'memoryUsage'] + 0.5) if i > 0 else 80
        df.loc[i, 'memoryUsage'] = leak_increase
    for i in range(anomaly_start, anomaly_start+anomaly_duration):
        if i % 3 == 0 and df.loc[i, 'memoryUsage'] > 85:
            anomalies.append({
                'timestamp': df.loc[i, 'timestamp'],
                'parameter': 'memoryUsage',
                'value': df.loc[i, 'memoryUsage'],
                'root_cause': 'memory_leak',
                'severity': 'low'
            })
    
    # Create anomaly DataFrame
    anomaly_df = pd.DataFrame(anomalies)
    
    # Add an anomaly flag to the main dataset
    df['anomaly'] = 0
    if not anomaly_df.empty:
        for idx, row in anomaly_df.iterrows():
            matching_idx = df[df['timestamp'] == row['timestamp']].index
            if not matching_idx.empty:
                df.loc[matching_idx[0], 'anomaly'] = 1
                df.loc[matching_idx[0], 'anomaly_parameter'] = row['parameter']
                df.loc[matching_idx[0], 'root_cause'] = row['root_cause']
    
    return df, anomaly_df

# Generate data for training and testing
training_data, training_anomalies = generate_satellite_telemetry(days=90, sample_interval_minutes=10)

# Save to CSV files
training_data.to_csv('satellite_telemetry_training.csv', index=False)
training_anomalies.to_csv('satellite_anomalies_training.csv', index=False)

print(f"Generated {len(training_data)} telemetry records with {len(training_anomalies)} anomalies")