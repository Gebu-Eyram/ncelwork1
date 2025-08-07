# app.py - Flask Backend for ML Model Predictions

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
import traceback

app = Flask(__name__)

# Enable CORS for Next.js frontend (runs on port 3000)
CORS(app, origins=["http://localhost:3000"])

# Global variable to store the loaded model
model = None
model_info = {}

def load_model():
    """Load the pickle model on server startup"""
    global model, model_info
    
    # List of possible model file names
    model_files = ['model.pkl', 'your_model.pkl', 'trained_model.pkl']
    
    for model_file in model_files:
        if os.path.exists(model_file):
            try:
                with open(model_file, 'rb') as f:
                    model = pickle.load(f)
                
                print(f"✅ Model loaded successfully from {model_file}")
                
                # Get model information
                model_info = {
                    'model_type': str(type(model).__name__),
                    'loaded': True,
                    'file_name': model_file,
                    'loaded_at': datetime.now().isoformat()
                }
                
                # Add sklearn-specific info if available
                if hasattr(model, 'feature_names_in_'):
                    model_info['expected_features'] = model.feature_names_in_.tolist()
                if hasattr(model, 'n_features_in_'):
                    model_info['n_features'] = model.n_features_in_
                if hasattr(model, 'classes_'):
                    model_info['classes'] = model.classes_.tolist()
                
                return True
                
            except Exception as e:
                print(f"❌ Error loading {model_file}: {str(e)}")
                continue
    
    print("❌ No model file found. Place your model as 'model.pkl' in this directory")
    return False

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with server info"""
    return jsonify({
        'status': 'running',
        'server': 'Flask ML Prediction Server',
        'model_loaded': model is not None,
        'model_type': model_info.get('model_type', 'None') if model else 'None',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'health': '/health',
            'model_info': '/model-info', 
            'predict': '/predict',
            'test': '/test-prediction'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None
    })

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({'error': 'No model loaded'}), 500
    
    # Enhanced model info
    enhanced_info = model_info.copy()
    
    # Try to get more detailed information
    try:
        # Check if it's a sklearn model
        if hasattr(model, '__class__'):
            enhanced_info['model_class'] = str(model.__class__)
        
        # Try to get feature information
        if hasattr(model, 'feature_names_in_'):
            enhanced_info['feature_names'] = model.feature_names_in_.tolist()
            enhanced_info['n_features'] = len(model.feature_names_in_)
        elif hasattr(model, 'n_features_in_'):
            enhanced_info['n_features'] = model.n_features_in_
        
        # Try to get target information
        if hasattr(model, 'classes_'):
            enhanced_info['target_classes'] = model.classes_.tolist()
            enhanced_info['n_classes'] = len(model.classes_)
        
        # Check if it's a pipeline
        if hasattr(model, 'steps'):
            enhanced_info['is_pipeline'] = True
            enhanced_info['pipeline_steps'] = [step[0] for step in model.steps]
        else:
            enhanced_info['is_pipeline'] = False
            
    except Exception as e:
        enhanced_info['info_error'] = str(e)
    
    return jsonify(enhanced_info)

@app.route('/test-prediction', methods=['POST'])
def test_prediction():
    """Test prediction with detailed debugging"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Create a simple test case with two different rows
        test_data = [
            {
                "CO2 Density (kg/m3)": 116.9,
                "Depth (m)": 465,
                "Fault": 0,
                "GIIP (Mt)": 10059.38824,
                "P (MPa)": 4.5,
                "Reservoir Thickness (m)": 108.6962682,
                "Seal Thickness (m)": 300,
                "Stacked": 0,
                "T (°C)": 20
            },
            {
                "CO2 Density (kg/m3)": 919.3,
                "Depth (m)": 4262,
                "Fault": 1,
                "GIIP (Mt)": 11057.38641,
                "P (MPa)": 61.8,
                "Reservoir Thickness (m)": 331.7784656,
                "Seal Thickness (m)": 192,
                "Stacked": 1,
                "T (°C)": 81
            }
        ]
        
        df = pd.DataFrame(test_data)
        print(f"🧪 Test data created with shape: {df.shape}")
        print(f"🧪 Test data columns: {df.columns.tolist()}")
        print("🧪 Test data:")
        print(df.to_string())
        
        # Preprocess and predict
        df_processed = preprocess_data(df.copy())
        predictions = model.predict(df_processed)
        
        print(f"🎯 Test predictions: {predictions}")
        
        return jsonify({
            'test_data': test_data,
            'predictions': predictions.tolist() if hasattr(predictions, 'tolist') else predictions,
            'processed_shape': df_processed.shape,
            'success': True
        })
        
    except Exception as e:
        print(f"❌ Test prediction failed: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
@app.route('/test-raw', methods=['POST'])
def test_raw_prediction():
    """Test prediction with minimal preprocessing - just send raw data to model"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Create test data with VERY different values
        test_data = [
            # Extreme low values
            {
                "Depth (m)": 1,
                "P (MPa)": 0.1,
                "T (°C)": -50,
                "CO2 Density (kg/m3)": 1,
                "GIIP (Mt)": 1,
                "Seal Thickness (m)": 1,
                "Reservoir Thickness (m)": 1,
                "Fault": 0,
                "Stacked": 0
            },
            # Extreme high values
            {
                "Depth (m)": 99999,
                "P (MPa)": 999.0,
                "T (°C)": 999,
                "CO2 Density (kg/m3)": 9999,
                "GIIP (Mt)": 99999,
                "Seal Thickness (m)": 99999,
                "Reservoir Thickness (m)": 99999,
                "Fault": 1,
                "Stacked": 1
            }
        ]
        
        # Convert to DataFrame with exact feature order expected by model
        expected_features = [
            "Depth (m)",
            "P (MPa)",
            "T (°C)",
            "CO2 Density (kg/m3)",
            "GIIP (Mt)",
            "Seal Thickness (m)",
            "Reservoir Thickness (m)",
            "Fault",
            "Stacked"
        ]
        
        df = pd.DataFrame(test_data)[expected_features]
        
        print(f"🧪 RAW TEST - Data shape: {df.shape}")
        print(f"🧪 RAW TEST - Columns: {df.columns.tolist()}")
        print("🧪 RAW TEST - Data:")
        print(df.to_string())
        
        # Send directly to model without any preprocessing
        print("🚀 Sending raw data directly to model...")
        predictions = model.predict(df)
        
        print(f"🎯 RAW TEST - Predictions: {predictions}")
        
        # Also try getting probabilities
        probabilities = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(df)
            print(f"🎯 RAW TEST - Probabilities: {probabilities}")
        
        return jsonify({
            'test_data': test_data,
            'predictions': predictions.tolist() if hasattr(predictions, 'tolist') else predictions,
            'probabilities': probabilities.tolist() if probabilities is not None else None,
            'data_shape': df.shape,
            'success': True
        })
        
    except Exception as e:
        print(f"❌ Raw test prediction failed: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Make predictions using the loaded model"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
        
        # Get JSON data from Next.js frontend
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if not isinstance(data, list):
            return jsonify({'error': 'Data should be a list of records'}), 400
        
        # Convert JSON data to DataFrame
        df = pd.DataFrame(data)
        
        # Basic data validation
        if df.empty:
            return jsonify({'error': 'Empty dataset provided'}), 400
        
        print(f"📊 Received data shape: {df.shape}")
        print(f"📋 Columns: {df.columns.tolist()}")
        
        # Debug: Show first few rows of original data
        print("🔍 First 3 rows of original data:")
        print(df.head(3).to_string())
        
        # Preprocess data if needed
        df_processed = preprocess_data(df.copy())
        
        print(f"🔄 Processed data shape: {df_processed.shape}")
        
        # Debug: Show first few rows of processed data
        print("🔍 First 3 rows of processed data:")
        print(df_processed.head(3).to_string())
        
        # Make predictions
        predictions = model.predict(df_processed)
        
        # Debug predictions
        print(f"🎯 Predictions: {predictions}")
        print(f"🔍 Prediction type: {type(predictions)}")
        print(f"🔍 Unique predictions: {np.unique(predictions) if isinstance(predictions, np.ndarray) else set(predictions)}")
        
        # Handle probability predictions if available
        prediction_proba = None
        if hasattr(model, 'predict_proba'):
            try:
                prediction_proba = model.predict_proba(df_processed)
                print(f"🎯 Prediction probabilities shape: {prediction_proba.shape if hasattr(prediction_proba, 'shape') else 'N/A'}")
                prediction_proba = prediction_proba.tolist()
            except Exception as prob_error:
                print(f"⚠️  Could not get prediction probabilities: {str(prob_error)}")
                pass  # Some models don't support predict_proba
        
        # Convert numpy arrays to Python lists for JSON serialization
        if isinstance(predictions, np.ndarray):
            predictions = predictions.tolist()
        
        # Create result with original data + predictions
        result_data = df.copy()
        result_data['prediction'] = predictions
        
        # Add probability scores if available
        if prediction_proba is not None:
            if hasattr(model, 'classes_'):
                for i, class_name in enumerate(model.classes_):
                    result_data[f'probability_{class_name}'] = [prob[i] for prob in prediction_proba]
            else:
                result_data['prediction_probability'] = [max(prob) for prob in prediction_proba]
        
        # Convert back to JSON format
        result = result_data.to_dict('records')
        
        print(f"✅ Successfully made {len(predictions)} predictions")
        
        return jsonify({
            'success': True,
            'predictions': result,
            'total_records': len(result),
            'model_type': model_info.get('model_type', 'unknown'),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        error_msg = f'Prediction failed: {str(e)}'
        print(f"❌ {error_msg}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        return jsonify({'error': error_msg}), 500

def preprocess_data(df):
    """
    Preprocess the data before making predictions
    Since the model is a Pipeline, it likely has built-in preprocessing
    We should minimize our preprocessing to avoid conflicts
    """
    try:
        print("🔄 Starting data preprocessing...")
        print(f"🔍 Input data shape: {df.shape}")
        print(f"🔍 Input columns: {df.columns.tolist()}")
        
        # Show data types and missing values info
        print("🔍 Data info:")
        print(f"Data types:\n{df.dtypes}")
        print(f"Missing values:\n{df.isnull().sum()}")
        
        # Show first few rows before processing
        print("🔍 First 2 rows before processing:")
        print(df.head(2).to_string())
        
        # Store original data for comparison
        original_df = df.copy()
        
        # Since the model is a Pipeline, it likely has built-in preprocessing
        # We should only do minimal preprocessing to avoid conflicts
        
        # 1. Ensure we have the expected features in the correct order
        if hasattr(model, 'feature_names_in_'):
            expected_features = model.feature_names_in_
            print(f"🎯 Model expects features: {expected_features.tolist()}")
            
            # Check which features are missing
            missing_features = set(expected_features) - set(df.columns)
            extra_features = set(df.columns) - set(expected_features)
            
            if missing_features:
                print(f"⚠️  Missing expected features: {list(missing_features)}")
                return None  # Don't add default values, this might cause issues
            
            if extra_features:
                print(f"ℹ️  Extra features (will be removed): {list(extra_features)}")
            
            # Select and reorder columns to match model's expected order
            df = df[expected_features]
            print(f"🔄 Selected and reordered columns to match model expectations")
        
        # 2. Only handle obvious missing values - let the pipeline handle the rest
        missing_count = df.isnull().sum().sum()
        if missing_count > 0:
            print(f"⚠️  Found {missing_count} missing values")
            # For now, just fill with 0 - the pipeline should handle proper scaling
            df = df.fillna(0)
            print(f"🔧 Filled missing values with 0")
        
        # 3. Ensure all data is numeric (don't transform, just convert types)
        for col in df.columns:
            if df[col].dtype == 'object':
                print(f"� Converting column '{col}' from object to numeric")
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # 4. Verify data integrity and show final state
        print("🔍 Data verification:")
        print(f"Final shape: {df.shape}")
        print(f"Final columns: {df.columns.tolist()}")
        print(f"Final data types: {df.dtypes.tolist()}")
        print(f"Any remaining NaN values: {df.isnull().sum().sum()}")
        
        # Show final processed data
        print("🔍 First 2 rows after processing:")
        print(df.head(2).to_string())
        
        # Show if all rows are identical (this would cause same predictions)
        if len(df) > 1:
            rows_identical = df.iloc[0].equals(df.iloc[1])
            if rows_identical:
                print("⚠️  WARNING: First two rows are identical after preprocessing!")
                print("🔍 Row 1:", df.iloc[0].tolist())
                print("🔍 Row 2:", df.iloc[1].tolist())
            else:
                print("✅ Rows are different after preprocessing")
                print("🔍 Row 1:", df.iloc[0].tolist())
                print("🔍 Row 2:", df.iloc[1].tolist() if len(df) > 1 else "Only one row")
        
        print(f"✅ Preprocessing complete. Final shape: {df.shape}")
        return df
        
    except Exception as e:
        print(f"❌ Error in preprocessing: {str(e)}")
        print(f"🔍 Traceback: {traceback.format_exc()}")
        raise e

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask ML Prediction Server...")
    print("=" * 50)
    
    # Try to load the model
    model_loaded = load_model()
    
    if not model_loaded:
        print("⚠️  Server starting without model. Predictions will not work.")
        print("💡 To fix: Place your pickle model file as 'model.pkl' in this directory")
    
    print("=" * 50)
    print("🌐 Server will run on: http://localhost:5000")
    print("🔗 Next.js frontend should run on: http://localhost:3000")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start the Flask development server
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )