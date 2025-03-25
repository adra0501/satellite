# train_root_cause_analysis.py
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os

# Load the prepared datasets
X_train = np.load('X_train_root.npy')
X_test = np.load('X_test_root.npy')
y_train = np.load('y_train_root.npy')
y_test = np.load('y_test_root.npy')

print(f"Training data shape: {X_train.shape}")
print(f"Test data shape: {X_test.shape}")
print(f"Target shape: {y_train.shape}")

# Get cause names from columns
cause_columns = [f"cause_{cause}" for cause in [
    'solar_panel_degradation', 
    'cooling_system_failure', 
    'battery_cell_degradation', 
    'antenna_misalignment', 
    'memory_leak'
]]

# Train a random forest for root cause analysis
base_clf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced'
)

# Use multi-output classifier if we have multiple possible root causes
if y_train.shape[1] > 1:
    model = MultiOutputClassifier(base_clf)
else:
    model = base_clf

# Train the model
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate each cause
for i, cause in enumerate(cause_columns):
    print(f"\nClassification Report for {cause}:")
    print(classification_report(y_test[:, i], y_pred[:, i]))
    
    # Plot confusion matrix
    cm = confusion_matrix(y_test[:, i], y_pred[:, i])
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(f'Confusion Matrix - {cause}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig(f'root_cause_{i}_confusion_matrix.png')

# Get feature importance
if hasattr(model, 'estimators_'):
    # For multi-output
    feature_importances = np.mean([est.feature_importances_ for est in model.estimators_], axis=0)
else:
    # For single output
    feature_importances = model.feature_importances_

# Get feature names - these would correspond to the columns in the processed dataframe
# For this example, we'll just use feature indices
feature_indices = np.argsort(feature_importances)[::-1]

# Plot feature importance
plt.figure(figsize=(12, 8))
plt.title("Feature Importances for Root Cause Analysis")
plt.bar(range(len(feature_importances)), feature_importances[feature_indices])
plt.xticks(range(len(feature_importances)), feature_indices, rotation=90)
plt.tight_layout()
plt.savefig('root_cause_feature_importance.png')

# Save the model
joblib.dump(model, 'root_cause_analysis_model.pkl')
print("Root cause analysis model saved")