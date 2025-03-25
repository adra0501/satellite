# train_lifetime_prediction.py
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib

# For this demo, we'll use a different approach to simulate lifetime prediction
# First, let's load the original telemetry data
telemetry_data = pd.read_csv('satellite_telemetry_training.csv')

# Convert timestamp
telemetry_data['timestamp'] = pd.to_datetime(telemetry_data['timestamp'])

# Calculate battery degradation rate based on telemetry
telemetry_data['day'] = (telemetry_data['timestamp'] - telemetry_data['timestamp'].min()).dt.total_seconds() / (60*60*24)

# Create synthetic lifetime labels
# We'll use battery health to estimate lifetime
# Let's assume battery reaches end of life at 60% health
battery_eol = 60

# Calculate the days until EOL based on current degradation rate
telemetry_data['current_battery_rate'] = telemetry_data.groupby('satellite_id')['batteryHealth'].diff().fillna(0) / telemetry_data.groupby('satellite_id')['day'].diff().fillna(1)

# Filter out extreme values
telemetry_data = telemetry_data[telemetry_data['current_battery_rate'] > -1]
telemetry_data = telemetry_data[telemetry_data['current_battery_rate'] < 0.1]

# Calculate days to EOL
telemetry_data['days_to_battery_eol'] = np.where(
    telemetry_data['current_battery_rate'] < 0,
    (telemetry_data['batteryHealth'] - battery_eol) / abs(telemetry_data['current_battery_rate']),
    500  # If battery is improving, cap at 500 days
)

# Cap the values and clean them
telemetry_data['days_to_battery_eol'] = telemetry_data['days_to_battery_eol'].clip(0, 500)
telemetry_data['days_to_battery_eol'] = telemetry_data['days_to_battery_eol'].fillna(telemetry_data['days_to_battery_eol'].median())

# Create features for the lifetime prediction model
features = ['batteryHealth', 'power', 'temperature', 'day', 
            'in_eclipse', 'orbit_position', 'memoryUsage']

X = telemetry_data[features].values
y = telemetry_data['days_to_battery_eol'].values

# Split the data
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a gradient boosting regressor
model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)

model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:.2f} days")
print(f"Root Mean Squared Error: {rmse:.2f} days")
print(f"R² Score: {r2:.2f}")

# Plot actual vs predicted
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.plot([0, 500], [0, 500], 'r--')
plt.xlabel('Actual Days to EOL')
plt.ylabel('Predicted Days to EOL')
plt.title('Battery Lifetime Prediction')
plt.savefig('lifetime_prediction_results.png')

# Feature importance
feature_importance = pd.DataFrame({
    'feature': features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

plt.figure(figsize=(10, 6))
plt.bar(feature_importance['feature'], feature_importance['importance'])
plt.xticks(rotation=45)
plt.title('Feature Importance for Lifetime Prediction')
plt.tight_layout()
plt.savefig('lifetime_prediction_feature_importance.png')

# Save the model
joblib.dump(model, 'lifetime_prediction_model.pkl')
print("Lifetime prediction model saved")