# simplified_prepare_for_web.py
import os
import tensorflow as tf
import json

# Create directory for models
os.makedirs('web_models', exist_ok=True)

try:
    # Load the trained model
    print("Loading the anomaly detection model...")
    anomaly_model = tf.keras.models.load_model('best_anomaly_detection_model.h5')
    
    # Create a simpler version of tensorflowjs conversion using tf.saved_model
    print("Saving the model in SavedModel format first...")
    anomaly_model.save('saved_model_format')
    
    # Create model metadata for JS implementation
    model_metadata = {
        "anomaly_detection": {
            "type": "tensorflow",
            "input_shape": [anomaly_model.input_shape[1], anomaly_model.input_shape[2]],
            "threshold": 0.5  # Threshold for binary classification
        },
        "version": "1.0",
        "description": "Anomaly detection model for satellite telemetry"
    }
    
    # Save metadata as JSON
    with open('web_models/model_metadata.json', 'w') as f:
        json.dump(model_metadata, f, indent=2)
    
    print("Model metadata saved to web_models/model_metadata.json")
    
    print("\nTo convert to TensorFlow.js format, run the following command:")
    print("tensorflowjs_converter --input_format=keras saved_model_format web_models/anomaly_detection")
    
    # Note: You might need to run the tensorflowjs_converter separately due to the dependency issue
    try:
        print("\nAttempting automatic conversion...")
        import subprocess
        subprocess.run(["tensorflowjs_converter", "--input_format=keras", "saved_model_format", "web_models/anomaly_detection"], check=True)
        print("Conversion successful!")
    except Exception as e:
        print(f"Automatic conversion failed: {e}")
        print("Please run the tensorflowjs_converter command manually after fixing the dependency issues.")
    
except Exception as e:
    print(f"Error: {e}")