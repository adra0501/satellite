import os
import tensorflow as tf
import tensorflowjs as tfjs
import json

# Ensure output directories exist
os.makedirs('web_models/anomaly_detection', exist_ok=True)

# Load the Keras model
model = tf.keras.models.load_model('best_anomaly_detection_model.h5')

# Convert to TensorFlow.js format
tfjs.converters.convert_keras(
    model, 
    'web_models/anomaly_detection',
    quantization_dtype=None
)

# Create metadata file
metadata = {
    "anomaly_detection": {
        "type": "tensorflow",
        "input_shape": list(model.input_shape)[1:],
        "threshold": 0.5
    },
    "root_cause": {
        "causes": [
            "solar_panel_degradation",
            "cooling_system_failure", 
            "battery_cell_degradation",
            "antenna_misalignment",
            "memory_leak"
        ]
    },
    "version": "1.0"
}

with open('web_models/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("Model conversion completed successfully!")
print(f"Input shape: {model.input_shape}")
print(f"Output shape: {model.output_shape}")