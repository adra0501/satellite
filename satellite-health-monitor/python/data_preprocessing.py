# data_preprocessing.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def preprocess_satellite_data(telemetry_file, anomaly_file=None):
    """
    Process satellite telemetry data, engineer features and prepare for model training
    
    Parameters:
    - telemetry_file: Path to the telemetry CSV file
    - anomaly_file: Path to the anomaly CSV file (optional)
    
    Returns:
    - Processed dataframe ready for modeling
    """
    # Load data
    df = pd.read_csv(telemetry_file)
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Extract time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    
    # Calculate rate of change for parameters (delta)
    for param in ['power', 'temperature', 'batteryHealth', 'signalStrength', 'memoryUsage']:
        df[f'{param}_delta'] = df[param].diff().fillna(0)
        
        # Calculate rolling statistics (last 6 samples = 1 hour)
        df[f'{param}_mean_1h'] = df[param].rolling(window=6).mean().fillna(df[param])
        df[f'{param}_std_1h'] = df[param].rolling(window=6).std().fillna(0)
        
        # Calculate deviation from moving average
        df[f'{param}_deviation'] = df[param] - df[f'{param}_mean_1h']
    
    # Create interaction features
    df['power_temp_ratio'] = df['power'] / df['temperature'].replace(0, 0.1)
    df['battery_power_ratio'] = df['batteryHealth'] / df['power'].replace(0, 0.1)
    
    # Feature to capture time since last eclipse entry/exit
    df['eclipse_change'] = df['in_eclipse'].diff().fillna(0)
    df['time_since_eclipse_change'] = 0
    counter = 0
    for i in range(len(df)):
        if df.loc[i, 'eclipse_change'] != 0:
            counter = 0
        else:
            counter += 1
        df.loc[i, 'time_since_eclipse_change'] = counter
    
    # If anomaly file provided, merge anomaly information
    if anomaly_file:
        anomalies = pd.read_csv(anomaly_file)
        anomalies['timestamp'] = pd.to_datetime(anomalies['timestamp'])
        
        # Create dict of root causes for one-hot encoding
        root_causes = anomalies['root_cause'].unique()
        for cause in root_causes:
            df[f'cause_{cause}'] = 0
            
        # Mark anomalies and their causes
        for idx, row in anomalies.iterrows():
            matching_idx = df[df['timestamp'] == row['timestamp']].index
            if not matching_idx.empty:
                df.loc[matching_idx[0], f"cause_{row['root_cause']}"] = 1
    
    # Drop rows with NaN (from window calculations)
    df = df.dropna().reset_index(drop=True)
    
    # Ensure anomaly column exists (0 if no anomalies)
    if 'anomaly' not in df.columns:
        df['anomaly'] = 0
    
    return df

def create_time_series_dataset(df, sequence_length=12, prediction_horizon=1):
    """
    Create sequences for time series prediction
    
    Parameters:
    - df: Processed dataframe
    - sequence_length: Number of time steps to use as input
    - prediction_horizon: How many steps ahead to predict
    
    Returns:
    - X: Input sequences
    - y: Target values (anomaly or not)
    """
    feature_columns = [col for col in df.columns if col not in 
                       ['timestamp', 'satellite_id', 'anomaly', 'anomaly_parameter', 'root_cause']]
    
    target_column = 'anomaly'
    
    X, y = [], []
    for i in range(len(df) - sequence_length - prediction_horizon + 1):
        X.append(df[feature_columns].iloc[i:i+sequence_length].values)
        y.append(df[target_column].iloc[i+sequence_length+prediction_horizon-1])
    
    return np.array(X), np.array(y)

def create_root_cause_dataset(df):
    """
    Create dataset for root cause analysis (only using anomalous records)
    """
    # Select only anomalous records
    anomaly_df = df[df['anomaly'] == 1].copy()
    
    feature_columns = [col for col in df.columns if col not in 
                      ['timestamp', 'satellite_id', 'anomaly', 'anomaly_parameter', 'root_cause'] and 
                      not col.startswith('cause_')]
    
    target_columns = [col for col in df.columns if col.startswith('cause_')]
    
    if anomaly_df.empty or not target_columns:
        print("No anomalies found for root cause analysis dataset")
        return None, None
    
    X = anomaly_df[feature_columns].values
    y = anomaly_df[target_columns].values
    
    return X, y

# Process the training data
processed_data = preprocess_satellite_data('satellite_telemetry_training.csv', 'satellite_anomalies_training.csv')

# Create sequence datasets for time series anomaly detection
X_seq, y_seq = create_time_series_dataset(processed_data, sequence_length=12)

# Create dataset for root cause analysis
X_root, y_root = create_root_cause_dataset(processed_data)

# Split datasets
X_train_seq, X_test_seq, y_train_seq, y_test_seq = train_test_split(
    X_seq, y_seq, test_size=0.2, random_state=42, stratify=y_seq)

if X_root is not None:
    X_train_root, X_test_root, y_train_root, y_test_root = train_test_split(
        X_root, y_root, test_size=0.2, random_state=42)
    
    # Save the processed datasets
    np.save('X_train_seq.npy', X_train_seq)
    np.save('X_test_seq.npy', X_test_seq)
    np.save('y_train_seq.npy', y_train_seq)
    np.save('y_test_seq.npy', y_test_seq)
    
    np.save('X_train_root.npy', X_train_root)
    np.save('X_test_root.npy', X_test_root)
    np.save('y_train_root.npy', y_train_root)
    np.save('y_test_root.npy', y_test_root)
    
    print("Data preprocessing complete. Datasets saved.")
else:
    print("Warning: Could not create root cause dataset")