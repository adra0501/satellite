# train_anomaly_detection.py
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Load the prepared datasets
try:
    X_train = np.load('X_train_seq.npy')
    X_test = np.load('X_test_seq.npy')
    y_train = np.load('y_train_seq.npy')
    y_test = np.load('y_test_seq.npy')
except FileNotFoundError:
    print("Error: Could not find the pre-processed data files.")
    print("Please run data_preprocessing.py first to generate the training data.")
    exit(1)

print(f"Training data shape: {X_train.shape}")
print(f"Test data shape: {X_test.shape}")

# Print more detailed information about the data
print(f"y_train shape: {y_train.shape}")
print(f"Unique classes in training data: {np.unique(y_train)}")
print(f"Unique classes in test data: {np.unique(y_test)}")
print(f"y_train value counts: {np.bincount(y_train.astype(int))}")
print(f"y_test value counts: {np.bincount(y_test.astype(int))}")

# Handle class imbalance (anomalies are rare)
# Calculate class weights only if we have both classes
from sklearn.utils.class_weight import compute_class_weight

if len(np.unique(y_train)) > 1:
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(y_train),
        y=y_train
    )
    class_weight_dict = {i: class_weights[i] for i in range(len(class_weights))}
    print(f"Class weights: {class_weight_dict}")
else:
    print("Warning: Only one class found in training data! This will not work for binary classification.")
    print("Please ensure your data has both normal and anomaly examples.")
    class_weight_dict = None  # Don't use class weights if only one class
    
    # Add some synthetic anomaly data if none exists
    if np.all(y_train == 0):
        print("Generating synthetic anomaly examples for training...")
        # Create a small percentage of synthetic anomaly data (5% of total)
        synthetic_count = max(5, int(0.05 * len(y_train)))
        
        # Select random indices to convert to anomalies
        anomaly_indices = np.random.choice(len(y_train), synthetic_count, replace=False)
        
        # Create a copy of the data to avoid modifying the original
        synthetic_y_train = y_train.copy()
        synthetic_y_train[anomaly_indices] = 1
        
        # Set the new synthetic data
        y_train = synthetic_y_train
        
        # Recalculate class weights
        class_weights = compute_class_weight(
            class_weight='balanced',
            classes=np.unique(y_train),
            y=y_train
        )
        class_weight_dict = {i: class_weights[i] for i in range(len(class_weights))}
        print(f"After synthetic data generation, class weights: {class_weight_dict}")
        print(f"New y_train value counts: {np.bincount(y_train.astype(int))}")

# Define the LSTM model
def create_anomaly_detection_model(input_shape):
    model = Sequential([
        Bidirectional(LSTM(64, return_sequences=True), input_shape=input_shape),
        Dropout(0.2),
        Bidirectional(LSTM(32)),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
    )
    
    return model

# Create and train the model
model = create_anomaly_detection_model((X_train.shape[1], X_train.shape[2]))
model.summary()

# Define callbacks
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
model_checkpoint = ModelCheckpoint(
    'best_anomaly_detection_model.h5',
    monitor='val_recall',
    mode='max',
    save_best_only=True,
    verbose=1
)

try:
    # Train the model
    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.2,
        callbacks=[early_stopping, model_checkpoint],
        class_weight=class_weight_dict,
        verbose=1
    )

    # Evaluate the model
    model = tf.keras.models.load_model('best_anomaly_detection_model.h5')
    y_pred_prob = model.predict(X_test)
    y_pred = (y_pred_prob > 0.5).astype(int).flatten()

    # Print classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Plot confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig('anomaly_detection_confusion_matrix.png')

    # Plot training history
    plt.figure(figsize=(12, 4))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()

    plt.tight_layout()
    plt.savefig('anomaly_detection_training_history.png')

    # Save the model in TensorFlow.js format
    import tensorflowjs as tfjs
    tfjs.converters.save_keras_model(model, 'tfjs_anomaly_detection_model')
    print("Model saved in TensorFlow.js format")
    
except Exception as e:
    print(f"Error during training: {e}")
    import traceback
    traceback.print_exc()